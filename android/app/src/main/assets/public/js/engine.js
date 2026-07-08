/* ============================================================
   ENGINE — The Keeper of Grey Harbor
   State, rendering, hotspots, inventory, dialogue, puzzles,
   journal, saving. No dependencies.
   ============================================================ */
'use strict';

(() => {
  const META_KEY = 'greyharbor_meta_v1'; // cross-chapter progress (unlocks)
  const $ = id => document.getElementById(id);

  let chapterId = 'ch1';
  const chapterCfg = () => Chapters[chapterId];

  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveMeta(m) {
    try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {}
  }

  const el = {
    title: $('title-screen'), game: $('game-screen'), ending: $('ending-screen'),
    prologue: $('prologue-screen'), prologueArt: $('prologue-art'), prologueCaption: $('prologue-caption'),
    titleArt: $('title-art'), endingArt: $('ending-art'), endingText: $('ending-text'),
    stage: $('stage'), caption: $('caption'), sceneName: $('scene-name'),
    invSlots: $('inv-slots'), toast: $('toast'),
    dialogOverlay: $('dialog-overlay'), dialogBox: $('dialog-box'),
    dialogPortrait: $('dialog-portrait'), dialogSpeaker: $('dialog-speaker'),
    dialogText: $('dialog-text'), dialogChoices: $('dialog-choices'), dialogNext: $('dialog-next'),
    journalOverlay: $('journal-overlay'), objectiveBox: $('objective-box'), clueList: $('clue-list'),
    puzzleOverlay: $('puzzle-overlay'), puzzlePanel: $('puzzle-panel'),
    menuOverlay: $('menu-overlay'), howtoOverlay: $('howto-overlay'),
  };

  let state = null;
  let selectedItem = null;
  let captionTimer = null;
  let toastTimer = null;

  /* ---------------- state & save (one save per chapter) ---------------- */
  function freshState() {
    return { v: 1, chapter: chapterId, scene: chapterCfg().start, inv: [], flags: {}, clues: [], introDone: false };
  }

  function save() {
    try { localStorage.setItem(chapterCfg().saveKey, JSON.stringify(state)); } catch (e) { /* private mode: play on */ }
  }

  function loadSave(ch) {
    try {
      const cfg = Chapters[ch || chapterId];
      const raw = localStorage.getItem(cfg.saveKey);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || s.v !== 1 || !Scenes[s.scene]) return null;
      s.chapter = ch || chapterId;
      s.inv = (s.inv || []).filter(id => Items[id]);
      s.clues = (s.clues || []).filter(id => Clues[id]);
      s.flags = s.flags || {};
      return s;
    } catch (e) { return null; }
  }

  function clearSave(ch) {
    try { localStorage.removeItem(Chapters[ch || chapterId].saveKey); } catch (e) {}
  }

  /* ---------------- engine API given to data handlers ---------------- */
  const G = {
    flag: name => !!state.flags[name],
    setFlag(name) { state.flags[name] = true; save(); },
    hasItem: id => state.inv.includes(id),
    addItem(id) {
      if (!Items[id] || state.inv.includes(id)) return;
      state.inv.push(id); save(); renderInventory();
      toast('Taken: ' + Items[id].name);
    },
    removeItem(id) {
      const i = state.inv.indexOf(id);
      if (i >= 0) { state.inv.splice(i, 1); save(); }
      if (selectedItem === id) selectedItem = null;
      renderInventory();
    },
    addClue(id) {
      if (!Clues[id] || state.clues.includes(id)) return;
      state.clues.push(id); save();
      toast('Field note added: ' + Clues[id].title);
    },
    say(text) { showCaption(text); },
    goto(sceneId, arriveText) {
      if (!Scenes[sceneId]) return;
      state.scene = sceneId; save();
      selectedItem = null;
      renderScene(); renderInventory();
      hideCaption();
      if (arriveText) showCaption(arriveText);
    },
    refresh() { renderScene(); },
    dialog(nodeId) { openDialog(nodeId); },
    puzzle(id) { openPuzzle(id); },
    checkCliffs() {
      if (state.flags.lensSolved && state.flags.logDecoded && !state.flags.cliffsOpen) {
        state.flags.cliffsOpen = true; save();
        setTimeout(() => toast('New path revealed: The Black Cliffs'), 1400);
      }
    },
    endGame() { setTimeout(showEnding, 400); },
  };

  /* ---------------- screens ---------------- */
  function show(screen) {
    [el.title, el.game, el.ending, el.prologue].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
  }

  function showTitle() {
    el.titleArt.innerHTML = Art.title();
    buildChapterList();
    show(el.title);
    Music.setScene('title');
  }

  function buildChapterList() {
    const meta = loadMeta();
    const list = $('chapter-list');
    list.innerHTML = '';
    Object.keys(Chapters).forEach(id => {
      const c = Chapters[id];
      const locked = c.requires && !meta[c.requires + 'Done'];
      const card = document.createElement('div');
      card.className = 'chapter-card' + (locked ? ' locked' : '');
      card.id = 'card-' + id;
      const done = meta[id + 'Done'] ? '<span class="chapter-done">✓ solved</span>' : '';
      card.innerHTML = '<span class="chapter-label">' + c.label + done + '</span><h3>' + c.name + '</h3>';
      if (locked) {
        const p = document.createElement('p');
        p.className = 'chapter-lock';
        p.id = 'lock-' + id;
        p.textContent = '🔒 ' + c.lockHint;
        card.appendChild(p);
      } else {
        const btns = document.createElement('div');
        btns.className = 'chapter-btns';
        const s = loadSave(id);
        if (s) {
          const cont = document.createElement('button');
          cont.className = 'btn btn-primary';
          cont.id = id === 'ch1' ? 'btn-continue' : 'btn-continue-' + id;
          cont.textContent = 'Continue — ' + Scenes[s.scene].name;
          cont.addEventListener('click', () => startGame(false, id));
          btns.appendChild(cont);
        }
        const nw = document.createElement('button');
        nw.className = 'btn' + (s ? '' : ' btn-primary');
        nw.id = id === 'ch1' ? 'btn-new' : 'btn-new-' + id;
        nw.textContent = s ? 'Restart' : 'New Game';
        nw.addEventListener('click', () => {
          if (loadSave(id) && !window.confirm('Start ' + c.label + ' over? Its saved progress will be erased.')) return;
          clearSave(id);
          startGame(true, id);
        });
        btns.appendChild(nw);
        card.appendChild(btns);
      }
      list.appendChild(card);
    });
  }

  function startGame(fresh, ch) {
    chapterId = ch || chapterId || 'ch1';
    if (fresh) { state = freshState(); save(); }
    else { state = loadSave() || freshState(); }
    selectedItem = null;
    if (!state.introDone) { showPrologue(); return; }
    enterGame();
  }

  function enterGame() {
    clearTimeout(prologueTimer);
    if (!state.introDone) { state.introDone = true; save(); }
    show(el.game);
    renderScene(); renderInventory();
  }

  /* ---------------- prologue cutscene ---------------- */
  let prologueSlide = 0;
  let prologueTimer = null;

  function showPrologue() {
    prologueSlide = 0;
    show(el.prologue);
    paintPrologue();
  }

  function paintPrologue() {
    clearTimeout(prologueTimer);
    const s = chapterCfg().prologue[prologueSlide];
    el.prologueArt.innerHTML = s.art();
    // retrigger the caption entrance animation
    const cap = el.prologueCaption;
    cap.textContent = s.text;
    cap.style.animation = 'none';
    void cap.offsetWidth;
    cap.style.animation = '';
    prologueTimer = setTimeout(nextPrologue, 8500);
  }

  function nextPrologue() {
    prologueSlide++;
    if (prologueSlide >= chapterCfg().prologue.length) enterGame();
    else paintPrologue();
  }

  function showEnding() {
    closeAllOverlays();
    const cfg = chapterCfg().ending;
    const meta = loadMeta();
    const unlocksCh2 = chapterId === 'ch1' && !meta.ch1Done;
    meta[chapterId + 'Done'] = true;
    saveMeta(meta);
    el.endingArt.innerHTML = cfg.art();
    $('ending-title').textContent = cfg.title;
    el.endingText.innerHTML = '';
    show(el.ending);
    Music.setScene('ending');
    clearSave();
    cfg.text.forEach((p, i) => {
      const par = document.createElement('p');
      par.textContent = p;
      par.style.opacity = '0';
      par.style.transition = 'opacity 1.2s ease';
      par.style.marginBottom = '12px';
      el.endingText.appendChild(par);
      setTimeout(() => { par.style.opacity = '1'; }, 600 + i * 1500);
    });
    /* action buttons — always visible, never below the fold */
    const btns = $('ending-buttons');
    btns.innerHTML = '';
    if (unlocksCh2) {
      const b = document.createElement('div');
      b.className = 'unlock-banner';
      b.textContent = '✦ Chapter Two unlocked: ' + Chapters.ch2.name;
      b.style.opacity = '0';
      b.style.transition = 'opacity 1.2s ease';
      btns.appendChild(b);
      setTimeout(() => { b.style.opacity = '1'; }, 1200);
    }
    if (chapterId === 'ch1' && Chapters.ch2) {
      const hasCh2Save = !!loadSave('ch2');
      const nx = document.createElement('button');
      nx.className = 'btn btn-primary';
      nx.id = 'btn-next-chapter';
      nx.textContent = (hasCh2Save ? 'Continue Chapter Two' : 'Begin Chapter Two') + ' ▸';
      nx.addEventListener('click', () => startGame(!hasCh2Save, 'ch2'));
      btns.appendChild(nx);
    }
    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn' + (btns.children.length ? '' : ' btn-primary');
    menuBtn.id = 'btn-again';
    menuBtn.textContent = 'Main Menu';
    menuBtn.addEventListener('click', showTitle);
    btns.appendChild(menuBtn);
  }

  /* ---------------- scene rendering ---------------- */
  function renderScene() {
    const scene = Scenes[state.scene];
    el.sceneName.textContent = scene.name;
    Music.setScene(scene.mood || state.scene);
    el.stage.innerHTML = scene.art(state.flags);
    const svg = el.stage.querySelector('svg');
    if (!svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('id', 'hotspot-layer');

    scene.hotspots.forEach(h => {
      if (h.visible && !h.visible(state.flags)) return;
      const [x, y, w, hh] = h.rect;

      const hit = document.createElementNS(NS, 'rect');
      hit.setAttribute('x', x); hit.setAttribute('y', y);
      hit.setAttribute('width', w); hit.setAttribute('height', hh);
      hit.setAttribute('fill', 'rgba(0,0,0,0)');
      hit.setAttribute('class', 'hotspot');
      hit.addEventListener('click', ev => { ev.stopPropagation(); tapHotspot(h); });

      const marker = document.createElementNS(NS, 'rect');
      marker.setAttribute('x', x + 4); marker.setAttribute('y', y + 4);
      marker.setAttribute('width', Math.max(2, w - 8)); marker.setAttribute('height', Math.max(2, hh - 8));
      marker.setAttribute('rx', 12);
      marker.setAttribute('class', 'hotspot-marker');

      layer.appendChild(marker);
      layer.appendChild(hit);
    });
    svg.appendChild(layer);
  }

  function tapHotspot(h) {
    hideCaption();
    if (selectedItem) {
      const item = selectedItem;
      deselectItem();
      const fn = h.onItem && h.onItem[item];
      if (fn) fn(G);
      else showCaption('The ' + Items[item].name.toLowerCase() + ' is no use there.');
      return;
    }
    if (h.onTap) h.onTap(G);
  }

  /* ---------------- caption & toast ---------------- */
  function showCaption(text) {
    clearTimeout(captionTimer);
    el.caption.textContent = text;
    el.caption.classList.remove('hidden');
    captionTimer = setTimeout(hideCaption, 1800 + text.length * 55);
  }
  function hideCaption() {
    clearTimeout(captionTimer);
    el.caption.classList.add('hidden');
  }

  function toast(text) {
    clearTimeout(toastTimer);
    el.toast.textContent = text;
    el.toast.classList.remove('hidden');
    toastTimer = setTimeout(() => el.toast.classList.add('hidden'), 2400);
  }

  /* ---------------- inventory ---------------- */
  function renderInventory() {
    el.invSlots.innerHTML = '';
    if (!state.inv.length) {
      const e = document.createElement('div');
      e.className = 'inv-empty';
      e.textContent = 'Your satchel is empty.';
      el.invSlots.appendChild(e);
      return;
    }
    state.inv.forEach(id => {
      const d = document.createElement('div');
      d.className = 'inv-item' + (selectedItem === id ? ' selected' : '');
      d.innerHTML = Art.icons[Items[id].icon] || '';
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', Items[id].name);
      d.addEventListener('click', () => tapItem(id));
      el.invSlots.appendChild(d);
    });
  }

  function tapItem(id) {
    if (selectedItem === id) {
      deselectItem();
      showCaption(Items[id].desc);
      return;
    }
    selectedItem = id;
    renderInventory();
    showCaption(Items[id].name + ' — now tap where you want to use it. (Tap it again to put it away.)');
  }

  function deselectItem() {
    selectedItem = null;
    renderInventory();
  }

  /* ---------------- dialogue ---------------- */
  let dlg = { node: null, typing: false, typeTimer: null, fullText: '' };

  function openDialog(nodeId) {
    el.dialogOverlay.classList.remove('hidden');
    showDialogNode(nodeId);
  }

  function showDialogNode(nodeId) {
    const node = Dialogs[nodeId];
    if (!node) { closeDialog(); return; }
    dlg.node = node;
    if (node.effect) { node.effect(G); }

    el.dialogPortrait.innerHTML = Art.portraits[node.portrait] || '';
    el.dialogSpeaker.textContent = node.speaker || '';
    el.dialogSpeaker.style.display = node.speaker ? '' : 'none';
    el.dialogChoices.innerHTML = '';
    el.dialogNext.classList.add('hidden');

    dlg.fullText = node.text;
    el.dialogText.textContent = '';
    dlg.typing = true;
    let i = 0;
    clearInterval(dlg.typeTimer);
    dlg.typeTimer = setInterval(() => {
      i += 2;
      el.dialogText.textContent = dlg.fullText.slice(0, i);
      if (i >= dlg.fullText.length) finishTyping();
    }, 24);
  }

  function finishTyping() {
    clearInterval(dlg.typeTimer);
    dlg.typing = false;
    el.dialogText.textContent = dlg.fullText;
    const node = dlg.node;
    if (!node) return;
    if (node.choices) {
      const avail = node.choices.filter(c => !c.if || c.if(state.flags));
      avail.forEach(c => {
        const b = document.createElement('button');
        b.className = 'choice-btn';
        b.textContent = c.label;
        b.addEventListener('click', ev => {
          ev.stopPropagation();
          if (c.next) showDialogNode(c.next); else closeDialog();
        });
        el.dialogChoices.appendChild(b);
      });
    } else {
      el.dialogNext.classList.remove('hidden');
    }
  }

  function advanceDialog() {
    if (!dlg.node) return;
    if (dlg.typing) { finishTyping(); return; }
    if (dlg.node.choices) return; // must pick
    if (dlg.node.next) showDialogNode(dlg.node.next);
    else closeDialog();
  }

  function closeDialog() {
    clearInterval(dlg.typeTimer);
    dlg.node = null; dlg.typing = false;
    el.dialogOverlay.classList.add('hidden');
    renderScene(); // flags may have changed the scene
  }

  /* ---------------- journal ---------------- */
  function openJournal() {
    el.objectiveBox.innerHTML = '<b>Current objective</b>' + escapeHtml(chapterCfg().objective(state.flags));
    el.clueList.innerHTML = '';
    if (!state.clues.length) {
      el.clueList.innerHTML = '<p class="no-clues">No notes yet. Poke around; talk to people.</p>';
    } else {
      [...state.clues].reverse().forEach(id => {
        const c = Clues[id];
        const d = document.createElement('div');
        d.className = 'clue';
        d.innerHTML = '<h3>' + escapeHtml(c.title) + '</h3><p>' + escapeHtml(c.text) + '</p>';
        el.clueList.appendChild(d);
      });
    }
    el.journalOverlay.classList.remove('hidden');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  /* ---------------- puzzles ---------------- */
  function openPuzzle(id) {
    const p = Puzzles[id];
    if (!p) return;
    el.puzzlePanel.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = '<h2>' + escapeHtml(p.title) + '</h2>';
    const close = document.createElement('button');
    close.className = 'icon-btn close-btn';
    close.innerHTML = '&times;';
    close.addEventListener('click', closePuzzle);
    head.appendChild(close);
    el.puzzlePanel.appendChild(head);

    const sub = document.createElement('p');
    sub.className = 'puzzle-sub';
    sub.textContent = p.sub;
    el.puzzlePanel.appendChild(sub);

    if (p.type === 'keypad') buildKeypad(p);
    else if (p.type === 'cipher') buildCipher(p);
    else if (p.type === 'lens') buildLens(p);
    else if (p.type === 'bell') buildBell(p);

    el.puzzleOverlay.classList.remove('hidden');
  }

  function closePuzzle() {
    el.puzzleOverlay.classList.add('hidden');
    el.puzzlePanel.innerHTML = '';
  }

  function solvePuzzle(p) {
    closePuzzle();
    p.onSolve(G);
    renderScene();
    renderInventory();
  }

  /* keypad */
  function buildKeypad(p) {
    let entry = '';
    const disp = document.createElement('div');
    disp.className = 'code-display';
    const digits = [];
    for (let i = 0; i < p.code.length; i++) {
      const d = document.createElement('div');
      d.className = 'code-digit';
      d.textContent = '•';
      digits.push(d); disp.appendChild(d);
    }
    el.puzzlePanel.appendChild(disp);

    const pad = document.createElement('div');
    pad.className = 'keypad';
    const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
    keys.forEach(k => {
      const b = document.createElement('button');
      b.className = 'key';
      b.textContent = k;
      b.addEventListener('click', () => {
        if (k === '⌫') { entry = entry.slice(0, -1); }
        else if (k === '✓') { if (entry.length === p.code.length) check(); return; }
        else if (entry.length < p.code.length) entry += k;
        paint();
        if (entry.length === p.code.length) setTimeout(check, 300);
      });
      pad.appendChild(b);
    });
    el.puzzlePanel.appendChild(pad);

    function paint() {
      digits.forEach((d, i) => {
        d.textContent = entry[i] !== undefined ? entry[i] : '•';
        d.classList.remove('code-wrong');
      });
    }
    function check() {
      if (entry === p.code) { solvePuzzle(p); return; }
      entry = ''; // clear immediately so quick retries aren't swallowed
      digits.forEach(d => d.classList.add('code-wrong'));
      showPuzzleNote(p.wrongText || 'Nothing happens.');
      setTimeout(paint, 500);
    }
  }

  function showPuzzleNote(text) {
    let n = el.puzzlePanel.querySelector('.solved-note');
    if (!n) {
      n = document.createElement('div');
      n.className = 'solved-note';
      el.puzzlePanel.appendChild(n);
    }
    n.textContent = text;
  }

  /* cipher */
  function buildCipher(p) {
    const A = 'A'.charCodeAt(0);
    const enc = ch => {
      const c = ch.charCodeAt(0);
      if (c < A || c > A + 25) return ch;
      return String.fromCharCode(A + (c - A + p.shift) % 26);
    };
    const ciphertext = p.plaintext.toUpperCase().split('').map(enc).join('');
    let turn = 0;

    const txt = document.createElement('div');
    txt.className = 'cipher-text';
    el.puzzlePanel.appendChild(txt);

    const ctrl = document.createElement('div');
    ctrl.className = 'cipher-controls';
    const left = document.createElement('button');
    left.className = 'wheel-btn'; left.textContent = '⟲';
    const mid = document.createElement('div');
    mid.className = 'wheel-readout';
    const right = document.createElement('button');
    right.className = 'wheel-btn'; right.textContent = '⟳';
    ctrl.appendChild(left); ctrl.appendChild(mid); ctrl.appendChild(right);
    el.puzzlePanel.appendChild(ctrl);

    const actions = document.createElement('div');
    actions.className = 'puzzle-actions';
    const done = document.createElement('button');
    done.className = 'btn btn-primary';
    done.textContent = 'Mark the page';
    done.disabled = true;
    done.style.opacity = '.35';
    done.addEventListener('click', () => { if (turn === p.shift) solvePuzzle(p); });
    actions.appendChild(done);
    el.puzzlePanel.appendChild(actions);

    const note = document.createElement('div');
    note.className = 'solved-note';
    el.puzzlePanel.appendChild(note);

    function paint() {
      txt.textContent = ciphertext.split('').map(ch => {
        const c = ch.charCodeAt(0);
        if (c < A || c > A + 25) return ch;
        return String.fromCharCode(A + (c - A - turn + 26) % 26);
      }).join('');
      const roman = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV'];
      mid.innerHTML = 'Turns<b>' + roman[turn] + '</b>';
      const good = turn === p.shift;
      done.disabled = !good;
      done.style.opacity = good ? '1' : '.35';
      note.textContent = good ? 'The letters settle. It reads true.' : '';
    }
    left.addEventListener('click', () => { turn = (turn + 25) % 26; paint(); });
    right.addEventListener('click', () => { turn = (turn + 1) % 26; paint(); });
    paint();
  }

  /* lens rings */
  function buildLens(p) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('id', 'lens-svg');

    svg.innerHTML =
      '<circle cx="150" cy="150" r="140" fill="#0a0f1f" stroke="#8a6a34" stroke-width="3"/>' +
      '<path d="M150,10 L150,34" stroke="#57c4b8" stroke-width="5" stroke-linecap="round"/>';

    const rings = [];
    const radii = [118, 84, 50];
    const angles = [90, 225, 315];

    radii.forEach((r, idx) => {
      const gEl = document.createElementNS(NS, 'g');
      gEl.setAttribute('class', 'lens-ring');

      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', 150); c.setAttribute('cy', 150); c.setAttribute('r', r);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', idx === 1 ? '#c9a24a' : '#a8863e');
      c.setAttribute('stroke-width', 22);
      c.setAttribute('opacity', '.85');
      gEl.appendChild(c);

      for (let k = 0; k < 8; k++) {
        const tick = document.createElementNS(NS, 'line');
        const ang = (k * 45) * Math.PI / 180;
        tick.setAttribute('x1', 150 + Math.sin(ang) * (r - 8));
        tick.setAttribute('y1', 150 - Math.cos(ang) * (r - 8));
        tick.setAttribute('x2', 150 + Math.sin(ang) * (r + 8));
        tick.setAttribute('y2', 150 - Math.cos(ang) * (r + 8));
        tick.setAttribute('stroke', '#6e5320');
        tick.setAttribute('stroke-width', 3);
        gEl.appendChild(tick);
      }

      const notch = document.createElementNS(NS, 'path');
      notch.setAttribute('d', `M150,${150 - r - 12} L${150 - 8},${150 - r + 8} L${150 + 8},${150 - r + 8} Z`);
      notch.setAttribute('fill', '#57c4b8');
      gEl.appendChild(notch);

      const hit = document.createElementNS(NS, 'circle');
      hit.setAttribute('cx', 150); hit.setAttribute('cy', 150); hit.setAttribute('r', r);
      hit.setAttribute('fill', 'none');
      hit.setAttribute('stroke', 'rgba(0,0,0,0)');
      hit.setAttribute('stroke-width', 32);
      hit.setAttribute('pointer-events', 'stroke');
      hit.style.cursor = 'pointer';
      gEl.appendChild(hit);

      svg.appendChild(gEl);
      rings.push({ g: gEl, angle: angles[idx] });

      hit.addEventListener('click', () => {
        const ring = rings[idx];
        ring.angle += 45;
        ring.g.style.transform = `rotate(${ring.angle}deg)`;
        if (rings.every(rr => rr.angle % 360 === 0)) {
          note.textContent = 'The marks align. Somewhere below, glass sings.';
          setTimeout(() => solvePuzzle(p), 700);
        } else {
          note.textContent = '';
        }
      });
    });

    // apply initial rotation
    el.puzzlePanel.appendChild(svg);
    rings.forEach(r => { r.g.style.transform = `rotate(${r.angle}deg)`; });

    const note = document.createElement('div');
    note.className = 'solved-note';
    el.puzzlePanel.appendChild(note);
  }

  /* bell ringing: pull the chain at the top of the swing */
  function buildBell(p) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 260');
    svg.setAttribute('id', 'bell-svg');
    svg.innerHTML =
      '<path d="M60,40 L240,40" stroke="#33291a" stroke-width="12" stroke-linecap="round"/>' +
      '<path d="M70,208 A116,116 0 0 1 230,208" fill="none" stroke="#26314a" stroke-width="7" stroke-linecap="round"/>' +
      // gold zones at the extremes of the swing
      '<path id="zoneL" d="M70,206 A118,118 0 0 1 92,146" fill="none" stroke="#9a7a3a" stroke-width="9" stroke-linecap="round"/>' +
      '<path id="zoneR" d="M208,146 A118,118 0 0 1 230,206" fill="none" stroke="#9a7a3a" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="150" cy="52" r="8" fill="#6a5f48"/>';

    const bellG = document.createElementNS(NS, 'g');
    bellG.innerHTML =
      '<path d="M150,52 L150,84" stroke="#8a7a5c" stroke-width="6"/>' +
      '<path d="M118,168 Q114,96 150,88 Q186,96 182,168 L190,178 Q150,192 110,178 Z" fill="#c9a24a"/>' +
      '<path d="M118,168 Q114,96 150,88 L150,186 Q130,186 110,178 Z" fill="#e0c06a" opacity=".5"/>' +
      '<path d="M150,178 L150,200" stroke="#d9d2c0" stroke-width="4"/>' +
      '<circle cx="150" cy="206" r="9" fill="#b8b2a0"/>';
    bellG.style.transformOrigin = '150px 52px';
    svg.appendChild(bellG);
    el.puzzlePanel.appendChild(svg);

    const pips = document.createElement('div');
    pips.className = 'bell-progress';
    const pipEls = [];
    for (let i = 0; i < p.pulls; i++) {
      const pip = document.createElement('div');
      pip.className = 'bell-pip';
      pips.appendChild(pip); pipEls.push(pip);
    }
    el.puzzlePanel.appendChild(pips);

    const note = document.createElement('div');
    note.className = 'solved-note';
    el.puzzlePanel.appendChild(note);

    const actions = document.createElement('div');
    actions.className = 'puzzle-actions';
    const pull = document.createElement('button');
    pull.className = 'btn btn-primary bell-pull-btn';
    pull.textContent = 'PULL';
    actions.appendChild(pull);
    el.puzzlePanel.appendChild(actions);

    const zoneL = svg.querySelector('#zoneL'), zoneR = svg.querySelector('#zoneR');
    let hits = 0, running = true;
    const t0 = performance.now();
    const PERIOD = 2100, MAXDEG = 38;

    function frame(now) {
      if (!running || !document.body.contains(svg)) return;
      const phase = Math.sin((now - t0) / PERIOD * Math.PI * 2);
      bellG.style.transform = 'rotate(' + (phase * MAXDEG).toFixed(2) + 'deg)';
      const inzone = Math.abs(phase) > 0.82;
      svg.dataset.inzone = inzone ? '1' : '0';
      svg.dataset.phase = phase.toFixed(3);
      zoneL.setAttribute('stroke', inzone && phase < 0 ? '#e8b44a' : '#9a7a3a');
      zoneR.setAttribute('stroke', inzone && phase > 0 ? '#e8b44a' : '#9a7a3a');
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    pull.addEventListener('click', () => {
      if (!running) return;
      if (svg.dataset.inzone === '1') {
        hits++;
        pipEls[hits - 1].classList.add('hit');
        Music.bell(hits);
        note.textContent = ['A deep bronze hum...', 'She\'s waking up...', 'DONG!'][Math.min(hits - 1, 2)];
        if (hits >= p.pulls) {
          running = false;
          setTimeout(() => solvePuzzle(p), 900);
        }
      } else {
        note.textContent = 'Too soon — pull when the swing reaches the gold.';
      }
    });
  }

  /* ---------------- overlays / chrome ---------------- */
  function closeAllOverlays() {
    [el.dialogOverlay, el.journalOverlay, el.puzzleOverlay, el.menuOverlay, el.howtoOverlay]
      .forEach(o => o.classList.add('hidden'));
    clearInterval(dlg.typeTimer);
    dlg.node = null;
  }

  function flashHints() {
    const svg = el.stage.querySelector('svg');
    if (!svg) return;
    svg.classList.add('show-hints');
    setTimeout(() => svg.classList.remove('show-hints'), 2600);
  }

  /* ---------------- wiring ---------------- */
  function init() {
    showTitle();

    // (ending-screen buttons are built dynamically in showEnding)

    $('btn-menu').addEventListener('click', () => el.menuOverlay.classList.remove('hidden'));
    $('btn-journal').addEventListener('click', openJournal);
    $('btn-hint').addEventListener('click', flashHints);
    $('btn-resume').addEventListener('click', () => el.menuOverlay.classList.add('hidden'));
    $('btn-howto').addEventListener('click', () => {
      el.menuOverlay.classList.add('hidden');
      el.howtoOverlay.classList.remove('hidden');
    });
    $('btn-restart').addEventListener('click', () => {
      if (!window.confirm('Restart this chapter from the beginning?')) return;
      clearSave();
      el.menuOverlay.classList.add('hidden');
      startGame(true, chapterId);
    });
    $('btn-save-exit').addEventListener('click', () => {
      save(); // belt & braces: progress is already saved on every change
      closeAllOverlays();
      showTitle();
      toast('Progress saved. Rest easy.');
    });

    /* ----- music ----- */
    const musicButtons = ['btn-music', 'btn-music-title'].map($);
    const musicMenuBtn = $('btn-music-menu');
    function paintMusic(on) {
      musicButtons.forEach(b => b.classList.toggle('muted', !on));
      musicMenuBtn.textContent = 'Music: ' + (on ? 'On' : 'Off');
    }
    Music.onChange(paintMusic);
    paintMusic(Music.isOn());
    musicButtons.forEach(b => b.addEventListener('click', () => Music.toggle()));
    musicMenuBtn.addEventListener('click', () => Music.toggle());
    // audio contexts must start from a user gesture on mobile
    document.addEventListener('pointerdown', () => Music.unlock(), { capture: true });

    document.querySelectorAll('.close-btn[data-close]').forEach(b => {
      b.addEventListener('click', () => $(b.dataset.close).classList.add('hidden'));
    });

    // overlays close on backdrop tap (journal/menu/howto)
    [el.journalOverlay, el.menuOverlay, el.howtoOverlay].forEach(o => {
      o.addEventListener('click', ev => { if (ev.target === o) o.classList.add('hidden'); });
    });

    el.dialogOverlay.addEventListener('click', advanceDialog);
    el.caption.addEventListener('click', hideCaption);

    // tapping empty scene space deselects the held item
    el.stage.addEventListener('click', () => {
      if (selectedItem) { deselectItem(); showCaption('You put it back in your satchel.'); }
    });

    // prologue controls
    el.prologue.addEventListener('click', nextPrologue);
    $('btn-skip').addEventListener('click', ev => { ev.stopPropagation(); enterGame(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
