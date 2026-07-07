/* ============================================================
   MUSIC — procedural ambient score for The Keeper of Grey Harbor.
   Pure WebAudio, no audio files: each scene gets a mood built from
   a slow pad chord, a generative melody over a scale, and a noise
   bed (waves / wind / cave drips). Everything is generated, so the
   whole soundtrack costs zero bytes of assets.
   ============================================================ */
'use strict';

const Music = (() => {
  const PREF_KEY = 'greyharbor_music';

  /* mood definitions (MIDI note numbers) */
  const MOODS = {
    title:    { pad: [45, 52, 57, 60], scale: [57, 60, 62, 64, 67, 69, 72], stepMs: 1900, rest: .45, decay: 2.6, noise: 'waves', noiseLvl: .05, melLvl: .10, padLvl: .05 },
    dock:     { pad: [38, 45, 50, 53], scale: [50, 53, 55, 57, 60, 62, 65], stepMs: 1700, rest: .40, decay: 2.2, noise: 'waves', noiseLvl: .07, melLvl: .10, padLvl: .05 },
    exterior: { pad: [40, 47, 52, 55], scale: [52, 55, 57, 59, 62, 64, 67], stepMs: 2400, rest: .55, decay: 2.8, noise: 'wind',  noiseLvl: .05, melLvl: .08, padLvl: .05 },
    cottage:  { pad: [43, 50, 55, 59], scale: [67, 69, 71, 74, 76, 79, 81], stepMs: 1500, rest: .35, decay: 1.6, noise: null,    noiseLvl: 0,   melLvl: .07, padLvl: .06, box: true },
    lamp:     { pad: [48, 55, 60, 64], scale: [60, 62, 64, 67, 69, 72, 74], stepMs: 2000, rest: .45, decay: 2.6, noise: 'wind',  noiseLvl: .035, melLvl: .09, padLvl: .05 },
    cliffs:   { pad: [36, 43, 48, 51], scale: [48, 51, 53, 55, 58, 60, 63], stepMs: 2600, rest: .60, decay: 3.0, noise: 'wind',  noiseLvl: .09, melLvl: .08, padLvl: .06 },
    cave:     { pad: [41, 48, 53],     scale: [],                            stepMs: 0,    rest: 1,   decay: 0,   noise: 'waves', noiseLvl: .05, melLvl: 0,   padLvl: .06, drips: true },
    ending:   { pad: [41, 48, 53, 57, 60], scale: [53, 55, 57, 60, 62, 65, 67], stepMs: 1600, rest: .35, decay: 2.2, noise: 'waves', noiseLvl: .05, melLvl: .10, padLvl: .06 },
    fog:      { pad: [36, 43, 48],         scale: [48, 50, 53, 55, 58],         stepMs: 3000, rest: .65, decay: 3.4, noise: 'hush',  noiseLvl: .09, melLvl: .07, padLvl: .06 },
  };

  let ctx = null, master = null, delaySend = null;
  let enabled = true, unlocked = false;
  let scene = null;            // current mood id
  let graph = null;            // active scene nodes {gain, stops:[], timers:[]}
  let noiseBuf = null;
  let listeners = [];

  try { enabled = localStorage.getItem(PREF_KEY) !== 'off'; } catch (e) {}

  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  function ensureCtx() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = .8;
    master.connect(ctx.destination);
    // shared airy echo
    delaySend = ctx.createGain();
    delaySend.gain.value = .22;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = .42;
    const fb = ctx.createGain();
    fb.gain.value = .3;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass'; damp.frequency.value = 1600;
    delaySend.connect(delay); delay.connect(damp); damp.connect(fb); fb.connect(delay);
    damp.connect(master);
    // 2s brown-noise loop buffer
    const len = 2 * ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + .02 * w) / 1.02;
      d[i] = last * 3.5;
    }
    return true;
  }

  /* must be called from a user gesture (mobile autoplay policy) */
  function unlock() {
    if (unlocked || !enabled) return;
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); }
    unlocked = true;
    if (scene) startScene(scene);
  }

  function osc(type, freq, dest) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    if (dest) o.connect(dest);
    return o;
  }

  function startScene(id) {
    const m = MOODS[id];
    if (!m || !ctx || !unlocked || !enabled) return;
    stopGraph(1.6);

    const g = { gain: ctx.createGain(), stops: [], timers: [] };
    g.gain.gain.value = 0;
    g.gain.connect(master);
    const t = ctx.currentTime;
    g.gain.gain.linearRampToValueAtTime(1, t + 2.2);

    /* pad: two detuned triangles per chord tone through a lowpass */
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass'; padFilter.frequency.value = 700; padFilter.Q.value = .4;
    const padGain = ctx.createGain();
    padGain.gain.value = m.padLvl;
    padFilter.connect(padGain); padGain.connect(g.gain);
    m.pad.forEach((n, i) => {
      const f = midi(n);
      [3, -4].forEach(cents => {
        const o = osc('triangle', f, padFilter);
        o.detune.value = cents + (i % 2 ? 2 : -2);
        o.start();
        g.stops.push(o);
      });
    });
    // slow filter breathing
    const lfo = osc('sine', .05, null);
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 220;
    lfo.connect(lfoAmt); lfoAmt.connect(padFilter.frequency);
    lfo.start(); g.stops.push(lfo);

    /* noise bed */
    if (m.noise) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf; src.loop = true;
      const nf = ctx.createBiquadFilter();
      if (m.noise === 'wind') { nf.type = 'bandpass'; nf.frequency.value = 500; nf.Q.value = .6; }
      else if (m.noise === 'hush') { nf.type = 'lowpass'; nf.frequency.value = 240; } // fog: the world muffled
      else { nf.type = 'lowpass'; nf.frequency.value = 480; }
      const ng = ctx.createGain();
      ng.gain.value = m.noiseLvl;
      src.connect(nf); nf.connect(ng); ng.connect(g.gain);
      // swell like surf / gusts
      const nlfo = osc('sine', m.noise === 'wind' ? .11 : .07, null);
      const nAmt = ctx.createGain();
      nAmt.gain.value = m.noiseLvl * .6;
      nlfo.connect(nAmt); nAmt.connect(ng.gain);
      if (m.noise === 'wind') {
        const fAmt = ctx.createGain(); fAmt.gain.value = 260;
        nlfo.connect(fAmt); fAmt.connect(nf.frequency);
      }
      src.start(); nlfo.start();
      g.stops.push(src, nlfo);
    }

    /* generative melody: gentle random walk over the mood's scale */
    if (m.scale.length && m.stepMs) {
      let idx = Math.floor(m.scale.length / 2);
      const step = () => {
        if (!enabled || !ctx || graph !== g) return;
        if (Math.random() > m.rest) {
          idx += [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)];
          idx = Math.max(0, Math.min(m.scale.length - 1, idx));
          note(midi(m.scale[idx]), m, g);
          if (Math.random() < .18 && idx >= 2) note(midi(m.scale[idx - 2]), m, g, .5);
        }
      };
      g.timers.push(setInterval(step, m.stepMs));
      g.timers.push(setTimeout(step, 700));
    }

    /* cave drips */
    if (m.drips) {
      const drip = () => {
        if (!enabled || !ctx || graph !== g) return;
        const f = 700 + Math.random() * 1800;
        const o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.setValueAtTime(f, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(f * .55, ctx.currentTime + .12);
        const e = ctx.createGain();
        e.gain.setValueAtTime(.08, ctx.currentTime);
        e.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .3);
        o.connect(e); e.connect(g.gain); e.connect(delaySend);
        o.start(); o.stop(ctx.currentTime + .35);
        g.timers.push(setTimeout(drip, 400 + Math.random() * 1600));
      };
      g.timers.push(setTimeout(drip, 600));
    }

    graph = g;
  }

  function note(freq, m, g, vol = 1) {
    const t = ctx.currentTime;
    const e = ctx.createGain();
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(m.melLvl * vol, t + (m.box ? .008 : .06));
    e.gain.exponentialRampToValueAtTime(.0001, t + m.decay);
    const o = osc('sine', freq, e);
    e.connect(g.gain); e.connect(delaySend);
    o.start(t); o.stop(t + m.decay + .1);
    if (m.box) { // music-box sparkle: quiet upper octave partial
      const e2 = ctx.createGain();
      e2.gain.setValueAtTime(0, t);
      e2.gain.linearRampToValueAtTime(m.melLvl * .25 * vol, t + .008);
      e2.gain.exponentialRampToValueAtTime(.0001, t + m.decay * .5);
      const o2 = osc('sine', freq * 2, e2);
      e2.connect(g.gain);
      o2.start(t); o2.stop(t + m.decay);
    }
  }

  function stopGraph(fade) {
    if (!graph) return;
    const g = graph;
    graph = null;
    g.timers.forEach(tm => { clearInterval(tm); clearTimeout(tm); });
    const t = ctx.currentTime;
    g.gain.gain.cancelScheduledValues(t);
    g.gain.gain.setValueAtTime(g.gain.gain.value, t);
    g.gain.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => {
      g.stops.forEach(n => { try { n.stop(); } catch (e) {} });
      try { g.gain.disconnect(); } catch (e) {}
    }, fade * 1000 + 150);
  }

  function notify() { listeners.forEach(fn => fn(enabled)); }

  return {
    unlock,
    isOn: () => enabled,
    status: () => ({ ctx: ctx ? ctx.state : 'none', playing: !!graph, scene }),
    /* synthesized bronze bell strike (inharmonic partials) */
    bell(strength) {
      try {
        if (!ctx || !unlocked || !enabled) return;
        const base = 196; // G3 fundamental
        const partials = [[0.5, .5], [1, 1], [1.183, .35], [1.506, .3], [2.0, .28], [2.662, .18], [3.011, .12]];
        const t = ctx.currentTime;
        const vol = .22 + .05 * Math.min(strength || 1, 3);
        partials.forEach(([r, a], i) => {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = base * r;
          const e = ctx.createGain();
          e.gain.setValueAtTime(0, t);
          e.gain.linearRampToValueAtTime(vol * a, t + .006);
          e.gain.exponentialRampToValueAtTime(.0001, t + 3.8 - i * .3);
          o.connect(e); e.connect(master);
          if (delaySend) e.connect(delaySend);
          o.start(t); o.stop(t + 4);
        });
      } catch (e) {}
    },
    onChange(fn) { listeners.push(fn); },
    setScene(id) {
      if (scene === id) return;
      scene = id;
      // audio must never be able to break the game
      try { if (unlocked && enabled) startScene(id); } catch (e) {}
    },
    toggle() {
      enabled = !enabled;
      try { localStorage.setItem(PREF_KEY, enabled ? 'on' : 'off'); } catch (e) {}
      if (enabled) {
        unlocked = false; // re-unlock (we're inside a tap handler, so this succeeds)
        unlock();
      } else if (ctx) {
        stopGraph(.5);
        setTimeout(() => { if (!enabled && ctx && ctx.state === 'running') ctx.suspend(); }, 800);
      }
      notify();
      return enabled;
    },
  };
})();
