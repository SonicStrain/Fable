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
  /* ---- chapter three ---- */
  officekey:    { name: 'Office key',          icon: 'cottagekey',   desc: 'The harbor office key, from the ledge above the door. Voss hid nothing well except cargo.' },
  fireiron:     { name: 'Fire iron',           icon: 'fireiron',     desc: 'Voss\'s stove poker. Bent at the tip — ideal for arguing with nailed-down floorboards.' },
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
  /* ---- chapter three ---- */
  c_collector:{ title: 'The Collector',        text: 'Voss confesses: every darkened night was bought and paid for by a stranger he calls the Collector — who wanted ships kept away from the black stretch where the Marigold sank. Tonight, IN the storm, the Collector sails to raise her strongbox.' },
  c_floorboard:{ title: 'Voss\'s hiding place', text: '"The chart, the letters, everything — under the floorboard by my stove. Key\'s on the ledge, where keys always are. Go, boy. I dimmed lights. I never drowned men."' },
  c_chart:    { title: 'The wreck chart',      text: 'A hand-drawn chart: the Marigold lies between Bell Rock and the black cliffs. Marked on the cliff path: "RELAY — shutter lock is the year she sank."' },
  c_letters:  { title: 'The Collector\'s letters', text: 'Cold, typed instructions signed with a quill-feather stamp: payments, dates, and one line that chills you — "keep the coast dark until I have what is mine."' },
  c_marigold: { title: 'The first keeper',     text: 'Marta: the Marigold carried Elias Fane — the FIRST keeper of Grey Harbor, Alvar\'s great-grandfather — home with the tower\'s founding deed and his sea letters. She sank in sight of his own unfinished light. 1893.' },
  c_relay:    { title: 'The shore relay',      text: 'Voss\'s old shutter rig, re-armed by the Collector\'s hired man to blind the light tonight. Not any more: the shutter is off and the beam runs full.' },
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

