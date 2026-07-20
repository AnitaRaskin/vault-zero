import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── jsdom setup ──────────────────────────────────────────────────────
// Each script tag in jsdom runs in its own vm invocation, so const/let
// variables don't become window properties.  We fix this by appending a
// small "bridge" snippet to the END of each loaded file — it runs in the
// same script scope, so it CAN read those variables and push them to
// window under a _prefix.

function buildDOM() {
  return `<!DOCTYPE html><html><body>
    <div id="termOut"></div><input id="termInput">
    <div class="terminal-panel">
      <div id="foxMessages"></div><div id="policeAlert"></div>
      <div id="policeCountdown"></div>
      <div id="policeBarFill" style="width:0"></div>
      <div id="policeVignette"></div>
    </div>
    <div id="bootTerminal"></div>
    <div id="txBody" style="opacity:0"></div>
    <div id="operativeRow" style="opacity:0"></div>
    <button id="enterBtn" style="opacity:0;pointer-events:none"></button>
    <input id="operativeName"><button id="bootSkipBtn"></button>
    <div id="panels">
      <div></div><div id="resizeLeft"></div>
      <div></div><div id="resizeRight"></div><div></div>
    </div>
    <div id="scoreChip"><span id="scoreVal">0</span></div>
    <div id="hintModal">
      <div id="hintLvl"></div><div id="hintProgressBar"></div>
      <div id="hintTxt"></div><button id="nextHintBtn"></button>
    </div>
    <div id="cheatSheet"><div id="cheatList"></div></div>
    <div id="roomInfo"></div><div id="progressFill"></div>
    <div id="activeBranch"></div><div id="footerClock"></div>
    <div id="secStatus"></div><div class="sec-dot"></div>
    <div id="roomDone">
      <div id="doneStats"></div><div id="doneMsg"></div>
      <div id="clueFragment">
        <div id="clueKey"></div><div id="clueVal"></div><div id="clueCount"></div>
      </div>
    </div>
    <div id="endScreen"><div id="assembledKey"></div></div>
    <div id="quizScreen">
      <div id="quizFoxSpeech"></div>
      <div id="quizBody">
        <div id="quizNum"></div><div id="quizQ"></div>
        <div id="quizOpts"></div><div id="quizFeedback"></div>
        <div id="quizTimerNum"></div><div id="quizTimerFill"></div>
        <div id="quizResult" style="display:none"><div id="quizResultScore"></div></div>
      </div>
    </div>
    <div id="scoreSection">
      <button id="saveScoreBtn"></button>
      <div id="scoreSaved" style="display:none"></div>
      <div id="leaderboardRows"></div>
    </div>
    <div id="introScreen"></div>
    <div id="gameShell" style="display:none"></div>
    <span id="operativeTag"></span>
    <div id="fileEditor">
      <div id="editorTitle"></div><div id="editorHint"></div>
      <textarea id="fileContent"></textarea>
    </div>
  </body></html>`;
}

// Shared references — set in before(), used across all describe blocks
let G, H, ROOMS, CMD_QUIZ_POOL, STATIC_QUIZ, CMD_DESCRIPTIONS, cmdLog;
let win; // jsdom window

