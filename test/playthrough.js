/* Automated end-to-end playthrough of The Keeper of Grey Harbor.
   Drives the game exactly as a player would: taps hotspots, uses
   items, solves puzzles, walks every dialogue branch — and asserts
   game state along the way. Run: node test/playthrough.js */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const PORT = 8734;
const ROOT = path.join(__dirname, '..', 'www');
const SHOTS = path.join(__dirname, 'shots');

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rq) => {
      let p = req.url.split('?')[0];
      if (p === '/') p = '/index.html';
      const f = path.join(ROOT, p);
      fs.readFile(f, (err, data) => {
        if (err) { rq.writeHead(404); rq.end('nope'); return; }
        rq.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
        rq.end(data);
      });
    });
    srv.listen(PORT, () => res(srv));
  });
}

let failures = 0;
function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { failures++; console.log('  ✗ FAIL: ' + msg); }
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const srv = await serve();
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const [vw, vh] = (process.env.VP || '390x844').split('x').map(Number);
  console.log(`viewport ${vw}x${vh}`);
  const page = await browser.newPage({
    viewport: { width: vw, height: vh },
    isMobile: true, hasTouch: true,
    deviceScaleFactor: 2,
  });

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  /* ---------- helpers that play like a player ---------- */
  let SAVEKEY = 'greyharbor_save_v1'; // switched when chapter two starts
  // Tap a hotspot by id: find a screen point inside the hotspot where it is
  // actually the topmost element (a player aims at the visible part of an object).
  async function tap(hsId) {
    // dismiss any caption first, like a player tapping the text away
    await page.evaluate(() => {
      const c = document.getElementById('caption');
      if (!c.classList.contains('hidden')) c.click();
    });
    const r = await page.evaluate(({ id, KEY }) => {
      const save = JSON.parse(localStorage.getItem(KEY));
      const defs = Scenes[save.scene].hotspots;
      const visible = defs.filter(h => !h.visible || h.visible(save.flags));
      const idx = visible.findIndex(h => h.id === id);
      if (idx < 0) return { err: 'hotspot ' + id + ' not found in scene ' + save.scene };
      const hit = document.querySelectorAll('#hotspot-layer .hotspot')[idx];
      if (!hit) return { err: 'no DOM hit rect for ' + id };
      const b = hit.getBoundingClientRect();
      // sample a grid of interior points, keep ones on-screen & topmost
      for (const fy of [.5, .3, .7, .15, .85]) {
        for (const fx of [.5, .3, .7, .15, .85]) {
          const x = b.x + b.width * fx, y = b.y + b.height * fy;
          if (x < 2 || y < 2 || x > window.innerWidth - 2 || y > window.innerHeight - 2) continue;
          if (document.elementFromPoint(x, y) === hit) return { x, y };
        }
      }
      return { err: 'hotspot ' + id + ' has no tappable on-screen point (scene ' + save.scene + ')' };
    }, { id: hsId, KEY: SAVEKEY });
    if (r.err) throw new Error(r.err);
    await page.mouse.click(r.x, r.y); // real coordinate click through the compositor
    await page.waitForTimeout(120);
  }

  async function selectItem(itemId) {
    const idx = await page.evaluate(({ id, KEY }) => {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s.inv.indexOf(id);
    }, { id: itemId, KEY: SAVEKEY });
    if (idx < 0) throw new Error('item not in inventory: ' + itemId);
    const items = page.locator('.inv-item');
    await items.nth(idx).click();
    await page.waitForTimeout(80);
  }

  async function useItem(itemId, hsId) {
    await selectItem(itemId);
    await tap(hsId);
  }

  async function state() {
    return page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), SAVEKEY);
  }
  const state2 = state, tap2 = (...a) => tap(...a);

  async function captionText() {
    return page.evaluate(() => document.getElementById('caption').textContent);
  }

  // advance dialogue until closed or choices appear; returns choice labels if any
  async function advanceDialog(maxSteps = 30) {
    for (let i = 0; i < maxSteps; i++) {
      await page.waitForTimeout(150);
      const st = await page.evaluate(() => {
        const ov = document.getElementById('dialog-overlay');
        if (ov.classList.contains('hidden')) return { closed: true };
        const btns = [...document.querySelectorAll('.choice-btn')].map(b => b.textContent);
        return { closed: false, choices: btns };
      });
      if (st.closed) return { closed: true };
      if (st.choices.length) return { closed: false, choices: st.choices };
      // short timeout + swallow: the ending screen can legitimately replace
      // the dialogue mid-loop (endGame), which retracts the click target
      await page.locator('#dialog-overlay')
        .click({ position: { x: Math.floor(vw / 2), y: vh - 90 }, timeout: 1500 })
        .catch(() => {});
    }
    throw new Error('dialogue never resolved');
  }

  async function pickChoice(labelPart) {
    // finish typing first if needed
    await page.waitForTimeout(200);
    const btn = page.locator('.choice-btn', { hasText: labelPart });
    await btn.first().click();
    await page.waitForTimeout(150);
  }

  async function shot(name) {
    await page.screenshot({ path: path.join(SHOTS, name + '.png') });
  }

  /* ================= RUN ================= */
  console.log('\n== Boot & title ==');
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(600);
  ok(await page.locator('#title-screen .game-title').isVisible(), 'title screen shows');
  ok((await page.locator('#btn-continue').isHidden()), 'no Continue button without a save');
  ok(await page.locator('#lock-ch2').isVisible(), 'Chapter Two starts locked');
  ok(await page.locator('#btn-new-ch2').isHidden(), 'no way to start Chapter Two while locked');
  await shot('01-title');

  console.log('\n== New game & prologue cutscene ==');
  await page.locator('#btn-new').click();
  await page.waitForTimeout(500);
  ok(await page.locator('#prologue-screen').isVisible(), 'prologue cutscene plays first');
  const cap1 = await page.locator('#prologue-caption').textContent();
  ok(cap1.includes('nine years'), 'slide 1: Alvar writing');
  await shot('00-prologue-1');
  await page.locator('#prologue-screen').click();
  await page.waitForTimeout(400);
  const cap2 = await page.locator('#prologue-caption').textContent();
  ok(cap2 !== cap1 && cap2.includes('mid-sentence'), 'tap advances to slide 2 (the letter)');
  await shot('00-prologue-2');
  await page.locator('#prologue-screen').click();
  await page.waitForTimeout(400);
  const cap3 = await page.locator('#prologue-caption').textContent();
  ok(cap3.includes('first boat north'), 'slide 3: the boat north');
  await shot('00-prologue-3');
  await page.locator('#prologue-screen').click();
  await page.waitForTimeout(500);
  ok(await page.locator('#game-screen').isVisible(), 'prologue ends into the game');
  let s = await state();
  ok(s.scene === 'dock', 'starts at the dock');
  ok(s.introDone === true, 'prologue marked done');
  await shot('02-dock');

  console.log('\n== Marta dialogue tree ==');
  await tap('marta');
  let d = await advanceDialog();
  ok(!d.closed && d.choices.length >= 3, 'Marta hub offers choices (' + d.choices.length + ')');
  ok(!d.choices.some(c => c.includes('strange in the harbor')), 'harbormaster topic hidden before asking about Alvar');
  await pickChoice('last see my uncle');
  d = await advanceDialog();
  ok(!d.closed, 'returns to Marta hub after Alvar topic');
  s = await state();
  ok(s.flags.martaAlvar === true, 'martaAlvar flag set');
  ok(s.clues.includes('key_hint'), 'marigold key hint recorded');
  ok(d.choices.some(c => c.includes('strange in the harbor')), 'harbormaster topic now unlocked');
  await pickChoice('strange in the harbor');
  d = await advanceDialog();
  await pickChoice('Who keeps the light');
  d = await advanceDialog();
  await pickChoice('back to her nets');
  d = await advanceDialog();
  ok(d.closed, 'Marta dialogue closes');
  s = await state();
  ok(s.clues.includes('voss_nights'), 'night sailings clue recorded');
  await shot('03-marta');

  console.log('\n== Dock props ==');
  await tap('crate');
  ok((await captionText()).includes('pry'), 'crate mentions needing to pry');
  await tap('gull'); await tap('sea'); await tap('boat'); await tap('lamppost');

  console.log('\n== To the point; gather key & pry bar ==');
  await tap('tolighthouse');
  s = await state();
  ok(s.scene === 'exterior', 'arrived at exterior');
  await shot('04-exterior');
  await tap('cottagedoor');
  ok((await captionText()).includes('locked'), 'cottage door is locked');
  await tap('flowerpot');
  s = await state();
  ok(s.inv.includes('cottagekey'), 'got cottage key from marigolds');
  ok(await page.evaluate(() => !!document.getElementById('ex-prybar')), 'pry bar visible in woodpile before pickup');
  await tap('woodpile');
  s = await state();
  ok(s.inv.includes('prybar'), 'got pry bar from woodpile');
  ok(await page.evaluate(() => !document.getElementById('ex-prybar')), 'pry bar art removed from woodpile after pickup');
  await tap('lightdoor');
  ok((await captionText()).includes('brass'), 'lighthouse door wants brass key');
  await tap('cliffpath');
  ok((await captionText()).toLowerCase().includes('dark'), 'cliff path blocked in the dark');

  console.log('\n== Wrong-item usage ==');
  await useItem('prybar', 'cottagedoor');
  ok((await captionText()).includes('no use'), 'wrong item gives a graceful miss');

  console.log('\n== Into the cottage ==');
  await useItem('cottagekey', 'cottagedoor');
  s = await state();
  ok(s.flags.cottageOpen === true, 'cottage unlocked');
  ok(!s.inv.includes('cottagekey'), 'cottage key consumed');
  await tap('cottagedoor');
  s = await state();
  ok(s.scene === 'cottage', 'inside the cottage');
  await shot('05-cottage');

  console.log('\n== Cottage clues ==');
  await tap('fireplace');
  s = await state();
  ok(s.clues.includes('burned_note'), 'burned note clue');
  await tap('clock');
  s = await state();
  ok(s.clues.includes('clock'), 'clock clue (7:25)');
  await tap('painting'); await tap('window2'); await tap('armchair'); await tap('desk');
  ok(await page.evaluate(() => !!document.getElementById('ct-oilcan')), 'oil can visible on shelf before pickup');
  await tap('shelf');
  s = await state();
  ok(s.inv.includes('oilcan'), 'got oil can');
  ok(await page.evaluate(() => !document.getElementById('ct-oilcan') && !!document.getElementById('ct-oilring')), 'oil can art replaced by a ring mark after pickup');

  console.log('\n== Drawer keypad puzzle ==');
  await tap('drawer');
  ok(await page.locator('#puzzle-overlay').isVisible(), 'keypad opens');
  // wrong code first
  for (const k of ['1', '2', '3', '4']) await page.locator('.key', { hasText: new RegExp('^' + k + '$') }).click();
  await page.waitForTimeout(700);
  ok(await page.locator('#puzzle-overlay').isVisible(), 'wrong code does not open drawer');
  s = await state();
  ok(!s.flags.drawerOpen, 'drawer still locked after wrong code');
  // right code 0725
  for (const k of ['0', '7', '2', '5']) await page.locator('.key', { hasText: new RegExp('^' + k + '$') }).click();
  await page.waitForTimeout(700);
  s = await state();
  ok(s.flags.drawerOpen === true, 'code 0725 opens the drawer');
  ok(s.inv.includes('lighthousekey') && s.inv.includes('cipherwheel'), 'got brass key + cipher wheel');
  await shot('06-drawer-solved');

  console.log('\n== Journal ==');
  await page.locator('#btn-journal').click();
  const clueCount = await page.locator('.clue').count();
  ok(clueCount >= 5, 'journal lists clues (' + clueCount + ')');
  const objText = await page.locator('#objective-box').textContent();
  ok(objText.includes('brass key'), 'objective points to the lighthouse');
  await shot('07-journal');
  await page.locator('[data-close="journal-overlay"]').click();

  console.log('\n== The lamp room ==');
  await tap('rug');
  await useItem('lighthousekey', 'lightdoor');
  s = await state();
  ok(s.flags.lampOpen === true, 'lighthouse unlocked');
  await tap('lightdoor');
  s = await state();
  ok(s.scene === 'lamp', 'in the lamp room');
  await shot('08-lamp');
  await tap('telescope');
  ok(!(await state()).clues.includes('telescope'), 'telescope shows nothing before decoding');
  await tap('logbook');
  ok((await captionText()).includes('cipher'), 'logbook is ciphered');

  console.log('\n== Cipher puzzle ==');
  await useItem('cipherwheel', 'logbook');
  ok(await page.locator('#puzzle-overlay').isVisible(), 'cipher opens');
  const encBefore = await page.locator('.cipher-text').textContent();
  ok(!encBefore.includes('CARGO MOVES'), 'text starts scrambled');
  const markBtn = page.locator('.puzzle-actions .btn');
  ok(await markBtn.isDisabled(), 'Mark disabled while scrambled');
  for (let i = 0; i < 7; i++) await page.locator('.wheel-btn').nth(1).click();
  const decoded = await page.locator('.cipher-text').textContent();
  ok(decoded.includes('CARGO MOVES WHEN MY LIGHT SLEEPS'), 'shift VII decodes the log');
  ok(!(await markBtn.isDisabled()), 'Mark enabled at VII');
  await shot('09-cipher');
  await markBtn.click();
  await page.waitForTimeout(400);
  s = await state();
  ok(s.flags.logDecoded === true, 'log decoded flag set');
  ok(s.clues.includes('log_entry'), 'decoded log in journal');

  console.log('\n== Telescope after decoding ==');
  await tap('telescope');
  s = await state();
  ok(s.clues.includes('telescope'), 'telescope clue after decode');

  console.log('\n== Lens ring puzzle ==');
  await tap('lens');
  ok(await page.locator('#lens-svg').isVisible(), 'lens puzzle opens');
  // rings start at 90,225,315 -> need 6,3,1 taps of 45deg
  const ringTaps = [6, 3, 1];
  for (let r = 0; r < 3; r++) {
    for (let t = 0; t < ringTaps[r]; t++) {
      await page.evaluate(idx => {
        const rings = document.querySelectorAll('#lens-svg .lens-ring');
        rings[idx].querySelector('circle[pointer-events="stroke"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, r);
      await page.waitForTimeout(60);
    }
  }
  await page.waitForTimeout(1200);
  s = await state();
  ok(s.flags.lensSolved === true, 'lens aligned');
  ok(s.flags.cliffsOpen === true, 'cliff path revealed (both conditions met)');
  await shot('10-lens-solved');

  console.log('\n== Back to dock: pry the crate ==');
  await tap('stairs');
  await tap('todock');
  s = await state();
  ok(s.scene === 'dock', 'back at the dock');
  ok(await page.evaluate(() => !!document.getElementById('dk-crate-closed')), 'crate shown nailed shut before prying');
  await useItem('prybar', 'crate');
  s = await state();
  ok(s.inv.includes('crank'), 'crank recovered from crate');
  ok(s.clues.includes('crate_mark'), 'V-stamp clue recorded');
  ok(await page.evaluate(() => !document.getElementById('dk-crate-closed') && !!document.getElementById('dk-crate-open')), 'crate art shows pried-open lid and V stamp');

  console.log('\n== The cliffs ==');
  await tap('tolighthouse');
  await tap('cliffpath');
  s = await state();
  ok(s.scene === 'cliffs', 'on the cliff path');
  await shot('11-cliffs');
  await tap('gate');
  ok((await captionText()).includes('winch'), 'gate needs the winch');
  await tap('winch');
  // crank before oil should fail
  await useItem('crank', 'winch');
  s = await state();
  ok(!s.flags.caveOpen, 'crank alone does not open rusted winch');
  ok(s.inv.includes('crank'), 'crank not consumed by failed attempt');
  await useItem('oilcan', 'winch');
  s = await state();
  ok(s.flags.gateOiled === true, 'winch oiled');
  ok(!s.inv.includes('oilcan'), 'oil can consumed');
  await useItem('crank', 'winch');
  s = await state();
  ok(s.flags.caveOpen === true, 'gate winched open');
  await shot('12-gate-open');

  console.log('\n== The sea cave & finale ==');
  await tap('gate');
  s = await state();
  ok(s.scene === 'cave', 'inside the sea cave');
  await shot('13-cave');
  await tap('crates2');
  s = await state();
  ok(s.clues.includes('cave_ledger'), 'ledger clue found');
  await tap('alvar');
  d = await advanceDialog();
  ok(!d.closed && d.choices.length === 2, 'confrontation choice appears');
  await pickChoice('Look behind you');
  d = await advanceDialog();
  ok(d.closed, 'finale dialogue completes');
  await page.waitForTimeout(1500);
  ok(await page.locator('#ending-screen').isVisible(), 'ending screen shows');
  await page.waitForTimeout(6500);
  await shot('14-ending');
  const endParas = await page.locator('#ending-text p').count();
  ok(endParas === 4, 'epilogue has 4 paragraphs');

  console.log('\n== Post-game & Chapter Two unlock ==');
  await page.waitForTimeout(1800); // let the unlock banner fade in
  ok(await page.locator('.unlock-banner').isVisible(), 'ending announces Chapter Two unlock');
  // the action buttons must be reachable WITHOUT scrolling — a phone user
  // gets no scroll hint on the ending screen (regression: v1.3)
  const endScroll = await page.evaluate(() => document.getElementById('ending-screen').scrollTop);
  const nextBox = await page.locator('#btn-next-chapter').boundingBox();
  const menuBox = await page.locator('#btn-again').boundingBox();
  ok(endScroll === 0 && nextBox && nextBox.y >= 0 && nextBox.y + nextBox.height <= vh,
    'Begin Chapter Two button fully on screen without scrolling');
  ok(menuBox && menuBox.y >= 0 && menuBox.y + menuBox.height <= vh,
    'Main Menu button fully on screen without scrolling');
  ok((await page.locator('#btn-next-chapter').textContent()).includes('Begin Chapter Two'), 'primary button offers Chapter Two');
  ok((await page.locator('#btn-again').textContent()) === 'Main Menu', 'secondary button returns to the menu');
  await shot('18-ch1-ending-buttons');

  console.log('\n== CHAPTER TWO: The Silent Bell (straight from the ending) ==');
  SAVEKEY = 'greyharbor_save_ch2_v1';
  await page.locator('#btn-next-chapter').click();
  await page.waitForTimeout(500);
  ok(await page.locator('#prologue-screen').isVisible(), 'ch2 prologue plays');
  const q1 = await page.locator('#prologue-caption').textContent();
  ok(q1.includes('fog'), 'ch2 prologue slide 1 (the fog)');
  await shot('19-ch2-prologue-1');
  await page.locator('#prologue-screen').click();
  await page.waitForTimeout(350);
  ok((await page.locator('#prologue-caption').textContent()).includes('ferry'), 'ch2 prologue slide 2 (the ferry)');
  await shot('19-ch2-prologue-2');
  await page.locator('#prologue-screen').click();
  await page.waitForTimeout(350);
  ok((await page.locator('#prologue-caption').textContent()).includes('bell was silent'), 'ch2 prologue slide 3 (the bell)');
  await page.locator('#prologue-screen').click();
  await page.waitForTimeout(500);
  s = await state2();
  ok(s.scene === 'lamp2', 'ch2 starts in the fogbound lamp room');
  await shot('20-ch2-lamp');

  // Alvar sends you out
  await tap2('b_stairs');
  ok((await captionText()).includes('Alvar called you'), 'cannot leave before hearing Alvar');
  await tap2('b_alvar');
  d = await advanceDialog();
  ok(!d.closed && d.choices.length === 2, 'Alvar briefing offers a choice');
  await pickChoice('What could silence');
  d = await advanceDialog();
  ok(d.closed, 'briefing complete');
  s = await state2();
  ok(s.flags.b_met === true && s.clues.includes('b_ferry'), 'mission accepted, ferry clue noted');

  console.log('\n== The foggy shore ==');
  await tap2('b_stairs');
  s = await state2();
  ok(s.scene === 'shore', 'took the shore path');
  await shot('21-ch2-shore');
  await tap2('b_notice');
  await tap2('b_plaque2');
  s = await state2();
  ok(s.clues.includes('b_notice') && s.clues.includes('b_plaque'), 'shed-code clues collected');
  await tap2('b_skiff');
  ok((await captionText()).includes('drifting'), 'skiff refuses without oars');

  // shed padlock: wrong year then 1957
  await tap2('b_shed');
  ok(await page.locator('#puzzle-overlay').isVisible(), 'padlock keypad opens');
  for (const k of ['1', '1', '1', '1']) await page.locator('.key', { hasText: new RegExp('^' + k + '$') }).click();
  await page.waitForTimeout(700);
  s = await state2();
  ok(!s.flags.b_shedOpen, 'wrong year keeps the shed shut');
  for (const k of ['1', '9', '5', '7']) await page.locator('.key', { hasText: new RegExp('^' + k + '$') }).click();
  await page.waitForTimeout(700);
  s = await state2();
  ok(s.flags.b_shedOpen === true, '1957 opens the shed');
  ok(await page.evaluate(() => !!document.getElementById('sh-oars')), 'oars visible inside the open shed');
  await tap2('b_shed');
  s = await state2();
  ok(s.inv.includes('oars'), 'took the oars');
  ok(await page.evaluate(() => !document.getElementById('sh-oars')), 'oars art gone from the shed');
  ok(await page.evaluate(() => !!document.getElementById('sh-boathook')), 'boathook on the shed wall');
  await tap2('b_hook');
  s = await state2();
  ok(s.inv.includes('boathook'), 'took the boathook');
  ok(await page.evaluate(() => !document.getElementById('sh-boathook')), 'boathook art gone from the wall');

  console.log('\n== Bell Rock ==');
  await tap2('b_skiff');
  s = await state2();
  ok(s.scene === 'bellrock', 'rowed out to Bell Rock');
  await shot('22-ch2-bellrock');
  await tap2('b_bell');
  s = await state2();
  ok(s.clues.includes('b_frayed'), 'found the frayed rope & missing chain');
  await tap2('b_magpie2');
  await tap2('b_nest');
  s = await state2();
  ok(s.clues.includes('b_magpie'), 'spotted the glittering nest');
  ok(await page.evaluate(() => !!document.getElementById('br-glints')), 'nest glitters before looting');
  await useItem('boathook', 'b_nest');
  s = await state2();
  ok(s.inv.includes('strikerchain'), 'recovered the striker chain');
  ok(s.clues.includes('b_trinkets'), 'catalogued the thief\'s hoard');
  ok(await page.evaluate(() => !document.getElementById('br-glints')), 'nest glitter gone after looting');
  await useItem('strikerchain', 'b_bell');
  s = await state2();
  ok(s.flags.b_chainOn === true, 'chain hung back inside the bell');

  console.log('\n== Ring the bell ==');
  await tap2('b_bell');
  ok(await page.locator('#bell-svg').isVisible(), 'bell-ringing puzzle opens');
  await shot('23-ch2-bellpuzzle');
  // deliberately pull at the wrong moment (bottom of the swing, far from
  // the zone so click latency can't accidentally land a good pull)
  await page.waitForFunction(() => Math.abs(parseFloat(document.getElementById('bell-svg').dataset.phase || '1')) < 0.15);
  await page.locator('.bell-pull-btn').click();
  ok((await page.locator('#puzzle-panel .solved-note').textContent()).includes('Too soon'), 'early pull is rejected');
  ok(await page.evaluate(() => document.querySelectorAll('.bell-pip.hit').length === 0), 'no progress from a bad pull');
  // now three good pulls, timed to the swing
  for (let target = 1; target <= 3; target++) {
    let done = false;
    for (let tries = 0; tries < 15 && !done; tries++) {
      await page.waitForFunction(() => document.getElementById('bell-svg') && document.getElementById('bell-svg').dataset.inzone === '1');
      await page.locator('.bell-pull-btn').click();
      done = await page.evaluate(t => document.querySelectorAll('.bell-pip.hit').length >= t, target);
      if (!done) await page.waitForTimeout(250);
    }
    ok(done, 'good pull #' + target + ' lands');
  }
  await page.waitForTimeout(1400);
  s = await state2();
  ok(s.flags.b_bellRung === true, 'the fog bell rings');
  d = await advanceDialog();
  ok(d.closed, 'finale plays out');
  await page.waitForTimeout(1500);
  ok(await page.locator('#ending-screen').isVisible(), 'chapter two ending shows');
  ok((await page.locator('#ending-title').textContent()) === 'The Bell Answers', 'ch2 ending title correct');
  await page.waitForTimeout(6500);
  ok(await page.locator('#ending-text p').count() === 4, 'ch2 epilogue has 4 paragraphs');
  await shot('24-ch2-ending');
  const meta = await page.evaluate(() => JSON.parse(localStorage.getItem('greyharbor_meta_v1')));
  ok(meta.ch1Done === true && meta.ch2Done === true, 'both chapters recorded as finished');
  ok(await page.locator('#btn-next-chapter').isHidden(), 'no next-chapter button after the final chapter');
  const mb2 = await page.locator('#btn-again').boundingBox();
  ok(mb2 && mb2.y + mb2.height <= vh, 'Main Menu button on screen at ch2 ending');
  await page.locator('#btn-again').click();
  await page.waitForTimeout(400);
  ok(await page.locator('#title-screen').isVisible(), 'back at the main menu');
  ok(await page.locator('#lock-ch2').isHidden(), 'Chapter Two shown unlocked on title');
  ok(await page.locator('#btn-new-ch2').isVisible(), 'Chapter Two startable from title');
  ok((await page.locator('#card-ch1 .chapter-done').textContent()).includes('solved'), 'Chapter One marked solved');
  ok((await page.locator('#card-ch2 .chapter-done').textContent()).includes('solved'), 'Chapter Two marked solved on title');
  await shot('18-title-both-solved');

  console.log('\n== Save/continue mid-game ==');
  SAVEKEY = 'greyharbor_save_v1';
  await page.locator('#btn-new').click();
  await page.waitForTimeout(500);
  ok(await page.locator('#prologue-screen').isVisible(), 'prologue plays again on a fresh game');
  await page.locator('#btn-skip').click();
  await page.waitForTimeout(500);
  ok(await page.locator('#game-screen').isVisible(), 'Skip jumps straight into the game');
  await tap('marta');
  d = await advanceDialog();
  await pickChoice('back to her nets');
  await advanceDialog();
  await tap('tolighthouse');
  await page.reload();
  await page.waitForTimeout(600);
  ok(await page.locator('#btn-continue').isVisible(), 'Continue offered after reload');
  await page.locator('#btn-continue').click();
  await page.waitForTimeout(400);
  s = await state();
  ok(s.scene === 'exterior', 'continued at the exterior where we left off');
  ok(s.flags.metMarta === true, 'flags survived reload');

  console.log('\n== Hint button ==');
  await page.locator('#btn-hint').click();
  const hinted = await page.evaluate(() => document.querySelector('#stage svg').classList.contains('show-hints'));
  ok(hinted, 'hint mode flashes hotspots');
  await shot('15-hints');

  console.log('\n== Music system ==');
  ok(await page.locator('#btn-music').isVisible(), 'music button in the top bar');
  const audioState = await page.evaluate(() => ({
    on: Music.isOn(),
    ctxState: (() => { try { return !!(window.AudioContext || window.webkitAudioContext); } catch (e) { return false; } })(),
  }));
  ok(audioState.on === true, 'music defaults to on');
  ok(audioState.ctxState, 'WebAudio available');
  await page.locator('#btn-music').click();
  ok(await page.evaluate(() => !Music.isOn()), 'toggle turns music off');
  ok(await page.evaluate(() => document.getElementById('btn-music').classList.contains('muted')), 'button shows muted state');
  ok(await page.evaluate(() => localStorage.getItem('greyharbor_music') === 'off'), 'preference persisted');
  await page.reload();
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => !Music.isOn()), 'muted preference survives reload');
  await page.locator('#btn-music-title').click();
  ok(await page.evaluate(() => Music.isOn() && localStorage.getItem('greyharbor_music') === 'on'), 'title-screen toggle re-enables music');
  // back into the game for the save & exit test
  await page.locator('#btn-continue').click();
  await page.waitForTimeout(400);
  const musicScene = await page.evaluate(() => {
    // menu music toggle reflects state
    return document.getElementById('btn-music-menu').textContent;
  });
  ok(musicScene === 'Music: On', 'menu shows music state (' + musicScene + ')');

  console.log('\n== Save & Exit to Title ==');
  await page.locator('#btn-menu').click();
  await page.locator('#btn-save-exit').click();
  await page.waitForTimeout(300);
  ok(await page.locator('#title-screen').isVisible(), 'returned to title');
  const contLabel = await page.locator('#btn-continue').textContent();
  ok(contLabel.includes('Continue —'), 'Continue shows saved location (' + contLabel.trim() + ')');
  await page.locator('#btn-continue').click();
  await page.waitForTimeout(400);
  s = await state();
  ok(s.scene === 'exterior' && s.flags.metMarta === true, 'continue restores the saved game');

  console.log('\n== Console health ==');
  ok(consoleErrors.length === 0, 'no console/page errors' + (consoleErrors.length ? ' -> ' + consoleErrors.join(' | ') : ''));

  await browser.close();
  srv.close();
  console.log('\n' + (failures ? `${failures} FAILURE(S)` : 'ALL CHECKS PASSED'));
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('\nTEST CRASH:', e.message); process.exit(2); });
