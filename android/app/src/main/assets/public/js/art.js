/* ============================================================
   ART — hand-built SVG scenes for The Keeper of Grey Harbor.
   Every scene is a portrait 800x1200 viewBox rendered with
   preserveAspectRatio slice so it fills any phone screen.
   All gradient ids are prefixed per-scene (ids are global to
   the document, and several SVGs coexist in the DOM).
   ============================================================ */
'use strict';

const Art = (() => {

  function wrap(defs, body) {
    return `<svg viewBox="0 0 800 1200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
  }

  function stars(n, seed, yMax, prefix) {
    let s = '', x = seed;
    const rnd = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
    for (let i = 0; i < n; i++) {
      const cx = 20 + rnd() * 760, cy = 15 + rnd() * yMax, r = .8 + rnd() * 1.7;
      const dur = (2 + rnd() * 3).toFixed(1);
      s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(1)}" fill="#dfe8ff" opacity=".8">
        <animate attributeName="opacity" values=".8;.15;.8" dur="${dur}s" begin="${(rnd()*3).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
    }
    return `<g id="${prefix}-stars">${s}</g>`;
  }

  /* small helper: person silhouette (standing) */
  function figure(x, y, h, color, opts = {}) {
    const s = h / 100;
    return `<g transform="translate(${x},${y}) scale(${s})">
      <ellipse cx="0" cy="98" rx="16" ry="4" fill="rgba(0,0,0,.35)"/>
      <path d="M-11,96 L-9,52 Q-14,48 -13,34 Q-12,22 0,20 Q12,22 13,34 Q14,48 9,52 L11,96 L4,96 L2,60 L-2,60 L-4,96 Z" fill="${color}"/>
      <circle cx="0" cy="11" r="9.5" fill="${color}"/>
      ${opts.hood ? `<path d="M-11,12 Q-12,-2 0,-2 Q12,-2 11,12 Q6,4 0,4 Q-6,4 -11,12 Z" fill="${opts.hood}"/>` : ''}
      ${opts.cap ? `<path d="M-10,6 Q0,-4 10,6 L11,9 L-11,9 Z" fill="${opts.cap}"/>` : ''}
      ${opts.extra || ''}
    </g>`;
  }

  function lanternGlow(x, y, r, id) {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffd98a" stop-opacity=".85"/>
        <stop offset="45%" stop-color="#ffb54d" stop-opacity=".28"/>
        <stop offset="100%" stop-color="#ffb54d" stop-opacity="0"/>
      </radialGradient>`;
  }

  /* ------------------------------------------------ DOCK */
  function dock() {
    const defs = `
      <linearGradient id="dk-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#131a3d"/><stop offset="55%" stop-color="#3b2f63"/>
        <stop offset="82%" stop-color="#a35a4e"/><stop offset="100%" stop-color="#e08a52"/>
      </linearGradient>
      <linearGradient id="dk-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c97a4a"/><stop offset="18%" stop-color="#4a3a66"/>
        <stop offset="100%" stop-color="#101830"/>
      </linearGradient>
      <linearGradient id="dk-plank" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a3826"/><stop offset="100%" stop-color="#241a10"/>
      </linearGradient>
      ${lanternGlow(0,0,0,'dk-glow')}
      <radialGradient id="dk-beamglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset="100%" stop-color="#ffe9a8" stop-opacity="0"/>
      </radialGradient>`;

    const body = `
      <rect width="800" height="470" fill="url(#dk-sky)"/>
      ${stars(26, 7, 260, 'dk')}
      <!-- headland with lighthouse -->
      <path d="M480,470 L520,380 Q560,330 640,318 L800,300 L800,470 Z" fill="#1a1430"/>
      <g transform="translate(648,318)">
        <path d="M-13,0 L13,0 L9,-64 L-9,-64 Z" fill="#2a2244"/>
        <rect x="-10" y="-76" width="20" height="12" fill="#1a1430"/>
        <circle cx="0" cy="-70" r="7" fill="#ffe9a8"/>
        <circle cx="0" cy="-70" r="22" fill="url(#dk-beamglow)"/>
        <g>
          <polygon points="0,-70 320,-118 320,-22" fill="#ffe9a8" opacity=".16">
            <animateTransform attributeName="transform" type="rotate" values="-30 0 -70;14 0 -70;-30 0 -70" dur="9s" repeatCount="indefinite"/>
          </polygon>
        </g>
      </g>
      <!-- sea -->
      <rect y="470" width="800" height="360" fill="url(#dk-sea)"/>
      <g opacity=".5" stroke="#c9955f" stroke-width="2" fill="none">
        <path d="M40,520 q34,-6 70,0 t72,0"> <animate attributeName="opacity" values=".6;.15;.6" dur="4s" repeatCount="indefinite"/></path>
        <path d="M420,555 q40,-7 84,0 t80,0"><animate attributeName="opacity" values=".2;.6;.2" dur="5s" repeatCount="indefinite"/></path>
        <path d="M180,640 q45,-8 90,0 t86,0"><animate attributeName="opacity" values=".5;.1;.5" dur="6s" repeatCount="indefinite"/></path>
        <path d="M500,705 q40,-8 88,0 t70,0"><animate attributeName="opacity" values=".15;.5;.15" dur="4.4s" repeatCount="indefinite"/></path>
      </g>
      <!-- moored boat -->
      <g transform="translate(150,700)">
        <animateTransform attributeName="transform" type="translate" values="150,700;150,706;150,700" dur="5s" repeatCount="indefinite"/>
        <path d="M-92,10 Q0,44 96,8 L74,44 Q0,66 -70,44 Z" fill="#2c2033"/>
        <path d="M-92,10 Q0,40 96,8 L92,16 Q0,50 -86,18 Z" fill="#54394a"/>
        <rect x="-6" y="-78" width="7" height="92" fill="#3a2b3f"/>
        <path d="M4,-72 L58,-14 L4,-14 Z" fill="#8d7f96" opacity=".9"/>
        <circle cx="-38" cy="22" r="5" fill="#ffd98a" opacity=".9"/>
      </g>
      <!-- pier -->
      <path d="M0,830 L800,790 L800,1200 L0,1200 Z" fill="url(#dk-plank)"/>
      <g stroke="#120c06" stroke-width="4" opacity=".7">
        <path d="M0,905 L800,862"/><path d="M0,990 L800,948"/><path d="M0,1082 L800,1042"/>
      </g>
      <g stroke="#5c4630" stroke-width="2" opacity=".35">
        <path d="M120,833 L96,1200"/><path d="M330,822 L318,1200"/><path d="M545,812 L548,1200"/><path d="M736,803 L760,1200"/>
      </g>
      <!-- bollard + gull -->
      <g transform="translate(72,776)">
        <path d="M-16,56 L16,56 L12,0 Q0,-10 -12,0 Z" fill="#171009"/>
        <g transform="translate(2,-8)">
          <ellipse cx="0" cy="0" rx="13" ry="9" fill="#cfd4de"/>
          <circle cx="10" cy="-7" r="6" fill="#cfd4de"/>
          <polygon points="15,-8 24,-6 15,-4" fill="#e2a23c"/>
          <path d="M-11,-2 Q-2,-9 8,-3 Q-2,2 -11,-2" fill="#9aa2b2"/>
        </g>
      </g>
      <!-- lamppost -->
      <g transform="translate(700,560)">
        <rect x="-5" y="0" width="10" height="330" fill="#0d0a12"/>
        <path d="M-22,0 L22,0 L14,-40 L-14,-40 Z" fill="#0d0a12"/>
        <rect x="-11" y="-36" width="22" height="30" rx="4" fill="#ffcf72" opacity=".95">
          <animate attributeName="opacity" values=".95;.8;.95" dur="3s" repeatCount="indefinite"/>
        </rect>
        <circle cx="0" cy="-20" r="90" fill="url(#dk-glow)"/>
      </g>
      <!-- crates -->
      <g transform="translate(640,860)">
        <rect x="-60" y="-70" width="120" height="86" rx="4" fill="#4d3a22"/>
        <path d="M-60,-70 L60,16 M60,-70 L-60,16" stroke="#2c2011" stroke-width="7"/>
        <rect x="-60" y="-70" width="120" height="86" rx="4" fill="none" stroke="#2c2011" stroke-width="7"/>
        <rect x="-42" y="-130" width="86" height="62" rx="4" fill="#5a4527"/>
        <rect x="-42" y="-130" width="86" height="62" rx="4" fill="none" stroke="#33260f" stroke-width="6"/>
        <text x="0" y="-92" font-size="26" fill="#2c2011" text-anchor="middle" font-family="Georgia">GH</text>
      </g>
      <!-- Marta -->
      <g transform="translate(408,760)">
        <circle cx="34" cy="52" r="86" fill="url(#dk-glow)"/>
        ${figure(0, -36, 150, '#20304a', { hood: '#31486b', extra: `
          <path d="M11,50 L26,50 L26,64" stroke="#20304a" stroke-width="5" fill="none"/>
          <g transform="translate(26,72)"><rect x="-7" y="-8" width="14" height="18" rx="3" fill="#1a140b" stroke="#0d0a06" stroke-width="2"/><rect x="-4" y="-5" width="8" height="12" fill="#ffd98a"><animate attributeName="opacity" values="1;.7;1" dur="2.2s" repeatCount="indefinite"/></rect></g>`})}
      </g>
      <!-- signpost to lighthouse -->
      <g transform="translate(268,742)">
        <rect x="-5" y="-90" width="10" height="150" fill="#241a10"/>
        <path d="M-58,-88 L44,-88 L64,-72 L44,-56 L-58,-56 Z" fill="#3d2d1a" stroke="#191108" stroke-width="3"/>
        <text x="-6" y="-66" font-size="22" fill="#d8b877" text-anchor="middle" font-family="Georgia" font-style="italic">Lighthouse</text>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ EXTERIOR */
  function exterior() {
    const defs = `
      <linearGradient id="ex-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#060a1c"/><stop offset="70%" stop-color="#14204a"/><stop offset="100%" stop-color="#23335f"/>
      </linearGradient>
      <linearGradient id="ex-grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1d2b35"/><stop offset="100%" stop-color="#0d151b"/>
      </linearGradient>
      <linearGradient id="ex-tower" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7e8896"/><stop offset="45%" stop-color="#d5d9e2"/><stop offset="100%" stop-color="#6c7684"/>
      </linearGradient>
      <linearGradient id="ex-band" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5e2430"/><stop offset="45%" stop-color="#a8434f"/><stop offset="100%" stop-color="#54202a"/>
      </linearGradient>
      ${lanternGlow(0,0,0,'ex-glow')}
      <radialGradient id="ex-moonglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8ecf7" stop-opacity=".5"/><stop offset="100%" stop-color="#e8ecf7" stop-opacity="0"/>
      </radialGradient>`;

    const body = `
      <rect width="800" height="900" fill="url(#ex-sky)"/>
      ${stars(34, 41, 420, 'ex')}
      <circle cx="660" cy="150" r="120" fill="url(#ex-moonglow)"/>
      <circle cx="660" cy="150" r="46" fill="#e9edf8"/>
      <circle cx="644" cy="138" r="9" fill="#c9cfdf"/><circle cx="676" cy="164" r="12" fill="#c9cfdf"/><circle cx="662" cy="172" r="5" fill="#c9cfdf"/>
      <!-- lighthouse -->
      <g transform="translate(250,0)">
        <path d="M-58,830 L58,830 L34,260 L-34,260 Z" fill="url(#ex-tower)"/>
        <path d="M-51,690 L51,690 L48,600 L-48,600 Z" fill="url(#ex-band)"/>
        <path d="M-42,470 L42,470 L40,390 L-40,390 Z" fill="url(#ex-band)"/>
        <path d="M-40,260 L40,260 L40,238 L-40,238 Z" fill="#3a4150"/>
        <rect x="-26" y="180" width="52" height="58" fill="#141a26"/>
        <rect x="-22" y="186" width="44" height="46" fill="#ffe9a8">
          <animate attributeName="opacity" values="1;.75;1" dur="4s" repeatCount="indefinite"/>
        </rect>
        <circle cx="0" cy="209" r="86" fill="url(#ex-glow)" opacity=".8"/>
        <path d="M-34,180 L34,180 L0,142 Z" fill="#2b303c"/>
        <g stroke="#2b303c" stroke-width="5"><path d="M-30,238 L-30,180 M30,238 L30,180"/></g>
        <rect x="-14" y="330" width="28" height="42" rx="12" fill="#141a26"/>
        <rect x="-14" y="510" width="28" height="42" rx="12" fill="#141a26"/>
        <!-- door -->
        <path d="M-40,830 L40,830 L40,716 Q0,690 -40,716 Z" fill="#33241a"/>
        <path d="M-32,830 L32,830 L32,722 Q0,700 -32,722 Z" fill="#4a3524"/>
        <path d="M-32,780 L32,780 M0,700 L0,830" stroke="#241a10" stroke-width="4"/>
        <circle cx="18" cy="770" r="5" fill="#c9a24a"/>
        <path d="M-26,742 a26,26 0 0 1 52,0" fill="none" stroke="#241a10" stroke-width="4"/>
        <text x="0" y="756" font-size="15" fill="#d8c48a" text-anchor="middle" font-family="Georgia">EST. 1893</text>
      </g>
      <!-- cottage -->
      <g transform="translate(595,540)">
        <path d="M-165,290 L165,290 L165,90 L-165,90 Z" fill="#2e3140"/>
        <path d="M-185,96 L0,-30 L185,96 Z" fill="#1c1f2c"/>
        <rect x="66" y="-16" width="34" height="76" fill="#242835"/>
        <path d="M62,-20 L104,-20 L104,-12 L62,-12 Z" fill="#141720"/>
        <g opacity=".85"><ellipse cx="83" cy="-46" rx="12" ry="9" fill="#5a6272">
          <animate attributeName="opacity" values=".7;0" dur="4s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;10,-36" dur="4s" repeatCount="indefinite"/>
        </ellipse></g>
        <!-- door -->
        <rect x="-42" y="120" width="86" height="170" rx="4" fill="#1f1610"/>
        <rect x="-34" y="128" width="70" height="162" fill="#3d2c1d"/>
        <circle cx="20" cy="212" r="6" fill="#b08d3e"/>
        <path d="M-34,208 L36,208 M1,128 L1,290" stroke="#241a10" stroke-width="4"/>
        <!-- window -->
        <rect x="70" y="140" width="76" height="88" rx="4" fill="#141720"/>
        <rect x="76" y="146" width="64" height="76" fill="#26314f"/>
        <path d="M108,146 L108,222 M76,184 L140,184" stroke="#141720" stroke-width="5"/>
        <!-- flowerpot -->
        <g transform="translate(-84,262)">
          <path d="M-24,0 L24,0 L17,30 L-17,30 Z" fill="#8a4b2e"/>
          <g fill="#e8a33c"><circle cx="-11" cy="-10" r="8"/><circle cx="4" cy="-15" r="9"/><circle cx="16" cy="-7" r="7"/></g>
          <g fill="#b5762a"><circle cx="-11" cy="-10" r="3"/><circle cx="4" cy="-15" r="3.5"/><circle cx="16" cy="-7" r="2.5"/></g>
          <path d="M-8,0 L-10,-6 M4,0 L4,-8 M13,0 L15,-4" stroke="#3f5a2e" stroke-width="3"/>
        </g>
      </g>
      <!-- ground -->
      <path d="M0,860 Q200,820 420,838 Q640,856 800,826 L800,1200 L0,1200 Z" fill="url(#ex-grass)"/>
      <path d="M120,1200 Q170,1020 250,880 L330,880 Q270,1030 240,1200 Z" fill="#2a2318" opacity=".9"/>
      <!-- woodpile with pry bar -->
      <g transform="translate(105,870)">
        <g fill="#4a3521" stroke="#241a10" stroke-width="3">
          <ellipse cx="-40" cy="26" rx="26" ry="15"/><ellipse cx="14" cy="28" rx="26" ry="15"/><ellipse cx="66" cy="26" rx="24" ry="14"/>
          <ellipse cx="-14" cy="2" rx="26" ry="15"/><ellipse cx="40" cy="2" rx="25" ry="14"/><ellipse cx="13" cy="-22" rx="25" ry="14"/>
        </g>
        <g fill="#6b5230"><ellipse cx="-40" cy="26" rx="14" ry="8"/><ellipse cx="14" cy="28" rx="14" ry="8"/><ellipse cx="66" cy="26" rx="13" ry="7"/><ellipse cx="-14" cy="2" rx="14" ry="8"/><ellipse cx="40" cy="2" rx="13" ry="7"/><ellipse cx="13" cy="-22" rx="13" ry="7"/></g>
        <g transform="translate(58,-40) rotate(-24)">
          <rect x="-4" y="-38" width="8" height="76" rx="4" fill="#7d8896"/>
          <path d="M-4,-38 Q-16,-46 -12,-56 L0,-48 Z" fill="#7d8896"/>
          <animate attributeName="opacity" values="1;.55;1" dur="2.6s" repeatCount="indefinite"/>
        </g>
      </g>
      <!-- fence -->
      <g stroke="#242c38" stroke-width="8" opacity=".9">
        <path d="M430,930 L800,905"/><path d="M430,975 L800,952"/>
        <path d="M450,900 L450,1000 M540,894 L540,995 M630,888 L630,988 M720,882 L720,980"/>
      </g>
      <!-- sign to dock -->
      <g transform="translate(120,1060)">
        <rect x="-5" y="-70" width="10" height="120" fill="#241a10"/>
        <path d="M-64,-70 L40,-70 L-64,-38 L40,-38" fill="none"/>
        <path d="M40,-70 L-56,-70 L-76,-54 L-56,-38 L40,-38 Z" fill="#3d2d1a" stroke="#191108" stroke-width="3"/>
        <text x="-8" y="-47" font-size="21" fill="#d8b877" text-anchor="middle" font-family="Georgia" font-style="italic">Harbor</text>
      </g>
      <!-- cliff path (dark notch right) -->
      <g transform="translate(690,940)">
        <path d="M-52,80 Q-30,20 6,-16 Q30,-40 58,-46 L58,120 L-52,120 Z" fill="#0a0e14"/>
        <path d="M-30,70 Q-10,26 22,-8" stroke="#2c3542" stroke-width="6" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ COTTAGE INTERIOR */
  function cottage() {
    const defs = `
      <linearGradient id="ct-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a2f2a"/><stop offset="100%" stop-color="#52413a"/>
      </linearGradient>
      <linearGradient id="ct-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a3421"/><stop offset="100%" stop-color="#241708"/>
      </linearGradient>
      <radialGradient id="ct-fireglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff9b3d" stop-opacity=".55"/><stop offset="100%" stop-color="#ff9b3d" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ct-moonlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9fb4e8" stop-opacity=".9"/><stop offset="100%" stop-color="#31406b" stop-opacity=".85"/>
      </linearGradient>`;

    const body = `
      <rect width="800" height="880" fill="url(#ct-wall)"/>
      <g stroke="#2c231f" stroke-width="3" opacity=".5">
        <path d="M0,120 H800 M0,340 H800 M0,560 H800 M0,780 H800"/>
      </g>
      <path d="M0,880 L800,880 L800,1200 L0,1200 Z" fill="url(#ct-floor)"/>
      <g stroke="#140c04" stroke-width="3" opacity=".6">
        <path d="M0,960 H800 M0,1060 H800 M0,1160 H800"/>
        <path d="M140,880 L110,1200 M400,880 L400,1200 M660,880 L692,1200"/>
      </g>
      <!-- window (moonlight) -->
      <g transform="translate(135,340)">
        <rect x="-78" y="-84" width="156" height="176" rx="6" fill="#241a12"/>
        <rect x="-66" y="-72" width="132" height="152" fill="url(#ct-moonlight)"/>
        <circle cx="30" cy="-30" r="20" fill="#e9edf8" opacity=".95"/>
        <path d="M0,-72 L0,80 M-66,4 L66,4" stroke="#241a12" stroke-width="8"/>
        <path d="M-66,86 L66,86 L74,98 L-74,98 Z" fill="#241a12"/>
      </g>
      <!-- clock stopped at 7:25 -->
      <g transform="translate(345,350)">
        <rect x="-42" y="-96" width="84" height="196" rx="10" fill="#2c1d10" stroke="#17100a" stroke-width="4"/>
        <circle cx="0" cy="-46" r="34" fill="#e7dcc2" stroke="#8a6a34" stroke-width="4"/>
        <g stroke="#3a2f1b" stroke-width="2">
          <path d="M0,-76 L0,-70 M0,-22 L0,-16 M-30,-46 L-24,-46 M24,-46 L30,-46"/>
        </g>
        <!-- hands read 7:25 -->
        <path d="M0,-46 L-13,-33" stroke="#3a2f1b" stroke-width="4" stroke-linecap="round"/>
        <path d="M0,-46 L12,-25" stroke="#3a2f1b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="0" cy="-46" r="3" fill="#3a2f1b"/>
        <rect x="-16" y="8" width="32" height="70" rx="6" fill="#17100a"/>
        <circle cx="0" cy="30" r="9" fill="#c9a24a" opacity=".9"/>
      </g>
      <!-- painting of a ship -->
      <g transform="translate(565,330)">
        <rect x="-92" y="-72" width="184" height="140" fill="#8a6a34"/>
        <rect x="-82" y="-62" width="164" height="120" fill="#1c2c47"/>
        <path d="M-82,20 Q-40,10 0,18 Q42,26 82,14 L82,58 L-82,58 Z" fill="#0f1b30"/>
        <g transform="translate(-6,6)">
          <path d="M-34,14 Q0,26 36,12 L26,26 Q0,34 -26,26 Z" fill="#241a10"/>
          <rect x="-2" y="-34" width="4" height="48" fill="#241a10"/>
          <path d="M2,-32 L26,-6 L2,-6 Z" fill="#cfc4a0"/>
          <path d="M-2,-32 L-22,-8 L-2,-8 Z" fill="#b3a67f"/>
        </g>
        <circle cx="56" cy="-38" r="12" fill="#dfe4f0" opacity=".9"/>
        <text x="0" y="52" font-size="13" fill="#8a6a34" text-anchor="middle" font-family="Georgia" font-style="italic">The Marigold — 1893</text>
      </g>
      <!-- shelf with oil can -->
      <g transform="translate(712,520)">
        <path d="M-66,26 L66,26 L66,36 L-66,36 Z" fill="#2c1d10"/>
        <g transform="translate(-30,24)">
          <path d="M-14,0 L14,0 L11,-34 L-11,-34 Z" fill="#5f6b4a"/>
          <path d="M-11,-34 L11,-34 L6,-42 L-6,-42 Z" fill="#4a5439"/>
          <path d="M6,-40 L22,-52" stroke="#4a5439" stroke-width="5" stroke-linecap="round"/>
          <circle cx="0" cy="-16" r="7" fill="#3c452e"/>
        </g>
        <g transform="translate(34,24)">
          <rect x="-12" y="-30" width="24" height="30" rx="3" fill="#37424f"/>
          <rect x="-8" y="-26" width="16" height="10" fill="#202730"/>
        </g>
      </g>
      <!-- fireplace -->
      <g transform="translate(160,880)">
        <path d="M-120,0 L120,0 L120,-260 L-120,-260 Z" fill="#3b3a44"/>
        <g fill="#4c4b57" stroke="#28272f" stroke-width="3">
          <rect x="-120" y="-260" width="240" height="34"/>
          <rect x="-114" y="-220" width="52" height="30"/><rect x="-56" y="-220" width="52" height="30"/><rect x="2" y="-220" width="52" height="30"/><rect x="60" y="-220" width="52" height="30"/>
          <rect x="-114" y="-186" width="40" height="30"/><rect x="76" y="-186" width="38" height="30"/>
          <rect x="-114" y="-152" width="40" height="30"/><rect x="76" y="-152" width="38" height="30"/>
          <rect x="-114" y="-118" width="40" height="30"/><rect x="76" y="-118" width="38" height="30"/>
          <rect x="-114" y="-84" width="40" height="30"/><rect x="76" y="-84" width="38" height="30"/>
          <rect x="-114" y="-50" width="40" height="46"/><rect x="76" y="-50" width="38" height="46"/>
        </g>
        <path d="M-72,-4 L72,-4 L72,-150 Q0,-190 -72,-150 Z" fill="#0d0906"/>
        <circle cx="0" cy="-60" r="120" fill="url(#ct-fireglow)">
          <animate attributeName="opacity" values="1;.6;1" dur="2.8s" repeatCount="indefinite"/>
        </circle>
        <g>
          <path d="M-34,-8 Q-38,-52 -10,-64 Q-22,-38 0,-30 Q4,-58 24,-66 Q20,-40 36,-30 Q40,-16 30,-8 Z" fill="#ff8c2e">
            <animate attributeName="opacity" values="1;.65;1" dur="1.6s" repeatCount="indefinite"/>
          </path>
          <path d="M-18,-8 Q-16,-36 2,-42 Q-2,-24 12,-18 Q16,-12 10,-8 Z" fill="#ffd25e">
            <animate attributeName="opacity" values=".9;.5;.9" dur="1.1s" repeatCount="indefinite"/>
          </path>
        </g>
        <ellipse cx="-30" cy="-6" rx="18" ry="7" fill="#1c1208"/><ellipse cx="18" cy="-4" rx="20" ry="7" fill="#241a0c"/>
        <path d="M46,-12 L64,-30 L58,-6 Z" fill="#d8ceb2" opacity=".92"/>
        <path d="M-134,10 L134,10 L120,-8 L-120,-8 Z" fill="#28272f"/>
      </g>
      <!-- armchair -->
      <g transform="translate(392,850)">
        <path d="M-64,20 Q-78,-90 -44,-104 Q-50,-40 -30,-26 L-30,20 Z" fill="#5a2e35"/>
        <path d="M64,20 Q78,-90 44,-104 Q50,-40 30,-26 L30,20 Z" fill="#5a2e35"/>
        <path d="M-44,-26 Q0,-44 44,-26 L44,-96 Q0,-122 -44,-96 Z" fill="#6b3840"/>
        <path d="M-44,-26 Q0,-8 44,-26 L44,20 Q0,36 -44,20 Z" fill="#7d434c"/>
        <path d="M-58,20 L-50,60 M58,20 L50,60" stroke="#241708" stroke-width="9" stroke-linecap="round"/>
        <path d="M-20,-58 Q0,-70 20,-58 L16,-30 Q0,-38 -16,-30 Z" fill="#8a5a4a" opacity=".7"/>
      </g>
      <!-- desk -->
      <g transform="translate(630,860)">
        <path d="M-130,-58 L130,-58 L130,-38 L-130,-38 Z" fill="#4a3018"/>
        <path d="M-118,-38 L118,-38 L110,120 L-110,120 Z" fill="#3a2410"/>
        <rect x="-84" y="-24" width="168" height="44" rx="5" fill="#54371c" stroke="#241708" stroke-width="3"/>
        <circle cx="0" cy="-2" r="8" fill="#c9a24a"/>
        <rect x="-24" y="-8" width="48" height="12" rx="3" fill="#2c1a0a"/>
        <!-- items on desk -->
        <g transform="translate(-78,-70)">
          <rect x="-24" y="0" width="48" height="12" rx="2" fill="#6e5a2e"/>
          <rect x="-20" y="-10" width="40" height="10" rx="2" fill="#7a3c30"/>
        </g>
        <g transform="translate(66,-78)">
          <path d="M-12,20 L12,20 L8,0 Q0,-6 -8,0 Z" fill="#3f5266"/>
          <ellipse cx="0" cy="-2" rx="7" ry="9" fill="#dce4f2" opacity=".9"/>
          <path d="M0,-10 L0,-22" stroke="#dce4f2" stroke-width="2"/>
        </g>
      </g>
      <!-- rug + door out -->
      <g transform="translate(400,1120)">
        <ellipse cx="0" cy="0" rx="230" ry="64" fill="#5a2e35"/>
        <ellipse cx="0" cy="0" rx="180" ry="46" fill="none" stroke="#7d434c" stroke-width="7"/>
        <ellipse cx="0" cy="0" rx="120" ry="30" fill="none" stroke="#3d1f24" stroke-width="6"/>
      </g>
      <circle cx="160" cy="820" r="170" fill="url(#ct-fireglow)" opacity=".5"/>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ LAMP ROOM */
  function lamp() {
    const defs = `
      <linearGradient id="lp-nightsea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a1024"/><stop offset="62%" stop-color="#18234a"/><stop offset="66%" stop-color="#0c1530"/><stop offset="100%" stop-color="#060b1a"/>
      </linearGradient>
      <linearGradient id="lp-brass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7a5c22"/><stop offset="50%" stop-color="#d9b25c"/><stop offset="100%" stop-color="#6e5320"/>
      </linearGradient>
      <radialGradient id="lp-lens" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stop-color="#fff3c4"/><stop offset="45%" stop-color="#ffd66e"/><stop offset="80%" stop-color="#c98a2e"/><stop offset="100%" stop-color="#8a5a18"/>
      </radialGradient>
      ${lanternGlow(0,0,0,'lp-glow')}
      <linearGradient id="lp-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3d3222"/><stop offset="100%" stop-color="#1c150c"/>
      </linearGradient>`;

    const body = `
      <!-- panoramic windows -->
      <rect width="800" height="820" fill="url(#lp-nightsea)"/>
      ${stars(20, 99, 380, 'lp')}
      <circle cx="140" cy="200" r="34" fill="#e9edf8" opacity=".95"/>
      <g opacity=".5" stroke="#39518c" stroke-width="2" fill="none">
        <path d="M60,560 q40,-6 80,0 t76,0"><animate attributeName="opacity" values=".5;.15;.5" dur="5s" repeatCount="indefinite"/></path>
        <path d="M480,600 q44,-7 90,0 t80,0"><animate attributeName="opacity" values=".15;.5;.15" dur="6s" repeatCount="indefinite"/></path>
      </g>
      <!-- window mullions -->
      <g stroke="#241d12" stroke-width="26">
        <path d="M100,0 L100,820 M370,0 L370,820 M640,0 L640,820"/>
        <path d="M0,90 L800,90"/>
      </g>
      <g stroke="#3d3222" stroke-width="8"><path d="M100,0 L100,820 M370,0 L370,820 M640,0 L640,820 M0,90 L800,90"/></g>
      <!-- floor -->
      <path d="M0,820 L800,820 L800,1200 L0,1200 Z" fill="url(#lp-floor)"/>
      <ellipse cx="400" cy="838" rx="430" ry="46" fill="#2c2415"/>
      <!-- brass rail -->
      <path d="M0,760 Q400,700 800,760" fill="none" stroke="url(#lp-brass)" stroke-width="12"/>
      <path d="M60,760 L60,830 M260,726 L260,808 M540,726 L540,808 M740,760 L740,830" stroke="url(#lp-brass)" stroke-width="8"/>
      <!-- the great lens -->
      <g transform="translate(400,560)">
        <circle cx="0" cy="30" r="230" fill="url(#lp-glow)" opacity=".9">
          <animate attributeName="opacity" values=".9;.55;.9" dur="4s" repeatCount="indefinite"/>
        </circle>
        <path d="M-90,300 L90,300 L70,236 L-70,236 Z" fill="#33291a"/>
        <path d="M-100,300 L100,300 L100,318 L-100,318 Z" fill="#241d12"/>
        <ellipse cx="0" cy="30" rx="118" ry="210" fill="url(#lp-lens)"/>
        <g fill="none" stroke="#8a5a18" stroke-width="6" opacity=".8">
          <ellipse cx="0" cy="30" rx="118" ry="210"/>
          <ellipse cx="0" cy="30" rx="88" ry="168"/>
          <ellipse cx="0" cy="30" rx="58" ry="118"/>
          <path d="M-118,30 L118,30 M-104,-72 L104,-72 M-104,132 L104,132"/>
        </g>
        <ellipse cx="-34" cy="-58" rx="24" ry="66" fill="#fff8dc" opacity=".55"/>
        <path d="M-124,-176 L124,-176 L96,-206 L-96,-206 Z" fill="#33291a"/>
        <path d="M-70,236 L-70,-176 M70,236 L70,-176" stroke="#33291a" stroke-width="10"/>
      </g>
      <!-- logbook stand -->
      <g transform="translate(150,800)">
        <path d="M-10,60 L10,60 L6,-40 L-6,-40 Z" fill="#33291a"/>
        <g transform="rotate(-14 0 -52)">
          <rect x="-58" y="-84" width="116" height="66" rx="4" fill="#4a3018"/>
          <rect x="-50" y="-78" width="48" height="54" fill="#e7dcc2"/>
          <rect x="2" y="-78" width="48" height="54" fill="#efe6cf"/>
          <g stroke="#8a7a56" stroke-width="2" opacity=".8">
            <path d="M-42,-66 h34 M-42,-58 h34 M-42,-50 h30 M-42,-42 h34 M10,-66 h34 M10,-58 h30 M10,-50 h34"/>
          </g>
        </g>
      </g>
      <!-- telescope -->
      <g transform="translate(662,700)">
        <path d="M-30,110 L0,20 L30,110" stroke="#33291a" stroke-width="10" fill="none"/>
        <g transform="rotate(-32 0 20)">
          <rect x="-14" y="-88" width="28" height="112" rx="10" fill="url(#lp-brass)"/>
          <rect x="-10" y="-108" width="20" height="24" rx="8" fill="#8a6a34"/>
          <circle cx="0" cy="-104" r="7" fill="#bfe0ff" opacity=".9"/>
        </g>
      </g>
      <!-- stair hatch -->
      <g transform="translate(400,1080)">
        <ellipse cx="0" cy="0" rx="150" ry="52" fill="#0d0906"/>
        <path d="M-150,0 A150,52 0 0 1 150,0" fill="none" stroke="#4a3b22" stroke-width="8"/>
        <path d="M-96,10 L96,10 M-120,-6 L120,-6 M-70,26 L70,26" stroke="#241d12" stroke-width="10"/>
        <path d="M-40,-40 Q0,-52 40,-40" stroke="url(#lp-brass)" stroke-width="7" fill="none"/>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ CLIFFS */
  function cliffs(beamOn, gateOpen) {
    const defs = `
      <linearGradient id="cl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070c1e"/><stop offset="100%" stop-color="#1a2a52"/>
      </linearGradient>
      <linearGradient id="cl-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#22355e"/><stop offset="100%" stop-color="#0a1226"/>
      </linearGradient>
      <linearGradient id="cl-rock" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2c2f3d"/><stop offset="100%" stop-color="#13151f"/>
      </linearGradient>
      <radialGradient id="cl-moonglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8ecf7" stop-opacity=".45"/><stop offset="100%" stop-color="#e8ecf7" stop-opacity="0"/>
      </radialGradient>`;

    const beam = beamOn ? `
      <g opacity=".8">
        <polygon points="86,26 600,660 700,600 130,10" fill="#ffe9a8" opacity=".22"/>
        <polygon points="96,22 620,648 660,624 120,14" fill="#fff3c4" opacity=".3">
          <animate attributeName="opacity" values=".3;.5;.3" dur="3s" repeatCount="indefinite"/>
        </polygon>
      </g>` : '';

    const body = `
      <rect width="800" height="700" fill="url(#cl-sky)"/>
      ${stars(26, 133, 340, 'cl')}
      <circle cx="560" cy="140" r="110" fill="url(#cl-moonglow)"/>
      <circle cx="560" cy="140" r="40" fill="#e9edf8"/>
      <!-- distant lighthouse, source of the beam -->
      <g transform="translate(86,60)">
        <path d="M-10,0 L10,0 L7,-44 L-7,-44 Z" fill="#1a1430"/>
        <circle cx="0" cy="-40" r="6" fill="#ffe9a8"/>
      </g>
      <rect y="700" width="800" height="220" fill="url(#cl-sea)"/>
      <g opacity=".6" stroke="#5a76b5" stroke-width="2.5" fill="none">
        <path d="M60,760 q40,-7 84,0 t76,0"><animate attributeName="opacity" values=".6;.2;.6" dur="4s" repeatCount="indefinite"/></path>
        <path d="M320,820 q46,-8 92,0 t84,0"><animate attributeName="opacity" values=".2;.6;.2" dur="5.4s" repeatCount="indefinite"/></path>
      </g>
      ${beam}
      <!-- cliff mass right -->
      <path d="M330,1200 L360,940 Q330,760 430,600 Q470,520 470,430 L560,300 L800,240 L800,1200 Z" fill="url(#cl-rock)"/>
      <path d="M470,430 Q520,470 540,560 M430,600 Q490,640 500,730" stroke="#0c0e16" stroke-width="7" fill="none" opacity=".7"/>
      <!-- cave mouth + winch gate -->
      <g transform="translate(590,760)">
        <path d="M-120,220 Q-140,40 -40,-60 Q40,-130 130,-90 L150,220 Z" fill="#05070d"/>
        <path d="M-120,220 Q-140,40 -40,-60 Q40,-130 130,-90" fill="none" stroke="#3d4356" stroke-width="10"/>
        <!-- gate (squashes upward when winched open) -->
        <g id="cl-gate" ${gateOpen ? 'transform="translate(0,-118) scale(1,.3)"' : ''}>
          <path d="M-96,200 L-100,-20 M-52,214 L-58,-72 M-6,220 L-8,-102 M42,222 L40,-112 M92,220 L92,-100" stroke="#3b2c17" stroke-width="20"/>
          <path d="M-106,-8 L104,-56 M-108,80 L108,60 M-106,160 L110,150" stroke="#4a3a20" stroke-width="16"/>
          <circle cx="-30" cy="66" r="10" fill="#1c150c"/>
        </g>
        ${gateOpen ? '<radialGradient id="cl-cavelight" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffb54d" stop-opacity=".35"/><stop offset="100%" stop-color="#ffb54d" stop-opacity="0"/></radialGradient><ellipse cx="0" cy="120" rx="110" ry="90" fill="url(#cl-cavelight)"><animate attributeName="opacity" values="1;.6;1" dur="2.6s" repeatCount="indefinite"/></ellipse>' : ''}
        <!-- winch -->
        <g transform="translate(112,64)">
          <rect x="-14" y="-10" width="46" height="120" rx="8" fill="#241d12"/>
          <circle cx="8" cy="22" r="30" fill="#3b2c17" stroke="#191108" stroke-width="5"/>
          <circle cx="8" cy="22" r="9" fill="#0d0a06"/>
          <path d="M8,-6 L8,50 M-20,22 L36,22" stroke="#191108" stroke-width="6"/>
          <path d="M-14,26 Q-60,40 -96,34" stroke="#1c150c" stroke-width="6" fill="none"/>
        </g>
      </g>
      <!-- stone stair from top left -->
      <path d="M0,340 L200,340 L200,1200 L0,1200 Z" fill="#171923"/>
      <g fill="#232636">
        <path d="M0,420 L170,420 L170,470 L0,470 Z"/><path d="M0,520 L150,520 L150,570 L0,570 Z"/>
        <path d="M0,620 L165,620 L165,672 L0,672 Z"/><path d="M0,724 L148,724 L148,776 L0,776 Z"/>
        <path d="M0,828 L168,828 L168,882 L0,882 Z"/><path d="M0,934 L150,934 L150,988 L0,988 Z"/>
        <path d="M0,1040 L166,1040 L166,1096 L0,1096 Z"/><path d="M0,1148 L152,1148 L152,1200 L0,1200 Z"/>
      </g>
      <!-- tide pools -->
      <g transform="translate(260,1080)">
        <ellipse cx="0" cy="0" rx="92" ry="34" fill="#0f1c33"/>
        <ellipse cx="-14" cy="-4" rx="56" ry="17" fill="#25436e" opacity=".7">
          <animate attributeName="opacity" values=".7;.35;.7" dur="4.5s" repeatCount="indefinite"/>
        </ellipse>
        <circle cx="44" cy="6" r="4" fill="#e88a5a"/><circle cx="52" cy="-2" r="3" fill="#e8b45a"/>
        <path d="M-70,26 L-92,40 M70,24 L96,36" stroke="#232636" stroke-width="10" stroke-linecap="round"/>
      </g>
      <!-- foam -->
      <g fill="#cfe0f5" opacity=".5">
        <ellipse cx="380" cy="1176" rx="60" ry="10"><animate attributeName="opacity" values=".5;.1;.5" dur="3.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="120" cy="710" rx="70" ry="9"><animate attributeName="opacity" values=".2;.55;.2" dur="4.2s" repeatCount="indefinite"/></ellipse>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ SEA CAVE */
  function cave() {
    const defs = `
      <radialGradient id="cv-lantern" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffd98a" stop-opacity=".9"/><stop offset="40%" stop-color="#ff9b3d" stop-opacity=".3"/><stop offset="100%" stop-color="#ff9b3d" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="cv-rock" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a0d18"/><stop offset="100%" stop-color="#1c2233"/>
      </linearGradient>
      <linearGradient id="cv-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#14304a"/><stop offset="100%" stop-color="#071120"/>
      </linearGradient>`;

    const body = `
      <rect width="800" height="1200" fill="url(#cv-rock)"/>
      <!-- stalactites -->
      <g fill="#05070d">
        <path d="M0,0 L120,0 L60,150 Z"/><path d="M110,0 L240,0 L180,110 Z"/><path d="M230,0 L340,0 L282,170 Z"/>
        <path d="M330,0 L470,0 L400,120 Z"/><path d="M460,0 L580,0 L520,190 Z"/><path d="M570,0 L700,0 L640,130 Z"/><path d="M690,0 L800,0 L760,160 Z"/>
      </g>
      <g fill="#141a2a">
        <path d="M60,0 L150,0 L104,96 Z"/><path d="M300,0 L390,0 L346,120 Z"/><path d="M560,0 L650,0 L606,104 Z"/>
      </g>
      <!-- water pool -->
      <path d="M0,880 Q220,840 430,872 Q640,904 800,860 L800,1200 L0,1200 Z" fill="url(#cv-water)"/>
      <g opacity=".55" stroke="#3f6c9e" stroke-width="2.5" fill="none">
        <path d="M120,940 q40,-6 82,0 t74,0"><animate attributeName="opacity" values=".55;.15;.55" dur="4s" repeatCount="indefinite"/></path>
        <path d="M420,1010 q44,-7 90,0 t80,0"><animate attributeName="opacity" values=".15;.55;.15" dur="5s" repeatCount="indefinite"/></path>
        <path d="M200,1100 q48,-8 94,0 t84,0"><animate attributeName="opacity" values=".45;.1;.45" dur="6s" repeatCount="indefinite"/></path>
      </g>
      <!-- rocky ledge -->
      <path d="M0,880 Q220,840 430,872 L430,930 Q200,900 0,940 Z" fill="#10131f"/>
      <path d="M0,560 L90,600 Q140,660 120,760 L140,880 L0,900 Z" fill="#05070d"/>
      <!-- smuggler crates -->
      <g transform="translate(230,760)">
        <rect x="-110" y="-90" width="140" height="104" rx="5" fill="#4d3a22" stroke="#291d0e" stroke-width="6"/>
        <path d="M-110,-90 L30,14 M30,-90 L-110,14" stroke="#291d0e" stroke-width="7"/>
        <rect x="-84" y="-160" width="108" height="74" rx="5" fill="#5a4527" stroke="#33260f" stroke-width="6"/>
        <text x="-30" y="-112" font-size="30" fill="#2c2011" text-anchor="middle" font-family="Georgia" font-weight="bold">V</text>
        <rect x="38" y="-64" width="94" height="78" rx="5" fill="#46331c" stroke="#291d0e" stroke-width="6"/>
        <text x="85" y="-18" font-size="26" fill="#2c2011" text-anchor="middle" font-family="Georgia" font-weight="bold">V</text>
        <path d="M-118,16 L140,16" stroke="#05070d" stroke-width="8"/>
      </g>
      <!-- lantern -->
      <g transform="translate(420,780)">
        <circle cx="0" cy="-20" r="150" fill="url(#cv-lantern)">
          <animate attributeName="opacity" values="1;.7;1" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <path d="M-4,-64 L4,-64 L4,-46 L-4,-46 Z" fill="#241a0c"/>
        <rect x="-16" y="-46" width="32" height="42" rx="6" fill="#1a140b" stroke="#0d0a06" stroke-width="3"/>
        <rect x="-9" y="-38" width="18" height="26" fill="#ffd98a">
          <animate attributeName="opacity" values="1;.72;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <path d="M-16,-4 L16,-4 L12,4 L-12,4 Z" fill="#0d0a06"/>
      </g>
      <!-- Alvar sitting on a rock -->
      <g transform="translate(560,700)">
        <ellipse cx="10" cy="118" rx="70" ry="26" fill="#0c101c"/>
        <path d="M-50,118 Q-56,64 -10,58 Q40,54 56,84 L60,118 Z" fill="#141a2a"/>
        <g transform="translate(4,-38)">
          <path d="M-26,150 L-30,96 Q-34,60 -20,42 Q-10,30 4,30 Q22,32 28,48 Q36,68 30,100 L34,150 L14,150 L10,110 L-6,110 L-10,150 Z" fill="#3d4a63"/>
          <circle cx="2" cy="16" r="15" fill="#c9a284"/>
          <path d="M-10,22 Q2,36 16,22 L14,40 Q2,46 -8,40 Z" fill="#b8bfcc"/>
          <path d="M-14,10 Q-10,-6 2,-6 Q15,-6 17,10 L18,14 L-15,14 Z" fill="#26314a"/>
        </g>
      </g>
      <!-- rowboat -->
      <g transform="translate(650,1000)">
        <animateTransform attributeName="transform" type="translate" values="650,1000;650,1006;650,1000" dur="4.6s" repeatCount="indefinite"/>
        <path d="M-96,-6 Q0,30 100,-10 L80,26 Q0,48 -74,28 Z" fill="#2c2033"/>
        <path d="M-96,-6 Q0,26 100,-10 L96,-2 Q0,34 -90,2 Z" fill="#54394a"/>
        <path d="M-30,4 L-64,-34" stroke="#3a2b3f" stroke-width="6" stroke-linecap="round"/>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ TITLE / ENDING */
  function title() {
    const defs = `
      <linearGradient id="tt-sky2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#04060f"/><stop offset="60%" stop-color="#101a3d"/><stop offset="100%" stop-color="#2a3a68"/>
      </linearGradient>
      <linearGradient id="tt-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1d2c55"/><stop offset="100%" stop-color="#060b18"/>
      </linearGradient>
      ${lanternGlow(0,0,0,'tt-glow')}
      <radialGradient id="tt-moonglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8ecf7" stop-opacity=".5"/><stop offset="100%" stop-color="#e8ecf7" stop-opacity="0"/>
      </radialGradient>`;

    const body = `
      <rect width="800" height="760" fill="url(#tt-sky2)"/>
      ${stars(40, 271, 500, 'tt')}
      <circle cx="590" cy="180" r="150" fill="url(#tt-moonglow)"/>
      <circle cx="590" cy="180" r="56" fill="#e9edf8"/>
      <circle cx="572" cy="164" r="11" fill="#c9cfdf"/><circle cx="608" cy="196" r="14" fill="#c9cfdf"/>
      <rect y="760" width="800" height="440" fill="url(#tt-sea)"/>
      <g opacity=".5" stroke="#4a6aac" stroke-width="2.5" fill="none">
        <path d="M80,830 q40,-7 84,0 t76,0"><animate attributeName="opacity" values=".5;.12;.5" dur="4.6s" repeatCount="indefinite"/></path>
        <path d="M420,900 q46,-8 92,0 t84,0"><animate attributeName="opacity" values=".14;.5;.14" dur="5.8s" repeatCount="indefinite"/></path>
        <path d="M180,1020 q50,-9 96,0 t88,0"><animate attributeName="opacity" values=".4;.1;.4" dur="6.6s" repeatCount="indefinite"/></path>
      </g>
      <!-- cliff + lighthouse -->
      <path d="M0,1200 L0,700 Q120,660 200,690 L330,720 Q400,740 400,820 L430,1200 Z" fill="#0d1120"/>
      <g transform="translate(200,690)">
        <path d="M-46,0 L46,0 L26,-330 L-26,-330 Z" fill="#aab2c2"/>
        <path d="M-40,-70 L40,-70 L37,-130 L-37,-130 Z" fill="#8a3a46"/>
        <path d="M-32,-200 L32,-200 L30,-252 L-30,-252 Z" fill="#8a3a46"/>
        <path d="M-30,-330 L30,-330 L30,-346 L-30,-346 Z" fill="#2b303c"/>
        <rect x="-19" y="-396" width="38" height="50" fill="#141a26"/>
        <rect x="-15" y="-390" width="30" height="40" fill="#ffe9a8"/>
        <path d="M-24,-396 L24,-396 L0,-424 Z" fill="#2b303c"/>
        <circle cx="0" cy="-372" r="70" fill="url(#tt-glow)"/>
        <g>
          <polygon points="0,-372 560,-470 560,-274" fill="#ffe9a8" opacity=".14">
            <animateTransform attributeName="transform" type="rotate" values="-38 0 -372;22 0 -372;-38 0 -372" dur="11s" repeatCount="indefinite"/>
          </polygon>
        </g>
      </g>`;
    return wrap(defs, body);
  }

  function ending() {
    const defs = `
      <linearGradient id="en-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a3a68"/><stop offset="55%" stop-color="#b06a5a"/><stop offset="100%" stop-color="#f0b26a"/>
      </linearGradient>
      <linearGradient id="en-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d89a62"/><stop offset="30%" stop-color="#5a5a8a"/><stop offset="100%" stop-color="#1d2545"/>
      </linearGradient>
      ${lanternGlow(0,0,0,'en-glow')}`;

    const body = `
      <rect width="800" height="760" fill="url(#en-sky)"/>
      <circle cx="400" cy="740" r="150" fill="#ffdf9a" opacity=".9"/>
      <circle cx="400" cy="740" r="230" fill="#ffdf9a" opacity=".25"/>
      <rect y="760" width="800" height="440" fill="url(#en-sea)"/>
      <path d="M340,760 L460,760 L430,1200 L370,1200 Z" fill="#ffd98a" opacity=".3"/>
      <g opacity=".6" stroke="#e8b477" stroke-width="2.5" fill="none">
        <path d="M100,830 q40,-7 84,0 t76,0"/>
        <path d="M430,910 q46,-8 92,0 t84,0"/>
      </g>
      <path d="M0,1200 L0,700 Q120,660 200,690 L330,720 Q400,740 400,820 L430,1200 Z" fill="#191527"/>
      <g transform="translate(200,690)">
        <path d="M-46,0 L46,0 L26,-330 L-26,-330 Z" fill="#d8ceb8"/>
        <path d="M-40,-70 L40,-70 L37,-130 L-37,-130 Z" fill="#a8434f"/>
        <path d="M-32,-200 L32,-200 L30,-252 L-30,-252 Z" fill="#a8434f"/>
        <path d="M-30,-330 L30,-330 L30,-346 L-30,-346 Z" fill="#3d3a4a"/>
        <rect x="-19" y="-396" width="38" height="50" fill="#2c2838"/>
        <path d="M-24,-396 L24,-396 L0,-424 Z" fill="#3d3a4a"/>
      </g>
      ${figure(300, 990, 140, '#2c3652', { cap: '#1d2540' })}
      ${figure(352, 1000, 128, '#4a3a30', { extra: '<path d="M-9,34 L-22,30" stroke="#4a3a30" stroke-width="5"/>' })}
      <g fill="#cfd4de">
        <path d="M520,300 q10,-14 22,0 q12,-14 22,0" stroke="#cfd4de" stroke-width="4" fill="none"/>
        <path d="M600,360 q8,-11 18,0 q10,-11 18,0" stroke="#cfd4de" stroke-width="3.5" fill="none"/>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ PORTRAITS (100x100) */
  function portrait(inner, bg) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${bg}"/>${inner}</svg>`;
  }

  const portraits = {
    kel: portrait(`
      <circle cx="50" cy="112" r="46" fill="#3a4a5a"/>
      <circle cx="50" cy="46" r="22" fill="#d4a985"/>
      <path d="M28,44 Q30,20 50,20 Q70,20 72,44 L72,36 Q68,14 50,14 Q32,14 28,36 Z" fill="#4a3826"/>
      <path d="M28,44 Q34,26 50,26 Q66,26 72,44 L72,40 Q66,20 50,20 Q34,20 28,40 Z" fill="#4a3826"/>
      <circle cx="42" cy="46" r="2.6" fill="#241a10"/><circle cx="58" cy="46" r="2.6" fill="#241a10"/>
      <path d="M44,58 Q50,62 56,58" stroke="#a97b58" stroke-width="2" fill="none"/>
      <path d="M30,80 Q50,70 70,80 L70,100 L30,100 Z" fill="#5a4a38"/>`, '#101828'),
    marta: portrait(`
      <circle cx="50" cy="116" r="50" fill="#20304a"/>
      <circle cx="50" cy="48" r="21" fill="#c9987a"/>
      <path d="M24,52 Q22,14 50,14 Q78,14 76,52 Q70,30 50,30 Q30,30 24,52 Z" fill="#31486b"/>
      <circle cx="42" cy="48" r="2.5" fill="#241a10"/><circle cx="58" cy="48" r="2.5" fill="#241a10"/>
      <path d="M38,44 L46,42 M54,42 L62,44" stroke="#8a6a50" stroke-width="2"/>
      <path d="M43,60 Q50,64 57,60" stroke="#96684a" stroke-width="2" fill="none"/>
      <path d="M34,42 Q36,54 34,60 M66,42 Q64,54 66,60" stroke="#a5765c" stroke-width="1.6" fill="none"/>
      <path d="M28,82 Q50,72 72,82 L72,100 L28,100 Z" fill="#263a56"/>`, '#0d1520'),
    alvar: portrait(`
      <circle cx="50" cy="116" r="50" fill="#3d4a63"/>
      <circle cx="50" cy="46" r="21" fill="#c9a284"/>
      <path d="M32,56 Q34,74 50,74 Q66,74 68,56 L68,66 Q64,80 50,80 Q36,80 32,66 Z" fill="#b8bfcc"/>
      <path d="M32,56 Q40,66 50,66 Q60,66 68,56 L68,62 Q60,72 50,72 Q40,72 32,62 Z" fill="#b8bfcc"/>
      <path d="M27,40 Q30,18 50,18 Q70,18 73,40 L74,46 L26,46 Z" fill="#26314a"/>
      <path d="M26,46 L74,46 L74,50 L26,50 Z" fill="#1a2338"/>
      <circle cx="42" cy="52" r="2.5" fill="#241a10"/><circle cx="58" cy="52" r="2.5" fill="#241a10"/>
      <path d="M30,86 Q50,76 70,86 L70,100 L30,100 Z" fill="#33405c"/>`, '#0d1220'),
    voss: portrait(`
      <circle cx="50" cy="116" r="50" fill="#2c2432"/>
      <circle cx="50" cy="48" r="21" fill="#d0a98e"/>
      <path d="M26,40 Q28,20 50,20 Q72,20 74,40 L76,44 L24,44 Z" fill="#1d1826"/>
      <path d="M24,44 L76,44 L74,50 L26,50 Z" fill="#0f0c16"/>
      <circle cx="60" cy="38" r="4" fill="#c9a24a"/>
      <circle cx="42" cy="52" r="2.5" fill="#241a10"/><circle cx="58" cy="52" r="2.5" fill="#241a10"/>
      <path d="M38,50 L46,48 M54,48 L62,50" stroke="#241a10" stroke-width="2.4"/>
      <path d="M42,64 L58,64" stroke="#96684a" stroke-width="2.4"/>
      <path d="M42,60 Q50,56 58,60 L58,63 Q50,60 42,63 Z" fill="#3d3026"/>
      <path d="M28,84 Q50,74 72,84 L72,100 L28,100 Z" fill="#241d30"/>
      <path d="M44,86 L50,92 L56,86 L56,100 L44,100 Z" fill="#c9a24a" opacity=".85"/>`, '#120e18'),
    narrator: portrait(`
      <circle cx="50" cy="50" r="30" fill="none" stroke="#e8b44a" stroke-width="2.5"/>
      <path d="M50,14 L56,44 L86,50 L56,56 L50,86 L44,56 L14,50 L44,44 Z" fill="#e8b44a" opacity=".9"/>
      <circle cx="50" cy="50" r="6" fill="#101828" stroke="#e8b44a" stroke-width="2"/>`, '#101828'),
  };

  /* ------------------------------------------------ ITEM ICONS (48x48) */
  function icon(inner) {
    return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  const icons = {
    prybar: icon(`<g transform="rotate(40 24 24)"><rect x="21" y="6" width="6" height="34" rx="3" fill="#8b96a5"/><path d="M21,8 Q12,2 14,-2 L24,4 Z" transform="translate(0,6)" fill="#8b96a5"/><path d="M22,40 L26,40 L27,45 L21,45 Z" fill="#6e7885"/></g>`),
    cottagekey: icon(`<g transform="rotate(-35 24 24)"><circle cx="24" cy="12" r="8" fill="none" stroke="#9a8a6a" stroke-width="4"/><rect x="22" y="18" width="4" height="22" fill="#9a8a6a"/><rect x="26" y="32" width="7" height="4" fill="#9a8a6a"/><rect x="26" y="38" width="5" height="4" fill="#9a8a6a"/></g>`),
    brasskey: icon(`<g transform="rotate(-35 24 24)"><circle cx="24" cy="11" r="8" fill="none" stroke="#e0b45c" stroke-width="4.5"/><circle cx="24" cy="11" r="2.5" fill="#e0b45c"/><rect x="22" y="18" width="4.5" height="23" fill="#e0b45c"/><rect x="26" y="30" width="8" height="4.5" fill="#e0b45c"/><rect x="26" y="37" width="6" height="4.5" fill="#e0b45c"/></g>`),
    cipherwheel: icon(`<circle cx="24" cy="24" r="19" fill="#5c4726" stroke="#8a6a34" stroke-width="2"/><circle cx="24" cy="24" r="12.5" fill="#7a5f33" stroke="#a8863e" stroke-width="1.5"/><circle cx="24" cy="24" r="5" fill="#c9a24a"/><g stroke="#d8c48a" stroke-width="1.4"><path d="M24,5 L24,10 M24,38 L24,43 M5,24 L10,24 M38,24 L43,24 M11,11 L14,14 M34,34 L37,37 M37,11 L34,14 M14,34 L11,37"/></g><text x="24" y="27.5" font-size="8" fill="#241a08" text-anchor="middle" font-family="Georgia" font-weight="bold">VII</text>`),
    oilcan: icon(`<path d="M12,40 L36,40 L33,20 L15,20 Z" fill="#5f6b4a"/><path d="M15,20 L33,20 L29,13 L19,13 Z" fill="#4a5439"/><path d="M29,15 L42,6" stroke="#4a5439" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="30" r="6" fill="#3c452e"/><path d="M19,13 L19,9 L24,9" stroke="#4a5439" stroke-width="3" fill="none"/>`),
    crank: icon(`<g transform="rotate(25 24 24)"><rect x="10" y="21" width="22" height="6" rx="3" fill="#7a6248"/><rect x="28" y="10" width="6" height="17" rx="3" fill="#7a6248"/><rect x="25" y="6" width="12" height="8" rx="4" fill="#5a4632"/><circle cx="13" cy="24" r="6" fill="#4a3826" stroke="#2c2011" stroke-width="2"/><rect x="11" y="22" width="4" height="4" fill="#241a10"/></g>`),
    lighthousekey: icon(`<g transform="rotate(-35 24 24)"><path d="M24,3 L30,11 L27,11 L27,15 L21,15 L21,11 L18,11 Z" fill="#c98a2e"/><circle cx="24" cy="11" r="8" fill="none" stroke="#c98a2e" stroke-width="4"/><rect x="22" y="18" width="4.5" height="23" fill="#c98a2e"/><rect x="26" y="31" width="8" height="4.5" fill="#c98a2e"/><rect x="26" y="38" width="6" height="4" fill="#c98a2e"/></g>`),
  };

  return { dock, exterior, cottage, lamp, cliffs, cave, title, ending, portraits, icons };
})();