before(() => {
  const dom = new JSDOM(buildDOM(), {
    runScripts:        'dangerously',
    pretendToBeVisual: true,
    url:               'http://localhost/',
  });

  win = dom.window;

  // Stub browser APIs
  const noop = () => ({});
  win.AudioContext = function () {
    return {
      state: 'running', sampleRate: 44100, currentTime: 0, destination: {},
      resume:             () => Promise.resolve(),
      createBuffer:       (ch, len) => ({ getChannelData: () => new Float32Array(len) }),
      createBufferSource: ()        => ({ connect: noop, start: noop, buffer: null }),
      createBiquadFilter: ()        => ({ connect: noop, type: '', frequency: { value: 0 }, Q: { value: 0 } }),
      createGain:         ()        => ({ connect: noop, gain: { setValueAtTime: noop } }),
    };
  };
  win.webkitAudioContext       = win.AudioContext;
  win.SpeechSynthesisUtterance = function (t) { this.text = t; };
  win.speechSynthesis          = { speak: () => {}, cancel: () => {} };
  win.renderTree               = () => {};

  // Append bridge code to each file so it runs in the same script scope,
  // giving it access to const/let variables and pushing them to window.
  const inject = (file, bridge) => {
    const s = win.document.createElement('script');
    s.textContent = readFileSync(resolve(__dir, '..', file), 'utf8') + '\n' + bridge;
    win.document.head.appendChild(s);
  };

  inject('missions/git-heist/config.js', '');

  inject('missions/git-heist/data.js', `
    window._ROOMS  = ROOMS;
    window._TREE   = TREE;
  `);

  inject('js/engine.js', `
    window._G              = G;
    window._H              = H;
    window._cmdLog         = cmdLog;
    window._CMD_QUIZ_POOL  = GAME_CONFIG.cmdQuizPool;
    window._STATIC_QUIZ    = GAME_CONFIG.staticQuiz;
    window._CMD_DESC       = GAME_CONFIG.cmdDescriptions;
    // Getters for primitives that get re-assigned (let, not const)
    window._getQuizQs      = () => quizQuestions;
    window._getQuizIdx     = () => quizIdx;
    window._getQuizCorrect = () => quizCorrect;
    // Reset helper — runs inside engine scope so it can mutate all vars
    window._resetG = function() {
      G.roomIdx       = 0;  G.stageIdx      = 0;
      G.hintsUsed     = 0;  G.totalHints    = 0;
      G.hintLevel     = 0;  G.score         = 0;
      G.stageWrongs   = 0;  G.stageHintLevel = -1;
      G.fileEditDone  = false;
      cmdLog.length   = 0;
      if (policeActive) clearPolice(true);
    };
  `);

  // Object/array refs — mutations from tests propagate back into engine scope
  G              = win._G;
  H              = win._H;
  ROOMS          = win._ROOMS;
  cmdLog         = win._cmdLog;
  CMD_QUIZ_POOL  = win._CMD_QUIZ_POOL;
  STATIC_QUIZ    = win._STATIC_QUIZ;
  CMD_DESCRIPTIONS = win._CMD_DESC;
});

function resetG() { win._resetG(); }


// ─── normalise() ──────────────────────────────────────────────────────

describe('normalise()', () => {
  test('trims leading whitespace',    () => assert.equal(win.normalise('  git status'), 'git status'));
  test('trims trailing whitespace',   () => assert.equal(win.normalise('git status  '), 'git status'));
  test('collapses interior spaces',   () => assert.equal(win.normalise('git  log   --oneline'), 'git log --oneline'));
  test('handles tabs',                () => assert.equal(win.normalise('\tgit status\t'), 'git status'));
  test('leaves clean string as-is',   () => assert.equal(win.normalise('git checkout -b main'), 'git checkout -b main'));
  test('returns empty string intact', () => assert.equal(win.normalise(''), ''));
});


// ─── genHash() ────────────────────────────────────────────────────────

describe('genHash()', () => {
  test('returns 7 characters',          () => assert.equal(win.genHash().length, 7));
  test('only lowercase hex characters', () => assert.match(win.genHash(), /^[0-9a-f]{7}$/));
  test('generates different values',    () => {
    const hashes = new Set(Array.from({ length: 30 }, win.genHash));
    assert.ok(hashes.size > 1, 'all 30 hashes are identical');
  });
});


// ─── interp() ─────────────────────────────────────────────────────────

describe('interp()', () => {
  test('passes non-strings through unchanged', () => {
    assert.equal(win.interp(42),   42);
    assert.equal(win.interp(null), null);
  });
  test('replaces {{H1}} with session hash', () => {
    const r = win.interp('checkout {{H1}}');
    assert.ok(!r.includes('{{H1}}'));
    assert.match(r, /^checkout [0-9a-f]{7}$/);
  });
  test('replaces all eight placeholders', () => {
    const r = win.interp('{{H1}} {{H2}} {{H3}} {{H4}} {{H5}} {{H6}} {{H7}} {{H8}}');
    assert.ok(!r.includes('{{H'), 'some placeholders not replaced');
    r.split(' ').forEach(p => assert.match(p, /^[0-9a-f]{7}$/, `not a hash: ${p}`));
  });
  test('leaves strings without placeholders unchanged', () => {
    assert.equal(win.interp('git status'), 'git status');
  });
  test('H[1]–H[8] are all valid 7-char hex hashes', () => {
    for (let i = 1; i <= 8; i++) assert.match(H[i], /^[0-9a-f]{7}$/, `H[${i}]`);
  });
  test('all H values are unique', () => {
    const vals = H.slice(1);
    assert.equal(new Set(vals).size, vals.length, 'duplicate hashes generated');
  });
});


