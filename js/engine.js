// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — GAME ENGINE
// Generic escape-room runtime.  All game-specific content (commands, quiz
// questions, file content, police flavour text, etc.) lives in the mission's
// config.js, which must define a global GAME_CONFIG object before this file
// is loaded.  data.js must also be loaded first (defines ROOMS and TREE).
// ═══════════════════════════════════════════════════════════════════════


// ─── Session hashes ──────────────────────────────────────────────────
// H[1]–H[8] replace {{H1}}–{{H8}} placeholders in data.js at runtime,
// giving every session unique "commit IDs".

function genHash() {
  const chars = '0123456789abcdef';
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const H = [''].concat(Array.from({ length: 8 }, genHash));

function interp(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\{\{H1\}\}/g, H[1]).replace(/\{\{H2\}\}/g, H[2])
    .replace(/\{\{H3\}\}/g, H[3]).replace(/\{\{H4\}\}/g, H[4])
    .replace(/\{\{H5\}\}/g, H[5]).replace(/\{\{H6\}\}/g, H[6])
    .replace(/\{\{H7\}\}/g, H[7]).replace(/\{\{H8\}\}/g, H[8]);
}


// ─── Global game state ───────────────────────────────────────────────

const G = {
  roomIdx:       0,
  stageIdx:      0,
  hintsUsed:     0,
  totalHints:    0,
  hintLevel:     0,
  roomStart:     0,
  missionStart:  0,
  fileEditDone:  false,
  score:         0,
  stageWrongs:   0,
  stageHintLevel: -1,
  clues: [],
  savedProgress: JSON.parse(localStorage.getItem('vz_progress') || '{}')
};

function room()  { return ROOMS[G.roomIdx]; }
function stage() { return room().stages[G.stageIdx]; }


// ─── Command log / cheat sheet ───────────────────────────────────────

let cmdLog = [];

function logCmd(raw) {
  const desc = GAME_CONFIG.cmdDescriptions || {};
  const key  = Object.keys(desc).find(k => raw === k || raw.startsWith(k + ' '));
  if (!key) return;
  if (!cmdLog.find(e => e.cmd === key)) cmdLog.push({ cmd: key, desc: desc[key] });
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
  const title    = GAME_CONFIG.cheatSheetTitle    || 'COMMAND RECORD';
  const footer   = GAME_CONFIG.cheatSheetFooter   || '';
  const filename = GAME_CONFIG.cheatSheetFilename  || 'commands.txt';
  const lines    = [title, '═'.repeat(40), ''];
  cmdLog.forEach(({ cmd, desc }) => lines.push(`  ${cmd.padEnd(28)}${desc}`));
  lines.push('', '═'.repeat(40), footer);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}


// ─── Score ───────────────────────────────────────────────────────────

function addScore(delta) {
  const chip = document.getElementById('scoreChip');
  const el   = document.getElementById('scoreVal');
  if (!chip || !el) return;
  const from   = G.score;
  G.score      = Math.max(0, G.score + delta);
  const actual = G.score - from;
  if (actual === 0) return;
  const cls = actual > 0 ? 'gaining' : 'dropping';
  chip.classList.remove('gaining', 'dropping');
  void chip.offsetWidth;
  chip.classList.add(cls);
  setTimeout(() => chip.classList.remove(cls), 700);
  showScoreDelta(actual);
  const frameDelay = Math.abs(actual) <= 1 ? 0 : Math.abs(actual) <= 5 ? 50 : 35;
  let current = from;
  function tick() {
    current += actual > 0 ? 1 : -1;
    el.textContent = current;
    if (current !== G.score) setTimeout(tick, frameDelay);
  }
  tick();
}

function showScoreDelta(delta) {
  const chip = document.getElementById('scoreChip');
  if (!chip) return;
  const ind = document.createElement('div');
  ind.className  = 'score-delta ' + (delta > 0 ? 'pos' : 'neg');
  ind.textContent = (delta > 0 ? '+' : '') + delta;
  chip.appendChild(ind);
  setTimeout(() => ind.remove(), 850);
}

function countWrong() {
  G.stageWrongs++;
  if (G.stageWrongs >= 2) addScore(-1);
  if (G.stageWrongs === POLICE_TRIGGER_WRONGS) triggerPolice();
}


// ─── Police mechanic ─────────────────────────────────────────────────

const POLICE_SECONDS        = 30;
const POLICE_TRIGGER_WRONGS = 3;

let policeActive      = false;
let policeSecondsLeft = 0;
let policeIntervalId  = null;
let footstepId        = null;
let voiceTriggered    = false;
let audioCtx          = null;

