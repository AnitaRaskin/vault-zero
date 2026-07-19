const G = {
  roomIdx:  0,
  stageIdx: 0,
  hintsUsed: 0,
  hintLevel: 0,
  roomStart: 0,
  fileEditDone: false,
  savedProgress: JSON.parse(localStorage.getItem('vz_progress') || '{}')
};

function room()  { return ROOMS[G.roomIdx]; }
function stage() { return room().stages[G.stageIdx]; }


// ═══════════════════════════════════════════════════════════════════════
// TERMINAL
// ═══════════════════════════════════════════════════════════════════════

const out  = document.getElementById('termOut');
const inp  = document.getElementById('termInput');
let cmdHist = [], histIdx = -1;

function tprint(lines) {
  if (typeof lines === 'string') lines = [[lines, '']];
  lines.forEach(([text, cls]) => {
    const d = document.createElement('div');
    d.className = 't ' + (cls || '');
    d.textContent = text;
    out.appendChild(d);
  });
  out.scrollTop = out.scrollHeight;
}

function tcmd(cmd) {
  const d = document.createElement('div');
  d.className = 't cmd';
  d.textContent = '$ ' + cmd;
  out.appendChild(d);
  out.scrollTop = out.scrollHeight;
}

function foxMsg(text, type) {
  const wrap = document.getElementById('foxMessages');
  const d = document.createElement('div');
  d.className = 'fox-msg' + (type === 'sys' ? ' sys' : '');
  d.innerHTML = `<span class="fox-tag">FOX</span>${text}`;
  wrap.appendChild(d);
  wrap.scrollTop = wrap.scrollHeight;
}


// ═══════════════════════════════════════════════════════════════════════
// COMMAND PARSING
// ═══════════════════════════════════════════════════════════════════════

function normalise(s) { return s.trim().replace(/\s+/g, ' '); }