/* objective line for chapter three */
function objective3(f) {
  if (!f.c_met)        return 'The storm of the century is hours away — and Voss will speak only to you. Hear him out in the lock-up.';
  if (!f.c_hasKey)     return 'Get into the harbor office on the dock. Voss said the key is "on the ledge, where keys always are".';
  if (!f.c_officeOpen) return 'Use the key on the harbor office door.';
  if (!f.c_gotChart) {
    let o = 'Search the office: the chart and the Collector\'s letters are hidden under the floorboard by the stove.';
    if (!f.c_hasIron) o += ' It\'s nailed down tight — the stove might have something to pry with.';
    return o;
  }
  if (!f.c_shutterOff) {
    let o = 'Take the cliff path and kill the Collector\'s relay before it blinds the light again.';
    if (!f.c_panelOpen) o += ' The chart says its shutter lock is "the year she sank" — but the access panel is screwed down; that fire iron might help.';
    return o;
  }
  if (!f.c_wound)      return 'Climb to the lamp room. Alvar needs your hands on the storm reserve — keep the light turning!';
  return 'Light and bell against the storm. Watch.';
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

  /* ================= CHAPTER THREE ================= */
  c_voss1: { speaker: 'Voss', portrait: 'voss',
    text: 'The keeper\'s brat. Good. Sit down, don\'t gloat, and listen — because tonight the glass is falling like a stone, and there are things you don\'t know about your harbor.',
    next: 'c_voss2' },
  c_voss2: { speaker: 'Kel', portrait: 'kel',
    text: 'You dimmed the light for cargo money, Voss. What\'s left to know?',
    next: 'c_voss3' },
  c_voss3: { speaker: 'Voss', portrait: 'voss',
    text: 'Cargo money. Ha. The cargo barely paid the crew, boy. The real coin came from a stranger — signs his letters with a quill-feather stamp. Calls himself the Collector. He didn\'t care what I moved. He cared that ships stayed AWAY from the black stretch.',
    next: 'c_voss_choice' },
  c_voss_choice: { speaker: 'Voss', portrait: 'voss',
    text: 'He leans close to the bars, and for the first time in his life, Voss looks afraid.',
    choices: [
      { label: '"Away from... what\'s down there?"', next: 'c_voss4' },
      { label: '"Why tell me now?"', next: 'c_voss5' },
    ] },
  c_voss4: { speaker: 'Voss', portrait: 'voss',
    text: 'The Marigold. The ship your light was BUILT for, wrecked in \'93 with the founding deed and the first keeper\'s chest aboard. The Collector has hunted her for years. My darkness kept his secret. Your lens and your bell ended it.',
    next: 'c_voss5' },
  c_voss5: { speaker: 'Voss', portrait: 'voss',
    text: 'Tonight he sails INTO the storm to raise her strongbox — with a hired crew that\'s never seen these rocks. If your light fails tonight, they all drown, and I\'ll not have that on my slate. I dimmed lights, boy. I never drowned men.',
    next: 'c_voss6' },
  c_voss6: { speaker: 'Voss', portrait: 'voss',
    text: 'His man re-armed my old relay on the cliffs — it\'ll blind your lamp at the worst hour. My chart, his letters, everything: under the floorboard by my office stove. Key\'s on the ledge, where keys always are. Run, Kel.',
    effect: g => { g.setFlag('c_met'); g.addClue('c_collector'); g.addClue('c_floorboard'); },
    next: null },
  c_voss_again: { speaker: 'Voss', portrait: 'voss',
    text: 'Still here? The glass is still falling, the relay\'s still armed, and my floorboard is still nailed down. RUN, boy.',
    next: null },

  c_marta1: { speaker: 'Marta', portrait: 'marta',
    text: 'Kel! Lash that line and talk fast — this storm means to eat the town. What did that old sinner want with you?',
    next: 'c_marta2' },
  c_marta2: { speaker: 'Kel', portrait: 'kel',
    text: 'The Marigold. He says someone\'s sailing tonight to rob her bones. What was she carrying, Marta?',
    next: 'c_marta3' },
  c_marta3: { speaker: 'Marta', portrait: 'marta',
    text: 'My grandmother\'s story: the Marigold carried Elias Fane home — the FIRST keeper, Alvar\'s great-grandfather — with the tower\'s founding deed and every letter he ever wrote at sea. She sank in sight of his own unfinished light. He kept it burning forty years anyway.',
    next: 'c_marta4' },
  c_marta4: { speaker: 'Marta', portrait: 'marta',
    text: 'If some quill-stamped vulture thinks he\'s taking Fane\'s chest from this family, on THIS night... then keep that light burning, Kel. Keepers\' blood. Go.',
    effect: g => { g.setFlag('c_martaTold'); g.addClue('c_marigold'); },
    next: null },
  c_marta_again: { speaker: 'Marta', portrait: 'marta',
    text: 'The boats will hold. Will the light? Go where you\'re needed, love.',
    next: null },

  c_alvar1: { speaker: 'Alvar', portrait: 'alvar',
    text: 'Kel! The relay\'s dead — I saw the beam come back full. That was you? Of course it was you. Now grab a handle: this wind is shaking the clockwork and the storm reserve wants winding.',
    next: 'c_alvar2' },
  c_alvar2: { speaker: 'Kel', portrait: 'kel',
    text: 'Voss talked. It\'s the Marigold, Uncle. The Collector is coming for Elias Fane\'s chest — tonight.',
    next: 'c_alvar3' },
  c_alvar3: { speaker: 'Alvar', portrait: 'alvar',
    text: '...Great-grandfather\'s chest. Nine years I\'ve tended his light and never knew she kept it. Then hear me, Kel: NOBODY dies over it. Not even grave-robbers. We give them what Fane gave everyone: light to see the rocks by — and a bell to answer for them. WIND.',
    effect: g => g.setFlag('c_alvarBriefed'),
    next: null },
  c_alvar_again: { speaker: 'Alvar', portrait: 'alvar',
    text: 'The reserve, Kel — catch the flywheel at the top of its swing, three clean catches. My hands aren\'t fast enough tonight. Yours are.',
    next: null },

  /* finale: the 'intro' cutscene (see Chapters.ch3.cutscenes) narrates the
     light and bell overwhelming the schooner, then opens this choice */
  c_fin_choice: { speaker: 'Kel', portrait: 'kel',
    text: 'The schooner claws for open water, the harbor arms closing around her like a hand.',
    choices: [
      { label: '"Let the light finish it."', next: 'c_fin6' },
      { label: '"Ring the bell once more — for Fane."', next: 'c_fin6b' },
    ] },
  c_fin6: { speaker: '', portrait: 'narrator',
    text: 'You say nothing. The beam says it for you, sweeping the schooner\'s deck bare of shadow to hide in. She strikes her sails and turns for the harbor mouth — surrender, not choice.',
    next: 'c_fin7' },
  c_fin6b: { speaker: '', portrait: 'narrator',
    text: 'Far off, the fog bell — no fog tonight, just storm — tolls once more anyway, deep and slow, like a name being read aloud. The schooner strikes her sails and turns for the harbor mouth, as if the sound itself had turned her.',
    next: 'c_fin7' },
  c_fin7: { speaker: 'Alvar', portrait: 'alvar',
    text: 'She\'s turning, Kel. Look — she\'s actually turning. Great tides... we did it. Nobody drowned tonight. Not even a grave-robber.',
    effect: g => g.cutscene('outro'),
    next: null },
};

