/* ============================================================
   DATA — story, items, clues, dialogue trees and scene hotspots
   for The Keeper of Grey Harbor.
   Handlers receive `g`, the engine API (see engine.js).
   ============================================================ */
'use strict';

/* ---------------- Items ---------------- */
const Items = {
  prybar:       { name: 'Rusty pry bar',       icon: 'prybar',       desc: 'Bent, rusted, and still stronger than any nail in this town.' },
  cottagekey:   { name: 'Small iron key',      icon: 'cottagekey',   desc: 'Cold and damp, smelling of soil and marigolds.' },
  lighthousekey:{ name: 'Brass lighthouse key',icon: 'lighthousekey',desc: 'Heavy brass, stamped with a tiny tower. It opens the light itself.' },
  cipherwheel:  { name: 'Cipher wheel',        icon: 'cipherwheel',  desc: 'Two brass rings of letters. Someone scratched "seven turns for seven seas" on the rim.' },
  oilcan:       { name: 'Oil can',             icon: 'oilcan',       desc: 'Half full of thick machine oil. Alvar kept everything running.' },
  crank:        { name: 'Winch crank',         icon: 'crank',        desc: 'An iron crank handle. It must fit some machine — a winch, maybe.' },
  /* ---- chapter two ---- */
  oars:         { name: 'Pair of oars',        icon: 'oars',         desc: 'Alvar\'s good spruce oars. "Row like you mean it," he always says.' },
  boathook:     { name: 'Boathook',            icon: 'boathook',     desc: 'A long pole with a brass hook. For catching mooring lines — or reaching things that would rather not be reached.' },
  strikerchain: { name: 'Striker chain',       icon: 'strikerchain', desc: 'The fog bell\'s silver striker chain, still tangled with a thief\'s treasure: a button, a ring-pull, and somebody\'s thimble.' },
};

/* ---------------- Clues ---------------- */
const Clues = {
  missing:    { title: 'A keeper vanishes',    text: 'Uncle Alvar has not been seen for three days — yet the light still turns every night. Someone, or something, keeps it burning.' },
  voss_nights:{ title: 'Night sailings',       text: 'Marta says Harbormaster Voss\'s launch slips out on moonless nights, running no lamps, and comes back riding low in the water.' },
  key_hint:   { title: 'Where marigolds grow', text: '"Alvar never once locked himself out. Kept a spare where the marigolds grow." — Marta' },
  burned_note:{ title: 'A half-burned note',   text: 'Rescued from the fireplace: "...remember, the clock lies — but twice a day it tells the truth. Feed its numbers to the drawer."' },
  clock:      { title: 'The stopped clock',    text: 'The cottage clock stopped long ago. Its hands read exactly 7:25.' },
  wheel_hint: { title: 'Scratched on the wheel', text: '"Seven turns for seven seas." The cipher wheel\'s rim carries Alvar\'s handwriting.' },
  log_entry:  { title: 'The decoded log',      text: '"Cargo moves when my light sleeps. Voss swore I would join the wrecks. If I am gone, look where the light dies."' },
  telescope:  { title: 'Through the telescope',text: 'A launch with no running lamps, riding low, creeping toward the black stretch of cliffs no beam ever touches.' },
  crate_mark: { title: 'Re-stamped crates',    text: 'Harbor-store crates, pried open and empty — every "GH" brand struck through and over-stamped with a crude V.' },
  cave_ledger:{ title: 'The smuggler\'s tally',text: 'A tally sheet in the cave: dates and tonnage. Every date matches a night the great light "failed".' },
  /* ---- chapter two ---- */
  b_ferry:    { title: 'The midnight ferry',   text: 'Marta\'s ferry rounds Bell Rock at midnight. In fog this thick, the light is useless — only the bell can warn her off the rocks.' },
  b_notice:   { title: 'The notice board',     text: '"BOAT SHED — combination is the year the Great Storm took the old pier. If you don\'t know it, you haven\'t lived here long enough to borrow the skiff."' },
  b_plaque:   { title: 'The jetty plaque',     text: '"REBUILT AFTER THE GREAT STORM — 1957."' },
  b_frayed:   { title: 'The silent bell',      text: 'The bell rope is frayed to threads by the wind — and the silver striker chain is simply gone. Cut? No: the links were worked loose. Carried off.' },
  b_magpie:   { title: 'The thief',            text: 'A magpie keeps circling the crag, scolding you. Its nest glitters with everything shiny it could lift — including, unmistakably, a silver chain.' },
  b_trinkets: { title: 'A thief\'s hoard',     text: 'Besides the chain: a brass button, three ring-pulls, a thimble, and what appears to be Alvar\'s missing pipe-band. Case closed on that mystery, too.' },
};

/* ---------------- Objectives ---------------- */
function currentObjective(f) {
  if (!f.metMarta)      return 'You\'ve just landed at Grey Harbor. Someone on the dock might know what happened to Uncle Alvar.';
  if (!f.cottageOpen)   return 'Get inside Alvar\'s cottage up by the lighthouse. Marta said he kept a spare key "where the marigolds grow".';
  if (!f.drawerOpen)    return 'Search the cottage. The desk drawer wants a 4-digit code — and that burned note said the stopped clock "tells the truth".';
  if (!f.lampOpen)      return 'The brass key from the drawer should open the lighthouse door.';
  if (!f.logDecoded)    return 'Alvar\'s logbook is written in cipher. The brass wheel from his drawer should crack it.';
  if (!f.lensSolved)    return 'Re-align the great lens so the beam reaches "where the light dies" — the black stretch of cliffs.';
  if (!f.caveOpen) {
    let o = 'Take the cliff path and open the old winch gate.';
    if (!f.gateOiled) o += ' The mechanism is rusted solid — Alvar\'s oil can might help.';
    if (!f.hasCrankKnown) o += ' The winch crank is missing; someone hid or stole it.';
    return o;
  }
  if (!f.foundAlvar)    return 'The gate is open. Enter the sea cave.';
  return 'See it through to the end.';
}

