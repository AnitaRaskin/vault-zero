// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — GAME ENGINE (CORE)
// Command parsing, room advancement, quiz, tour, session management.
//
// Load order (all plain scripts, in sequence):
//   config.js → data.js → renderer.js → supabase.js →
//   hashes.js → state.js → audio.js → terminal.js → score.js →
//   police.js → cheatsheet.js → modals.js → editor.js → hints.js →
//   progress.js → resize.js → admin.js → boot.js → engine.js
// ═══════════════════════════════════════════════════════════════════════


// ─── Near-miss detection ─────────────────────────────────────────────

function checkNearMiss(cmd) {
  if (cmd === 'git add')
    return "correct command — but it needs a target. try: git add . (all files) or git add <filename>";
  if (cmd === 'git commit')
    return "correct command — but it needs -m and a message. try: git commit -m \"describe your change\"";
  if (cmd === 'git commit -m')
    return "you need a message in quotes after -m. try: git commit -m \"your message here\"";
  if (cmd === 'git revert')
    return "git revert needs a commit hash. run git log --oneline first, then: git revert <hash>";
  if (cmd === 'git checkout' || cmd === 'git checkout --')
    return "git checkout needs a branch name or commit hash after it";
  if (cmd === 'git switch')
    return "git switch needs a branch name — try: git switch <branchname>";
  if (cmd === 'git checkout -b' || cmd === 'git checkout -B')
    return "git checkout -b needs a new branch name — try: git checkout -b <branchname>";
  if (cmd === 'git switch -c')
    return "git switch -c needs a new branch name — try: git switch -c <branchname>";
  if (cmd === 'git clean')
    return "git clean needs -f to force removal of untracked files — try: git clean -fd";
  if (cmd === 'git log oneline')
    return "close — but the flag needs -- before it. try: git log --oneline";
  if (cmd === 'git branch a')
    return "close — the flag needs - before it. try: git branch -a";
  if (['git stauts', 'git statsu', 'git staus', 'git statuts', 'git sttaus', 'git statu'].includes(cmd))
    return "did you mean: git status?";
  return null;
}


// ─── Free commands (valid git/shell, no penalty, no advance) ─────────