/* ---------------- Ending epilogues ---------------- */
const EndingText3 = [
  'Elias Fane\'s sea-chest came up the hundred and eighteen steps at last, four generations late. Inside: the tower\'s founding deed, a captain\'s letters, and a keeper\'s log that began "Light kept, whatever the cost."',
  'The Collector gave his real name to no one, but he gave his ledger to the constable — enough names and dates to keep three harbors\' courts busy through the spring.',
  'Voss served his sentence a changed man, or at least a quieter one. He mends nets now, by the boat shed, and swears — to anyone who\'ll listen — that he never once drowned a soul. Nobody argues with him about it anymore.',
  'Grey Harbor got its light, its bell, its keeper, and its story back, all in one storm. Kel stayed for good this time. Some lights are worth minding for the rest of your life.',
];

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

const Prologue3 = [
  { art: () => Art.prologue3(1),
    text: 'By spring, the almanacs agreed on one thing: a storm was coming the old sailors would measure every future storm against.' },
  { art: () => Art.prologue3(2),
    text: 'And Voss — awaiting trial in the town lock-up — sent word that he would speak. But only to Kel, and only once.' },
  { art: () => Art.prologue3(3),
    text: 'Whatever he had to say, it began in 1893, with a ship called the Marigold, and a storm just like this one.' },
];

/* mid-chapter cutscenes for chapter three's finale */
const FinaleIntro = [
  { art: () => Art.finale(1),
    text: 'The flywheel screams up to speed. Overhead, the great lens locks and BLAZES — full strength, storm be damned. Across the black water, faint under the wind: DONG. Bell Rock, awake, answering the light note for note.' },
  { art: () => Art.finale(2),
    text: 'Caught dead center in the beam, sails ripping: a black schooner with no business in this weather. The Collector\'s hunt for Elias Fane\'s chest ends in a hundred thousand candlepower — and the only door left open leads straight to the constable\'s launch.' },
];