/* objective line for chapter two */
function objective2(f) {
  if (!f.b_met)        return 'Fog has swallowed the harbor and the fog bell is silent. Speak with Alvar in the lamp room.';
  if (!f.b_shedOpen)   return 'Get into the boat shed by the jetty. The padlock wants a year — the notice board says the harbor remembers its worst night.';
  if (!f.b_hasOars)    return 'Take the oars from the shed.';
  if (!f.b_seenBell)   return 'Row the skiff out to Bell Rock.';
  if (!f.b_nestLooted) {
    let o = 'The striker chain was stolen — and the magpie\'s nest on the crag glitters. Get it back.';
    if (!f.b_hasHook) o += ' You\'ll need something long to reach it; there was a boathook on the shed wall.';
    return o;
  }
  if (!f.b_chainOn)    return 'Hang the striker chain back inside the bell.';
  if (!f.b_bellRung)   return 'Ring the bell! Pull when the swing is at its highest — three strong pulls will wake her.';
  return 'Listen.';
}

/* ---------------- Dialogue trees ---------------- */
const Dialogs = {
  /* ---- Marta ---- */
  marta_hub: { speaker: 'Marta', portrait: 'marta',
    text: 'You\'d be Kel, then. Alvar\'s sister\'s child — he kept your letters in his coat pocket like they were banknotes. Ask me what you need.',
    effect: g => { g.setFlag('metMarta'); g.addClue('missing'); },
    choices: [
      { label: 'When did you last see my uncle?', next: 'marta_alvar' },
      { label: 'Who keeps the light burning now?', next: 'marta_light' },
      { label: 'Anything strange in the harbor lately?', next: 'marta_voss', if: f => f.martaAlvar },
      { label: '(Let her get back to her nets)', next: 'marta_bye' },
    ] },
  marta_alvar: { speaker: 'Marta', portrait: 'marta',
    text: 'Three days past, stomping down this very dock with a face like a storm glass. Said he\'d "found the rot in the timbers of this town." Never came down again.',
    effect: g => g.setFlag('martaAlvar'),
    next: 'marta_alvar2' },
  marta_alvar2: { speaker: 'Marta', portrait: 'marta',
    text: 'Try his cottage, up by the tower. And Kel — Alvar never once locked himself out. Kept a spare where the marigolds grow, if you take my meaning.',
    effect: g => g.addClue('key_hint'),
    next: 'marta_hub2' },
  marta_light: { speaker: 'Marta', portrait: 'marta',
    text: 'That\'s the queer part. Light turns every night, same as ever. But some nights, near the small hours... it just dies. Ten minutes, twenty. Then back, like nothing happened.',
    next: 'marta_hub2' },
  marta_voss: { speaker: 'Marta', portrait: 'marta',
    text: 'You didn\'t hear it from me. Harbormaster Voss takes his launch out on moonless nights. No lamps. Comes home riding low, like she\'s full of stone. No fish were ever that heavy.',
    effect: g => g.addClue('voss_nights'),
    next: 'marta_hub2' },
  marta_hub2: { speaker: 'Marta', portrait: 'marta',
    text: 'Anything else, love?',
    choices: [
      { label: 'When did you last see my uncle?', next: 'marta_alvar', if: f => !f.martaAlvar },
      { label: 'Who keeps the light burning now?', next: 'marta_light' },
      { label: 'Anything strange in the harbor lately?', next: 'marta_voss', if: f => f.martaAlvar },
      { label: '(Let her get back to her nets)', next: 'marta_bye' },
    ] },
  marta_bye: { speaker: 'Marta', portrait: 'marta',
    text: 'Mind how you go, Kel. Towns like this one keep their secrets the way the sea keeps its drowned.',
    next: null },

  /* ---- Alvar, in the cave ---- */
  alvar1: { speaker: '???', portrait: 'alvar',
    text: 'Stay where you— ...Kel? Great tides, KEL? How in the name of every drowned saint did you find this place?',
    next: 'alvar2' },
  alvar2: { speaker: 'Kel', portrait: 'kel',
    text: 'Your letters stopped. So I started reading everything else you left behind — the clock, the wheel, the log. "Look where the light dies," Uncle.',
    next: 'alvar3' },
  alvar3: { speaker: 'Alvar', portrait: 'alvar',
    text: 'Ha! Nine years I taught you to read charts, and you go and read *me* instead.',
    effect: g => g.setFlag('foundAlvar'),
    next: 'alvar4' },
  alvar4: { speaker: 'Alvar', portrait: 'alvar',
    text: 'It\'s Voss, Kel. He\'s been dousing my light from the shore relay on moonless nights — running contraband through this very cave while honest ships steer blind. I found his tally. Then he found me finding it.',
    next: 'alvar5' },
  alvar5: { speaker: 'Alvar', portrait: 'alvar',
    text: '"Keepers fall from towers all the time," he said. So I let him think I ran. I\'ve been living on crab and stubbornness, copying his ledger by lantern light. But I\'m one old man, and he owns every ear in town.',
    next: 'alvar6' },
  alvar6: { speaker: 'Kel', portrait: 'kel',
    text: 'You\'re not one old man anymore. And the light isn\'t dark — I re-set your lens. The whole cliff face is lit up like a festival.',
    next: 'alvar7' },
  alvar7: { speaker: 'Alvar', portrait: 'alvar',
    text: 'You re-set the... Kel. Tonight is a moonless night. If the beam is on this cave, then his launch is coming in blind and bright as a stage — and the constable\'s watch-post can see every plank of her.',
    next: 'voss1' },
  voss1: { speaker: 'Voss', portrait: 'voss',
    text: '...Well. The keeper\'s brat. I wondered who\'d been rummaging through my harbor. Step away from the old man, child. Gates like that one close as easy as they open.',
    next: 'voss_choice' },
  voss_choice: { speaker: 'Kel', portrait: 'kel',
    text: 'Voss stands in the gateway, lantern raised, the tide climbing behind him.',
    choices: [
      { label: '"Look behind you, Harbormaster."', next: 'voss2' },
      { label: 'Say nothing. Let the light speak.', next: 'voss2b' },
    ] },
  voss2: { speaker: 'Voss', portrait: 'voss',
    text: 'I\'ll not fall for— ...why is the cliff lit? WHO LIT THE CLIFF?',
    next: 'voss3' },
  voss2b: { speaker: '', portrait: 'narrator',
    text: 'You fold your arms. Behind Voss, the great beam sweeps the water — and catches his launch, dead center, crates stacked to the gunwales. A whistle shrills from the watch-post above.',
    next: 'voss3' },
  voss3: { speaker: 'Alvar', portrait: 'alvar',
    text: 'That would be my light, Voss. Turns out it only ever sleeps when *you* tell it to. The constable will want a word about that — and about your ledger. We made copies.',
    next: 'voss4' },
  voss4: { speaker: '', portrait: 'narrator',
    text: 'Voss runs. Smugglers always do. But the tide he used for nine years has turned, the stair is slick, and the constable\'s men are already on the cliff path...',
    effect: g => g.endGame(),
    next: null },

  /* ================= CHAPTER TWO ================= */
  b_alvar1: { speaker: 'Alvar', portrait: 'alvar',
    text: 'Kel. Look at it out there — fog like a fleece over the whole sea. I\'ve run the lamp to full and it just bounces the light back in my face.',
    next: 'b_alvar2' },
  b_alvar2: { speaker: 'Kel', portrait: 'kel',
    text: 'The evening ferry\'s still out. Marta\'s aboard — she rounds Bell Rock at midnight.',
    next: 'b_alvar3' },
  b_alvar3: { speaker: 'Alvar', portrait: 'alvar',
    text: 'Aye. And when light fails, sound serves. The fog bell on Bell Rock has warned ships off those teeth for eighty years. Tonight of all nights, she\'s silent as a held breath.',
    next: 'b_alvar_choice' },
  b_alvar_choice: { speaker: 'Alvar', portrait: 'alvar',
    text: 'He looks at you the way he looks at weather he doesn\'t like — and waits.',
    choices: [
      { label: '"What could silence a bell like that?"', next: 'b_alvar4' },
      { label: '"I\'ll go. Tell me how."', next: 'b_alvar5' },
    ] },
  b_alvar4: { speaker: 'Alvar', portrait: 'alvar',
    text: 'Wind, rust, or thieves — and on a bare rock a mile out? Could be all three at once. Whatever it is, it must be *undone* before midnight.',
    next: 'b_alvar5' },
  b_alvar5: { speaker: 'Alvar', portrait: 'alvar',
    text: 'I can\'t leave the lamp in this soup. So it\'s you, Kel. Take the shore path down — my skiff\'s by the boat shed. And Kel... row like you mean it.',
    effect: g => { g.setFlag('b_met'); g.addClue('b_ferry'); },
    next: null },
  b_alvar_again: { speaker: 'Alvar', portrait: 'alvar',
    text: 'Midnight comes on the tide\'s own clock, Kel — it doesn\'t wait for anyone\'s nerves. The skiff, the shed, Bell Rock. Go.',
    next: null },

  /* finale */
  b_end1: { speaker: '', portrait: 'narrator',
    text: 'DONG. The sound rolls out across the water, deep as a whale\'s heartbeat — once, twice, three times — and the fog itself seems to flinch.',
    next: 'b_end2' },
  b_end2: { speaker: '', portrait: 'narrator',
    text: 'Silence. Then, far out in the white... a horn answers. Long, low, and turning away from the rocks.',
    next: 'b_end3' },
  b_end3: { speaker: 'Marta', portrait: 'marta',
    text: '(faint, carried over the water) "...THAT\'S my bell! HA! Somebody put the harbor back where I left it!"',
    next: 'b_end4' },
  b_end4: { speaker: '', portrait: 'narrator',
    text: 'Out of the fog come lights — a whole string of warm windows gliding safely wide of Bell Rock. On the crag above, one very indignant magpie files a formal complaint.',
    effect: g => g.endGame(),
    next: null },
};