// ─── logCmd() ─────────────────────────────────────────────────────────

describe('logCmd()', () => {
  test('adds a known command', () => {
    cmdLog.length = 0;
    win.logCmd('git status');
    assert.equal(cmdLog.length, 1);
    assert.equal(cmdLog[0].cmd, 'git status');
  });
  test('ignores unknown commands', () => {
    cmdLog.length = 0;
    win.logCmd('rm -rf /');
    assert.equal(cmdLog.length, 0);
  });
  test('deduplicates — same command not added twice', () => {
    cmdLog.length = 0;
    win.logCmd('git status'); win.logCmd('git status');
    assert.equal(cmdLog.length, 1);
  });
  test('prefix match — command with args matches base key', () => {
    cmdLog.length = 0;
    win.logCmd('git checkout operative/entry-window');
    assert.equal(cmdLog.length, 1);
    assert.equal(cmdLog[0].cmd, 'git checkout');
  });
  test('accumulates multiple distinct commands', () => {
    cmdLog.length = 0;
    win.logCmd('git status'); win.logCmd('git log --oneline'); win.logCmd('git stash');
    assert.equal(cmdLog.length, 3);
  });
  test('each entry has a non-empty desc string', () => {
    cmdLog.length = 0;
    win.logCmd('git status');
    assert.ok(typeof cmdLog[0].desc === 'string' && cmdLog[0].desc.length > 0);
  });
});


// ─── ROOMS data integrity ─────────────────────────────────────────────

describe('ROOMS data integrity', () => {
  test('room count matches ROOMS.length', () => assert.equal(ROOMS.length, ROOMS[ROOMS.length - 1].id + 1));
  test('ids are sequential from 0', () => {
    ROOMS.forEach((r, i) => assert.equal(r.id, i, `Room at index ${i} has id ${r.id}`));
  });
  test('every room has a non-empty name', () => {
    ROOMS.forEach(r => assert.ok(r.name?.length > 0, `Room ${r.id}`));
  });
  test('every room has a non-empty stages array', () => {
    ROOMS.forEach(r => assert.ok(Array.isArray(r.stages) && r.stages.length > 0, `Room ${r.id}`));
  });
  test('every room has a non-empty hints array', () => {
    ROOMS.forEach(r => assert.ok(Array.isArray(r.hints) && r.hints.length > 0, `Room ${r.id}`));
  });
  test('hints.length matches stages.length in every room', () => {
    ROOMS.forEach(r => assert.equal(r.hints.length, r.stages.length,
      `Room ${r.id} "${r.name}": ${r.hints.length} hint sets vs ${r.stages.length} stages`));
  });
  test('every hint set has exactly 3 levels', () => {
    ROOMS.forEach(r => r.hints.forEach((h, si) =>
      assert.equal(h.length, 3, `Room ${r.id} stage ${si}: ${h.length} hint levels`)));
  });
  test('every stage has a non-empty accepted array', () => {
    ROOMS.forEach(r => r.stages.forEach((s, si) =>
      assert.ok(Array.isArray(s.accepted) && s.accepted.length > 0, `Room ${r.id} stage ${si}`)));
  });
  test('every stage has foxMsg or foxMessage', () => {
    ROOMS.forEach(r => r.stages.forEach((s, si) =>
      assert.ok(s.foxMsg || s.foxMessage, `Room ${r.id} stage ${si} missing fox message`)));
  });
  test('every room has a clue with label and value', () => {
    ROOMS.forEach(r => {
      assert.ok(r.clue?.label?.length > 0, `Room ${r.id} missing clue.label`);
      assert.ok(r.clue?.value?.length > 0, `Room ${r.id} missing clue.value`);
    });
  });
  test('all clue labels are unique', () => {
    const labels = ROOMS.map(r => r.clue.label);
    assert.equal(new Set(labels).size, labels.length, `duplicate clue labels: ${labels}`);
  });
});


// ─── Quiz pool data integrity ─────────────────────────────────────────