function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playFootstep() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const sr  = ctx.sampleRate;
    const now = ctx.currentTime;
    const tbuf = ctx.createBuffer(1, Math.floor(sr * 0.08), sr);
    const td   = tbuf.getChannelData(0);
    for (let i = 0; i < td.length; i++) td[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.018));
    const tsrc = ctx.createBufferSource();
    tsrc.buffer = tbuf;
    const tlpf = ctx.createBiquadFilter();
    tlpf.type = 'lowpass'; tlpf.frequency.value = 160; tlpf.Q.value = 0.5;
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.6, now);
    tsrc.connect(tlpf); tlpf.connect(tg); tg.connect(ctx.destination);
    tsrc.start(now);
    const cbuf = ctx.createBuffer(1, Math.floor(sr * 0.012), sr);
    const cd   = cbuf.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.002));
    const csrc = ctx.createBufferSource();
    csrc.buffer = cbuf;
    const chpf = ctx.createBiquadFilter();
    chpf.type = 'highpass'; chpf.frequency.value = 1500;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.2, now + 0.008);
    csrc.connect(chpf); chpf.connect(cg); cg.connect(ctx.destination);
    csrc.start(now + 0.008);
  } catch(e) {}
}

function stopPoliceAudio() {
  if (footstepId) { clearInterval(footstepId); footstepId = null; }
  voiceTriggered = false;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(e) {}
}

function triggerPolice(skipMsg) {
  if (policeActive) return;
  policeActive      = true;
  policeSecondsLeft = POLICE_SECONDS;
  voiceTriggered    = false;
  if (!skipMsg) {
    const warnings = (GAME_CONFIG.policeWarnings || []);
    const msg      = warnings[G.stageWrongs % warnings.length] || '';
    if (msg) setTimeout(() => foxMsg(msg, 'sys'), 100);
  }
  const alertEl = document.getElementById('policeAlert');
  alertEl.classList.add('active');
  alertEl.classList.remove('urgent-mode');
  document.querySelector('.terminal-panel').classList.add('police-active');
  document.querySelector('.terminal-panel').classList.remove('police-urgent');
  document.getElementById('policeVignette').classList.remove('active');
  updatePoliceUI();
  policeIntervalId = setInterval(() => {
    policeSecondsLeft--;
    updatePoliceUI();
    if (policeSecondsLeft <= 0) policeRaid();
  }, 1000);
}

function clearPolice(silent) {
  if (!policeActive) return;
  policeActive = false;
  clearInterval(policeIntervalId);
  policeIntervalId = null;
  stopPoliceAudio();
  const alertEl = document.getElementById('policeAlert');
  alertEl.classList.remove('active', 'urgent-mode');
  document.getElementById('policeVignette').classList.remove('active');
  document.querySelector('.terminal-panel').classList.remove('police-active', 'police-urgent');
  if (!silent) setTimeout(() => foxMsg('clean. they moved on.', 'sys'), 200);
}

function policeRaid() {
  clearPolice(true);
  addScore(-10);
  setTimeout(() => foxMsg("too slow. they logged the attempt. we took a hit.", 'sys'), 100);
}

function updatePoliceUI() {
  const countdownEl = document.getElementById('policeCountdown');
  const fillEl      = document.getElementById('policeBarFill');
  const alertEl     = document.getElementById('policeAlert');
  const vigEl       = document.getElementById('policeVignette');
  const termEl      = document.querySelector('.terminal-panel');
  if (!countdownEl || !fillEl) return;
  const s      = policeSecondsLeft;
  const urgent = s <= 10;
  countdownEl.textContent = '0:' + String(s).padStart(2, '0');
  fillEl.style.width      = ((s / POLICE_SECONDS) * 100) + '%';
  countdownEl.classList.toggle('urgent', urgent);
  alertEl.classList.toggle('urgent-mode', urgent);
  vigEl.classList.toggle('active', urgent);
  termEl.classList.toggle('police-urgent', urgent);
  if (urgent && !footstepId) {
    footstepId = setInterval(() => { if (policeActive) playFootstep(); }, 550);
  }
  if (s === 6 && !voiceTriggered) {
    voiceTriggered = true;
    try {
      if (window.speechSynthesis) {
        const utt  = new SpeechSynthesisUtterance("who's there?");
        utt.volume = 0.85; utt.rate = 0.75; utt.pitch = 0.6;
        window.speechSynthesis.speak(utt);
      }
    } catch(e) {}
  }
}


// ─── Concept & police modals ─────────────────────────────────────────

