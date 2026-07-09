/* Audit: every hotspot in every scene must expose at least one tappable
   on-screen point (topmost element) across a wide range of phone/tablet
   viewports. Run: node test/reachability.js */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');
const PORT = 8737;
const ROOT = path.join(__dirname, '..', 'www');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((req, rq) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rq.writeHead(404); rq.end(); } else { rq.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' }); rq.end(d); } });
}).listen(PORT);

const VIEWPORTS = [
  ['iPhone SE 1st', 320, 568],
  ['small Android', 360, 640],
  ['tall Android 20:9', 360, 800],
  ['iPhone SE 2/3', 375, 667],
  ['iPhone 14/15', 390, 844],
  ['Pixel 7', 412, 915],
  ['iPhone Pro Max', 430, 932],
  ['Sony 21:9', 360, 822],
  ['iPad portrait', 768, 1024],
];

// scene -> flags that make all its hotspots visible/meaningful
const SCENE_STATES = {
  dock: {},
  exterior: { cliffsOpen: true },
  cottage: { cottageOpen: true },
  lamp: { lampOpen: true },
  cliffs: { cliffsOpen: true },
  cliffs_open: { cliffsOpen: true, caveOpen: true },
  cave: { cliffsOpen: true, caveOpen: true },
  /* chapter two */
  lamp2: { b_met: true },
  shore: {},
  shore_open: { b_shedOpen: true, b_hasHook: true },
  bellrock: {},
  bellrock_late: { b_seenBell: true, b_nestLooted: true, b_chainOn: true },
  /* chapter three */
  jail: {},
  jail_met: { c_met: true },
  dockstorm: { c_gotChart: true },
  office: {},
  office_done: { c_hasIron: true, c_gotChart: true },
  cliffs3: { c_gotChart: true },
  cliffs3_open: { c_gotChart: true, c_panelOpen: true, c_shutterOff: true },
  lamp3: { c_shutterOff: true, c_alvarBriefed: true, c_wound: true },
};
const SCENE_OF = {
  cliffs_open: 'cliffs', shore_open: 'shore', bellrock_late: 'bellrock',
  jail_met: 'jail', office_done: 'office', cliffs3_open: 'cliffs3',
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let failures = 0;
  for (const [name, w, h] of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForTimeout(250);
    for (const key of Object.keys(SCENE_STATES)) {
      const scene = SCENE_OF[key] || key;
      await page.evaluate(({ scene, flags }) => {
        localStorage.setItem('greyharbor_save_v1', JSON.stringify({ v: 1, scene, inv: [], clues: [], flags, introDone: true }));
      }, { scene, flags: SCENE_STATES[key] });
      await page.reload();
      await page.waitForTimeout(250);
      await page.locator('#btn-continue').click();
      await page.waitForTimeout(250);
      const missing = await page.evaluate(() => {
        const save = JSON.parse(localStorage.getItem('greyharbor_save_v1'));
        const defs = Scenes[save.scene].hotspots.filter(hs => !hs.visible || hs.visible(save.flags));
        const hits = document.querySelectorAll('#hotspot-layer .hotspot');
        const bad = [];
        defs.forEach((hs, i) => {
          const b = hits[i].getBoundingClientRect();
          let found = false;
          for (const fy of [.5, .3, .7, .15, .85]) for (const fx of [.5, .3, .7, .15, .85]) {
            const x = b.x + b.width * fx, y = b.y + b.height * fy;
            if (x < 2 || y < 2 || x > window.innerWidth - 2 || y > window.innerHeight - 2) continue;
            if (document.elementFromPoint(x, y) === hits[i]) { found = true; break; }
          }
          if (!found) bad.push(hs.id);
        });
        return bad;
      });
      if (missing.length) { failures++; console.log(`✗ ${name} (${w}x${h}) scene ${key}: unreachable -> ${missing.join(', ')}`); }
    }
    await page.close();
    console.log(`checked ${name} (${w}x${h})`);
  }
  await browser.close();
  console.log(failures ? `\n${failures} viewport/scene combos with unreachable hotspots` : '\nALL HOTSPOTS REACHABLE ON ALL VIEWPORTS');
  process.exit(failures ? 1 : 0);
})();