/* ---------------- Ending epilogues ---------------- */
const EndingText2 = [
  'The ferry tied up twenty minutes past midnight, and Marta stepped off it arguing with the gangplank. She had brought back city tea, city gossip, and absolutely no patience for either.',
  'The magpie kept the button, the ring-pulls, and the thimble. Alvar kept his recovered pipe-band, and told everyone at the harbor inn that his apprentice "rows nearly as well as a keeper should."',
  'The bell got a new rope, a magpie-proof cage for her chain, and a coat of wax. On foggy nights her voice rolls out across the water, and ships answer her by name.',
  'And if you listen on clear nights, very carefully, you can hear a small, glittering thief ringing something high on the crag. Everyone needs a bell of their own.',
];

const EndingText = [
  'They pulled Voss off the rocks at dawn, soaked and swearing, his launch impounded with forty crates of untaxed cargo. The ledger — and Alvar\'s patient copies — did the rest.',
  'Uncle Alvar climbed his hundred and eighteen steps that same evening and lit the lamp himself. Marta brought chowder up the hill, "seeing as nobody in this family can be trusted to eat."',
  'You stayed the summer. You learned the lens, the log, and the long quiet of the lamp room. The light of Grey Harbor never went dark again.',
  'And if the cottage clock still reads 7:25 — well. Some lies are worth keeping, twice a day.',
];