function _freeCommand(cmd) {
  const treeData = (typeof _currentStateKey !== 'undefined' && TREE[_currentStateKey]) || {};
  const branches = treeData.branches || [];
  const extras   = treeData.extras   || [];
  const head     = treeData.HEAD;

  const headBranch = branches.find(b =>
    b.name === head?.ref || (head?.branchY !== undefined && b.y === head?.branchY)
  ) || branches.find(b => !b.dashed) || branches[0];
  const headCI     = head?.ci ?? ((headBranch?.commits.length ?? 1) - 1);
  const headCommit = headBranch?.commits[headCI];
  const branchName = headBranch?.name || 'main';

  const hasStaged   = extras.some(e => e.type === 'staged-indicator');
  const hasDirty    = extras.some(e => e.type === 'dirty-indicator');
  const hasConflict = extras.some(e => e.type === 'conflict-indicator');
  const hasStash    = extras.some(e => e.type === 'stash-indicator');
  const remoteBox   = extras.find(e => e.type === 'remote-box');

  // git status
  if (cmd === 'git status') {
    const o = [['On branch ' + branchName, 'br'], ['', '']];
    if (hasConflict) {
      o.push(['You have unmerged paths.', 'err']);
      o.push(['  (fix conflicts and run "git commit")', 'dim']);
      o.push(['', '']);
      o.push(['Unmerged paths:', 'sys']);
      o.push(['    both modified:   firewall-rules.json', 'err']);
    } else if (hasStaged && hasDirty) {
      o.push(['Changes to be committed:', 'sys']);
      o.push(['    modified:   firewall-rules.json', 'ok']);
      o.push(['', '']);
      o.push(['Changes not staged for commit:', 'sys']);
      o.push(['    modified:   entry-tokens.txt', 'warn']);
    } else if (hasStaged) {
      o.push(['Changes to be committed:', 'sys']);
      o.push(['    modified:   firewall-rules.json', 'ok']);
    } else if (hasDirty) {
      o.push(['Changes not staged for commit:', 'sys']);
      o.push(['    modified:   firewall-rules.json', 'warn']);
    } else {
      o.push(['nothing to commit, working tree clean', 'ok']);
    }
    if (hasStash) { o.push(['', '']); o.push(['stash@{0}: WIP on ' + branchName, 'dim']); }
    return o;
  }

  // git log / git log --oneline
  if (['git log', 'git log --oneline', 'git log -1', 'git log -1 --oneline'].includes(cmd)) {
    if (!headBranch?.commits.length) return [['no commits yet.', 'dim']];
    const oneline = cmd.includes('--oneline');
    const limit   = cmd.includes('-1') ? 1 : Infinity;
    const commits = [...headBranch.commits].reverse().slice(0, limit);
    const o = [];
    commits.forEach((c, i) => {
      const hash = (c.hash || 'a1b2c3d').slice(0, 7);
      const ref  = i === 0 ? ` (HEAD -> ${branchName})` : '';
      const msg  = c.msg || `commit ${headBranch.commits.length - i}`;
      if (oneline) {
        o.push([`${hash}${ref} ${msg}`, i === 0 ? 'cm' : '']);
      } else {
        o.push([`commit ${hash}xxxxxxxxxxxxxxxxxxxxxxx`, 'cm']);
        o.push([`Author: Operative <op@vault-zero.io>`, 'dim']);
        o.push(['', '']);
        o.push([`    ${msg}`, '']);
        o.push(['', '']);
      }
    });
    return o;
  }

  // git log --all --oneline (and --oneline --all)
  if (cmd === 'git log --all --oneline' || cmd === 'git log --oneline --all' ||
      cmd === 'git log --oneline --graph --all' || cmd === 'git log --graph --oneline --all') {
    const seen = new Set();
    const o = [];
    branches.forEach(branch => {
      const isActive = branch === headBranch;
      [...branch.commits].reverse().forEach((c, i) => {
        const hash = (c.hash || 'a1b2c3d').slice(0, 7);
        if (seen.has(hash)) return;
        seen.add(hash);
        const isHd = isActive && i === 0;
        const ref  = isHd ? ` (HEAD -> ${branch.name})` : (i === 0 && !isActive ? ` (${branch.name})` : '');
        o.push([`${hash}${ref} ${c.msg || 'commit'}`, isHd ? 'cm' : '']);
      });
    });
    return o;
  }

  // git branch
  if (cmd === 'git branch') {
    const local = branches.filter(b => !b.dashed);
    if (!local.length) return [['no local branches.', 'dim']];
    return local.map(b => [(b === headBranch ? '* ' : '  ') + b.name, b === headBranch ? 'br' : '']);
  }

  // git branch -a
  if (cmd === 'git branch -a') {
    const o = [];
    branches.filter(b => !b.dashed).forEach(b =>
      o.push([(b === headBranch ? '* ' : '  ') + b.name, b === headBranch ? 'br' : '']));
    branches.filter(b => b.dashed).forEach(b =>
      o.push(['  remotes/' + b.name, 'dim']));
    return o.length ? o : [['(no branches)', 'dim']];
  }

  // git remote -v
  if (cmd === 'git remote -v') {
    const url = remoteBox
      ? 'https://syndicate-server.vault/access-system.git'
      : 'https://operative.vault/access-system.git';
    if (!remoteBox && !branches.some(b => b.dashed)) return [['fatal: no remotes configured.', 'err']];
    return [
      ['origin  ' + url + ' (fetch)', 'sys'],
      ['origin  ' + url + ' (push)',  'sys'],
    ];
  }

  // git diff / git diff --staged / git diff --cached
  if (cmd === 'git diff' || cmd === 'git diff --staged' || cmd === 'git diff --cached') {
    const isStaged = cmd !== 'git diff';
    const hasChange = isStaged ? hasStaged : hasDirty;
    if (!hasChange) return [['(no changes)', 'dim']];
    return [
      ['diff --git a/firewall-rules.json b/firewall-rules.json', 'dim'],
      ['@@ -1,4 +1,4 @@', 'dim'],
      ['-  "access": "locked"', 'err'],
      ['+  "access": "open"', 'ok'],
    ];
  }

  // git stash list
  if (cmd === 'git stash list') {
    if (!hasStash) return [];
    const hash = (headCommit?.hash || 'a1b2c3d').slice(0, 7);
    return [['stash@{0}: WIP on ' + branchName + ': ' + hash + ' ' + (headCommit?.msg || 'latest'), 'sys']];
  }

  // git show / git show HEAD
  if (cmd === 'git show' || cmd === 'git show HEAD') {
    if (!headCommit) return [['nothing to show.', 'dim']];
    const hash = (headCommit.hash || 'a1b2c3d').slice(0, 7);
    return [
      [`commit ${hash}xxxxxxxxxxxxxxxxxxxxxxx`, 'cm'],
      [`Author: Operative <op@vault-zero.io>`, 'dim'],
      ['', ''],
      [`    ${headCommit.msg || 'commit'}`, ''],
    ];
  }

  // ls
  if (cmd === 'ls' || cmd === 'ls -la' || cmd === 'ls -l' || cmd === 'ls -a') {
    return [
      ['README.md', 'sys'],
      ['.gitignore', 'dim'],
      ['vault.txt', 'sys'],
      ['access-routes.json', 'sys'],
      ['firewall-rules.json', 'sys'],
    ];
  }

  // pwd / whoami / git --version
  if (cmd === 'pwd')                                     return [['/home/operative/access-system', 'sys']];
  if (cmd === 'whoami')                                  return [['operative', 'sys']];
  if (cmd === 'git --version' || cmd === 'git version') return [['git version 2.42.0', 'sys']];
  if (cmd === 'echo $?')                                 return [['0', 'sys']];

  return null;
}


