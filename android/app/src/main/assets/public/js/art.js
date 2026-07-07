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

  /* drifting fog banks (chapter two weather) */
  function fogBands(prefix, opacity) {
    const o = opacity || .45;
    return `<g pointer-events="none">
      <g opacity="${o}">
        <animateTransform attributeName="transform" type="translate" values="-90,0;90,0;-90,0" dur="30s" repeatCount="indefinite"/>
        <ellipse cx="300" cy="430" rx="480" ry="70" fill="#c9d2e0" opacity=".35"/>
        <ellipse cx="700" cy="520" rx="420" ry="55" fill="#b8c2d4" opacity=".3"/>
      </g>
      <g opacity="${o}">
        <animateTransform attributeName="transform" type="translate" values="80,0;-80,0;80,0" dur="41s" repeatCount="indefinite"/>
        <ellipse cx="180" cy="700" rx="460" ry="80" fill="#cfd8e6" opacity=".32"/>
        <ellipse cx="640" cy="820" rx="500" ry="66" fill="#b8c2d4" opacity=".28"/>
      </g>
      <g opacity="${o}">
        <animateTransform attributeName="transform" type="translate" values="-60,0;60,0;-60,0" dur="53s" repeatCount="indefinite"/>
        <ellipse cx="420" cy="980" rx="520" ry="90" fill="#c9d2e0" opacity=".3"/>
      </g>
    </g>`;
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
  function dock(f = {}) {
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
        ${f.crateOpen ? `
        <g id="dk-crate-open">
          <rect x="-42" y="-118" width="86" height="50" rx="4" fill="#4a3a20" stroke="#33260f" stroke-width="6"/>
          <ellipse cx="1" cy="-116" rx="38" ry="9" fill="#150e05"/>
          <g stroke="#c9a24a" stroke-width="2.5" opacity=".8">
            <path d="M-24,-118 L-30,-132 M-8,-116 L-4,-134 M14,-117 L22,-130 M30,-118 L26,-131"/>
          </g>
          <g transform="translate(74,-92) rotate(26)">
            <rect x="-42" y="-7" width="84" height="14" rx="3" fill="#5a4527" stroke="#33260f" stroke-width="5"/>
          </g>
          <text x="-6" y="-38" font-size="24" fill="#2c2011" text-anchor="middle" font-family="Georgia">GH</text>
          <path d="M-24,-46 L12,-46" stroke="#6e2418" stroke-width="4"/>
          <text x="26" y="-36" font-size="30" fill="#6e2418" text-anchor="middle" font-family="Georgia" font-weight="bold">V</text>
        </g>` : `
        <g id="dk-crate-closed">
          <rect x="-42" y="-130" width="86" height="62" rx="4" fill="#5a4527"/>
          <rect x="-42" y="-130" width="86" height="62" rx="4" fill="none" stroke="#33260f" stroke-width="6"/>
          <text x="0" y="-92" font-size="26" fill="#2c2011" text-anchor="middle" font-family="Georgia">GH</text>
        </g>`}
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
  function exterior(f = {}) {
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
        ${f.gotPrybar ? '' : `
        <g id="ex-prybar" transform="translate(58,-40) rotate(-24)">
          <rect x="-4" y="-38" width="8" height="76" rx="4" fill="#7d8896"/>
          <path d="M-4,-38 Q-16,-46 -12,-56 L0,-48 Z" fill="#7d8896"/>
          <animate attributeName="opacity" values="1;.55;1" dur="2.6s" repeatCount="indefinite"/>
        </g>`}
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
  function cottage(f = {}) {
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
        ${f.gotOil ? `
        <ellipse id="ct-oilring" cx="-30" cy="22" rx="13" ry="4" fill="none" stroke="#1c1208" stroke-width="2" opacity=".8"/>` : `
        <g id="ct-oilcan" transform="translate(-30,24)">
          <path d="M-14,0 L14,0 L11,-34 L-11,-34 Z" fill="#5f6b4a"/>
          <path d="M-11,-34 L11,-34 L6,-42 L-6,-42 Z" fill="#4a5439"/>
          <path d="M6,-40 L22,-52" stroke="#4a5439" stroke-width="5" stroke-linecap="round"/>
          <circle cx="0" cy="-16" r="7" fill="#3c452e"/>
        </g>`}
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
        ${f.drawerOpen ? `
        <rect x="-84" y="-24" width="168" height="44" rx="5" fill="#120b04"/>
        <g transform="translate(0,30)">
          <rect x="-84" y="-24" width="168" height="44" rx="5" fill="#54371c" stroke="#241708" stroke-width="3"/>
          <rect x="-74" y="-18" width="148" height="30" rx="4" fill="#241505"/>
          <circle cx="0" cy="-2" r="8" fill="#c9a24a"/>
          <g transform="translate(-40,-6)">
            <path d="M0,6 Q6,-2 12,4" stroke="#5a5230" stroke-width="2.5" fill="none"/>
            <circle cx="14" cy="2" r="5" fill="#b5762a"/>
          </g>
        </g>` : `
        <rect x="-84" y="-24" width="168" height="44" rx="5" fill="#54371c" stroke="#241708" stroke-width="3"/>
        <circle cx="0" cy="-2" r="8" fill="#c9a24a"/>
        <rect x="-24" y="-8" width="48" height="12" rx="3" fill="#2c1a0a"/>`}
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

  /* ------------------------------------------------ LAMP ROOM (fogNight: chapter two) */
  function lamp(fogNight) {
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

    const windows = fogNight ? `
      <rect width="800" height="820" fill="#3d4656"/>
      <rect width="800" height="820" fill="#2c3442" opacity=".6"/>
      ${fogBands('lpf', .8)}
      <g opacity=".25" fill="#dfe6f2">
        <ellipse cx="200" cy="240" rx="300" ry="60"><animate attributeName="opacity" values=".25;.1;.25" dur="9s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="620" cy="360" rx="340" ry="70"><animate attributeName="opacity" values=".1;.28;.1" dur="12s" repeatCount="indefinite"/></ellipse>
      </g>` : `
      <rect width="800" height="820" fill="url(#lp-nightsea)"/>
      ${stars(20, 99, 380, 'lp')}
      <circle cx="140" cy="200" r="34" fill="#e9edf8" opacity=".95"/>
      <g opacity=".5" stroke="#39518c" stroke-width="2" fill="none">
        <path d="M60,560 q40,-6 80,0 t76,0"><animate attributeName="opacity" values=".5;.15;.5" dur="5s" repeatCount="indefinite"/></path>
        <path d="M480,600 q44,-7 90,0 t80,0"><animate attributeName="opacity" values=".15;.5;.15" dur="6s" repeatCount="indefinite"/></path>
      </g>`;

    const alvar = fogNight ? `
      <g transform="translate(645,690)">
        ${figure(0, -160, 210, '#26314a', { cap: '#1a2338', extra: `
          <path d="M-9,30 L-26,20" stroke="#26314a" stroke-width="6" fill="none"/>` })}
      </g>` : '';

    const body = `
      <!-- panoramic windows -->
      ${windows}
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
      ${alvar}
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
          ${gateOpen ? `
          <g id="cl-crank" transform="translate(8,22) rotate(-40)">
            <rect x="-4" y="-34" width="8" height="38" rx="4" fill="#7a6248"/>
            <rect x="-4" y="-42" width="26" height="9" rx="4" fill="#5a4632"/>
          </g>` : ''}
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

  /* ------------------------------------------------ FOGGY SHORE (ch2) */
  function shore(f = {}) {
    const defs = `
      <linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2c3442"/><stop offset="60%" stop-color="#48525f"/><stop offset="100%" stop-color="#5a6470"/>
      </linearGradient>
      <linearGradient id="sh-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a5461"/><stop offset="100%" stop-color="#242c38"/>
      </linearGradient>
      ${lanternGlow(0, 0, 0, 'sh-glow')}`;

    const body = `
      <rect width="800" height="760" fill="url(#sh-sky)"/>
      <rect y="760" width="800" height="440" fill="url(#sh-sea)"/>
      <g opacity=".4" stroke="#8a99ad" stroke-width="2" fill="none">
        <path d="M120,830 q40,-6 82,0 t74,0"><animate attributeName="opacity" values=".4;.12;.4" dur="5s" repeatCount="indefinite"/></path>
        <path d="M430,900 q44,-7 90,0 t80,0"><animate attributeName="opacity" values=".12;.4;.12" dur="6.4s" repeatCount="indefinite"/></path>
      </g>
      <!-- boat shed -->
      <g transform="translate(255,560)">
        <path d="M-135,240 L135,240 L135,40 L-135,40 Z" fill="#3d3630"/>
        <path d="M-155,46 L0,-64 L155,46 Z" fill="#2a2521"/>
        <g stroke="#2a2521" stroke-width="4" opacity=".6">
          <path d="M-135,90 H135 M-135,140 H135 M-135,190 H135"/>
        </g>
        <!-- big door with padlock -->
        <rect x="-72" y="80" width="144" height="160" fill="#31261c"/>
        <path d="M-72,80 L72,240 M72,80 L-72,240" stroke="#241c12" stroke-width="9"/>
        <rect x="-72" y="80" width="144" height="160" fill="none" stroke="#241c12" stroke-width="8"/>
        ${f.b_shedOpen ? `
        <rect x="-64" y="88" width="128" height="152" fill="#120d07"/>
        ${f.b_hasOars ? '' : `<g id="sh-oars" transform="translate(-6,150) rotate(12)">
          <rect x="-6" y="-95" width="9" height="150" rx="4" fill="#8a7a5c"/>
          <path d="M-6,-95 Q-20,-118 -2,-128 Q12,-116 3,-93 Z" fill="#8a7a5c"/>
          <rect x="14" y="-88" width="9" height="145" rx="4" fill="#7a6a4e"/>
          <path d="M14,-88 Q2,-112 18,-121 Q32,-108 23,-86 Z" fill="#7a6a4e"/>
        </g>`}` : `
        <g id="sh-padlock" transform="translate(0,158)">
          <path d="M-13,-6 a13,13 0 0 1 26,0" fill="none" stroke="#9aa2b2" stroke-width="6"/>
          <rect x="-17" y="-6" width="34" height="30" rx="6" fill="#7a8494"/>
          <circle cx="0" cy="8" r="5" fill="#3d4656"/>
        </g>`}
        <!-- lantern on shed -->
        <g transform="translate(112,52)">
          <circle cx="0" cy="10" r="80" fill="url(#sh-glow)"/>
          <rect x="-9" y="-6" width="18" height="26" rx="4" fill="#1a140b" stroke="#0d0a06" stroke-width="2"/>
          <rect x="-5" y="-1" width="10" height="16" fill="#ffd98a"><animate attributeName="opacity" values="1;.7;1" dur="2.6s" repeatCount="indefinite"/></rect>
        </g>
        <!-- boathook on the wall -->
        ${f.b_hasHook ? `<g id="sh-hookpegs"><circle cx="-108" cy="120" r="4" fill="#241c12"/><circle cx="-108" cy="180" r="4" fill="#241c12"/></g>` : `
        <g id="sh-boathook" transform="translate(-108,150)">
          <rect x="-4" y="-72" width="8" height="144" rx="4" fill="#8a7a5c"/>
          <path d="M-4,-72 Q-22,-84 -18,-98 Q-2,-94 4,-74 Z" fill="#9aa2b2"/>
          <circle cx="0" cy="-30" r="4" fill="#241c12"/><circle cx="0" cy="30" r="4" fill="#241c12"/>
        </g>`}
      </g>
      <!-- notice board -->
      <g transform="translate(530,620)">
        <rect x="-6" y="-40" width="12" height="180" fill="#31261c"/>
        <rect x="-70" y="-120" width="140" height="92" rx="6" fill="#3d3630" stroke="#241c12" stroke-width="5"/>
        <rect x="-58" y="-108" width="52" height="32" fill="#d8cfb8" transform="rotate(-3)"/>
        <rect x="2" y="-104" width="50" height="40" fill="#c9bfa4" transform="rotate(2)"/>
        <rect x="-52" y="-66" width="58" height="26" fill="#d8cfb8" transform="rotate(1)"/>
        <g stroke="#6a5f48" stroke-width="2" opacity=".8">
          <path d="M-52,-98 h40 M-52,-92 h34 M8,-96 h38 M8,-88 h30 M8,-80 h36 M-46,-58 h44"/>
        </g>
      </g>
      <!-- jetty -->
      <path d="M0,1010 L800,950 L800,1200 L0,1200 Z" fill="#33291d"/>
      <g stroke="#1c150c" stroke-width="4" opacity=".7"><path d="M0,1080 L800,1024 M0,1150 L800,1100"/></g>
      <g stroke="#4a3d2a" stroke-width="2" opacity=".4"><path d="M170,1000 L150,1200 M420,985 L415,1200 M660,962 L672,1200"/></g>
      <!-- storm plaque on jetty post -->
      <g transform="translate(660,900)">
        <rect x="-8" y="-10" width="16" height="130" fill="#241c12"/>
        <rect x="-52" y="-60" width="104" height="56" rx="6" fill="#5c5648" stroke="#2c2821" stroke-width="4"/>
        <text x="0" y="-38" font-size="15" fill="#d8cfb8" text-anchor="middle" font-family="Georgia">REBUILT AFTER</text>
        <text x="0" y="-20" font-size="15" fill="#d8cfb8" text-anchor="middle" font-family="Georgia">THE GREAT STORM</text>
        <text x="0" y="-4" font-size="17" fill="#e8b44a" text-anchor="middle" font-family="Georgia" font-weight="bold">— 1957 —</text>
      </g>
      <!-- skiff -->
      <g transform="translate(210,1035)">
        <animateTransform attributeName="transform" type="translate" values="210,1035;210,1041;210,1035" dur="4.8s" repeatCount="indefinite"/>
        <path d="M-100,0 Q0,36 104,-4 L82,34 Q0,56 -76,34 Z" fill="#2c2033"/>
        <path d="M-100,0 Q0,32 104,-4 L100,4 Q0,40 -94,8 Z" fill="#54394a"/>
        ${f.b_hasOars ? `<g id="sh-oars-in">
          <path d="M-30,10 L-90,-30" stroke="#8a7a5c" stroke-width="7" stroke-linecap="round"/>
          <path d="M34,8 L96,-26" stroke="#7a6a4e" stroke-width="7" stroke-linecap="round"/></g>` : ''}
        <path d="M-40,16 L-44,40 M42,14 L46,38" stroke="#1c150c" stroke-width="4"/>
      </g>
      <!-- crab pots -->
      <g transform="translate(680,1105)">
        <g fill="none" stroke="#4a3d2a" stroke-width="4">
          <ellipse cx="0" cy="0" rx="44" ry="18"/><ellipse cx="0" cy="-26" rx="34" ry="14"/>
          <path d="M-44,0 L-34,-26 M44,0 L34,-26 M0,18 L0,-40"/>
        </g>
        <circle cx="-14" cy="-4" r="5" fill="#c25454" opacity=".8"/>
      </g>
      <!-- path up to the light -->
      <g transform="translate(80,760)">
        <path d="M-40,-120 Q-10,-60 -20,40 L40,40 Q26,-70 60,-140 Q10,-160 -40,-120 Z" fill="#2c3038" opacity=".9"/>
        <path d="M-6,20 Q4,-40 22,-100" stroke="#4a525e" stroke-width="5" fill="none" stroke-dasharray="2 13" stroke-linecap="round"/>
        <circle cx="30" cy="-150" r="26" fill="url(#sh-glow)"/>
      </g>
      ${fogBands('sh', .5)}`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ BELL ROCK (ch2) */
  function bellrock(f = {}) {
    const defs = `
      <linearGradient id="br-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#232b3d"/><stop offset="100%" stop-color="#48525f"/>
      </linearGradient>
      <linearGradient id="br-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3d4754"/><stop offset="100%" stop-color="#1a212c"/>
      </linearGradient>
      <linearGradient id="br-stone" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5a5f6b"/><stop offset="100%" stop-color="#353a45"/>
      </linearGradient>
      <radialGradient id="br-moon" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8ecf7" stop-opacity=".4"/><stop offset="100%" stop-color="#e8ecf7" stop-opacity="0"/>
      </radialGradient>`;

    const body = `
      <rect width="800" height="740" fill="url(#br-sky)"/>
      <circle cx="560" cy="150" r="110" fill="url(#br-moon)"/>
      <circle cx="560" cy="150" r="38" fill="#dfe4f0" opacity=".8"/>
      <rect y="740" width="800" height="460" fill="url(#br-sea)"/>
      <g opacity=".45" stroke="#7a8aa0" stroke-width="2.5" fill="none">
        <path d="M80,800 q40,-7 84,0 t76,0"><animate attributeName="opacity" values=".45;.15;.45" dur="4.6s" repeatCount="indefinite"/></path>
        <path d="M420,880 q46,-8 92,0 t84,0"><animate attributeName="opacity" values=".15;.45;.15" dur="5.8s" repeatCount="indefinite"/></path>
      </g>
      <!-- the islet -->
      <path d="M0,1200 L0,900 Q80,830 200,840 L620,860 Q760,870 800,940 L800,1200 Z" fill="#232630"/>
      <path d="M60,900 Q110,850 190,856 M600,864 Q680,868 730,910" stroke="#12141c" stroke-width="6" fill="none" opacity=".7"/>
      <!-- bell tower -->
      <g transform="translate(430,560)">
        <path d="M-95,320 L95,320 L78,-10 L-78,-10 Z" fill="url(#br-stone)"/>
        <g stroke="#2a2e38" stroke-width="3" opacity=".6">
          <path d="M-88,180 H88 M-84,100 H84 M-92,260 H92 M-80,20 H80"/>
          <path d="M-30,180 L-30,100 M30,260 L30,180 M-20,320 L-20,260 M46,100 L46,20"/>
        </g>
        <path d="M-92,-10 L92,-10 L0,-88 Z" fill="#2a2e38"/>
        <!-- open arch with the bell -->
        <path d="M-52,180 L52,180 L52,60 Q0,10 -52,60 Z" fill="#0d0f16"/>
        <g transform="translate(0,78)">
          <path d="M0,-14 L0,-4" stroke="#6a5f48" stroke-width="5"/>
          <g>
            ${f.b_bellRung ? '<animateTransform attributeName="transform" type="rotate" values="-16 0 -4;16 0 -4;-16 0 -4" dur="1.6s" repeatCount="indefinite"/>' : ''}
            <path d="M-30,58 Q-34,6 0,0 Q34,6 30,58 L36,64 Q0,74 -36,64 Z" fill="#a8863e"/>
            <path d="M-30,58 Q-34,6 0,0 L0,70 Q-18,70 -36,64 Z" fill="#c9a24a" opacity=".55"/>
            ${f.b_chainOn ? `<path d="M0,64 L0,84" stroke="#d9d2c0" stroke-width="4"/><circle cx="0" cy="88" r="7" fill="#b8b2a0"/>` : ''}
          </g>
        </g>
        <!-- frayed rope hanging -->
        ${f.b_chainOn ? '' : `<g id="br-frayed">
          <path d="M40,168 q4,26 -2,48" stroke="#8a7a5c" stroke-width="5" fill="none">
            <animateTransform attributeName="transform" type="rotate" values="-5 40 168;5 40 168;-5 40 168" dur="3.4s" repeatCount="indefinite"/>
          </path>
          <path d="M38,214 l-6,12 M40,214 l2,13 M42,213 l8,10" stroke="#8a7a5c" stroke-width="2.5"/>
        </g>`}
        <path d="M-60,320 L60,320 L52,252 Q0,236 -52,252 Z" fill="#1c1f28"/>
        <path d="M-44,320 L44,320 L44,262 Q0,248 -44,262 Z" fill="#2e333f"/>
      </g>
      <!-- crag with magpie nest -->
      <g transform="translate(185,520)">
        <path d="M-70,340 Q-90,140 -30,40 Q0,-10 40,-24 Q60,60 44,180 L60,340 Z" fill="#2a2d38"/>
        <path d="M-40,180 Q-20,120 8,60" stroke="#12141c" stroke-width="5" fill="none" opacity=".6"/>
        <!-- nest -->
        <g transform="translate(24,-18)">
          <path d="M-34,10 Q0,30 34,10 Q28,-8 0,-12 Q-28,-8 -34,10 Z" fill="#4a3d26"/>
          <g stroke="#6a5a3a" stroke-width="2.5" opacity=".9">
            <path d="M-32,4 L-46,-4 M32,4 L46,-2 M-20,-8 L-30,-20 M22,-8 L34,-18 M0,-10 L-4,-24"/>
          </g>
          ${f.b_nestLooted ? '' : `<g id="br-glints">
            <circle cx="-10" cy="0" r="4" fill="#e8e4d8"><animate attributeName="opacity" values="1;.3;1" dur="1.8s" repeatCount="indefinite"/></circle>
            <circle cx="8" cy="-2" r="3.4" fill="#ffd98a"><animate attributeName="opacity" values=".4;1;.4" dur="2.3s" repeatCount="indefinite"/></circle>
            <path d="M-2,4 q6,-4 12,0" stroke="#d9d2c0" stroke-width="3" fill="none"/>
          </g>`}
        </g>
      </g>
      <!-- magpie circling -->
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;150,-60;300,-20;150,40;0,0" dur="16s" repeatCount="indefinite"/>
        <g transform="translate(240,330)">
          <path d="M0,0 q-14,-16 -30,-6 q12,2 16,10 q-16,2 -26,14 q16,-2 26,2 Z" fill="#14161c"/>
          <path d="M0,0 q16,-10 30,-2 q-12,4 -14,12 q14,0 24,10 q-16,0 -26,4 Z" fill="#e8e4d8" opacity=".85"/>
          <circle cx="2" cy="2" r="6" fill="#14161c"/>
        </g>
      </g>
      <!-- tide pool + mussels -->
      <g transform="translate(640,1060)">
        <ellipse cx="0" cy="0" rx="86" ry="30" fill="#131c2c"/>
        <ellipse cx="-10" cy="-3" rx="52" ry="15" fill="#22364f" opacity=".7">
          <animate attributeName="opacity" values=".7;.35;.7" dur="4.8s" repeatCount="indefinite"/>
        </ellipse>
        <g fill="#1c2230"><ellipse cx="-60" cy="24" rx="12" ry="6" transform="rotate(-18 -60 24)"/><ellipse cx="66" cy="16" rx="11" ry="5" transform="rotate(12 66 16)"/><ellipse cx="40" cy="30" rx="10" ry="5"/></g>
      </g>
      <!-- your skiff -->
      <g transform="translate(160,1020)">
        <animateTransform attributeName="transform" type="translate" values="160,1020;160,1026;160,1020" dur="4.4s" repeatCount="indefinite"/>
        <path d="M-84,0 Q0,30 88,-4 L70,28 Q0,48 -64,28 Z" fill="#2c2033"/>
        <path d="M-26,8 L-78,-26" stroke="#8a7a5c" stroke-width="6" stroke-linecap="round"/>
        <path d="M30,6 L84,-22" stroke="#7a6a4e" stroke-width="6" stroke-linecap="round"/>
      </g>
      ${fogBands('br', .32)}`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ PROLOGUE CH2 */
  function prologue2(n) {
    if (n === 1) {
      /* fog rolling over the harbor */
      const defs = `
        <linearGradient id="q1-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10182e"/><stop offset="100%" stop-color="#3d4656"/>
        </linearGradient>
        <linearGradient id="q1-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a4456"/><stop offset="100%" stop-color="#161d2b"/>
        </linearGradient>`;
      const body = `
        <rect width="800" height="720" fill="url(#q1-sky)"/>
        <rect y="720" width="800" height="480" fill="url(#q1-sea)"/>
        <!-- town silhouette -->
        <g fill="#141a26">
          <path d="M140,720 L140,640 L180,640 L180,600 L220,600 L220,720 Z"/>
          <path d="M240,720 L240,620 L300,585 L360,620 L360,720 Z"/>
          <path d="M380,720 L380,650 L440,650 L440,720 Z"/>
          <path d="M460,720 L460,610 L500,580 L540,610 L540,720 Z"/>
        </g>
        <g fill="#ffd98a" opacity=".85">
          <rect x="262" y="636" width="14" height="18"/><rect x="310" y="640" width="12" height="16"/>
          <rect x="480" y="626" width="12" height="16"><animate attributeName="opacity" values="1;.4;1" dur="4s" repeatCount="indefinite"/></rect>
        </g>
        <!-- the light, sweeping weakly -->
        <g transform="translate(600,470)">
          <path d="M-22,250 L22,250 L14,-40 L-14,-40 Z" fill="#8a92a2"/>
          <path d="M-19,120 L19,120 L18,84 L-18,84 Z" fill="#7a3a46"/>
          <rect x="-10" y="-64" width="20" height="26" fill="#ffe9a8"/>
          <path d="M-13,-64 L13,-64 L0,-80 Z" fill="#2b303c"/>
          <polygon points="0,-52 300,-96 300,-8" fill="#ffe9a8" opacity=".12">
            <animateTransform attributeName="transform" type="rotate" values="-24 0 -52;16 0 -52;-24 0 -52" dur="8s" repeatCount="indefinite"/>
          </polygon>
        </g>
        <!-- fog devouring everything, rolling in from the sea -->
        <g opacity=".9">
          <g><animateTransform attributeName="transform" type="translate" values="-220,0;40,0;-220,0" dur="18s" repeatCount="indefinite"/>
            <ellipse cx="220" cy="800" rx="520" ry="110" fill="#c9d2e0" opacity=".5"/>
            <ellipse cx="700" cy="880" rx="480" ry="90" fill="#b8c2d4" opacity=".45"/>
          </g>
          <g><animateTransform attributeName="transform" type="translate" values="160,0;-120,0;160,0" dur="26s" repeatCount="indefinite"/>
            <ellipse cx="300" cy="980" rx="560" ry="130" fill="#cfd8e6" opacity=".5"/>
          </g>
          <g><animateTransform attributeName="transform" type="translate" values="-90,0;110,0;-90,0" dur="33s" repeatCount="indefinite"/>
            <ellipse cx="460" cy="700" rx="500" ry="80" fill="#b8c2d4" opacity=".35"/>
          </g>
        </g>`;
      return wrap(defs, body);
    }
    if (n === 2) {
      /* the ferry, a ghost in the white */
      const defs = `
        <radialGradient id="q2-fog" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stop-color="#8a96a8"/><stop offset="100%" stop-color="#525d6d"/>
        </radialGradient>
        ${lanternGlow(0, 0, 0, 'q2-glow')}`;
      const body = `
        <rect width="800" height="1200" fill="url(#q2-fog)"/>
        <!-- ferry silhouette, barely there, bobbing -->
        <g opacity=".8">
          <animateTransform attributeName="transform" type="translate" values="0,0;0,14;0,0" dur="6s" repeatCount="indefinite"/>
          <g transform="translate(400,620)">
            <path d="M-210,60 Q0,110 216,52 L180,128 Q0,164 -160,128 Z" fill="#1d2330"/>
            <rect x="-130" y="-14" width="250" height="76" rx="10" fill="#242c3c"/>
            <rect x="-60" y="-58" width="120" height="46" rx="8" fill="#1d2330"/>
            <rect x="24" y="-96" width="18" height="40" fill="#141a26"/>
            <g fill="#ffd98a">
              <rect x="-112" y="6" width="22" height="26" rx="4"><animate attributeName="opacity" values=".9;.5;.9" dur="3s" repeatCount="indefinite"/></rect>
              <rect x="-70" y="6" width="22" height="26" rx="4"/>
              <rect x="-28" y="6" width="22" height="26" rx="4"><animate attributeName="opacity" values=".6;1;.6" dur="4s" repeatCount="indefinite"/></rect>
              <rect x="14" y="6" width="22" height="26" rx="4"/>
              <rect x="56" y="6" width="22" height="26" rx="4"/>
              <rect x="-36" y="-48" width="16" height="20" rx="3"/>
              <rect x="8" y="-48" width="16" height="20" rx="3"/>
            </g>
            <circle cx="-170" cy="-20" r="60" fill="url(#q2-glow)" opacity=".7"/>
            <circle cx="-170" cy="-20" r="7" fill="#8ae0a0" opacity=".9"><animate attributeName="opacity" values=".9;.3;.9" dur="2s" repeatCount="indefinite"/></circle>
          </g>
        </g>
        <!-- fog layers over it -->
        <g opacity=".85">
          <g><animateTransform attributeName="transform" type="translate" values="-140,0;100,0;-140,0" dur="17s" repeatCount="indefinite"/>
            <ellipse cx="300" cy="560" rx="540" ry="120" fill="#a5b0c2" opacity=".5"/>
          </g>
          <g><animateTransform attributeName="transform" type="translate" values="120,0;-140,0;120,0" dur="23s" repeatCount="indefinite"/>
            <ellipse cx="480" cy="760" rx="560" ry="140" fill="#95a2b5" opacity=".55"/>
          </g>
          <g><animateTransform attributeName="transform" type="translate" values="-80,0;80,0;-80,0" dur="31s" repeatCount="indefinite"/>
            <ellipse cx="380" cy="380" rx="520" ry="100" fill="#a5b0c2" opacity=".4"/>
          </g>
        </g>`;
      return wrap(defs, body);
    }
    /* n === 3: the silent bell */
    const defs = `
      <linearGradient id="q3-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1c2333"/><stop offset="100%" stop-color="#414b5a"/>
      </linearGradient>
      <linearGradient id="q3-stone" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5a5f6b"/><stop offset="100%" stop-color="#353a45"/>
      </linearGradient>`;
    const body = `
      <rect width="800" height="1200" fill="url(#q3-sky)"/>
      <circle cx="250" cy="200" r="42" fill="#dfe4f0" opacity=".6"/>
      <!-- big silent bell tower -->
      <g transform="translate(430,520)">
        <path d="M-130,480 L130,480 L104,-40 L-104,-40 Z" fill="url(#q3-stone)"/>
        <path d="M-122,-40 L122,-40 L0,-140 Z" fill="#2a2e38"/>
        <g stroke="#2a2e38" stroke-width="4" opacity=".6">
          <path d="M-118,220 H118 M-112,100 H112 M-124,340 H124"/>
        </g>
        <path d="M-70,220 L70,220 L70,50 Q0,-16 -70,50 Z" fill="#0d0f16"/>
        <g transform="translate(0,80)">
          <path d="M0,-24 L0,-8" stroke="#6a5f48" stroke-width="6"/>
          <path d="M-42,76 Q-46,4 0,-4 Q46,4 42,76 L50,86 Q0,100 -50,86 Z" fill="#a8863e"/>
          <path d="M-42,76 Q-46,4 0,-4 L0,92 Q-25,92 -50,86 Z" fill="#c9a24a" opacity=".5"/>
        </g>
        <!-- a crow lands and waits -->
        <g transform="translate(86,-52)">
          <path d="M0,0 q-10,-14 -24,-8 q8,4 10,10 q-10,2 -16,10 q10,-2 18,0 Z" fill="#0d0f16">
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="3s" repeatCount="indefinite"/>
          </path>
        </g>
      </g>
      <!-- ground fog -->
      <g opacity=".8">
        <g><animateTransform attributeName="transform" type="translate" values="-100,0;80,0;-100,0" dur="21s" repeatCount="indefinite"/>
          <ellipse cx="320" cy="1030" rx="540" ry="120" fill="#a5b0c2" opacity=".5"/>
        </g>
        <g><animateTransform attributeName="transform" type="translate" values="90,0;-90,0;90,0" dur="29s" repeatCount="indefinite"/>
          <ellipse cx="480" cy="1140" rx="560" ry="110" fill="#95a2b5" opacity=".5"/>
        </g>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ ENDING CH2 */
  function ending2() {
    const defs = `
      <linearGradient id="e2-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#141c33"/><stop offset="65%" stop-color="#2c3a5c"/><stop offset="100%" stop-color="#4a5a7a"/>
      </linearGradient>
      <linearGradient id="e2-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3d4c6a"/><stop offset="100%" stop-color="#101828"/>
      </linearGradient>
      <radialGradient id="e2-moon" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8ecf7" stop-opacity=".55"/><stop offset="100%" stop-color="#e8ecf7" stop-opacity="0"/>
      </radialGradient>`;
    const body = `
      <rect width="800" height="760" fill="url(#e2-sky)"/>
      ${stars(24, 311, 360, 'e2')}
      <circle cx="400" cy="210" r="150" fill="url(#e2-moon)"/>
      <circle cx="400" cy="210" r="52" fill="#e9edf8"/>
      <circle cx="384" cy="196" r="10" fill="#c9cfdf"/><circle cx="416" cy="226" r="13" fill="#c9cfdf"/>
      <rect y="760" width="800" height="440" fill="url(#e2-sea)"/>
      <path d="M330,760 L470,760 L440,1200 L360,1200 Z" fill="#d8dff0" opacity=".18"/>
      <g opacity=".5" stroke="#6a80b0" stroke-width="2.5" fill="none">
        <path d="M90,830 q40,-7 84,0 t76,0"/><path d="M440,910 q46,-8 92,0 t84,0"/>
      </g>
      <!-- bell rock, bell swinging joyfully -->
      <g transform="translate(160,690)">
        <path d="M-120,510 L120,510 L96,70 Q60,20 0,16 Q-60,20 -96,70 Z" fill="#232630"/>
        <g transform="translate(0,120)">
          <path d="M-60,110 L60,110 L50,-10 L-50,-10 Z" fill="#3d434f"/>
          <path d="M-56,-10 L56,-10 L0,-58 Z" fill="#262a33"/>
          <path d="M-34,84 L34,84 L34,10 Q0,-16 -34,10 Z" fill="#0d0f16"/>
          <g transform="translate(0,32)">
            <path d="M0,-12 L0,-4" stroke="#6a5f48" stroke-width="4"/>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-20 0 -4;20 0 -4;-20 0 -4" dur="1.5s" repeatCount="indefinite"/>
              <path d="M-20,38 Q-23,2 0,-2 Q23,2 20,38 L25,44 Q0,52 -25,44 Z" fill="#c9a24a"/>
            </g>
          </g>
        </g>
      </g>
      <!-- the ferry gliding home, windows warm -->
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="5.4s" repeatCount="indefinite"/>
        <g transform="translate(480,930)">
          <path d="M-190,50 Q0,96 196,44 L164,112 Q0,146 -146,112 Z" fill="#1d2330"/>
          <rect x="-120" y="-18" width="228" height="70" rx="9" fill="#242c3c"/>
          <rect x="-54" y="-58" width="108" height="42" rx="7" fill="#1d2330"/>
          <rect x="20" y="-92" width="16" height="36" fill="#141a26"/>
          <g fill="#ffd98a">
            <rect x="-102" y="0" width="20" height="24" rx="4"/><rect x="-64" y="0" width="20" height="24" rx="4"/>
            <rect x="-26" y="0" width="20" height="24" rx="4"/><rect x="12" y="0" width="20" height="24" rx="4"/>
            <rect x="50" y="0" width="20" height="24" rx="4"/><rect x="-32" y="-48" width="14" height="18" rx="3"/><rect x="6" y="-48" width="14" height="18" rx="3"/>
          </g>
          <g opacity=".85"><ellipse cx="30" cy="-108" rx="10" ry="7" fill="#8a96a8">
            <animate attributeName="opacity" values=".7;0" dur="3.4s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="translate" values="0,0;16,-30" dur="3.4s" repeatCount="indefinite"/>
          </ellipse></g>
        </g>
      </g>
      <!-- last shreds of fog, thinning -->
      <g opacity=".35">
        <g><animateTransform attributeName="transform" type="translate" values="-70,0;70,0;-70,0" dur="37s" repeatCount="indefinite"/>
          <ellipse cx="400" cy="1120" rx="520" ry="80" fill="#a5b0c2" opacity=".4"/>
        </g>
      </g>`;
    return wrap(defs, body);
  }

  /* ------------------------------------------------ PROLOGUE SLIDES */
  function prologue(n) {
    if (n === 1) {
      /* Alvar at his desk, writing by candlelight */
      const defs = `
        <linearGradient id="p1-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#170f0a"/><stop offset="100%" stop-color="#2c1d14"/>
        </linearGradient>
        <radialGradient id="p1-candle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffcf72" stop-opacity=".75"/><stop offset="55%" stop-color="#ff9b3d" stop-opacity=".22"/><stop offset="100%" stop-color="#ff9b3d" stop-opacity="0"/>
        </radialGradient>`;
      const body = `
        <rect width="800" height="1200" fill="url(#p1-wall)"/>
        <!-- window with moon (prologue fills the whole screen, so keep
             everything inside x 130..670 for the phone crop) -->
        <g transform="translate(300,290)">
          <rect x="-90" y="-110" width="180" height="220" rx="6" fill="#0d0a08"/>
          <rect x="-78" y="-98" width="156" height="196" fill="#1d2745"/>
          <circle cx="34" cy="-40" r="26" fill="#e9edf8"/>
          <path d="M0,-98 L0,98 M-78,0 L78,0" stroke="#0d0a08" stroke-width="9"/>
        </g>
        <!-- desk -->
        <path d="M100,840 L700,840 L682,880 L118,880 Z" fill="#3a2410"/>
        <path d="M150,880 L176,1200 M650,880 L626,1200" stroke="#241708" stroke-width="22"/>
        <!-- candle -->
        <g transform="translate(200,820)">
          <circle cx="0" cy="-90" r="190" fill="url(#p1-candle)">
            <animate attributeName="opacity" values="1;.72;.92;.68;1" dur="3.2s" repeatCount="indefinite"/>
          </circle>
          <rect x="-13" y="-64" width="26" height="66" rx="5" fill="#e7dcc2"/>
          <path d="M-13,-64 Q-2,-72 13,-62 L13,-56 L-13,-56 Z" fill="#d8c9a4"/>
          <path d="M0,-66 L0,-76" stroke="#241708" stroke-width="3"/>
          <path d="M0,-76 Q-9,-92 0,-108 Q10,-94 0,-76" fill="#ffb54d">
            <animate attributeName="opacity" values="1;.8;1;.85;1" dur=".9s" repeatCount="indefinite"/>
          </path>
          <path d="M0,-80 Q-4,-90 0,-99 Q5,-91 0,-80" fill="#fff3c4">
            <animate attributeName="opacity" values=".95;.6;.95" dur=".6s" repeatCount="indefinite"/>
          </path>
          <path d="M-16,0 L16,0 L12,10 L-12,10 Z" fill="#8a6a34"/>
        </g>
        <!-- paper being written, lines draw on -->
        <g transform="translate(390,806) rotate(-4)">
          <rect x="-110" y="-74" width="220" height="148" rx="4" fill="#efe6cf"/>
          <rect x="-110" y="-74" width="220" height="148" rx="4" fill="none" stroke="#c9b98e" stroke-width="2"/>
          <g stroke="#4a3826" stroke-width="3" fill="none" stroke-linecap="round">
            <path pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" d="M-88,-48 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0">
              <animate attributeName="stroke-dashoffset" from="100" to="0" begin="0.6s" dur="1.6s" fill="freeze"/>
            </path>
            <path pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" d="M-88,-16 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0">
              <animate attributeName="stroke-dashoffset" from="100" to="0" begin="2.3s" dur="1.5s" fill="freeze"/>
            </path>
            <path pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" d="M-88,16 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0">
              <animate attributeName="stroke-dashoffset" from="100" to="0" begin="3.9s" dur="1.3s" fill="freeze"/>
            </path>
            <path pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" d="M-88,48 q10,-6 20,0 t20,0 t20,0">
              <animate attributeName="stroke-dashoffset" from="100" to="0" begin="5.3s" dur="1.1s" fill="freeze"/>
            </path>
          </g>
        </g>
        <!-- inkwell -->
        <g transform="translate(548,812)">
          <path d="M-16,10 L16,10 L12,-14 Q0,-22 -12,-14 Z" fill="#141a26"/>
          <ellipse cx="0" cy="-14" rx="9" ry="4" fill="#060913"/>
        </g>
        <!-- Alvar in profile, hunched over the letter, quill hand moving -->
        <g transform="translate(560,660)">
          <path d="M-56,220 Q-68,70 -8,32 Q64,2 100,80 L112,220 Z" fill="#0f0a06"/>
          <circle cx="-26" cy="10" r="44" fill="#0f0a06"/>
          <path d="M-64,-12 Q-28,-42 12,-18 L14,-4 Q-24,-24 -60,2 Z" fill="#1d1207"/>
          <path d="M-70,16 L-46,20" stroke="#b8bfcc" stroke-width="7" stroke-linecap="round" opacity=".85"/>
          <path d="M-4,64 Q-64,86 -114,112" stroke="#0f0a06" stroke-width="26" fill="none" stroke-linecap="round"/>
          <g transform="translate(-122,118)">
            <animateTransform attributeName="transform" type="translate" values="-122,118;-128,121;-117,117;-124,122;-122,118" dur="1.4s" repeatCount="indefinite"/>
            <circle cx="0" cy="0" r="13" fill="#0f0a06"/>
            <path d="M2,-4 Q20,-46 40,-66 L45,-60 Q26,-40 10,-2 Z" fill="#cfc4a0"/>
          </g>
        </g>`;
      return wrap(defs, body);
    }
    if (n === 2) {
      /* the letter itself, ending mid-sentence */
      const defs = `
        <radialGradient id="p2-vig" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stop-color="#f2e8cf"/><stop offset="72%" stop-color="#dcc9a0"/><stop offset="100%" stop-color="#6e5a38"/>
        </radialGradient>`;
      let lines = '';
      const ys = [230, 300, 370, 440, 510];
      ys.forEach((y, i) => {
        lines += `<path pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"
          d="M140,${y} q14,-8 28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0 t28,0">
          <animate attributeName="stroke-dashoffset" from="100" to="0" begin="${(0.2 + i * 0.45).toFixed(2)}s" dur="0.5s" fill="freeze"/>
        </path>`;
      });
      const body = `
        <rect width="800" height="1200" fill="url(#p2-vig)"/>
        <g stroke="#5a4a2c" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8">
          ${lines}
        </g>
        <text x="150" y="640" font-size="34" font-family="Georgia" font-style="italic" fill="#3a2c14" opacity="0">
          The harbor is not what it
          <animate attributeName="opacity" from="0" to="1" begin="2.5s" dur=".7s" fill="freeze"/>
        </text>
        <text x="150" y="695" font-size="34" font-family="Georgia" font-style="italic" fill="#3a2c14" opacity="0">
          was, Kel. If anything
          <animate attributeName="opacity" from="0" to="1" begin="2.8s" dur=".7s" fill="freeze"/>
        </text>
        <text x="150" y="750" font-size="34" font-family="Georgia" font-style="italic" fill="#3a2c14" opacity="0">
          should happen to me&#8212;
          <animate attributeName="opacity" from="0" to="1" begin="3.1s" dur=".7s" fill="freeze"/>
        </text>
        <!-- the ink trails off -->
        <g opacity="0">
          <animate attributeName="opacity" from="0" to="1" begin="3.7s" dur=".5s" fill="freeze"/>
          <path d="M566,742 q26,10 52,24" stroke="#3a2c14" stroke-width="4" fill="none" stroke-linecap="round"/>
          <circle cx="622" cy="770" r="0" fill="#2c2011">
            <animate attributeName="r" from="0" to="13" begin="3.9s" dur=".45s" fill="freeze"/>
          </circle>
          <circle cx="642" cy="786" r="0" fill="#2c2011">
            <animate attributeName="r" from="0" to="5" begin="4.2s" dur=".3s" fill="freeze"/>
          </circle>
        </g>
        <g stroke="#5a4a2c" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".35">
          <path d="M150,880 q14,-8 28,0 t28,0 t28,0" opacity="0">
            <animate attributeName="opacity" from="0" to=".6" begin="4.6s" dur="1s" fill="freeze"/>
          </path>
        </g>`;
      return wrap(defs, body);
    }
    /* n === 3: Kel on the mail boat, heading north at dawn */
    const defs = `
      <linearGradient id="p3-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a2547"/><stop offset="62%" stop-color="#7a5a72"/><stop offset="100%" stop-color="#d69a6a"/>
      </linearGradient>
      <linearGradient id="p3-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b8825e"/><stop offset="25%" stop-color="#4a4270"/><stop offset="100%" stop-color="#141b30"/>
      </linearGradient>`;
    const body = `
      <rect width="800" height="720" fill="url(#p3-sky)"/>
      <circle cx="400" cy="700" r="120" fill="#ffdf9a" opacity=".55"/>
      <!-- distant headland + lighthouse -->
      <path d="M440,720 L480,664 Q540,626 620,620 L800,610 L800,720 Z" fill="#1d1a30"/>
      <g transform="translate(600,622)">
        <path d="M-9,0 L9,0 L6,-40 L-6,-40 Z" fill="#2a2244"/>
        <circle cx="0" cy="-36" r="5" fill="#ffe9a8">
          <animate attributeName="opacity" values="1;.3;1" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
      <rect y="720" width="800" height="480" fill="url(#p3-sea)"/>
      <g opacity=".5" stroke="#d8a274" stroke-width="2.5" fill="none">
        <path d="M80,780 q40,-7 84,0 t76,0"><animate attributeName="opacity" values=".5;.15;.5" dur="4.4s" repeatCount="indefinite"/></path>
        <path d="M420,850 q46,-8 92,0 t84,0"><animate attributeName="opacity" values=".15;.5;.15" dur="5.6s" repeatCount="indefinite"/></path>
      </g>
      <!-- gulls -->
      <g stroke="#e8e4d8" stroke-width="4" fill="none" stroke-linecap="round">
        <g><path d="M240,300 q12,-14 24,0 q12,-14 24,0"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;36,-14;0,0" dur="7s" repeatCount="indefinite"/></g>
        <g><path d="M480,220 q9,-11 18,0 q9,-11 18,0"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;-30,10;0,0" dur="9s" repeatCount="indefinite"/></g>
      </g>
      <!-- the boat, bobbing, Kel reading at the rail -->
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,12;0,0" dur="5s" repeatCount="indefinite"/>
        <path d="M0,1200 L0,980 Q170,930 400,940 Q640,950 800,1010 L800,1200 Z" fill="#241a24"/>
        <path d="M0,980 Q170,930 400,940 Q640,950 800,1010 L800,1040 Q640,982 400,972 Q170,962 0,1010 Z" fill="#3d2b3f"/>
        <path d="M180,952 L180,700" stroke="#241a24" stroke-width="14"/>
        <path d="M187,706 L320,860 L187,860 Z" fill="#8d7f96" opacity=".9"/>
        <!-- Kel -->
        <g transform="translate(430,810)" fill="#141a2a">
          <path d="M-24,160 L-20,44 Q-26,10 0,4 Q28,10 24,44 L28,160 Z"/>
          <circle cx="1" cy="-16" r="24"/>
          <path d="M-20,-28 Q0,-46 22,-26 L22,-14 Q0,-30 -18,-14 Z" fill="#0d1120"/>
          <path d="M-20,60 Q-46,74 -58,96 L-50,102 Q-36,82 -14,72 Z"/>
          <path d="M20,60 Q46,74 58,96 L50,102 Q36,82 14,72 Z"/>
          <g transform="translate(-52,102) rotate(-14)">
            <rect x="-26" y="-34" width="60" height="42" rx="3" fill="#efe6cf"/>
            <g stroke="#8a7a56" stroke-width="2" opacity=".8">
              <path d="M-18,-24 h44 M-18,-16 h44 M-18,-8 h38 M-18,0 h44"/>
            </g>
          </g>
        </g>
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
    oars: icon(`<g transform="rotate(38 24 24)"><rect x="21.5" y="10" width="5" height="32" rx="2.5" fill="#8a7a5c"/><path d="M21.5,10 Q14,2 24,-2 Q33,3 26.5,11 Z" transform="translate(0,4)" fill="#8a7a5c"/></g><g transform="rotate(-38 24 24)"><rect x="21.5" y="10" width="5" height="32" rx="2.5" fill="#7a6a4e"/><path d="M21.5,10 Q14,2 24,-2 Q33,3 26.5,11 Z" transform="translate(0,4)" fill="#7a6a4e"/></g>`),
    boathook: icon(`<g transform="rotate(30 24 24)"><rect x="21.5" y="8" width="5" height="36" rx="2.5" fill="#8a7a5c"/><path d="M21.5,8 Q10,1 13,-8 Q24,-5 27,7 Z" transform="translate(0,7)" fill="#9aa2b2"/></g>`),
    strikerchain: icon(`<g stroke="#b8b2a0" stroke-width="3" fill="none"><ellipse cx="20" cy="10" rx="5" ry="7" transform="rotate(-16 20 10)"/><ellipse cx="25" cy="20" rx="5" ry="7" transform="rotate(10 25 20)"/><ellipse cx="27" cy="31" rx="5" ry="7" transform="rotate(-6 27 31)"/></g><circle cx="28" cy="42" r="6" fill="#d9d2c0"/>`),
  };

  return { dock, exterior, cottage, lamp, cliffs, cave, shore, bellrock, prologue, prologue2, title, ending, ending2, portraits, icons };
})();