/* ---------------- Prologues (cinematic intros) ---------------- */
const Prologue = [
  { art: () => Art.prologue(1),
    text: 'Uncle Alvar\'s letters arrived every month for nine years. Then, three weeks ago — nothing.' },
  { art: () => Art.prologue(2),
    text: 'His last letter ended mid-sentence, the ink trailing into a blot.' },
  { art: () => Art.prologue(3),
    text: 'You took the first boat north — to cold spray, gull-cries, and a light that turns without its keeper.' },
];

const Prologue2 = [
  { art: () => Art.prologue2(1),
    text: 'Winter came to Grey Harbor, and one evening the white fog came with it — swallowing the sea, the town, and the light itself.' },
  { art: () => Art.prologue2(2),
    text: 'Somewhere out in that white, the midnight ferry was feeling her way home. Marta was aboard.' },
  { art: () => Art.prologue2(3),
    text: 'Ships trust the fog bell of Bell Rock when they can trust nothing else. Tonight, for the first time in eighty years... the bell was silent.' },
];

/* ---------------- Scenes ---------------- */
const Scenes = {

  /* ============ THE DOCK ============ */
  dock: {
    name: 'Grey Harbor Dock',
    art: f => Art.dock(f),
    hotspots: [
      { id: 'marta', label: 'Fisherwoman', rect: [340, 590, 180, 290],
        onTap: g => g.dialog(g.flag('metMarta') ? 'marta_hub2' : 'marta_hub') },
      { id: 'boat', label: 'Mail boat', rect: [40, 610, 230, 160],
        onTap: g => g.say('The mail boat that carried you north. The skipper won\'t sail again before the week\'s end — you\'re staying, one way or another.') },
      { id: 'crate', label: 'Crates', rect: [565, 715, 200, 220],
        onTap: g => {
          if (g.flag('crateOpen')) { g.say('Empty crates. Harbor brand struck through, a crude "V" burned over it. Somebody re-routes supplies and doesn\'t even hide it well.'); return; }
          g.setFlag('hasCrankKnown');
          g.say('Stout crates stamped "GH" — harbor stores. Nailed shut, and heavy. Odd place to leave supplies out in the salt air. You\'d need something to pry them open.');
        },
        onItem: { prybar: g => {
          if (g.flag('crateOpen')) { g.say('They\'re already open.'); return; }
          g.setFlag('crateOpen'); g.addClue('crate_mark'); g.addItem('crank');
          g.refresh();
          g.say('The nails shriek loose. Inside: mostly straw — and an iron winch crank that matches no machine on this dock. Under the lid, every "GH" brand is over-stamped with a crude "V".');
        } } },
      { id: 'lamppost', label: 'Dock lamp', rect: [620, 490, 150, 220],
        onTap: g => g.say('A whale-oil lamp, kept full and trimmed. Somebody still tends the small lights of this town. Just not, apparently, the big one.') },
      { id: 'gull', label: 'Gull', rect: [20, 700, 130, 150],
        onTap: g => g.say('The gull eyes you like a landlord owed rent. It smells of fish and judgment.') },
      { id: 'sea', label: 'The harbor', rect: [80, 460, 640, 130],
        onTap: g => g.say('Dusk settles over the water. Out past the point, the lighthouse blinks awake — turning, faithful, keeperless.') },
      { id: 'tolighthouse', label: 'Path to the lighthouse', rect: [190, 640, 170, 200],
        onTap: g => g.goto('exterior') },
    ],
  },

  /* ============ LIGHTHOUSE EXTERIOR ============ */
  exterior: {
    name: 'The Point',
    art: f => Art.exterior(f),
    hotspots: [
      { id: 'lightdoor', label: 'Lighthouse door', rect: [190, 680, 120, 160],
        onTap: g => {
          if (g.flag('lampOpen')) { g.goto('lamp', 'One hundred and eighteen steps. You count every one.'); return; }
          g.say('Iron-banded oak under a plaque: EST. 1893. Locked — and this is no cottage latch. It wants a proper brass key.');
        },
        onItem: { lighthousekey: g => {
          g.setFlag('lampOpen'); g.removeItem('lighthousekey');
          g.say('The brass key turns like it was oiled yesterday. The door swings open onto a spiral of stone steps.');
        } } },
      { id: 'tower', label: 'The lighthouse', rect: [160, 120, 190, 520],
        onTap: g => g.say('White and red against the stars, lamp burning at the top. Three days without a keeper, and it still turns. Machines are loyal like that. Or someone winds them.') },
      { id: 'cottagedoor', label: 'Cottage door', rect: [545, 655, 100, 180],
        onTap: g => {
          if (g.flag('cottageOpen')) { g.goto('cottage'); return; }
          g.say('Alvar\'s cottage. The door is locked, the windows dark. No one has lit that stove in days.');
        },
        onItem: { cottagekey: g => {
          g.setFlag('cottageOpen'); g.removeItem('cottagekey');
          g.say('The little key fits. The door opens on the smell of cold ash and pipe smoke — home, but held-breath quiet.');
        } } },
      { id: 'flowerpot', label: 'Marigolds', rect: [480, 770, 90, 90],
        onTap: g => {
          if (g.flag('gotCottageKey')) { g.say('The marigolds nod in the wind, keeping no more secrets.'); return; }
          g.setFlag('gotCottageKey'); g.addItem('cottagekey');
          g.say('Marigolds, stubborn against the sea wind. You tilt the pot — and there it is, pressed into the soil: a small iron key.');
        } },
      { id: 'window', label: 'Cottage window', rect: [660, 670, 90, 100],
        onTap: g => g.say('Through the glass: a cold hearth, a desk, an armchair with a dent shaped like a waiting man.') },
      { id: 'woodpile', label: 'Woodpile', rect: [30, 790, 190, 130],
        onTap: g => {
          if (g.flag('gotPrybar')) { g.say('Split logs, neatly stacked. Alvar was always tidy about firewood and untidy about everything else.'); return; }
          g.setFlag('gotPrybar'); g.addItem('prybar');
          g.refresh();
          g.say('Between the logs, something glints: a rusty pry bar, wedged in like a bookmark. You work it free.');
        } },
      { id: 'moon', label: 'The night sky', rect: [520, 60, 260, 200],
        onTap: g => g.say('No moon tonight — just stars and cold. "Moonless nights," Marta said. The kind Voss sails on.') },
      { id: 'cliffpath', label: 'Cliff path', rect: [610, 860, 170, 220],
        onTap: g => {
          if (g.flag('cliffsOpen')) { g.goto('cliffs'); return; }
          if (g.flag('logDecoded')) { g.say('"Look where the light dies." The cliffs below are pure black — a sheer drop into noise and spray. Without light you\'d break your neck on the first step.'); return; }
          g.say('A crumbling track vanishes toward the black cliffs. Sheer, wet, and utterly dark. Not without good reason — and good light.');
        } },
      { id: 'todock', label: 'Down to the harbor', rect: [50, 970, 200, 180],
        onTap: g => g.goto('dock') },
    ],
  },

  /* ============ COTTAGE INTERIOR ============ */
  cottage: {
    name: 'Keeper\'s Cottage',
    art: f => Art.cottage(f),
    hotspots: [
      { id: 'fireplace', label: 'Fireplace', rect: [40, 620, 240, 260],
        onTap: g => {
          if (g.flag('gotNote')) { g.say('Embers and ash. Whatever else burned here is past reading.'); return; }
          g.setFlag('gotNote'); g.addClue('burned_note');
          g.say('The fire is days old, but one scrap of paper escaped, scorched at the edges: "...remember, the clock lies — but twice a day it tells the truth. Feed its numbers to the drawer."');
        } },
      { id: 'clock', label: 'Wall clock', rect: [300, 250, 95, 210],
        onTap: g => { g.addClue('clock');
          g.say('A ship\'s clock, long stopped. The hands read 7:25 — and by the dust on them, they\'ve read it for years. "The clock lies... but twice a day it tells the truth."'); } },
      { id: 'painting', label: 'Painting', rect: [470, 255, 190, 150],
        onTap: g => g.say('A little ship beating through moonlit swell. The brass plate reads "The Marigold — 1893". Alvar named his flowers after her. Sentimental old anchor.') },
      { id: 'window2', label: 'Window', rect: [55, 250, 160, 190],
        onTap: g => g.say('Moonless dark over the water. From here Alvar could see every ship that rounded the point — and everything else that moved at night.') },
      { id: 'shelf', label: 'Shelf', rect: [630, 455, 125, 115],
        onTap: g => {
          if (g.flag('gotOil')) { g.say('A tin mug and a ring where the oil can stood.'); return; }
          g.setFlag('gotOil'); g.addItem('oilcan');
          g.refresh();
          g.say('A keeper\'s shelf: spare wicks, a tin mug, and a can of machine oil. You take the oil — around here, everything old is rusted, and everything is old.');
        } },
      { id: 'armchair', label: 'Armchair', rect: [315, 730, 160, 180],
        onTap: g => g.say('The seat still holds his shape. A cold pipe rests in the ashtray — Alvar left without it, and he never went anywhere without it.') },
      { id: 'desk', label: 'Writing desk', rect: [495, 780, 270, 190],
        onTap: g => g.say('Charts, a dry inkwell, and a letter begun: "Dear Kel —" and nothing more. The drawer below is fitted with a four-digit letter lock.') },
      { id: 'drawer', label: 'Locked drawer', rect: [530, 825, 180, 60],
        onTap: g => {
          if (g.flag('drawerOpen')) { g.say('The drawer stands open, empty now but for a dried marigold pressed flat.'); return; }
          g.puzzle('drawer');
        } },
      { id: 'rug', label: 'Door out', rect: [200, 1030, 400, 150],
        onTap: g => g.goto('exterior') },
    ],
  },

  /* ============ LAMP ROOM ============ */
  lamp: {
    name: 'The Lamp Room',
    art: () => Art.lamp(),
    hotspots: [
      { id: 'lens', label: 'The great lens', rect: [270, 340, 260, 470],
        onTap: g => {
          if (g.flag('lensSolved')) { g.say('The lens rides true in its cradle, beam running clean and far. Where it strikes the cliffs, the dark stretch is dark no longer.'); return; }
          g.puzzle('lens');
        } },
      { id: 'logbook', label: 'Keeper\'s logbook', rect: [70, 640, 180, 220],
        onTap: g => {
          if (g.flag('logDecoded')) { g.say('"Cargo moves when my light sleeps. Voss swore I would join the wrecks. If I am gone, look where the light dies."'); return; }
          g.say('The last pages aren\'t in any language — rows of letters marching like drunk soldiers. A cipher. Alvar used to make puzzle-letters like this when you were small. You\'d need his wheel.');
        },
        onItem: { cipherwheel: g => g.puzzle('cipher') } },
      { id: 'telescope', label: 'Telescope', rect: [575, 470, 180, 260],
        onTap: g => {
          if (!g.flag('logDecoded')) { g.say('A fine brass telescope aimed at the harbor mouth. Nothing out there now but black water.'); return; }
          if (!g.flag('sawBoat')) { g.setFlag('sawBoat'); g.addClue('telescope'); }
          g.say('You swing it toward the cliffs. There — a launch with no running lamps, riding low, creeping for the black stretch of shore no beam ever touches. Voss keeps his schedule.');
        } },
      { id: 'windows', label: 'The night sea', rect: [60, 120, 680, 240],
        onTap: g => g.say('Glass on every side, sea on every side of that. From up here the town looks small and the dark looks very, very large.') },
      { id: 'stairs', label: 'Stairs down', rect: [255, 990, 290, 170],
        onTap: g => g.goto('exterior') },
    ],
  },

  /* ============ THE CLIFFS ============ */
  cliffs: {
    name: 'The Black Cliffs',
    art: f => Art.cliffs(true, !!f.caveOpen),
    hotspots: [
      { id: 'gate', label: 'Winch gate', rect: [455, 620, 190, 300],
        onTap: g => {
          if (g.flag('caveOpen')) { g.goto('cave', 'You duck under the raised gate into the dark.'); return; }
          g.say('A timber gate seals the cave mouth — harbor-built, and new. Whoever hides things here has keys to town property. It won\'t lift without the winch.');
        } },
      { id: 'winch', label: 'Rusted winch', rect: [620, 690, 150, 220],
        onTap: g => {
          if (g.flag('caveOpen')) { g.say('The winch stands with the crank still in it, gate raised. Let Voss wonder.'); return; }
          if (!g.flag('gateOiled')) { g.say('The winch that lifts the gate — seized under years of rust and salt. The crank socket is empty, too. Rust you can fix with oil; the missing crank is somebody\'s idea of a lock.'); return; }
          g.setFlag('hasCrankKnown');
          g.say('Oiled and willing now — but the crank socket is still empty. Square iron fitting, about a hand across.');
        },
        onItem: {
          oilcan: g => {
            if (g.flag('gateOiled')) { g.say('It\'s as oiled as it will ever be.'); return; }
            g.setFlag('gateOiled'); g.removeItem('oilcan');
            g.say('You feed oil into every joint until the gears surrender with a groan. Now it only needs its crank.');
          },
          crank: g => {
            if (!g.flag('gateOiled')) { g.say('You fit the crank and heave — the rusted gears won\'t give. It needs oil first, and plenty.'); return; }
            g.setFlag('caveOpen'); g.removeItem('crank');
            g.say('The crank bites. You wind, the cable sings, and the gate grinds up out of the spray. Beyond it: a sea cave, and somewhere inside — lantern light.');
            g.refresh();
          },
        } },
      { id: 'beam', label: 'The beam', rect: [80, 60, 500, 400],
        onTap: g => g.say('Your handiwork: the great beam sweeps the whole black stretch now. "Where the light dies" is nowhere at all.') },
      { id: 'tidepool', label: 'Tide pool', rect: [150, 1010, 230, 130],
        onTap: g => g.say('A crab shuffles sideways under a stone, unimpressed. The tide is low — for now. These rocks drown twice a day.') },
      { id: 'stair', label: 'Stone stair up', rect: [0, 380, 200, 700],
        onTap: g => g.goto('exterior') },
    ],
  },

  /* ============ THE SEA CAVE ============ */
  cave: {
    name: 'The Sea Cave',
    art: () => Art.cave(),
    hotspots: [
      { id: 'alvar', label: 'A figure by the lantern', rect: [470, 560, 190, 300],
        onTap: g => g.dialog('alvar1') },
      { id: 'crates2', label: 'Stacked crates', rect: [90, 580, 300, 290],
        onTap: g => { g.addClue('cave_ledger');
          g.say('Crates to the ceiling, all wearing the crude "V". Tucked under a lid: a tally of dates and tonnage. Every date is a night Marta says the light "failed".'); } },
      { id: 'lantern2', label: 'Lantern', rect: [385, 690, 90, 130],
        onTap: g => g.say('A storm lantern, trimmed low and recently filled. Someone lives here. Someone careful.') },
      { id: 'boat2', label: 'Hidden rowboat', rect: [540, 930, 230, 140],
        onTap: g => g.say('A rowboat on a line, oars shipped, packed with tinned food and a bailing cup. A bolt-hole — kept ready by someone who expects to need it.') },
      { id: 'pool', label: 'Black water', rect: [60, 950, 340, 180],
        onTap: g => g.say('The tide breathes in and out of the cave mouth. On a smuggler\'s schedule, you\'d guess it\'s nearly time.') },
      { id: 'exit', label: 'Back out', rect: [0, 520, 190, 400],
        onTap: g => g.goto('cliffs') },
    ],
  },
};

