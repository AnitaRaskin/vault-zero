const G = {
  roomIdx:  0,
  stageIdx: 0,
  hintsUsed: 0,
  hintLevel: 0,
  roomStart: 0,
  missionStart: 0,
  fileEditDone: false,
  clues: [],
  savedProgress: JSON.parse(localStorage.getItem('vz_progress') || '{}')
};

// ═══════════════════════════════════════════════════════════════════════
// COMMAND LOG / CHEAT SHEET
// ═══════════════════════════════════════════════════════════════════════

let cmdLog = [];

const CMD_DESCRIPTIONS = {
  'ls':                  'list files in the current directory',
  'git status':          'show working tree state (modified, staged, untracked)',
  'git log --oneline':   'compact commit history',
  'git log':             'full commit history with author and date',
  'git branch -a':       'list all branches — local and remote',
  'git checkout':        'switch to a branch or commit',
  'git switch':          'switch branches',
  'git checkout -b':     'create a new branch and switch to it',
  'git switch -c':       'create a new branch and switch to it',
  'git stash':           'hide uncommitted changes temporarily',
  'git stash push':      'hide uncommitted changes temporarily',
  'git stash list':      'list all stashed changes',
  'git stash pop':       'restore latest stash and remove it from the list',
  'git stash apply':     'restore latest stash (keeps it in the list)',
  'git pull':            'fetch remote changes and merge them locally',
  'git add':             'stage file changes for the next commit',
  'git commit':          'save staged changes as a snapshot with a message',
  'git push':            'upload local commits to the remote server',
  'git show':            'inspect a specific commit\'s changes',
  'git diff':            'compare working directory or commits',
  'git clean -fd':       'remove untracked files and directories',
  'git clean -f':        'remove untracked files',
  'git restore':         'discard working directory changes for a file',
  'git revert':          'safely undo a commit on a shared branch',
  'git remote -v':       'show remote server connections',
  'gh repo fork':        'fork a repo to your own account',
  'git clone':           'download a repo to your local machine',
};

function logCmd(raw) {
  const key = Object.keys(CMD_DESCRIPTIONS).find(k => raw === k || raw.startsWith(k + ' '));
  if (!key) return;
  if (!cmdLog.find(e => e.cmd === key)) {
    cmdLog.push({ cmd: key, desc: CMD_DESCRIPTIONS[key] });
  }
}

function openCheatSheet() {
  const list = document.getElementById('cheatList');
  list.innerHTML = '';
  if (cmdLog.length === 0) {
    list.innerHTML = '<div class="cheat-empty">no commands logged yet. complete a stage to start building your record.</div>';
  } else {
    cmdLog.forEach(({ cmd, desc }) => {
      const row = document.createElement('div');
      row.className = 'cheat-row';
      row.innerHTML = `<span class="cheat-cmd">${cmd}</span><span class="cheat-desc">${desc}</span>`;
      list.appendChild(row);
    });
  }
  document.getElementById('cheatSheet').classList.add('open');
}

function closeCheatSheet() {
  document.getElementById('cheatSheet').classList.remove('open');
  inp.focus();
}

function downloadCheatSheet() {
  const lines = ['VAULT ZERO // COMMAND RECORD', '═'.repeat(40), ''];
  cmdLog.forEach(({ cmd, desc }) => {
    lines.push(`  ${cmd.padEnd(28)}${desc}`);
  });
  lines.push('', '═'.repeat(40), 'vault-zero-v1 // operative record');
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vault-zero-commands.txt';
  a.click();
}

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