const FinaleOutro = [
  { art: () => Art.finale(3),
    text: 'By the time the wind drops toward dawn, the Collector\'s crew are ashore in irons, his strongbox charts confiscated, and Elias Fane\'s sea-chest is finally, properly, coming home.' },
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

/* ================= CHAPTER THREE SCENES ================= */

Scenes.jail = {
  name: 'The Lock-Up',
  mood: 'storm',
  art: () => Art.jail(),
  hotspots: [
    { id: 'c_voss', label: 'Voss', rect: [90, 580, 300, 440],
      onTap: g => g.dialog(g.flag('c_met') ? 'c_voss_again' : 'c_voss1') },
    { id: 'c_window2', label: 'Barred window', rect: [450, 210, 220, 180],
      onTap: g => g.say('Storm cloud already blackening the sky. The barometer in your gut is falling faster than any glass.') },
    { id: 'c_exit', label: 'Door out', rect: [570, 850, 180, 320],
      onTap: g => {
        if (!g.flag('c_met')) { g.say('Voss asked to speak with you. Hear him out first.'); return; }
        g.goto('dockstorm');
      } },
  ],
};

Scenes.dockstorm = {
  name: 'Grey Harbor Dock',
  mood: 'storm',
  art: f => Art.dockStorm(f),
  hotspots: [
    { id: 'c_marta', label: 'Marta', rect: [100, 700, 220, 300],
      onTap: g => g.dialog(g.flag('c_martaTold') ? 'c_marta_again' : 'c_marta1') },
    { id: 'c_ledge', label: 'Ledge above the door', rect: [516, 746, 148, 54],
      onTap: g => {
        if (g.flag('c_hasKey')) { g.say('Just a bare ledge now, streaming with rain.'); return; }
        g.setFlag('c_hasKey'); g.addItem('officekey'); g.refresh();
        g.say('Above the office door, half-hidden by the rain: a key, exactly where Voss said it would be.');
      } },
    { id: 'c_officedoor', label: 'Harbor office door', rect: [534, 780, 112, 150],
      onTap: g => {
        if (g.flag('c_officeOpen')) { g.goto('office'); return; }
        g.say('Locked fast. Voss said the key would be nearby.');
      },
      onItem: { officekey: g => {
        g.setFlag('c_officeOpen'); g.removeItem('officekey');
        g.say('The key turns. The office door bangs open in the wind.');
      } } },
    { id: 'c_boat', label: 'Straining boat', rect: [230, 900, 220, 140],
      onTap: g => g.say('A boat fights its lines like it wants to be somewhere drier. Marta\'s knots hold, for now.') },
    { id: 'c_stormsea', label: 'The storm', rect: [0, 60, 800, 300],
      onTap: g => g.say('The worst weather the almanacs have a name for, and it\'s only just arriving.') },
    { id: 'c_tocliffs3', label: 'Cliff path', rect: [40, 940, 200, 200],
      onTap: g => {
        if (!g.flag('c_gotChart')) { g.say('No reason to go out on the cliffs yet — you don\'t even know what you\'re looking for.'); return; }
        g.goto('cliffs3');
      } },
    { id: 'c_tolamp3', label: 'Path to the lighthouse', rect: [270, 1000, 200, 170],
      onTap: g => g.goto('lamp3') },
    { id: 'c_tojail', label: 'Back to the lock-up', rect: [530, 960, 170, 220],
      onTap: g => g.goto('jail') },
  ],
};

Scenes.office = {
  name: 'Harbor Office',
  mood: 'storm',
  art: f => Art.office(f),
  hotspots: [
    { id: 'c_chart2', label: 'Wall chart', rect: [110, 210, 240, 180],
      onTap: g => g.say('A chart of the coast, marked in Voss\'s hand with routes that avoid the black stretch entirely. Now you know why.') },
    { id: 'c_window3', label: 'Rain window', rect: [510, 190, 180, 200],
      onTap: g => g.say('Rain hammers the glass so hard it sounds like gravel. Somewhere out past it, the storm is only getting started.') },
    { id: 'c_stove', label: 'Iron stove', rect: [60, 600, 220, 300],
      onTap: g => {
        if (g.flag('c_hasIron')) { g.say('The stove ticks and glows. You already took its iron.'); return; }
        g.setFlag('c_hasIron'); g.addItem('fireiron'); g.refresh();
        g.say('Beside the stove: a bent fire iron. It might pry more than embers tonight.');
      } },
    { id: 'c_desk', label: 'Desk', rect: [460, 770, 280, 190],
      onTap: g => g.say('Ledgers and manifests in Voss\'s cramped hand — nothing here he hasn\'t already confessed to.') },
    { id: 'c_floorboard', label: 'Loose floorboard', rect: [280, 990, 220, 140],
      onTap: g => {
        if (g.flag('c_gotChart')) { g.say('Empty now. You already took everything Voss hid under here.'); return; }
        g.say('A floorboard, nailed flush — except the nail heads are shiny, recently pulled and reset. Something\'s underneath.');
      },
      onItem: { fireiron: g => {
        if (g.flag('c_gotChart')) { g.say('Nothing left to pry.'); return; }
        g.setFlag('c_gotChart'); g.addClue('c_chart'); g.addClue('c_letters'); g.refresh();
        g.say('The iron bites under the board and it splits up with a crack. Inside: a hand-drawn chart and a bundle of cold, typed letters.');
      } } },
    { id: 'c_exit2', label: 'Door out', rect: [630, 480, 170, 330],
      onTap: g => g.goto('dockstorm') },
  ],
};

Scenes.cliffs3 = {
  name: 'The Black Cliffs',
  mood: 'storm',
  art: f => Art.cliffs(true, false, { shutterOff: f.c_shutterOff, panelOpen: f.c_panelOpen }),
  hotspots: [
    { id: 'c_relay', label: 'Shore relay', rect: [220, 460, 200, 220],
      onTap: g => {
        if (g.flag('c_shutterOff')) { g.say('The shutter housing hangs open, harmless. The beam runs full and free.'); return; }
        if (!g.flag('c_gotChart')) { g.say('A locked steel box bolted to the rock, humming faintly. No idea what opens it — Voss\'s chart might know.'); return; }
        if (!g.flag('c_panelOpen')) { g.say('The access panel is screwed down tight. You\'d need something to pry it with.'); return; }
        g.puzzle('relaylock');
      },
      onItem: { fireiron: g => {
        if (g.flag('c_shutterOff') || g.flag('c_panelOpen')) { g.say('Nothing left to pry here.'); return; }
        if (!g.flag('c_gotChart')) { g.say('You could pry at it, but you don\'t even know what you\'re looking for yet.'); return; }
        g.setFlag('c_panelOpen'); g.refresh();
        g.say('The fire iron levers the access panel loose. Inside: a small numbered keypad, waiting for a date.');
      } } },
    { id: 'c_stormsea2', label: 'The black water', rect: [420, 700, 340, 220],
      onTap: g => g.say('The sea itself seems to be trying to climb these cliffs tonight.') },
    { id: 'c_backdock', label: 'Path back to the dock', rect: [0, 380, 200, 700],
      onTap: g => g.goto('dockstorm') },
  ],
};

Scenes.lamp3 = {
  name: 'The Lamp Room',
  mood: 'storm',
  art: () => Art.lamp('storm'),
  hotspots: [
    { id: 'c_alvar_npc', label: 'Alvar', rect: [560, 470, 180, 290],
      onTap: g => {
        if (g.flag('c_alvarBriefed')) { g.dialog('c_alvar_again'); return; }
        if (!g.flag('c_shutterOff')) { g.say('"Kel! Cut that relay first — the beam still gutters. GO!"'); return; }
        g.dialog('c_alvar1');
      } },
    { id: 'c_reserve', label: 'Storm reserve flywheel', rect: [150, 780, 200, 220],
      onTap: g => {
        if (g.flag('c_wound')) { g.say('The reserve holds steady, charged and humming under the strain.'); return; }
        if (!g.flag('c_alvarBriefed')) { g.say('Best hear Alvar out before you touch his machinery.'); return; }
        g.puzzle('reserve');
      } },
    { id: 'c_lens3', label: 'The great lens', rect: [270, 340, 260, 430],
      onTap: g => g.say('The lens burns and gutters with every gust — but it\'s still throwing every ounce of light it has at the black water.') },
    { id: 'c_stairs3', label: 'Stairs down', rect: [255, 990, 290, 170],
      onTap: g => g.goto('dockstorm') },
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
  ch3: {
    label: 'Chapter Three',
    name: 'The Wreck of the Marigold',
    saveKey: 'greyharbor_save_ch3_v1',
    start: 'jail',
    requires: 'ch2',
    lockHint: 'Finish Chapter Two to unlock',
    prologue: Prologue3,
    objective: objective3,
    ending: { title: 'The Light Endures Still', text: EndingText3, art: () => Art.ending3() },
    cutscenes: {
      intro: { slides: FinaleIntro, next: { type: 'dialog', id: 'c_fin_choice' } },
      outro: { slides: FinaleOutro, next: { type: 'end' } },
    },
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
  relaylock: {
    type: 'keypad',
    title: 'The Collector\'s Relay',
    sub: '"Shutter lock is the year she sank." — Voss\'s chart',
    code: '1893',
    wrongText: 'The shutter stays locked down tight.',
    onSolve: g => {
      g.setFlag('c_shutterOff');
      g.addClue('c_relay');
      g.refresh();
      g.say('1-8-9-3. The shutter housing pops loose and swings free. The beam leaps back to full strength, sweeping the black water clean.');
    },
  },
  reserve: {
    type: 'reserve',
    title: 'Wind the Storm Reserve',
    sub: 'Catch the flywheel handle when the marker crosses the gold notch at the top. Three clean catches will charge the reserve.',
    pulls: 3,
    onSolve: g => {
      g.setFlag('c_wound');
      g.refresh();
      setTimeout(() => g.cutscene('intro'), 500);
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