describe('Quiz pool data integrity', () => {
  test('CMD_QUIZ_POOL: every entry has required fields', () => {
    Object.entries(CMD_QUIZ_POOL).forEach(([cmd, q]) => {
      assert.ok(typeof q.q       === 'string', `${cmd}: missing q`);
      assert.ok(Array.isArray(q.options),      `${cmd}: missing options`);
      assert.ok(typeof q.correct === 'number', `${cmd}: correct not a number`);
      assert.ok(typeof q.explain === 'string', `${cmd}: missing explain`);
    });
  });
  test('CMD_QUIZ_POOL: correct index is in bounds', () => {
    Object.entries(CMD_QUIZ_POOL).forEach(([cmd, q]) =>
      assert.ok(q.correct >= 0 && q.correct < q.options.length,
        `${cmd}: correct=${q.correct} but ${q.options.length} options`));
  });
  test('CMD_QUIZ_POOL: all keys are known CMD_DESCRIPTIONS keys', () => {
    Object.keys(CMD_QUIZ_POOL).forEach(key =>
      assert.ok(key in CMD_DESCRIPTIONS, `quiz pool key "${key}" not in CMD_DESCRIPTIONS`));
  });
  test('STATIC_QUIZ: all entries have required fields', () => {
    STATIC_QUIZ.forEach((q, i) => {
      assert.ok(typeof q.q       === 'string', `static[${i}]: missing q`);
      assert.ok(Array.isArray(q.options),      `static[${i}]: missing options`);
      assert.ok(typeof q.correct === 'number', `static[${i}]: correct not a number`);
      assert.ok(typeof q.explain === 'string', `static[${i}]: missing explain`);
    });
  });
  test('STATIC_QUIZ: every correct index is in bounds', () => {
    STATIC_QUIZ.forEach((q, i) =>
      assert.ok(q.correct >= 0 && q.correct < q.options.length,
        `static[${i}]: correct=${q.correct} out of ${q.options.length}`));
  });
});


// ─── buildQuiz() ──────────────────────────────────────────────────────

describe('buildQuiz()', () => {
  test('produces exactly 4 questions with empty cmdLog', () => {
    resetG();
    win.buildQuiz();
    assert.equal(win._getQuizQs().length, 4);
  });
  test('picks a dynamic question from cmdLog', () => {
    resetG();
    cmdLog.push({ cmd: 'git stash', desc: CMD_DESCRIPTIONS['git stash'] });
    win.buildQuiz();
    assert.ok(win._getQuizQs().some(q => q === CMD_QUIZ_POOL['git stash']),
      'stash question not selected despite being in cmdLog');
  });
  test('caps dynamic questions at 2 even with large cmdLog', () => {
    resetG();
    ['git stash', 'git push', 'git pull', 'git revert', 'git checkout'].forEach(cmd =>
      cmdLog.push({ cmd, desc: '' }));
    win.buildQuiz();
    assert.equal(win._getQuizQs().length, 4);
    const dynamic = win._getQuizQs().filter(q => Object.values(CMD_QUIZ_POOL).includes(q));
    assert.ok(dynamic.length <= 2, `${dynamic.length} dynamic questions, max is 2`);
  });
  test('no duplicate questions in quiz', () => {
    resetG();
    win.buildQuiz();
    const qs = win._getQuizQs();
    assert.equal(new Set(qs).size, qs.length, 'duplicates found');
  });
  test('resets quizIdx and quizCorrect to 0', () => {
    resetG();
    win.buildQuiz();
    assert.equal(win._getQuizIdx(),     0);
    assert.equal(win._getQuizCorrect(), 0);
  });
});


// ─── addScore() ───────────────────────────────────────────────────────

describe('addScore()', () => {
  test('increments G.score', () => {
    resetG(); G.score = 10;
    win.addScore(5);
    assert.equal(G.score, 15);
  });
  test('decrements G.score', () => {
    resetG(); G.score = 20;
    win.addScore(-5);
    assert.equal(G.score, 15);
  });
  test('floor is 0 — score never goes negative', () => {
    resetG(); G.score = 3;
    win.addScore(-100);
    assert.equal(G.score, 0);
  });
  test('delta of 0 leaves score unchanged', () => {
    resetG(); G.score = 42;
    win.addScore(0);
    assert.equal(G.score, 42);
  });
  test('cumulative additions are correct', () => {
    resetG();
    win.addScore(10); win.addScore(10); win.addScore(10);
    assert.equal(G.score, 30);
  });
});