// ─── Command parsing ─────────────────────────────────────────────────

function normalise(s) { return s.trim().replace(/\s+/g, ' '); }

function parseCmd(raw) {
  const cmd = normalise(raw);
  const s   = stage();

  // Universal commands
  if (cmd === 'clear') { out.innerHTML = ''; return {}; }
  if (cmd === 'hint')  { openHint(); return {}; }
  if (cmd === '//jump') {
    if (!G.isAdmin) { tprint([['access denied.', 'err']]); return {}; }
    toggleAdminPanel(); return {};
  }
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

  // Free commands — valid git/shell commands accepted without penalty or advancement
  const freeOut = _freeCommand(cmd);
  if (freeOut !== null) { tprint(freeOut); return {}; }

  // Near-miss detection — targeted feedback before the generic fallback
  const nearMiss = checkNearMiss(cmd);
  if (nearMiss) {
    tprint([[nearMiss, 'warn']]);
    flashTerminal();
    countWrong();
    return {};
  }

  tprint([["command not recognized in this environment. type 'help' for available commands.", 'warn']]);
  flashTerminal();
  countWrong();
  return {};
}


// ─── Advancement ─────────────────────────────────────────────────────

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
          inp.focus();
        });
      }, 800);
    } else {
      setTimeout(() => triggerPolice(true), 1400);
    }
  }
  inp.focus();
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
      if (stage().conceptBrief) maybeShowConceptBrief(stage().conceptBrief, loadNextStageUI);
      else                       loadNextStageUI();
    }, 700);
  }
}

function saveFullProgress() {
  if (G.roomIdx + 1 >= ROOMS.length) return;
  localStorage.setItem('vz_save', JSON.stringify({
    roomIdx:    G.roomIdx + 1,
    score:      G.score,
    clues:      G.clues,
    cmdLog:     cmdLog,
    totalHints: G.totalHints,
    elapsed:    Date.now() - G.missionStart
  }));
}

function completeRoom() {
  const t = Math.floor((Date.now() - G.roomStart) / 1000);
  const m = Math.floor(t / 60);
  const s = (t % 60).toString().padStart(2, '0');
  const completionMsg = room().stages[room().stages.length - 1].completionMsg || 'room cleared.';
  G.savedProgress[`room${room().id}`] = { complete: true, hints: G.hintsUsed, time: t };
  localStorage.setItem('vz_progress', JSON.stringify(G.savedProgress));
  saveFullProgress();
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
    [`  ║  ROOM ${r.id}: ${r.name.padEnd(28)}║`, 'hl'],
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
    if (_tourPending) {
      startTour();
    } else if (s.conceptBrief) {
      maybeShowConceptBrief(s.conceptBrief, loadNextStageUI);
    } else {
      loadNextStageUI();
    }
  }, 400);
  inp.focus();
}


