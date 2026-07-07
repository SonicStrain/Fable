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
  // Tap a hotspot by id: find a screen point inside the hotspot where it is
  // actually the topmost element (a player aims at the visible part of an object).
  async function tap(hsId) {
    // dismiss any caption first, like a player tapping the text away
    await page.evaluate(() => {
      const c = document.getElementById('caption');
      if (!c.classList.contains('hidden')) c.click();
    });
    const r = await page.evaluate(id => {
      const save = JSON.parse(localStorage.getItem('greyharbor_save_v1'));
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
    }, hsId);
    if (r.err) throw new Error(r.err);
    await page.mouse.click(r.x, r.y); // real coordinate click through the compositor
    await page.waitForTimeout(120);
  }

  async function selectItem(itemId) {
    const idx = await page.evaluate(id => {
      const s = JSON.parse(localStorage.getItem('greyharbor_save_v1'));
      return s.inv.indexOf(id);
    }, itemId);
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
    return page.evaluate(() => JSON.parse(localStorage.getItem('greyharbor_save_v1')));
  }

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
      await page.locator('#dialog-overlay').click({ position: { x: Math.floor(vw / 2), y: vh - 90 } });
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

  console.log('\n== Post-game ==');
  await page.locator('#btn-again').click();
  await page.waitForTimeout(400);
  ok(await page.locator('#title-screen').isVisible(), 'back to title');
  ok(await page.locator('#btn-continue').isHidden(), 'save cleared after finishing');

  console.log('\n== Save/continue mid-game ==');
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