// ─── saveFile() ───────────────────────────────────────────────────────

describe('saveFile()', () => {
  function setContent(val) {
    win.document.getElementById('fileContent').value = val;
  }

  // Regular edit — Room 3 Stage 3 (security-config.json)
  test('regular edit: correct value → fileEditDone = true', () => {
    resetG();
    G.roomIdx = 3; G.stageIdx = 3;
    setContent('{"maintenance_window": "02:00"}');
    win.saveFile();
    assert.ok(G.fileEditDone);
  });
  test('regular edit: wrong value → fileEditDone stays false', () => {
    resetG();
    G.roomIdx = 3; G.stageIdx = 3;
    setContent('{"maintenance_window": null}');
    win.saveFile();
    assert.ok(!G.fileEditDone);
  });

  // Conflict resolution — Room 5 Stage 1 (entry-tokens.txt)
  test('conflict: fully resolved → fileEditDone = true', () => {
    resetG();
    G.roomIdx = 5; G.stageIdx = 1;
    setContent('{"entry_tokens": ["tok_operative_7a2f", "tok_crew_3b1e", "tok_override_9x77"]}');
    win.saveFile();
    assert.ok(G.fileEditDone);
  });
  test('conflict: markers still present → fileEditDone stays false', () => {
    resetG();
    G.roomIdx = 5; G.stageIdx = 1;
    setContent('<<<<<<< HEAD\ntok_a\n=======\ntok_b\n>>>>>>> origin/main\ntok_override_9x77');
    win.saveFile();
    assert.ok(!G.fileEditDone);
  });
  test('conflict: missing tok_override_9x77 → fileEditDone stays false', () => {
    resetG();
    G.roomIdx = 5; G.stageIdx = 1;
    setContent('{"entry_tokens": ["tok_operative_7a2f", "tok_crew_3b1e"]}');
    win.saveFile();
    assert.ok(!G.fileEditDone);
  });
});


// ─── parseCmd() ───────────────────────────────────────────────────────

describe('parseCmd()', () => {
  test('"clear" empties terminal output', () => {
    resetG();
    win.document.getElementById('termOut').innerHTML = '<div>old line</div>';
    win.parseCmd('clear');
    assert.equal(win.document.getElementById('termOut').innerHTML, '');
  });
  test('accepted command advances stageIdx', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0;  // accepts "ls"
    win.parseCmd('ls');
    assert.equal(G.stageIdx, 1);
  });
  test('accepted command awards 10 points via advance()', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0;
    win.parseCmd('ls');
    assert.equal(G.score, 10);
  });
  test('unrecognised command increments stageWrongs', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0;
    win.parseCmd('invalid-command-xyz');
    assert.equal(G.stageWrongs, 1);
  });
  test('first wrong command does not deduct score', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0; G.score = 20;
    win.parseCmd('bad-command-one');
    assert.equal(G.score, 20);
  });
  test('second wrong command deducts 1 point', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0; G.score = 20;
    win.parseCmd('bad-one');
    win.parseCmd('bad-two');
    assert.equal(G.score, 19);
  });
  test('extra spaces are normalised before matching', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 1;  // Stage 1 accepts "git log --oneline"
    win.parseCmd('git  log  --oneline');
    assert.equal(G.stageIdx, 2);
  });
  test('flexCommit: valid message triggers advance (+10 score)', () => {
    resetG();
    G.roomIdx = 3; G.stageIdx = 4;  // Room 3 Stage 4 is flexCommit
    win.parseCmd('git commit -m "set maintenance window to 02:00"');
    assert.equal(G.score, 10);
  });
  test('flexCommit: trivial message still commits (warning is cosmetic)', () => {
    resetG();
    G.roomIdx = 3; G.stageIdx = 4;  // Room 3 Stage 4 is flexCommit
    win.parseCmd('git commit -m "fix"');
    assert.equal(G.score, 10);
  });
  test('flexStashPop: git stash pop triggers advance', () => {
    resetG();
    G.roomIdx = 4; G.stageIdx = 3;  // Room 4 Stage 3 is flexStashPop
    win.parseCmd('git stash pop');
    assert.equal(G.score, 10);
  });
});