function showConceptBrief(brief, callback) {
  const modal     = document.getElementById('conceptModal');
  const titleEl   = document.getElementById('conceptTitle');
  const bulletsEl = document.getElementById('conceptBullets');
  const asciiEl   = document.getElementById('conceptAscii');
  const btn       = document.getElementById('conceptBtn');
  if (!modal) { callback(); return; }
  titleEl.textContent = brief.title || '';
  bulletsEl.innerHTML = '';
  (brief.bullets || []).forEach(text => {
    const d = document.createElement('div');
    d.className  = 'concept-bullet';
    d.textContent = text;
    bulletsEl.appendChild(d);
  });
  if (brief.ascii) { asciiEl.textContent = brief.ascii; asciiEl.style.display = ''; }
  else              { asciiEl.style.display = 'none'; }
  modal.classList.add('open');
  function close() { document.removeEventListener('keydown', onEnter); modal.classList.remove('open'); callback(); }
  function onEnter(e) { if (e.key === 'Enter') close(); }
  btn.onclick = close;
  document.addEventListener('keydown', onEnter);
}

function showPoliceWarnModal(msg, callback) {
  const modal = document.getElementById('policeWarnModal');
  const msgEl = document.getElementById('pwarnMsg');
  const btn   = document.getElementById('pwarnBtn');
  if (!modal) { callback(); return; }
  msgEl.textContent = '';
  modal.classList.add('open');
  const fullText = `[fox] > ${msg}`;
  let i = 0;
  function next() { if (i < fullText.length) { msgEl.textContent += fullText[i++]; setTimeout(next, 18); } }
  next();
  function close() { document.removeEventListener('keydown', onEnter); modal.classList.remove('open'); callback(); }
  function onEnter(e) { if (e.key === 'Enter') close(); }
  btn.onclick = close;
  document.addEventListener('keydown', onEnter);
}


// ─── Terminal ────────────────────────────────────────────────────────

const out = document.getElementById('termOut');
const inp = document.getElementById('termInput');
let cmdHist = [], histIdx = -1;

function tprint(lines) {
  if (typeof lines === 'string') lines = [[lines, '']];
  lines.forEach(([text, cls]) => {
    const d = document.createElement('div');
    d.className  = 't ' + (cls || '');
    d.textContent = interp(text);
    out.appendChild(d);
  });
  out.scrollTop = out.scrollHeight;
}

function tcmd(cmd) {
  const d = document.createElement('div');
  d.className  = 't cmd';
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
  const row  = document.createElement('div');
  row.className = 'fox-msg-row';
  const ts  = document.createElement('span');
  ts.className  = 'fox-ts';
  ts.textContent = getMissionTime();
  const msg = document.createElement('div');
  msg.className  = 'fox-msg' + (type === 'sys' ? ' sys' : '');
  row.appendChild(ts);
  row.appendChild(msg);
  wrap.appendChild(row);
  const fullText = `[fox] > ${interp(text)}`;
  let i = 0;
  function next() {
    if (i < fullText.length) { msg.textContent += fullText[i++]; wrap.scrollTop = wrap.scrollHeight; setTimeout(next, 16); }
  }
  next();
}


// ─── Command parsing ─────────────────────────────────────────────────

function normalise(s) { return s.trim().replace(/\s+/g, ' '); }