// ─── Immersion ───────────────────────────────────────────────────────

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


// ─── End screen ──────────────────────────────────────────────────────

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
    commandsUsed:   cmdLog.map(e => e.cmd),
    userId:         G.userId || null
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
      <span class="lb-time">${m}:${s}</span>
      <span class="lb-rooms">${rooms}/${ROOMS.length}</span>
    </div>`;
  }).join('');
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
    if (picked.length >= 4) break;
  }
  const shuffled = statics.slice().sort(() => 0.5 - Math.random());
  for (const q of shuffled) { if (picked.length >= 7) break; picked.push(q); }
  quizQuestions = picked.slice(0, 7);
  quizIdx       = 0;
  quizCorrect   = 0;

  const speech = document.getElementById('quizFoxSpeech');
  speech.textContent = '';
  const intro = '"I need to know it\'s really you — not someone who got lucky. Prove it."';
  let ci = 0;
  function typeIntro() {
    if (ci < intro.length) { speech.textContent += intro[ci++]; setTimeout(typeIntro, 18); }
    else {
      setTimeout(() => {
        const sw = document.getElementById('quizStartWrap');
        if (sw) sw.style.display = '';
      }, 400);
    }
  }
  document.getElementById('quizBody').style.display   = 'none';
  document.getElementById('quizResult').style.display = 'none';
  const startWrap = document.getElementById('quizStartWrap');
  if (startWrap) startWrap.style.display = 'none';
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
  quizTimeLeft = 30;
  updateQuizTimerUI();
  quizTimerInt = setInterval(() => { quizTimeLeft--; updateQuizTimerUI(); if (quizTimeLeft <= 0) answerQuiz(-1); }, 1000);
}

function stopQuizTimer()  { clearInterval(quizTimerInt); quizTimerInt = null; }

function updateQuizTimerUI() {
  const numEl  = document.getElementById('quizTimerNum');
  const fillEl = document.getElementById('quizTimerFill');
  if (!numEl || !fillEl) return;
  numEl.textContent  = '0:' + String(quizTimeLeft).padStart(2, '0');
  fillEl.style.width = ((quizTimeLeft / 30) * 100) + '%';
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
    if (i === q.correct)               btn.classList.add('correct');
    else if (i === chosen && !correct) btn.classList.add('wrong');
  });
  const fb     = document.getElementById('quizFeedback');
  const prefix = chosen === -1 ? 'TIME UP — ' : correct ? '✓ CORRECT — ' : '✗ WRONG — ';
  fb.textContent = prefix + q.explain;
  fb.className   = 'quiz-feedback ' + (correct ? 'show-ok' : 'show-err');
  quizIdx++;
  const nextBtn = document.getElementById('quizNextBtn');
  if (nextBtn) {
    nextBtn.textContent = quizIdx < quizQuestions.length ? 'NEXT QUESTION →' : 'SEE RESULTS →';
    nextBtn.style.display = '';
  }
}

function nextQuizStep() {
  const nextBtn = document.getElementById('quizNextBtn');
  if (nextBtn) nextBtn.style.display = 'none';
  if (quizIdx < quizQuestions.length) showQuizQuestion(quizIdx);
  else showQuizResult();
}

function startQuiz() {
  const sw = document.getElementById('quizStartWrap');
  if (sw) sw.style.display = 'none';
  document.getElementById('quizBody').style.display = '';
  showQuizQuestion(0);
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
  localStorage.removeItem('vz_save');
  document.getElementById('quizScreen').classList.remove('open');
  buildEndScreen();
  document.getElementById('endScreen').classList.add('open');
}


// ─── First-run tour ──────────────────────────────────────────────────

const TOUR_STEPS = [
  {
    sel: '.fox-panel',
    pos: 'right',
    title: 'FOX // COMMS',
    body: 'Your encrypted contact. Fox briefs you stage by stage — read her message before you type anything.'
  },
  {
    sel: '.terminal-panel',
    pos: 'right',
    title: 'TERMINAL',
    body: 'Type real Git commands here. Real-looking output, real feedback. No clicking — only typing.'
  },
  {
    sel: '.tree-panel',
    pos: 'left',
    title: 'REPO STATE',
    body: 'A live SVG of your repo. Branches, commits, HEAD — watch it update as you work.'
  },
  {
    sel: 'button[onclick*="openHint"]',
    pos: 'bottom',
    title: '[CMD: HINT]',
    body: 'Stuck? Three hint levels available — nudge, method, full explanation. Each one costs points, so use them wisely.'
  },
  {
    sel: 'button[onclick*="openCheatSheet"]',
    pos: 'bottom',
    title: '[CMD: LOG]',
    body: 'Every command you type is recorded here. Download it as a cheat sheet when the heist is done.'
  },
  {
    sel: '#scoreChip',
    pos: 'bottom',
    title: 'SCORE',
    body: 'Earn points for each stage. Deductions for hints and wrong answers. Finish the heist and save to the leaderboard.'
  },
];

let _tourStep    = 0;
let _tourPending = false;

function startTour() {
  _tourStep = 0;
  document.getElementById('tourOverlay').style.display = 'block';
  ['tourDimTop','tourDimBottom','tourDimLeft','tourDimRight','tourSpotlight','tourTooltip'].forEach(id => {
    document.getElementById(id).style.transition = 'none';
  });
  showTourStep(0);
  requestAnimationFrame(() => {
    ['tourDimTop','tourDimBottom','tourDimLeft','tourDimRight','tourSpotlight','tourTooltip'].forEach(id => {
      document.getElementById(id).style.transition = '';
    });
  });
  document.addEventListener('keydown', _tourKeyHandler);
}

function _tourKeyHandler(e) {
  if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextTourStep();
  } else if (e.key === 'Escape') {
    skipTour();
  }
}

function showTourStep(i) {
  const step = TOUR_STEPS[i];
  const el   = document.querySelector(step.sel);
  if (!el) { nextTourStep(); return; }

  const PAD  = 8;
  const TW   = 270;
  const TH   = 175;
  const GAP  = 14;
  const rect = el.getBoundingClientRect();
  const vw   = window.innerWidth;
  const vh   = window.innerHeight;

  const l = rect.left - PAD, t = rect.top - PAD;
  const r = rect.right + PAD, b = rect.bottom + PAD;
  function setDim(id, left, top, width, height) {
    const st = document.getElementById(id).style;
    st.left = left + 'px'; st.top = top + 'px';
    st.width = width + 'px'; st.height = height + 'px';
  }
  setDim('tourDimTop',    0, 0,   vw,     t);
  setDim('tourDimBottom', 0, b,   vw,     vh - b);
  setDim('tourDimLeft',   0, t,   l,      b - t);
  setDim('tourDimRight',  r, t,   vw - r, b - t);

  const sp = document.getElementById('tourSpotlight');
  sp.style.left   = l + 'px';
  sp.style.top    = t + 'px';
  sp.style.width  = (r - l) + 'px';
  sp.style.height = (b - t) + 'px';

  let tl, ttop;
  if (step.pos === 'right') {
    tl   = r + GAP;
    ttop = Math.max(16, Math.min(t, vh - TH - 16));
  } else if (step.pos === 'left') {
    tl   = l - GAP - TW;
    ttop = Math.max(16, Math.min(t, vh - TH - 16));
  } else {
    tl   = Math.max(16, Math.min(l, vw - TW - 16));
    ttop = b + GAP;
  }

  const tt = document.getElementById('tourTooltip');
  tt.style.left = tl + 'px';
  tt.style.top  = ttop + 'px';

  document.getElementById('tourStepNum').textContent = `STEP ${i + 1} / ${TOUR_STEPS.length}`;
  document.getElementById('tourTtTitle').textContent  = step.title;
  document.getElementById('tourTtBody').textContent   = step.body;
  document.getElementById('tourNextBtn').textContent  = (i === TOUR_STEPS.length - 1) ? 'DONE ✓' : 'NEXT →';
}

function nextTourStep() {
  _tourStep++;
  if (_tourStep >= TOUR_STEPS.length) {
    skipTour();
  } else {
    showTourStep(_tourStep);
  }
}

function skipTour() {
  localStorage.setItem('vz_tour_done', '1');
  _tourPending = false;
  document.getElementById('tourOverlay').style.display = 'none';
  document.removeEventListener('keydown', _tourKeyHandler);
  const s = stage();
  if (s && s.conceptBrief) maybeShowConceptBrief(s.conceptBrief, loadNextStageUI);
  else loadNextStageUI();
}


// ─── Input events ────────────────────────────────────────────────────

let cmdHist = [], histIdx = -1;

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

document.querySelector('.terminal-panel').addEventListener('click', () => {
  if (!window.getSelection()?.toString()) inp.focus();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const roomDone = document.getElementById('roomDone');
    if (roomDone && roomDone.classList.contains('open')) { e.preventDefault(); goNextRoom(); }
  }
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); if (G.isAdmin) toggleAdminPanel(); }
});


// ─── Leave room ───────────────────────────────────────────────────────

function openLeaveModal()  { document.getElementById('leaveModal').classList.add('open'); }
function closeLeaveModal() { document.getElementById('leaveModal').classList.remove('open'); }
function leaveRoom() {
  localStorage.removeItem('vz_progress');
  window.location.href = '../../index.html';
}


// ─── Boot & start ────────────────────────────────────────────────────

let gameStarted      = false;
let _pendingCodename = '';
let _pendingSave     = null;

function startGame() {
  if (gameStarted) return;
  const rawName  = (document.getElementById('operativeName').value || '').trim();
  const codename = rawName.replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase() || 'operative';
  const save     = JSON.parse(localStorage.getItem('vz_save') || 'null');
  if (save && save.roomIdx > 0 && save.roomIdx < ROOMS.length) {
    _pendingCodename = codename;
    _pendingSave     = save;
    document.getElementById('resumeRoomNum').textContent    = save.roomIdx;
    document.getElementById('resumeRoomsTotal').textContent = ROOMS.length;
    document.getElementById('resumeScore').textContent      = save.score || 0;
    document.getElementById('resumeModal').classList.add('open');
    return;
  }
  gameStarted = true;
  _launchGame(codename, 0, true);
}

function doResume() {
  if (gameStarted) return;
  gameStarted = true;
  document.getElementById('resumeModal').classList.remove('open');
  const save   = _pendingSave;
  G.roomIdx    = save.roomIdx;
  G.score      = save.score      || 0;
  G.clues      = save.clues      || [];
  cmdLog       = save.cmdLog     || [];
  G.totalHints = save.totalHints || 0;
  document.getElementById('scoreVal').textContent = G.score;
  _launchGame(_pendingCodename, save.elapsed || 0, false);
}

function doStartFresh() {
  if (gameStarted) return;
  gameStarted = true;
  document.getElementById('resumeModal').classList.remove('open');
  localStorage.removeItem('vz_save');
  _launchGame(_pendingCodename, 0, true);
}

function _launchGame(codename, elapsed, showTour) {
  G.codename = codename;
  document.getElementById('operativeTag').textContent = `${codename}@${GAME_CONFIG.promptSuffix || 'local:~$'}`;
  document.getElementById('introScreen').style.display = 'none';
  document.getElementById('gameShell').style.display   = 'flex';
  G.missionStart = Date.now() - elapsed;
  G.roomStart    = Date.now();
  startFooterClock();
  if (showTour) {
    _tourPending = true;
    localStorage.removeItem('vz_tour_done');
    localStorage.removeItem('vz_brief_0_0'); // always show git repo brief on fresh start
  }
  loadRoom();
}


// ─── Session check on load ────────────────────────────────────────────

(async function () {
  if (typeof getSessionUser !== 'function') return;
  const user = await getSessionUser();
  if (!user) return;
  G.userId = user.userId;
  G.isAuthenticated = true;
  G.isAdmin = user.role === 'admin';
  const nameEl = document.getElementById('operativeName');
  if (nameEl && user.codename) {
    nameEl.value    = user.codename;
    nameEl.readOnly = true;
  }
})();


// ─── Mission tree state initialisation + boot ─────────────────────────

if (GAME_CONFIG.initTreeStates) GAME_CONFIG.initTreeStates(TREE);

initResizable();
runBootSequence();