/* ================= CHAPTER TWO SCENES ================= */

Scenes.lamp2 = {
  name: 'The Lamp Room',
  mood: 'fog',
  art: () => Art.lamp(true),
  hotspots: [
    { id: 'b_alvar', label: 'Alvar', rect: [560, 470, 180, 290],
      onTap: g => g.dialog(g.flag('b_met') ? 'b_alvar_again' : 'b_alvar1') },
    { id: 'b_lens', label: 'The great lens', rect: [270, 340, 260, 430],
      onTap: g => g.say('The lens burns at full trim — and the fog just hands the light straight back. Like shouting into a pillow.') },
    { id: 'b_windows', label: 'The fog', rect: [60, 120, 680, 200],
      onTap: g => g.say('White, moving, absolute. Somewhere under it: the sea, the rocks, and one ferry that thinks it knows the way.') },
    { id: 'b_stairs', label: 'Stairs down', rect: [255, 990, 290, 170],
      onTap: g => {
        if (!g.flag('b_met')) { g.say('Alvar called you up here for a reason. Hear him out first.'); return; }
        g.goto('shore', 'Down the spiral stairs and along the shore path, into the wool-thick white.');
      } },
  ],
};

Scenes.shore = {
  name: 'The Foggy Shore',
  mood: 'fog',
  art: f => Art.shore(f),
  hotspots: [
    { id: 'b_shed', label: 'Boat shed', rect: [150, 600, 220, 210],
      onTap: g => {
        if (!g.flag('b_shedOpen')) { g.puzzle('shedlock'); return; }
        if (!g.flag('b_hasOars')) {
          g.setFlag('b_hasOars'); g.addItem('oars'); g.refresh();
          g.say('Inside: nets, floats, tar — and Alvar\'s good spruce oars, right where he said.');
          return;
        }
        g.say('Nets, floats, and the smell of tar. You have what you came for.');
      } },
    { id: 'b_hook', label: 'Boathook', rect: [120, 660, 80, 160],
      visible: f => !f.b_hasHook,
      onTap: g => {
        g.setFlag('b_hasHook'); g.addItem('boathook'); g.refresh();
        g.say('You lift the long boathook off its pegs. Good for mooring lines, gutters, and arguments you\'d rather have at a distance.');
      } },
    { id: 'b_notice', label: 'Notice board', rect: [455, 490, 150, 180],
      onTap: g => { g.addClue('b_notice');
        g.say('Among the tide tables: "BOAT SHED — combination is the year the Great Storm took the old pier. If you don\'t know it, you haven\'t lived here long enough to borrow the skiff."'); } },
    { id: 'b_plaque2', label: 'Jetty plaque', rect: [600, 830, 130, 130],
      onTap: g => { g.addClue('b_plaque');
        g.say('A weathered plaque on the jetty post: "REBUILT AFTER THE GREAT STORM — 1957."'); } },
    { id: 'b_skiff', label: 'The skiff', rect: [100, 970, 230, 130],
      onTap: g => {
        if (!g.flag('b_hasOars')) { g.say('Alvar\'s skiff, patient at her line. Rowing without oars is called drifting, and drifting in fog is called a shipwreck.'); return; }
        g.goto('bellrock', 'You pull hard through the white. Twice something groans in the fog. On the third groan, Bell Rock rises out of it.');
      } },
    { id: 'b_pots', label: 'Crab pots', rect: [600, 1040, 170, 130],
      onTap: g => g.say('A stack of crab pots. One crab, still in residence, gives you a look of profound legal confidence.') },
    { id: 'b_fog', label: 'The water', rect: [420, 740, 340, 180],
      onTap: g => g.say('You can hear the sea better than you can see it. Somewhere out there, a ferry is listening for a bell that isn\'t ringing.') },
    { id: 'b_uppath', label: 'Path up to the light', rect: [20, 620, 130, 200],
      onTap: g => g.goto('lamp2') },
  ],
};