function getMissionTime() {
  const elapsed = Math.floor((Date.now() - (G.missionStart || Date.now())) / 1000);
  const base = 2 * 3600 + elapsed;
  const h = Math.floor(base / 3600) % 24;
  const m = Math.floor((base % 3600) / 60);
  const s = base % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function foxMsg(text, type) {
  const wrap = document.getElementById('foxMessages');

  const row = document.createElement('div');
  row.className = 'fox-msg-row';

  const ts = document.createElement('span');
  ts.className = 'fox-ts';
  ts.textContent = getMissionTime();

  const msg = document.createElement('div');
  msg.className = 'fox-msg' + (type === 'sys' ? ' sys' : '');

  row.appendChild(ts);
  row.appendChild(msg);
  wrap.appendChild(row);

  const fullText = `[fox] > ${text}`;
  let i = 0;
  function next() {
    if (i < fullText.length) {
      msg.textContent += fullText[i++];
      wrap.scrollTop = wrap.scrollHeight;
      setTimeout(next, 16);
    }
  }
  next();
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

  // File edit trigger (generic — uses s.fileName or defaults to security-config.json)
  if (s.fileEdit) {
    const fn = s.fileName || 'security-config.json';
    if (cmd === `edit ${fn}` || cmd === `nano ${fn}` || cmd === `vim ${fn}`) {
      openEditor(); return {};
    }
  }

  // Flexible stash pop (HIDE THE EVIDENCE Stage 4)
  if (s.flexStashPop) {
    if (cmd === 'git stash pop') {
      tprint(s.output || []);
      logCmd(cmd);
      advance(s.tree);
      return {};
    }
    if (cmd === 'git stash apply') {
      tprint([
        ['On branch operative/entry-window', 'br'],
        ['Changes not staged for commit:', 'sys'],
        ['    modified:   firewall-rules.json', 'ok'],
        ['    modified:   entry-tokens.txt', 'ok'],
        ['', ''],
        ['apply restores the stash but keeps it in the list — use git stash drop to clean up.', 'dim'],
        ['git stash pop does both in one step. worth knowing the difference.', 'dim'],
      ]);
      logCmd('git stash apply');
      advance(s.tree);
      return {};
    }
  }

  // Flexible commit (Rooms 3, 6)
  if (s.flexCommit) {
    if (/^git commit -m ['"].+['"]/.test(cmd) || /^git commit -m .+/.test(cmd)) {
      const m = cmd.match(/^git commit -m ['"]?(.+?)['"]?$/) || [];
      const msg = m[1] || 'committed';
      const branch = (s.tree || '').includes('conflict') ? 'main' : 'operative/entry-window';
      const output = [
        [`[${branch} f4a2b19] ${msg}`, 'cm'],
        [' 1 file changed, 1 insertion(+), 1 deletion(-)', 'sys'],
        ['', '']
      ];
      if (!msg || msg.length < 5 || /^(wip|fix|test|asdf|temp|x+|update)$/i.test(msg)) {
        output.push(["commit messages are for the crew. make them readable.", "warn"]);
        output.push(['', '']);
      }
      tprint(output);
      logCmd('git commit');
      advance(s.tree);
      return {};
    }
  }

  // Exact + near matches
  const accepted = (s.accepted || []).map(normalise);
  if (accepted.includes(cmd)) {
    if (s.fileEdit && !G.fileEditDone) {
      const fn = s.fileName || 'security-config.json';
      tprint([[`no changes to stage. edit the file first — type: edit ${fn}`, "warn"]]);
      return {};
    }
    tprint(s.output || []);
    logCmd(cmd);
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
  flashTerminal();
  return {};
}


function defaultStatus() {
  const s = stage();
  const t = s.tree || '';
  if (t.includes('stash_dirty')) {
    return [
      ['On branch operative/entry-window', 'br'],
      ['', ''],
      ['Changes not staged for commit:', 'sys'],
      ['    modified:   firewall-rules.json', 'err'],
      ['    modified:   entry-tokens.txt', 'err'],
    ];
  }
  if (t.includes('stash_clean')) {
    return [
      ['On branch operative/entry-window', 'br'],
      ['nothing to commit, working tree clean', 'ok'],
    ];
  }
  if (t.includes('conflict_initial')) {
    return [
      ['On branch main', 'br'],
      ['You have unmerged paths.', 'err'],
      ['    (fix conflicts and run "git commit")', 'dim'],
      ['', ''],
      ['Unmerged paths:', 'sys'],
      ['    both modified:   entry-tokens.txt', 'err'],
    ];
  }
  if (t.includes('dirty') || t.includes('r5') || t.includes('r6_dirty')) {
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
  const b = (t.includes('feature') || t.includes('r3') || t.includes('stash') || t.includes('entry'))
    ? 'operative/entry-window' : 'main';
  return [
    [`On branch ${b}`, 'br'],
    ['nothing to commit, working tree clean', 'dim']
  ];
}


// ═══════════════════════════════════════════════════════════════════════
// STAGE / ROOM ADVANCEMENT
// ═══════════════════════════════════════════════════════════════════════

function updateActiveBranch(treeKey) {
  const el = document.getElementById('activeBranch');
  if (!el) return;
  const isFeature = treeKey && (treeKey.includes('r3') || treeKey.includes('r4') || treeKey.includes('entry') || treeKey.includes('stash'));
  el.textContent = isFeature ? 'local/operative' : 'local/main';
}

function advance(treeState) {
  if (treeState) { renderTree(treeState); updateActiveBranch(treeState); }

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

  // Collect clue fragment
  const clue = room().clue;
  if (clue && !G.clues.find(c => c.label === clue.label)) {
    G.clues.push(clue);
  }

  document.getElementById('doneStats').textContent = `Time: ${m}:${s}  ·  Hints used: ${G.hintsUsed}`;
  document.getElementById('doneMsg').textContent = `"${completionMsg}"`;

  // Show clue fragment in done screen
  const clueWrap = document.getElementById('clueFragment');
  if (clue && clueWrap) {
    document.getElementById('clueKey').textContent = clue.label;
    const clueValEl = document.getElementById('clueVal');
    clueValEl.textContent = '';
    document.getElementById('clueCount').textContent =
      `${G.clues.length} of ${ROOMS.length} fragments collected`;
    clueWrap.style.display = '';
    let i = 0;
    function typeVal() {
      if (i < clue.value.length) { clueValEl.textContent += clue.value[i++]; setTimeout(typeVal, 35); }
    }
    setTimeout(typeVal, 900);
  } else if (clueWrap) {
    clueWrap.style.display = 'none';
  }

  setTimeout(() => document.getElementById('roomDone').classList.add('open'), 1200);
}

function goNextRoom() {
  document.getElementById('roomDone').classList.remove('open');
  const next = G.roomIdx + 1;
  if (next >= ROOMS.length) {
    buildEndScreen();
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
  const roomSlug = r.name.toLowerCase().replace(/\s+/g, '_');
  document.getElementById('roomInfo').textContent = `room_0${r.id} // ${roomSlug}`;
  updateActiveBranch(r.initialTree || ('r' + r.id + '_initial'));
  updateSecurityDots();

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
  renderTree(r.initialTree || ('r' + r.id + '_initial'));

  setTimeout(() => {
    foxMsg(s.foxMessage || s.foxMsg);
    if (s.fileEdit) setTimeout(openEditor, 1000);
  }, 400);

  inp.focus();
}


// ═══════════════════════════════════════════════════════════════════════
// FILE EDITOR (Room 3 Stage 3 + Room 6 conflict)
// ═══════════════════════════════════════════════════════════════════════

const FILE_BEFORE = `{
  "system": "vault-zero",
  "maintenance_window": null,
  "ids_threshold": 5,
  "monitoring_cycle": "04:00"
}`;

const FILE_CONFLICT = `{
  "system": "vault-zero",
  "entry_tokens": [
<<<<<<< HEAD
    "tok_operative_7a2f",
    "tok_crew_3b1e"
=======
    "tok_operative_7a2f",
    "tok_crew_3b1e",
    "tok_override_9x77"
>>>>>>> origin/main
  ],
  "expiry": "02:15"
}`;

function openEditor() {
  const s = stage();
  const isConflict = s.fileEditType === 'conflict';
  const fc = document.getElementById('fileContent');
  fc.value = isConflict ? FILE_CONFLICT : FILE_BEFORE;
  const title = document.getElementById('editorTitle');
  if (title) title.textContent = 'EDIT FILE: ' + (s.fileName || 'security-config.json');
  const hint = document.getElementById('editorHint');
  if (hint) {
    hint.innerHTML = isConflict
      ? 'remove the <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers — keep all three tokens'
      : 'change <code>"maintenance_window": null</code> → <code>"maintenance_window": "02:00"</code>';
  }
  document.getElementById('fileEditor').classList.add('open');
  fc.focus();
}

function saveFile() {
  const s = stage();
  const isConflict = s.fileEditType === 'conflict';
  const val = document.getElementById('fileContent').value;
  document.getElementById('fileEditor').classList.remove('open');

  if (isConflict) {
    const hasMarkers = val.includes('<<<<<<<') || val.includes('=======') || val.includes('>>>>>>>');
    if (!hasMarkers && val.includes('tok_override_9x77')) {
      G.fileEditDone = true;
      tprint([
        ['entry-tokens.txt saved — conflict resolved.', 'ok'],
        ['', ''],
        ['all three tokens preserved. markers removed.', 'dim'],
        ['', ''],
        ['now stage the resolved file.', 'sys']
      ]);
    } else if (hasMarkers) {
      tprint([
        ['conflict markers still present.', 'err'],
        ['remove the <<<<<<, ======, >>>>>>> lines and keep all three tokens.', 'warn'],
        ['type: edit entry-tokens.txt to try again.', 'dim']
      ]);
    } else {
      tprint([
        ['file saved but tok_override_9x77 is missing.', 'err'],
        ['keep all three tokens — that\'s the combined correct version.', 'warn'],
        ['type: edit entry-tokens.txt to try again.', 'dim']
      ]);
    }
  } else {
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

function setHintDisplay(lvl, hints) {
  document.getElementById('hintLvl').textContent = `HINT ${lvl + 1} OF ${hints.length}`;
  document.getElementById('hintTxt').textContent = hints[lvl];
  document.getElementById('nextHintBtn').style.display = lvl < hints.length - 1 ? '' : 'none';
  const bar = document.getElementById('hintProgressBar');
  if (bar) bar.style.width = (((lvl + 1) / hints.length) * 100) + '%';
}

function openHint() {
  const hints = room().hints[G.stageIdx];
  if (!hints) return;
  const lvl = Math.min(G.hintLevel, hints.length - 1);
  setHintDisplay(lvl, hints);
  document.getElementById('hintModal').classList.add('open');
  G.hintsUsed++;
}

function moreHint() {
  const hints = room().hints[G.stageIdx];
  G.hintLevel = Math.min(G.hintLevel + 1, hints.length - 1);
  setHintDisplay(G.hintLevel, hints);
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
// Rooms with initialTree property in data.js use that directly; others fall back to r{id}_initial
TREE['r1_initial'] = { branches: [{name:'main', y:90, color:'#1D9E75', commits:[{x:40},{x:100}]}], HEAD: {type:'branch', ref:'main', ci:1, branchY:90} };
TREE['r2_initial'] = TREE['r2_remote'];
TREE['r3_initial'] = TREE['r3_clean'];


// ═══════════════════════════════════════════════════════════════════════
// IMMERSION SYSTEMS
// ═══════════════════════════════════════════════════════════════════════

function flashTerminal() {
  const el = document.getElementById('termOut');
  el.classList.remove('err-flash');
  void el.offsetWidth;
  el.classList.add('err-flash');
  setTimeout(() => el.classList.remove('err-flash'), 500);
}

function startFooterClock() {
  const el = document.getElementById('footerClock');
  if (!el) return;
  function tick() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s} utc`;
  }
  tick();
  setInterval(tick, 1000);
}

function updateSecurityDots() {
  const dots = document.querySelectorAll('.sec-dot');
  const statusEl = document.getElementById('secStatus');
  // 1 bypassed for rooms 1-2, 2 for rooms 3-4, 3 for rooms 5-6
  const bypassed = Math.floor(G.roomIdx / 2) + 1;
  const probing = Math.min(bypassed + 1, 4);

  dots.forEach((dot, i) => {
    dot.className = 'sec-dot';
    if (i < bypassed) dot.classList.add('active');
    else if (i === bypassed) dot.classList.add('probing');
  });

  if (statusEl) {
    const bStr = bypassed === 1 ? 'layer_01: bypassed'
               : bypassed === 2 ? 'layer_01+02: bypassed'
               :                  'layer_01+02+03: bypassed';
    statusEl.textContent = `${bStr} // layer_0${probing}: probing`;
  }
}

const BOOT_LINES = [
  { text: '> initializing secure tunnel to vault_zero_banking_system...', cls: 'dim', pause: 180 },
  { text: '> handshake 0x4f22 — success', cls: 'ok', pause: 140 },
  { text: '> bypassing firewall node layer_01...', cls: 'dim', pause: 200 },
  { text: '> LAYER_01: ACCESS BYPASSED', cls: 'ok', pause: 120 },
  { text: '> WARNING: intrusion_detection_system active on layer_02', cls: 'warn', pause: 160 },
  { text: '> encrypted tunnel established. trace protection: active', cls: 'ok', pause: 120 },
  { text: '> incoming transmission — source: unknown // signal encrypted', cls: 'dim', pause: 80 },
];

function buildEndScreen() {
  const container = document.getElementById('assembledKey');
  if (!container) return;
  container.innerHTML = '';
  G.clues.forEach((clue, i) => {
    const row = document.createElement('div');
    row.className = 'key-row';
    row.innerHTML = `<span class="key-label">[${clue.label}]</span><span class="key-val"></span>`;
    container.appendChild(row);
    const valEl = row.querySelector('.key-val');
    let ci = 0;
    function typeChar() {
      if (ci < clue.value.length) {
        valEl.textContent += clue.value[ci++];
        setTimeout(typeChar, 30);
      }
    }
    setTimeout(typeChar, i * 220);
  });
}

function runBootSequence() {
  const container = document.getElementById('bootTerminal');
  const txBody    = document.getElementById('txBody');
  const opRow     = document.getElementById('operativeRow');
  const enterBtn  = document.getElementById('enterBtn');
  const nameInput = document.getElementById('operativeName');
  if (!container) return;

  let idx = 0;
  let skipped = false;

  function revealEnd() {
    if (skipped) return;
    txBody.style.opacity = '1';
    txBody.style.transform = 'translateY(0)';
    setTimeout(() => {
      opRow.style.opacity = '1';
      opRow.style.transform = 'translateY(0)';
      setTimeout(() => {
        enterBtn.style.opacity = '1';
        enterBtn.style.pointerEvents = '';
        nameInput.focus();
        nameInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') startGame();
        });
      }, 300);
    }, 600);
  }

  function skip() {
    if (skipped) return;
    skipped = true;
    container.innerHTML = BOOT_LINES.map(l =>
      `<span class="boot-line ${l.cls || 'dim'}">${l.text}</span>`
    ).join('');
    txBody.style.opacity = '1';
    txBody.style.transform = 'translateY(0)';
    opRow.style.opacity = '1';
    opRow.style.transform = 'translateY(0)';
    enterBtn.style.opacity = '1';
    enterBtn.style.pointerEvents = '';
    nameInput.focus();
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') startGame();
    });
  }

  function nextLine() {
    if (skipped) return;
    if (idx >= BOOT_LINES.length) { revealEnd(); return; }
    const line = BOOT_LINES[idx++];
    const el = document.createElement('span');
    el.className = 'boot-line ' + (line.cls || 'dim');
    container.appendChild(el);

    let ci = 0;
    const txt = line.text;
    function typeChar() {
      if (skipped) return;
      if (ci < txt.length) {
        el.textContent += txt[ci++];
        setTimeout(typeChar, 6);
      } else {
        setTimeout(nextLine, line.pause || 120);
      }
    }
    typeChar();
  }

  nextLine();
  document.addEventListener('keydown', skip, { once: true });
  container.addEventListener('click', skip, { once: true });
  const skipBtn = document.getElementById('bootSkipBtn');
  if (skipBtn) skipBtn.addEventListener('click', skip, { once: true });
}

runBootSequence();


// ═══════════════════════════════════════════════════════════════════════
// RESIZABLE PANELS
// ═══════════════════════════════════════════════════════════════════════

function initResizable() {
  const panels      = document.getElementById('panels');
  const leftHandle  = document.getElementById('resizeLeft');
  const rightHandle = document.getElementById('resizeRight');
  if (!panels || !leftHandle || !rightHandle) return;

  let dragging = null;
  let startX   = 0;
  let startW   = 0;

  const MIN_SIDE   = 120;
  const MIN_CENTER = 280;

  function getSideWidths() {
    const cols = getComputedStyle(panels).gridTemplateColumns.split(' ');
    return { left: parseFloat(cols[0]), right: parseFloat(cols[4]) };
  }

  function startDrag(side, e) {
    dragging = side;
    startX   = e.clientX;
    startW   = getSideWidths()[side];
    leftHandle.classList.toggle('dragging', side === 'left');
    rightHandle.classList.toggle('dragging', side === 'right');
    document.body.classList.add('resizing-col');
    e.preventDefault();
  }

  leftHandle.addEventListener('mousedown',  e => startDrag('left',  e));
  rightHandle.addEventListener('mousedown', e => startDrag('right', e));

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const total       = panels.offsetWidth - 2;
    const { left, right } = getSideWidths();
    if (dragging === 'left') {
      const delta = e.clientX - startX;
      const newW  = Math.max(MIN_SIDE, Math.min(startW + delta, total - right - MIN_CENTER));
      panels.style.setProperty('--left-w', newW + 'px');
    } else {
      const delta = startX - e.clientX;
      const newW  = Math.max(MIN_SIDE, Math.min(startW + delta, total - left - MIN_CENTER));
      panels.style.setProperty('--right-w', newW + 'px');
    }
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = null;
    leftHandle.classList.remove('dragging');
    rightHandle.classList.remove('dragging');
    document.body.classList.remove('resizing-col');
  });
}

initResizable();

let gameStarted = false;
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  const rawName = (document.getElementById('operativeName').value || '').trim();
  const codename = rawName.replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase() || 'operative';
  G.codename = codename;
  document.getElementById('operativeTag').textContent = `${codename}@layer-01:~/vault-repo$`;

  document.getElementById('introScreen').style.display = 'none';
  const shell = document.getElementById('gameShell');
  shell.style.display = 'flex';
  G.missionStart = Date.now();
  G.roomStart = Date.now();
  startFooterClock();
  loadRoom();
}