function parseCmd(raw) {
  const cmd = normalise(raw);
  const s   = stage();

  // Universal commands
  if (cmd === 'clear') { out.innerHTML = ''; return {}; }
  if (cmd === 'hint')  { openHint(); return {}; }
  if (cmd === 'help')  {
    const avail = (GAME_CONFIG.alwaysAvailableHelp || []).map(l => [l, 'dim']);
    tprint([
      [`ROOM ${room().id}: ${room().name}`, 'hl'],
      [`Stage ${G.stageIdx + 1}: ${s.task}`, ''],
      ['', ''],
      ...avail,
      ['hint             — get a hint', 'dim'],
      ['clear            — clear terminal', 'dim']
    ]);
    return {};
  }

  // Risky commands trigger police
  const riskyCmds = GAME_CONFIG.policeRiskyCmds || [];
  if (!policeActive && riskyCmds.some(r => cmd === r || cmd.startsWith(r + ' '))) {
    triggerPolice();
  }

  // File editor trigger
  if (s.fileEdit) {
    const fn = s.fileName || 'config.json';
    if (cmd === `edit ${fn}` || cmd === `nano ${fn}` || cmd === `vim ${fn}`) {
      openEditor(); return {};
    }
  }

  // Game-specific special handlers (flexCommit, flexStashPop, etc.)
  if (GAME_CONFIG.parseSpecial) {
    const result = GAME_CONFIG.parseSpecial(cmd, s, { tprint, logCmd, advance, H });
    if (result) return result;
  }

  // Exact + near matches
  const accepted = (s.accepted || []).map(a => interp(normalise(a)));
  if (accepted.includes(cmd)) {
    if (s.fileEdit && !G.fileEditDone) {
      const fn = s.fileName || 'config.json';
      tprint([[`no changes to stage. edit the file first — type: edit ${fn}`, 'warn']]);
      return {};
    }
    tprint(s.output || []);
    logCmd(cmd);
    advance(s.tree);
    return {};
  }

  // Wrong-command responses from stage data
  if (s.wrong) {
    for (const [wCmd, wOut] of Object.entries(s.wrong)) {
      if (cmd === interp(normalise(wCmd)) || cmd.startsWith(interp(normalise(wCmd)) + ' ')) {
        tprint(wOut);
        countWrong();
        return {};
      }
    }
  }

  // Mission-defined always-available fallbacks (e.g. git status)
  if (GAME_CONFIG.alwaysAvailable) {
    const fallback = GAME_CONFIG.alwaysAvailable(cmd, s);
    if (fallback) { tprint(fallback); return {}; }
  }

  tprint([["command not recognized in this environment. type 'help' for available commands.", 'warn']]);
  flashTerminal();
  countWrong();
  return {};
}


// ─── Advancement ─────────────────────────────────────────────────────

function updateActiveBranch(treeKey) {
  const el = document.getElementById('activeBranch');
  if (!el) return;
  const label = GAME_CONFIG.activeBranchLabel
    ? GAME_CONFIG.activeBranchLabel(treeKey)
    : 'local/main';
  el.textContent = label;
}

function loadNextStageUI() {
  const s = stage();
  if (!s.policeWarnModal) foxMsg(s.foxMessage || s.foxMsg);
  if (s.fileEdit) setTimeout(openEditor, 900);
  if (s.policeOnLoad) {
    if (s.policeWarnModal) {
      setTimeout(() => {
        const popupMsg = s.policePopupMsg || s.foxMsg || s.foxMessage || '';
        showPoliceWarnModal(popupMsg, () => {
          foxMsg(s.foxMsg || s.foxMessage || '');
          triggerPolice(true);
        });
      }, 800);
    } else {
      setTimeout(() => triggerPolice(true), 1400);
    }
  }
}

function advance(treeState) {
  if (treeState) { renderTree(treeState); updateActiveBranch(treeState); }
  clearPolice(false);
  addScore(10);
  const nextIdx = G.stageIdx + 1;
  if (nextIdx >= room().stages.length) {
    completeRoom();
  } else {
    G.stageIdx       = nextIdx;
    G.hintLevel      = 0;
    G.fileEditDone   = false;
    G.stageWrongs    = 0;
    G.stageHintLevel = -1;
    updateProgress();
    setTimeout(() => {
      if (stage().conceptBrief) showConceptBrief(stage().conceptBrief, loadNextStageUI);
      else                       loadNextStageUI();
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
  const clue = room().clue;
  if (clue && !G.clues.find(c => c.label === clue.label)) G.clues.push(clue);
  document.getElementById('doneStats').textContent = `Time: ${m}:${s}  ·  Hints used: ${G.hintsUsed}`;
  document.getElementById('doneMsg').textContent   = `"${completionMsg}"`;
  const clueWrap = document.getElementById('clueFragment');
  if (clue && clueWrap) {
    document.getElementById('clueKey').textContent   = clue.label;
    const clueValEl = document.getElementById('clueVal');
    clueValEl.textContent = '';
    document.getElementById('clueCount').textContent = `${G.clues.length} of ${ROOMS.length} fragments collected`;
    clueWrap.style.display = '';
    let i = 0;
    function typeVal() { if (i < clue.value.length) { clueValEl.textContent += clue.value[i++]; setTimeout(typeVal, 35); } }
    setTimeout(typeVal, 900);
  } else if (clueWrap) {
    clueWrap.style.display = 'none';
  }
  setTimeout(() => document.getElementById('roomDone').classList.add('open'), 1200);
}

function goNextRoom() {
  document.getElementById('roomDone').classList.remove('open');
  clearPolice(true);
  const next = G.roomIdx + 1;
  if (next >= ROOMS.length) {
    buildQuiz();
    document.getElementById('quizScreen').classList.add('open');
    return;
  }
  G.roomIdx        = next;
  G.stageIdx       = 0;
  G.hintsUsed      = 0;
  G.hintLevel      = 0;
  G.fileEditDone   = false;
  G.stageWrongs    = 0;
  G.stageHintLevel = -1;
  G.roomStart      = Date.now();
  loadRoom();
}

function updateProgress() {
  const total = ROOMS.reduce((s, r) => s + r.stages.length, 0);
  const done  = ROOMS.slice(0, G.roomIdx).reduce((s, r) => s + r.stages.length, 0) + G.stageIdx;
  document.getElementById('progressFill').style.width = ((done / total) * 100) + '%';
}


// ─── Load room ───────────────────────────────────────────────────────

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
    if (s.conceptBrief) showConceptBrief(s.conceptBrief, loadNextStageUI);
    else                 loadNextStageUI();
  }, 400);
  inp.focus();
}