Scenes.bellrock = {
  name: 'Bell Rock',
  mood: 'cliffs',
  art: f => Art.bellrock(f),
  hotspots: [
    { id: 'b_bell', label: 'The fog bell', rect: [330, 540, 200, 350],
      onTap: g => {
        g.setFlag('b_seenBell');
        if (g.flag('b_bellRung')) { g.say('She swings and sings, eighty years young.'); return; }
        if (g.flag('b_chainOn')) { g.puzzle('bellring'); return; }
        g.addClue('b_frayed'); g.refresh();
        g.say('There she hangs, bronze and patient — but the pull-rope is frayed to wool by the wind, and the silver striker chain is GONE. Not snapped: worked loose, link by link, and carried off.');
      },
      onItem: { strikerchain: g => {
        if (!g.flag('b_chainOn')) {
          g.setFlag('b_chainOn'); g.removeItem('strikerchain'); g.refresh();
          g.say('You climb the tower steps and hang the chain back on its hook inside her dark bronze mouth. The striker swings true. Now — ring her.');
        }
      } } },
    { id: 'b_nest', label: 'Glittering nest', rect: [140, 420, 140, 140],
      onTap: g => {
        g.setFlag('b_seenBell');
        if (g.flag('b_nestLooted')) { g.say('Sticks, fluff, and honest trinkets. You left the museum its exhibits.'); return; }
        g.addClue('b_magpie');
        g.say('High on the crag, out of reach: a nest absolutely FULL of glitter — and hanging off one side, unmistakably, a silver chain. The thief has taste.');
      },
      onItem: { boathook: g => {
        if (g.flag('b_nestLooted')) { g.say('Leave the rest. Even thieves get to keep something.'); return; }
        g.setFlag('b_nestLooted'); g.addItem('strikerchain'); g.addClue('b_trinkets'); g.refresh();
        g.say('You reach the boathook up, hook the chain, and lift it free — to a storm of magpie outrage. The rest of the hoard you leave: a button, three ring-pulls, a thimble, and Alvar\'s long-lost pipe-band.');
      } } },
    { id: 'b_magpie2', label: 'The magpie', rect: [200, 260, 200, 140],
      onTap: g => {
        const lines = [
          'The magpie circles, scolding you in fluent Corvid. You gather you are the villain of this story.',
          '"CHAKKA-CHAKKA-CHAK!" — which, roughly translated, means see you in court.',
          'It lands, glares, and polishes one ring-pull pointedly.',
        ];
        g.say(lines[Math.floor(Math.random() * lines.length)]);
      } },
    { id: 'b_pool2', label: 'Tide pool', rect: [540, 1000, 200, 120],
      onTap: g => g.say('Mussels stacked like cobblestones, and one anemone waving at nothing. The tide is coming in — and midnight with it.') },
    { id: 'b_back', label: 'The skiff', rect: [60, 950, 210, 140],
      onTap: g => g.goto('shore', 'You row back toward the one lantern glowing through the fog.') },
  ],
};