function parseCmd(raw) {
  const cmd = normalise(raw);
  const s = stage();

  // Always-available
  if (cmd === 'clear') { out.innerHTML = ''; return {}; }
  if (cmd === 'hint')  { openHint(); return {}; }
  if (cmd === 'help')  {
    tprint([
      [`ROOM ${room().id}: ${room().name}`, 'hl'],
      [`Stage ${G.stageIdx+1}: ${s.task}`, ''],
      ['', ''],
      ['git status       — always works', 'dim'],
      ['git log          — always works', 'dim'],
      ['hint             — get a hint', 'dim'],
      ['clear            — clear terminal', 'dim']
    ]);
    return {};
  }

  // File edit trigger
  if (s.fileEdit && (cmd === 'edit security-config.json' || cmd === 'nano security-config.json' || cmd === 'vim security-config.json')) {
    openEditor(); return {};
  }

  // Flexible commit (Room 3 Stage 4)
  if (s.flexCommit) {
    if (/^git commit -m ['"].+['"]/.test(cmd) || /^git commit -m .+/.test(cmd)) {
      const m = cmd.match(/^git commit -m ['"]?(.+?)['"]?$/) || [];
      const msg = m[1] || 'committed';
      const output = [
        [`[operative/entry-window f4a2b19] ${msg}`, 'cm'],
        [' 1 file changed, 1 insertion(+), 1 deletion(-)', 'sys'],
        ['', '']
      ];
      if (!msg || msg.length < 5 || /^(wip|fix|test|asdf|temp|x+|update)$/i.test(msg)) {
        output.push(["commit messages are for the crew. make them readable.", "warn"]);
        output.push(['', '']);
      }
      tprint(output);
      advance(s.tree);
      return {};
    }
  }

  // Exact + near matches
  const accepted = (s.accepted || []).map(normalise);
  if (accepted.includes(cmd)) {
    if (s.fileEdit && !G.fileEditDone) {
      tprint([["no changes to stage. edit the file first — type: edit security-config.json", "warn"]]);
      return {};
    }
    tprint(s.output || []);
    advance(s.tree);
    return {};
  }

  // Wrong-command responses
  if (s.wrong) {
    for (const [wCmd, wOut] of Object.entries(s.wrong)) {
      if (cmd === normalise(wCmd) || cmd.startsWith(normalise(wCmd) + ' ')) {
        tprint(wOut); return {};
      }
    }
  }

  // Soft fallbacks
  if (cmd === 'git status') { tprint(defaultStatus()); return {}; }
  if (cmd === 'git log' || cmd === 'git log --oneline') {
    tprint([['view git log once you\'re on the right branch', 'dim']]); return {};
  }

  tprint([["command not recognized in this environment. type 'help' for available commands.", 'warn']]);
  return {};
}


function defaultStatus() {
  const s = stage();
  if ((s.tree || '').includes('dirty') || (s.tree || '').includes('r5') || (s.tree || '').includes('r6_dirty')) {
    return [
      ['On branch main', 'br'],
      ['', ''],
      ['Changes not staged for commit:', 'sys'],
      ['    modified:   alarm-config.json', 'err'],
      ['    modified:   access-log.txt', 'err'],
      ['', ''],
      ['Untracked files:', 'sys'],
      ['    temp-override.sh', 'warn']
    ];
  }
  const b = (s.tree || '').includes('feature') || (s.tree || '').includes('r3') || (s.tree || '').includes('r4')
    ? 'operative/entry-window' : 'main';
  return [
    [`On branch ${b}`, 'br'],
    ['nothing to commit, working tree clean', 'dim']
  ];
}


// ═══════════════════════════════════════════════════════════════════════
// STAGE / ROOM ADVANCEMENT
// ═══════════════════════════════════════════════════════════════════════

function advance(treeState) {
  if (treeState) renderTree(treeState);

  const nextIdx = G.stageIdx + 1;
  if (nextIdx >= room().stages.length) {
    completeRoom();
  } else {
    G.stageIdx = nextIdx;
    G.hintLevel = 0;
    G.fileEditDone = false;
    updateProgress();

    setTimeout(() => {
      foxMsg(stage().foxMessage || stage().foxMsg);
      if (stage().fileEdit) {
        setTimeout(openEditor, 900);
      }
    }, 700);
  }
}

function completeRoom() {
  const t = Math.floor((Date.now() - G.roomStart) / 1000);
  const m = Math.floor(t / 60);
  const s = (t % 60).toString().padStart(2, '0');
  const completionMsg = room().stages[room().stages.length - 1].completionMsg || 'room cleared.';

  G.savedProgress[`room${room().id}`] = { complete: true, hints: G.hintsUsed, time: t };
  localStorage.setItem('vz_progress', JSON.stringify(G.savedProgress));

  document.getElementById('doneStats').textContent = `Time: ${m}:${s}  ·  Hints used: ${G.hintsUsed}`;
  document.getElementById('doneMsg').textContent = `"${completionMsg}"`;

  setTimeout(() => document.getElementById('roomDone').classList.add('open'), 1200);
}

function goNextRoom() {
  document.getElementById('roomDone').classList.remove('open');
  const next = G.roomIdx + 1;
  if (next >= ROOMS.length) {
    document.getElementById('endScreen').classList.add('open');
    return;
  }
  G.roomIdx  = next;
  G.stageIdx = 0;
  G.hintsUsed = 0;
  G.hintLevel = 0;
  G.fileEditDone = false;
  G.roomStart = Date.now();
  loadRoom();
}

function updateProgress() {
  const total = ROOMS.reduce((s, r) => s + r.stages.length, 0);
  const done  = ROOMS.slice(0, G.roomIdx).reduce((s, r) => s + r.stages.length, 0) + G.stageIdx;
  document.getElementById('progressFill').style.width = ((done / total) * 100) + '%';
}


// ═══════════════════════════════════════════════════════════════════════
// LOAD ROOM
// ═══════════════════════════════════════════════════════════════════════

function loadRoom() {
  const r = room();
  const s = stage();

  out.innerHTML = '';
  document.getElementById('foxMessages').innerHTML = '';
  document.getElementById('roomInfo').textContent = `ROOM ${r.id} — ${r.name}`;

  tprint([
    ['', ''],
    [`  ╔══════════════════════════════════════╗`, 'dim'],
    [`  ║  ROOM ${r.id}: ${r.name.padEnd(32)}║`, 'hl'],
    [`  ╚══════════════════════════════════════╝`, 'dim'],
    ['', ''],
    [r.intro, 'sys'],
    ['', ''],
    [`  ──────────────────────────────────────`, 'dim'],
    ['', '']
  ]);

  updateProgress();
  renderTree('r' + r.id + '_initial');

  setTimeout(() => {
    foxMsg(s.foxMessage || s.foxMsg);
    if (s.fileEdit) setTimeout(openEditor, 1000);
  }, 400);

  inp.focus();
}


// ═══════════════════════════════════════════════════════════════════════
// FILE EDITOR (Room 3 Stage 3)
// ═══════════════════════════════════════════════════════════════════════

const FILE_BEFORE = `{
  "system": "vault-zero",
  "maintenance_window": null,
  "ids_threshold": 5,
  "monitoring_cycle": "04:00"
}`;

function openEditor() {
  const fc = document.getElementById('fileContent');
  fc.value = FILE_BEFORE;
  document.getElementById('fileEditor').classList.add('open');
  fc.focus();
}

function saveFile() {
  const val = document.getElementById('fileContent').value;
  document.getElementById('fileEditor').classList.remove('open');

  if (val.includes('"maintenance_window": "02:00"')) {
    G.fileEditDone = true;
    tprint([
      ['security-config.json saved.', 'ok'],
      ['', ''],
      ['  "maintenance_window": null  →  "maintenance_window": "02:00"', 'dim'],
      ['', ''],
      ['now stage the change.', 'sys']
    ]);
  } else {
    tprint([
      ['file saved but the change is wrong.', 'err'],
      ['"maintenance_window" should be "02:00", not null.', 'warn'],
      ['type: edit security-config.json to try again.', 'dim']
    ]);
  }
  inp.focus();
}

function cancelFile() {
  document.getElementById('fileEditor').classList.remove('open');
  inp.focus();
}


// ═══════════════════════════════════════════════════════════════════════
// HINT SYSTEM
// ═══════════════════════════════════════════════════════════════════════

function openHint() {
  const hints = room().hints[G.stageIdx];
  if (!hints) return;
  const lvl = Math.min(G.hintLevel, hints.length - 1);
  document.getElementById('hintLvl').textContent = `HINT ${lvl + 1} OF ${hints.length}`;
  document.getElementById('hintTxt').textContent = hints[lvl];
  document.getElementById('nextHintBtn').style.display = lvl < hints.length - 1 ? '' : 'none';
  document.getElementById('hintModal').classList.add('open');
  G.hintsUsed++;
}

function moreHint() {
  const hints = room().hints[G.stageIdx];
  G.hintLevel = Math.min(G.hintLevel + 1, hints.length - 1);
  const lvl = G.hintLevel;
  document.getElementById('hintLvl').textContent = `HINT ${lvl + 1} OF ${hints.length}`;
  document.getElementById('hintTxt').textContent = hints[lvl];
  document.getElementById('nextHintBtn').style.display = lvl < hints.length - 1 ? '' : 'none';
}

function closeHint() {
  document.getElementById('hintModal').classList.remove('open');
  G.hintLevel = 0;
  inp.focus();
}


// ═══════════════════════════════════════════════════════════════════════
// INPUT EVENTS
// ═══════════════════════════════════════════════════════════════════════

inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const raw = inp.value.trim();
    if (!raw) return;
    cmdHist.unshift(raw);
    histIdx = -1;
    inp.value = '';
    tcmd(raw);
    parseCmd(raw);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < cmdHist.length - 1) inp.value = cmdHist[++histIdx];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    inp.value = histIdx > 0 ? cmdHist[--histIdx] : (histIdx = -1, '');
  }
});

// Keep focus when clicking terminal panel
document.querySelector('.terminal-panel').addEventListener('click', () => inp.focus());


// ═══════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════

// Initial tree states per room (before any command succeeds)
TREE['r1_initial'] = { branches: [{name:'main', y:90, color:'#1D9E75', commits:[{x:40},{x:100}]}], HEAD: {type:'branch', ref:'main', ci:1, branchY:90} };
TREE['r2_initial'] = TREE['r2_remote'];
TREE['r3_initial'] = TREE['r3_clean'];
TREE['r4_initial'] = TREE['r4_ahead'];
TREE['r5_initial'] = TREE['r5_dirty'];
TREE['r6_initial'] = TREE['r6_dirty'];

function startGame() {
  document.getElementById('introScreen').style.display = 'none';
  const shell = document.getElementById('gameShell');
  shell.style.display = 'flex';
  G.roomStart = Date.now();
  loadRoom();
}



