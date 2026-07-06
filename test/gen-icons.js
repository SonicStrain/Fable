/* Renders the app icon + splash SVGs to PNG at every size Android/iOS need,
   using the pre-installed Chromium. Run: node test/gen-icons.js */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');

// Full-bleed icon (square). Key art: lighthouse beam at night.
function iconSvg(pad) {
  // pad=true renders the adaptive-icon foreground (content in inner 60%)
  const inner = `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a1128"/><stop offset="100%" stop-color="#23335f"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset="100%" stop-color="#ffe9a8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" fill="url(#sky)"/>
    <circle cx="76" cy="22" r="9" fill="#e9edf8"/>
    <circle cx="73" cy="19" r="2.2" fill="#c9cfdf"/><circle cx="79" cy="25" r="2.8" fill="#c9cfdf"/>
    <g fill="#dfe8ff"><circle cx="16" cy="14" r="1.4"/><circle cx="32" cy="24" r="1.1"/><circle cx="55" cy="12" r="1.3"/><circle cx="88" cy="44" r="1.2"/><circle cx="10" cy="38" r="1.1"/></g>
    <polygon points="50,26 96,12 96,40" fill="#ffe9a8" opacity=".3"/>
    <polygon points="50,26 4,16 4,42" fill="#ffe9a8" opacity=".18"/>
    <circle cx="50" cy="26" r="15" fill="url(#glow)"/>
    <path d="M0,100 L0,74 Q16,66 30,72 L52,80 Q60,83 60,90 L62,100 Z" fill="#0d1120"/>
    <g transform="translate(38,72)">
      <path d="M-12,0 L12,0 L7,-34 L-7,-34 Z" fill="#d5d9e2"/>
      <path d="M-10.4,-8 L10.4,-8 L9.5,-15 L-9.5,-15 Z" fill="#a8434f"/>
      <path d="M-8.6,-22 L8.6,-22 L8,-28 L-8,-28 Z" fill="#a8434f"/>
      <rect x="-8" y="-36" width="16" height="2.5" fill="#2b303c"/>
      <rect x="-5.5" y="-45" width="11" height="9" fill="#ffe9a8"/>
      <path d="M-7,-45.5 L7,-45.5 L0,-52 Z" fill="#2b303c"/>
      <rect x="-7,-45" width="0" height="0" fill="none"/>
    </g>
    <path d="M62,100 Q70,92 100,94 L100,100 Z" fill="#101830"/>`;
  if (!pad) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
  // adaptive foreground: shrink into safe zone over transparent bg
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g transform="translate(23,23) scale(.54)">${inner}</g></svg>`;
}

function splashSvg(w, h) {
  // simple centered lighthouse mark on night gradient, any aspect
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#060913"/><stop offset="100%" stop-color="#101a3d"/>
    </linearGradient>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe9a8" stop-opacity=".8"/><stop offset="100%" stop-color="#ffe9a8" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#s)"/>
    <g transform="translate(${w / 2},${h / 2}) scale(${Math.min(w, h) / 400})">
      <circle cx="0" cy="-64" r="46" fill="url(#g)"/>
      <path d="M-26,80 L26,80 L15,-30 L-15,-30 Z" fill="#d5d9e2"/>
      <path d="M-22.6,62 L22.6,62 L21,46 L-21,46 Z" fill="#a8434f"/>
      <path d="M-18.6,8 L18.6,8 L17,-6 L-17,-6 Z" fill="#a8434f"/>
      <rect x="-17" y="-34" width="34" height="5" fill="#2b303c"/>
      <rect x="-12" y="-56" width="24" height="20" fill="#ffe9a8"/>
      <path d="M-15,-57 L15,-57 L0,-72 Z" fill="#2b303c"/>
    </g>
  </svg>`;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  async function render(svg, w, h, out) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(`<!DOCTYPE html><style>*{margin:0}svg{display:block;width:${w}px;height:${h}px}</style>${svg}`);
    await page.screenshot({ path: out, omitBackground: false });
    await page.close();
    console.log('wrote', path.relative(ROOT, out), w + 'x' + h);
  }

  const A = p => path.join(ROOT, 'android/app/src/main/res', p);
  const sizes = { 'mipmap-mdpi': 48, 'mipmap-hdpi': 72, 'mipmap-xhdpi': 96, 'mipmap-xxhdpi': 144, 'mipmap-xxxhdpi': 192 };
  const fgSizes = { 'mipmap-mdpi': 108, 'mipmap-hdpi': 162, 'mipmap-xhdpi': 216, 'mipmap-xxhdpi': 324, 'mipmap-xxxhdpi': 432 };
  for (const [dir, s] of Object.entries(sizes)) {
    await render(iconSvg(false), s, s, A(`${dir}/ic_launcher.png`));
    await render(iconSvg(false), s, s, A(`${dir}/ic_launcher_round.png`));
    await render(iconSvg(true), fgSizes[dir], fgSizes[dir], A(`${dir}/ic_launcher_foreground.png`));
  }
  // iOS single 1024 icon
  await render(iconSvg(false), 1024, 1024, path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));

  // splashes (Capacitor default drawable dirs)
  const splashes = [
    ['drawable', 480, 320], // legacy landscape default
    ['drawable-land-mdpi', 480, 320], ['drawable-land-hdpi', 800, 480], ['drawable-land-xhdpi', 1280, 720],
    ['drawable-land-xxhdpi', 1600, 960], ['drawable-land-xxxhdpi', 1920, 1280],
    ['drawable-port-mdpi', 320, 480], ['drawable-port-hdpi', 480, 800], ['drawable-port-xhdpi', 720, 1280],
    ['drawable-port-xxhdpi', 960, 1600], ['drawable-port-xxxhdpi', 1280, 1920],
  ];
  for (const [dir, w, h] of splashes) {
    await render(splashSvg(w, h), w, h, A(`${dir}/splash.png`));
  }
  // iOS splash asset
  const iosSplash = path.join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset');
  if (fs.existsSync(iosSplash)) {
    for (const f of fs.readdirSync(iosSplash)) {
      if (f.endsWith('.png')) await render(splashSvg(2732, 2732), 2732, 2732, path.join(iosSplash, f));
    }
  }
  await browser.close();
  console.log('DONE');
})();