/* ---------------- Chapters ---------------- */
const Chapters = {
  ch1: {
    label: 'Chapter One',
    name: 'The Keeper of Grey Harbor',
    saveKey: 'greyharbor_save_v1',
    start: 'dock',
    prologue: Prologue,
    objective: currentObjective,
    ending: { title: 'The Light Endures', text: EndingText, art: () => Art.ending() },
  },
  ch2: {
    label: 'Chapter Two',
    name: 'The Silent Bell',
    saveKey: 'greyharbor_save_ch2_v1',
    start: 'lamp2',
    requires: 'ch1',
    lockHint: 'Finish Chapter One to unlock',
    prologue: Prologue2,
    objective: objective2,
    ending: { title: 'The Bell Answers', text: EndingText2, art: () => Art.ending2() },
  },
};

/* ---------------- Puzzles ---------------- */
const Puzzles = {
  shedlock: {
    type: 'keypad',
    title: 'The Boat Shed Padlock',
    sub: '"...the year the Great Storm took the old pier."',
    code: '1957',
    wrongText: 'The padlock stays shut. Wrong year.',
    onSolve: g => {
      g.setFlag('b_shedOpen');
      g.say('1-9-5-7. The padlock drops open like it was waiting. The shed breathes out tar and old rope.');
    },
  },
  bellring: {
    type: 'bell',
    title: 'Ring the Fog Bell',
    sub: 'Pull the chain when the swing reaches its highest — the gold marks. Three strong pulls will wake her voice.',
    pulls: 3,
    onSolve: g => {
      g.setFlag('b_bellRung');
      g.refresh();
      setTimeout(() => g.dialog('b_end1'), 600);
    },
  },
  drawer: {
    type: 'keypad',
    title: 'The Letter Lock',
    sub: '"The clock lies — but twice a day it tells the truth. Feed its numbers to the drawer."',
    code: '0725',
    wrongText: 'The lock doesn\'t budge.',
    onSolve: g => {
      g.setFlag('drawerOpen');
      g.addItem('lighthousekey'); g.addItem('cipherwheel'); g.addClue('wheel_hint');
      g.say('Click. Inside: a heavy brass key stamped with a tiny tower, and a two-ring cipher wheel. On its rim, in Alvar\'s hand: "seven turns for seven seas".');
    },
  },
  cipher: {
    type: 'cipher',
    title: 'Alvar\'s Cipher',
    sub: 'Turn the wheel until the log speaks plainly. "Seven turns for seven seas."',
    plaintext: 'CARGO MOVES WHEN MY LIGHT SLEEPS. VOSS SWORE I WOULD JOIN THE WRECKS. IF I AM GONE, LOOK WHERE THE LIGHT DIES.',
    shift: 7,
    onSolve: g => {
      g.setFlag('logDecoded'); g.addClue('log_entry');
      g.checkCliffs();
      g.say('Your blood runs cold as the letters settle into place. Voss. And a warning: "look where the light dies."');
    },
  },
  lens: {
    type: 'lens',
    title: 'The Great Lens',
    sub: 'Three prism rings, knocked out of true. Turn each until every keeper\'s mark points to the top.',
    onSolve: g => {
      g.setFlag('lensSolved');
      g.checkCliffs();
      g.say('The rings seat home with a satisfying chime. The beam leaps out full strength — and where it rakes the cliffs, stone stairs and something like a gate glint in the dark.');
    },
  },
};