// ─── File editor ─────────────────────────────────────────────────────

function openEditor() {
  const s          = stage();
  const isConflict = s.fileEditType === 'conflict';
  const fc         = document.getElementById('fileContent');
  const fileConf   = GAME_CONFIG.fileContent || {};
  const which      = isConflict ? (fileConf.conflict || {}) : (fileConf.edit || {});
  fc.value = which.text || '';
  const title = document.getElementById('editorTitle');
  if (title) title.textContent = 'EDIT FILE: ' + (s.fileName || 'file');
  const hint = document.getElementById('editorHint');
  if (hint) hint.innerHTML = which.hint || '';
  document.getElementById('fileEditor').classList.add('open');
  fc.focus();
}

function saveFile() {
  const s          = stage();
  const isConflict = s.fileEditType === 'conflict';
  const val        = document.getElementById('fileContent').value;
  document.getElementById('fileEditor').classList.remove('open');
  if (GAME_CONFIG.validateFile) {
    const result = GAME_CONFIG.validateFile(val, isConflict);
    if (result.pass) G.fileEditDone = true;
    tprint(result.output || []);
  }
  inp.focus();
}

function cancelFile() {
  document.getElementById('fileEditor').classList.remove('open');
  inp.focus();
}


// ─── Hint system ─────────────────────────────────────────────────────

function setHintDisplay(lvl, hints) {
  document.getElementById('hintLvl').textContent = `HINT ${lvl + 1} OF ${hints.length}`;
  const bar = document.getElementById('hintProgressBar');
  if (bar) bar.style.width = (((lvl + 1) / hints.length) * 100) + '%';
  const hintTxt  = document.getElementById('hintTxt');
  const text     = interp(hints[lvl]);
  const cmdMatch = text.match(/^([\s\S]+)\n\n((?:run|type): .+)$/);
  if (cmdMatch) hintTxt.innerHTML = cmdMatch[1] + '<br><br><span class="hint-cmd">' + cmdMatch[2] + '</span>';
  else          hintTxt.textContent = text;
  const nextBtn = document.getElementById('nextHintBtn');
  nextBtn.classList.remove('reveal-answer');
  nextBtn.textContent = 'DEEPER HINT →';
  if (lvl >= hints.length - 1) { nextBtn.style.display = 'none'; return; }
  nextBtn.style.display = '';
  if (lvl === hints.length - 2) { nextBtn.textContent = 'REVEAL ANSWER'; nextBtn.classList.add('reveal-answer'); }
}

function openHint() {
  const hints = room().hints[G.stageIdx];
  if (!hints) return;
  const lvl = Math.min(G.hintLevel, hints.length - 1);
  setHintDisplay(lvl, hints);
  document.getElementById('hintModal').classList.add('open');
  G.hintsUsed++;
  G.totalHints++;
  if (G.stageHintLevel < 0) { G.stageHintLevel = 0; addScore(-1); }
}

function moreHint() {
  const hints = room().hints[G.stageIdx];
  G.hintLevel = Math.min(G.hintLevel + 1, hints.length - 1);
  if (G.hintLevel === 1 && G.stageHintLevel < 1) {
    G.stageHintLevel = 1; addScore(-5);
  } else if (G.hintLevel === hints.length - 1 && G.stageHintLevel < hints.length - 1) {
    G.stageHintLevel = hints.length - 1;
    addScore(-15);
    G.totalHints += 3;
    G.hintsUsed  += 3;
  }
  setHintDisplay(G.hintLevel, hints);
}

function closeHint() {
  document.getElementById('hintModal').classList.remove('open');
  G.hintLevel = 0;
  inp.focus();
}


// ─── Input events ────────────────────────────────────────────────────

inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const raw = inp.value.trim();
    if (!raw) return;
    cmdHist.unshift(raw);
    histIdx    = -1;
    inp.value  = '';
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

document.querySelector('.terminal-panel').addEventListener('click', () => inp.focus());

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const roomDone = document.getElementById('roomDone');
    if (roomDone && roomDone.classList.contains('open')) { e.preventDefault(); goNextRoom(); }
  }
});


// ─── Tree state bootstrapping ────────────────────────────────────────
// Missions may need to initialize derived TREE states that reference other
// entries — this is called after data.js has loaded TREE.

if (GAME_CONFIG.initTreeStates) GAME_CONFIG.initTreeStates(TREE);


// ─── Immersion systems ───────────────────────────────────────────────

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
  const dots     = document.querySelectorAll('.sec-dot');
  const statusEl = document.getElementById('secStatus');
  const bypassed = Math.floor(G.roomIdx / 2) + 1;
  const probing  = Math.min(bypassed + 1, 4);
  dots.forEach((dot, i) => {
    dot.className = 'sec-dot';
    if (i < bypassed)      dot.classList.add('active');
    else if (i === bypassed) dot.classList.add('probing');
  });
  if (statusEl && GAME_CONFIG.securityLayerLabel) {
    statusEl.textContent = GAME_CONFIG.securityLayerLabel(bypassed, probing);
  }
}


// ─── Boot sequence ───────────────────────────────────────────────────

function buildEndScreen() {
  const container = document.getElementById('assembledKey');
  if (!container) return;
  container.innerHTML = '';
  G.clues.forEach((clue, i) => {
    const row   = document.createElement('div');
    row.className = 'key-row';
    row.innerHTML = `<span class="key-label">[${clue.label}]</span><span class="key-val"></span>`;
    container.appendChild(row);
    const valEl = row.querySelector('.key-val');
    let ci = 0;
    function typeChar() { if (ci < clue.value.length) { valEl.textContent += clue.value[ci++]; setTimeout(typeChar, 30); } }
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

  const BOOT_LINES = GAME_CONFIG.bootLines || [];
  let idx = 0, skipped = false;

  function hideSkipBtn() {
    const sb = document.getElementById('bootSkipBtn');
    if (sb) { sb.style.visibility = 'hidden'; sb.style.pointerEvents = 'none'; }
  }

  function revealEnd() {
    if (skipped) return;
    hideSkipBtn();
    txBody.style.opacity   = '1';
    txBody.style.transform = 'translateY(0)';
    setTimeout(() => {
      opRow.style.opacity   = '1';
      opRow.style.transform = 'translateY(0)';
      setTimeout(() => {
        enterBtn.style.opacity      = '1';
        enterBtn.style.pointerEvents = '';
        nameInput.focus();
        nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
      }, 300);
    }, 600);
  }

  function skip() {
    if (skipped) return;
    skipped = true;
    hideSkipBtn();
    container.innerHTML = BOOT_LINES.map(l =>
      `<span class="boot-line ${l.cls || 'dim'}">${l.text}</span>`
    ).join('');
    txBody.style.opacity   = '1';
    txBody.style.transform = 'translateY(0)';
    opRow.style.opacity    = '1';
    opRow.style.transform  = 'translateY(0)';
    enterBtn.style.opacity      = '1';
    enterBtn.style.pointerEvents = '';
    nameInput.focus();
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
  }

  function nextLine() {
    if (skipped) return;
    if (idx >= BOOT_LINES.length) { revealEnd(); return; }
    const line = BOOT_LINES[idx++];
    const el   = document.createElement('span');
    el.className = 'boot-line ' + (line.cls || 'dim');
    container.appendChild(el);
    let ci = 0;
    const txt = line.text;
    function typeChar() {
      if (skipped) return;
      if (ci < txt.length) { el.textContent += txt[ci++]; setTimeout(typeChar, 6); }
      else                  { setTimeout(nextLine, line.pause || 120); }
    }
    typeChar();
  }

  nextLine();
  document.addEventListener('keydown', skip, { once: true });
  container.addEventListener('click', skip, { once: true });
  const skipBtn = document.getElementById('bootSkipBtn');
  if (skipBtn) skipBtn.addEventListener('click', skip, { once: true });
}


// ─── Verification quiz ───────────────────────────────────────────────

let quizQuestions = [];
let quizIdx       = 0;
let quizCorrect   = 0;
let quizTimerInt  = null;
let quizTimeLeft  = 20;
let quizAnswered  = false;

function buildQuiz() {
  const pool    = GAME_CONFIG.cmdQuizPool   || {};
  const statics = GAME_CONFIG.staticQuiz    || [];
  const picked  = [];
  const usedKeys = new Set();
  for (const { cmd } of cmdLog) {
    for (const key of Object.keys(pool)) {
      if (!usedKeys.has(key) && (cmd === key || cmd.startsWith(key + ' '))) {
        picked.push(pool[key]);
        usedKeys.add(key);
        break;
      }
    }
    if (picked.length >= 2) break;
  }
  const shuffled = statics.slice().sort(() => 0.5 - Math.random());
  for (const q of shuffled) { if (picked.length >= 4) break; picked.push(q); }
  quizQuestions = picked.slice(0, 4);
  quizIdx       = 0;
  quizCorrect   = 0;

  const speech = document.getElementById('quizFoxSpeech');
  speech.textContent = '';
  const intro = '"I need to know it\'s really you — not someone who got lucky. Prove it."';
  let ci = 0;
  function typeIntro() {
    if (ci < intro.length) { speech.textContent += intro[ci++]; setTimeout(typeIntro, 18); }
    else                   { setTimeout(() => showQuizQuestion(0), 900); }
  }
  document.getElementById('quizBody').style.display   = '';
  document.getElementById('quizResult').style.display = 'none';
  setTimeout(typeIntro, 400);
}

function showQuizQuestion(idx) {
  const q = quizQuestions[idx];
  if (!q) { showQuizResult(); return; }
  quizAnswered = false;
  document.getElementById('quizNum').textContent = `QUESTION ${idx + 1} / ${quizQuestions.length}`;
  document.getElementById('quizQ').textContent   = q.q;
  const fb = document.getElementById('quizFeedback');
  fb.textContent = ''; fb.className = 'quiz-feedback';
  const optsEl = document.getElementById('quizOpts');
  optsEl.innerHTML = '';
  ['A','B','C','D'].forEach((letter, i) => {
    if (i >= q.options.length) return;
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.innerHTML = `<span class="quiz-opt-letter">${letter}</span>${q.options[i]}`;
    btn.addEventListener('click', () => answerQuiz(i));
    optsEl.appendChild(btn);
  });
  startQuizTimer();
}

function startQuizTimer() {
  stopQuizTimer();
  quizTimeLeft = 20;
  updateQuizTimerUI();
  quizTimerInt = setInterval(() => { quizTimeLeft--; updateQuizTimerUI(); if (quizTimeLeft <= 0) answerQuiz(-1); }, 1000);
}

function stopQuizTimer()  { clearInterval(quizTimerInt); quizTimerInt = null; }

function updateQuizTimerUI() {
  const numEl  = document.getElementById('quizTimerNum');
  const fillEl = document.getElementById('quizTimerFill');
  if (!numEl || !fillEl) return;
  numEl.textContent  = '0:' + String(quizTimeLeft).padStart(2, '0');
  fillEl.style.width = ((quizTimeLeft / 20) * 100) + '%';
  fillEl.classList.toggle('urgent', quizTimeLeft <= 7);
}

function answerQuiz(chosen) {
  if (quizAnswered) return;
  quizAnswered = true;
  stopQuizTimer();
  const q       = quizQuestions[quizIdx];
  const correct = chosen === q.correct;
  if (correct) { quizCorrect++; addScore(5); }
  document.querySelectorAll('.quiz-opt-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct)         btn.classList.add('correct');
    else if (i === chosen && !correct) btn.classList.add('wrong');
  });
  const fb     = document.getElementById('quizFeedback');
  const prefix = chosen === -1 ? 'TIME UP — ' : correct ? '✓ CORRECT — ' : '✗ WRONG — ';
  fb.textContent = prefix + q.explain;
  fb.className   = 'quiz-feedback ' + (correct ? 'show-ok' : 'show-err');
  quizIdx++;
  setTimeout(() => { if (quizIdx < quizQuestions.length) showQuizQuestion(quizIdx); else showQuizResult(); }, 2600);
}

function showQuizResult() {
  stopQuizTimer();
  document.getElementById('quizBody').style.display = 'none';
  const total = quizQuestions.length;
  const pct   = quizCorrect / total;
  let verdict;
  if      (pct === 1)   verdict = '"Perfect. Identity confirmed. You didn\'t just get lucky — you know this. The vault is yours."';
  else if (pct >= 0.5)  verdict = '"Close enough. You know the tools that matter. The vault is open."';
  else                  verdict = '"Shaky. But you made it this far. The vault opens. Study up."';
  const speech = document.getElementById('quizFoxSpeech');
  speech.textContent = '';
  let ci = 0;
  function typeVerdict() { if (ci < verdict.length) { speech.textContent += verdict[ci++]; setTimeout(typeVerdict, 14); } }
  setTimeout(typeVerdict, 200);
  document.getElementById('quizResultScore').textContent = `${quizCorrect} / ${total}`;
  document.getElementById('quizResult').style.display = '';
}

function finishQuiz() {
  document.getElementById('quizScreen').classList.remove('open');
  buildEndScreen();
  document.getElementById('endScreen').classList.add('open');
}


// ─── Score submission + leaderboard ──────────────────────────────────

async function submitScore() {
  const btn = document.getElementById('saveScoreBtn');
  btn.textContent = '[ SAVING... ]';
  btn.disabled    = true;
  const totalTime = Math.floor((Date.now() - G.missionStart) / 1000);
  const saved = await saveScore({
    codename:       G.codename,
    totalTime,
    roomsCompleted: G.clues.length,
    hintsUsed:      G.totalHints,
    finalScore:     G.score,
    commandsUsed:   cmdLog.map(e => e.cmd)
  });
  if (saved) {
    btn.style.display = 'none';
    document.getElementById('scoreSaved').style.display = '';
    const board = await getLeaderboard();
    renderLeaderboard(board);
  } else {
    btn.textContent = '[ SAVE FAILED — CHECK CONSOLE ]';
    btn.disabled    = false;
    const section  = document.getElementById('scoreSection');
    let errNote    = section.querySelector('.score-err-note');
    if (!errNote) {
      errNote = document.createElement('div');
      errNote.className = 'score-err-note';
      section.appendChild(errNote);
    }
    errNote.textContent = 'could not write to leaderboard. supabase RLS policies may not be set — check console for details.';
  }
}

function renderLeaderboard(board) {
  const el = document.getElementById('leaderboardRows');
  if (!board || !board.length) {
    el.innerHTML = "<div class=\"lb-empty\">no other scores yet. you're the first operative.</div>";
    return;
  }
  el.innerHTML = board.map((row, i) => {
    const t     = row.total_time || 0;
    const m     = Math.floor(t / 60);
    const s     = String(t % 60).padStart(2, '0');
    const rooms = row.rooms_completed || 0;
    const score = row.final_score != null ? row.final_score : '—';
    return `<div class="lb-row">
      <span class="lb-rank">#${i + 1}</span>
      <span class="lb-name">${row.codename}</span>
      <span class="lb-score">${score}</span>
      <span class="lb-rooms">${rooms}/${ROOMS.length}</span>
    </div>`;
  }).join('');
}


// ─── Resizable panels ────────────────────────────────────────────────

function initResizable() {
  const panels      = document.getElementById('panels');
  const leftHandle  = document.getElementById('resizeLeft');
  const rightHandle = document.getElementById('resizeRight');
  if (!panels || !leftHandle || !rightHandle) return;
  let dragging = null, startX = 0, startW = 0;
  const MIN_SIDE = 120, MIN_CENTER = 280;
  function getSideWidths() {
    const cols = getComputedStyle(panels).gridTemplateColumns.split(' ');
    return { left: parseFloat(cols[0]), right: parseFloat(cols[4]) };
  }
  function startDrag(side, e) {
    dragging = side; startX = e.clientX; startW = getSideWidths()[side];
    leftHandle.classList.toggle('dragging',  side === 'left');
    rightHandle.classList.toggle('dragging', side === 'right');
    document.body.classList.add('resizing-col');
    e.preventDefault();
  }
  leftHandle.addEventListener('mousedown',  e => startDrag('left',  e));
  rightHandle.addEventListener('mousedown', e => startDrag('right', e));
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const total      = panels.offsetWidth - 2;
    const { left, right } = getSideWidths();
    if (dragging === 'left') {
      const newW = Math.max(MIN_SIDE, Math.min(startW + (e.clientX - startX), total - right - MIN_CENTER));
      panels.style.setProperty('--left-w', newW + 'px');
    } else {
      const newW = Math.max(MIN_SIDE, Math.min(startW + (startX - e.clientX), total - left - MIN_CENTER));
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
runBootSequence();


// ─── startGame ───────────────────────────────────────────────────────

let gameStarted = false;
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  const rawName  = (document.getElementById('operativeName').value || '').trim();
  const codename = rawName.replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase() || 'operative';
  G.codename = codename;
  document.getElementById('operativeTag').textContent = `${codename}@${GAME_CONFIG.promptSuffix || 'local:~$'}`;
  document.getElementById('introScreen').style.display = 'none';
  document.getElementById('gameShell').style.display   = 'flex';
  G.missionStart = Date.now();
  G.roomStart    = Date.now();
  startFooterClock();
  loadRoom();
}
