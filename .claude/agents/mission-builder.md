---
name: mission-builder
description: Use when creating a new Vault Zero mission from scratch — this is the step-by-step build guide covering config.js, data.js, the HTML file, the hub card, and tests. Also use when filling out the Mission Brief Template (Step 7) before starting implementation, or when a specific implementation step is unclear (validateFile, parseSpecial, TREE design, jsdom test setup).
tools: Read, Edit, Write, Bash
---

# Vault Zero — Mission Builder Guide

> Read the `architecture` agent first for system internals. This guide covers the build process.

---

## Step 0: Before You Write a Line of Code

### Define the learning concept

1. **What commands will the player learn?** Be specific. Not "Docker" — "docker build, docker run, docker logs, docker exec".
2. **What are the 2–3 core mental models?** These become `conceptBrief` modals.
3. **What is the wrong-path behaviour?** For each stage, what would a confused player try first? Those become `wrong` entries.
4. **What scenario makes these commands feel necessary?** Narrative context motivates the commands.

**Target command count:** 6–14 distinct commands. Under 6 is too thin. Over 14 is cognitively overwhelming.

**Target room count:** 5–9 rooms. Each room = one logical cluster. 3 rooms is too short. 10+ risks player fatigue.

---

## Step 1: Create the Mission Folder

```
missions/
└── <mission-name>/
    ├── config.js
    ├── data.js
    └── <mission-name>.html
```

Choose a short, URL-safe slug (lowercase, hyphens). Example: `docker-breach`, `ci-incident`.

---

## Step 2: Build config.js

`config.js` defines the global `GAME_CONFIG` object. Must be defined before `engine.js` runs.

### Minimal skeleton

```js
const GAME_CONFIG = {

  // ── Identity ──────────────────────────────────────────────────────────
  title:        'YOUR MISSION TITLE',
  promptSuffix: 'node-01:~/target-dir$',

  // ── Boot sequence ──────────────────────────────────────────────────────
  bootLines: [
    { text: '> connecting to target...', cls: 'dim',  pause: 200 },
    { text: '> handshake: OK',           cls: 'ok',   pause: 140 },
    { text: '> WARNING: intrusion',      cls: 'warn', pause: 160 },
  ],

  // ── Command glossary ───────────────────────────────────────────────────
  cmdDescriptions: {
    'docker build': 'build a container image from a Dockerfile',
    'docker run':   'start a container from an image',
  },
  cheatSheetTitle:    'DOCKER BREACH // COMMAND RECORD',
  cheatSheetFilename: 'docker-breach-commands.txt',
  cheatSheetFooter:   'docker-breach-v1 // operative record',

  // ── Help text ──────────────────────────────────────────────────────────
  alwaysAvailableHelp: ['docker ps — always works'],

  // ── Police ────────────────────────────────────────────────────────────
  policeRiskyCmds: ['docker system prune', 'docker kill'],
  policeWarnings: [
    "scanner picked up anomalies. 30 seconds. move.",
    "IDS alert — watching. 30 seconds.",
    "audit bot flagged your session. 30 seconds.",
  ],

  // ── Display hooks ──────────────────────────────────────────────────────
  securityLayerLabel: (bypassed, probing) =>
    `${bypassed} layer${bypassed === 1 ? '' : 's'} breached // layer ${probing}: probing`,

  activeBranchLabel: (treeKey) =>
    treeKey.includes('r3') ? 'container: running' : 'host: idle',

  // ── Always-available fallbacks ─────────────────────────────────────────
  alwaysAvailable: (cmd, stage) => {
    if (cmd === 'docker ps') return [['CONTAINER ID   IMAGE   STATUS', 'dim'], ['(none)', 'dim']];
    return null;
  },

  // ── Special command handlers (remove if not needed) ────────────────────
  parseSpecial: (cmd, stage, { tprint, logCmd, advance, H }) => {
    if (stage.flexBuild && /^docker build -t \S+/.test(cmd)) {
      tprint([['Successfully tagged ' + cmd.split('-t ')[1] + ':latest', 'ok']]);
      logCmd('docker build');
      advance(stage.tree);
      return {};
    }
    return null;
  },

  // ── File editor (remove if not needed) ────────────────────────────────
  fileContent: {
    edit: {
      text: `FROM node:18\nRUN npm install\nCMD ["node", "app.js"]`,
      hint: 'change <code>RUN npm install</code> → <code>RUN npm ci</code>',
    },
    conflict: {
      text: `FROM node:18\n<<<<<<< HEAD\nRUN npm install\n=======\nRUN npm ci\n>>>>>>> origin/main`,
      hint: 'remove the conflict markers and keep the correct RUN command',
    },
  },
  validateFile: (val, isConflict) => {
    if (isConflict) {
      const hasMarkers = ['<<<<<<<', '=======', '>>>>>>>'].some(m => val.includes(m));
      if (hasMarkers) return { pass: false, output: [['conflict markers still present.', 'err']] };
      if (!val.includes('npm ci')) return { pass: false, output: [['npm ci is missing.', 'err']] };
      return { pass: true, output: [['Dockerfile saved — conflict resolved.', 'ok']] };
    }
    if (val.includes('npm ci')) return { pass: true, output: [['Dockerfile saved.', 'ok']] };
    return { pass: false, output: [['wrong change. use npm ci, not npm install.', 'err']] };
  },

  // ── Tree state bootstrapper (remove if not needed) ─────────────────────
  initTreeStates: (TREE) => {
    TREE['r0_initial'] = TREE['r0_clean'];
  },

  // ── Quiz pool ─────────────────────────────────────────────────────────
  cmdQuizPool: {
    'docker build': {
      q: 'What does `docker build -t myapp .` do?',
      options: ['Runs the container', 'Builds an image from the Dockerfile, tagged myapp', 'Pulls from DockerHub', 'Installs Docker'],
      correct: 1,
      explain: 'docker build reads the Dockerfile and creates an image. -t sets the tag. The dot is the build context.',
    },
  },
  staticQuiz: [
    {
      q: 'What is a Docker container vs a Docker image?',
      options: ['They are identical', 'An image is a blueprint; a container is a running instance', 'A container is a blueprint; an image is a running instance', 'Images are only on DockerHub'],
      correct: 1,
      explain: 'An image is the packaged template. A container is a live process created from that template.',
    },
  ],
};
```

### Field guidance

- **`bootLines`** — 5–10 lines. `cls: 'ok'` for good news, `'warn'` for danger, `'dim'` for atmosphere. Skippable, so don't make it too long.
- **`cmdDescriptions`** — Every command the player will type. Key = shortest unambiguous form. Doubles as cheat-sheet logging gate.
- **`policeRiskyCmds`** — Genuinely dangerous commands in your domain. Teaches players why certain commands are risky.
- **`policeWarnings`** — Exactly 3 strings, ascending urgency. Fox voice: lowercase, terse.
- **`securityLayerLabel`** — Short string for top bar. `bypassed` starts at 1.
- **`activeBranchLabel`** — Describe the current "active context" for the right panel chip. Adapt to your domain (container state, server environment, etc.)
- **`alwaysAvailable`** — One or two commands valid at any point. Return output array on match, `null` otherwise.
- **`parseSpecial`** — For variable-content commands, alternate correct forms, or regex needs. Gate each handler on a stage flag (e.g. `stage.flexBuild`).
- **`validateFile`** — Keep validation tight. Return clear feedback either way. If `pass: false`, tell exactly what is wrong.
- **`cmdQuizPool`** — Every key must exist in `cmdDescriptions`. Aim for 5–8 entries. Engine picks up to 4 based on commands used, fills to 7 with `staticQuiz`.

---

## Step 3: Build data.js

### ROOMS skeleton

```js
const ROOMS = [
  {
    id: 0,                       // Must equal array index. First room is 0.
    name: 'THE EQUIPMENT',
    initialTree: 'r0_initial',
    intro: "Narrative framing. Sets context for this room's commands.",
    clue: {
      label: 'SECTOR',           // Unique across all rooms, ALL_CAPS
      value: 'V0-CORE',          // Secret fragment revealed after room completes
    },
    stages: [
      {
        conceptBrief: {
          title: 'CONCEPT NAME',
          bullets: ['first key fact', 'second key fact', 'third key fact'],
          ascii: '  optional diagram  ',
        },
        foxMsg: "Fox's coaching line — first person, terse, motivating.",
        task: 'One-sentence description of what the player must do.',
        accepted: ['docker ps', 'docker ps -a'],
        output: [
          ['CONTAINER ID   IMAGE   STATUS', 'dim'],
          ['(no containers)', 'dim'],
          ['', ''],
          ['clean environment. ready to work.', 'ok'],
        ],
        tree: 'r0_initial',
        wrong: {
          'docker images': [['images, not containers. try: docker ps', 'warn']],
        },
      },
      {
        foxMsg: "Last stage in the room.",
        task: 'Final task.',
        accepted: ['final command'],
        output: [['success output', 'ok']],
        tree: 'r0_done',
        wrong: {},
        completionMsg: 'Takeaway line shown in room-complete modal. One sentence.',
      },
    ],
    hints: [
      // One 3-element array per stage.
      ['Vague directional hint — no command.', 'More specific — what kind of command.', 'Specific enough to succeed.\n\nrun: docker ps'],
      ['Hint 1', 'Hint 2', 'Hint 3 — the answer.\n\nrun: <command>'],
    ],
  },
];
```

### Stage design rules

- **Stage count per room:** 2–6. Sweet spot: 3–4.
- **`accepted`:** List every valid form. Normalised (trimmed, single spaces). Use `{{H1}}`–`{{H8}}` for commit hashes.
- **`output`:** Each entry is `[text, cssClass]`. See data-schema agent for CSS class reference.
- **`wrong`:** Cover 2–3 most common mistakes. If right direction but wrong syntax, be helpful. Empty `{}` is valid.
- **`tree`:** Must match a key in TREE (or one created by `initTreeStates`). If no visual change, repeat current key.
- **`completionMsg`:** Only on last stage. One memorable sentence. Shown in "ROOM CLEARED" modal.
- **Hints — 3-level rule:**
  - Level 1: Direction only. No command name.
  - Level 2: Narrower — command family, no flags.
  - Level 3: Exact answer. End with `\n\nrun: <command>`.
  - All three levels required. `hints.length` must equal `stages.length`. Each inner array must have exactly 3 elements. Tests enforce this.

### Pacing across rooms

| Room | Purpose | Stages | Police? |
|---|---|---|---|
| Room 0 | Orientation — read the environment | 2–3 | No |
| Room 1 | First substantive workflow | 3–4 | Optional |
| Room 2 | Add complexity | 3–4 | Yes (one stage) |
| Room 3 | Adversarial — something goes wrong | 3–4 | Yes, intense |
| Room 4 | Recovery / cleanup | 2–3 | Optional |
| Room 5+ | Advanced or synthesis | 3–4 | Yes |
| Last | Forensics / investigation | 3 | Optional |

### TREE design

SVG canvas: `240×360`. The renderer draws horizontal branch lines with commit circles.

```js
const TREE = {
  r0_initial: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [{x:40},{x:90}] }],
    HEAD: { type: 'branch', ref: 'main', ci: 1, branchY: 80 },
  },
  r1_feature: {
    branches: [
      { name: 'main',             y: 55,  color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] },
      { name: 'feature/new-work', y: 130, color: '#7eb8d4', commits: [{x:140}] },
    ],
    HEAD: { type: 'branch', ref: 'feature/new-work', ci: 0, branchY: 130 },
  },
  r1_detached: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] }],
    HEAD: { type: 'detached', cx: 90, cy: 80 },
  },
  r2_with_remote: {
    branches: [
      { name: 'main',        y: 65,  color: '#1D9E75',   commits: [{x:40},{x:90},{x:140}] },
      { name: 'origin/main', y: 130, color: '#1D9E7566', commits: [{x:40},{x:90},{x:140}], dashed: true },
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 65 },
  },
  r3_dirty: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] }],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 },
    extras: [{ type: 'dirty-indicator', x: 10, y: 200 }],
  },
};
```

**TREE checklist:**
- Every `tree:` and `initialTree:` reference must exist in TREE (or be created by `initTreeStates`).
- Commits visible should match the narrative — don't show 6 commits in room 0.
- Spread branches at least 60px apart vertically.
- Use `extras` to annotate state (dirty, staged, stash, conflict).
- Cross-referenced states → handle in `initTreeStates`.

---

## Step 4: Create the HTML File

Copy `missions/git-heist/git-heist.html` and make three targeted changes:

1. **Title tag** — replace with your mission name.
2. **Visible mission text** — update `<div class="vault-tag">`, top-bar metadata, footer spans.
3. **Script paths** — last 5 `<script>` tags in this exact order:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="./config.js"></script>
<script src="./data.js"></script>
<script src="../../js/renderer.js"></script>
<script src="../../js/supabase.js"></script>
<script src="../../js/engine.js"></script>
```

**Do not rename or remove any element IDs.** The engine reads DOM elements by ID — renaming breaks the game. The intro screen text (From: Fox message, vault-logo, vault-sub) is safe to customise. Boot content comes from `config.js:bootLines`, not HTML.

---

## Step 5: Add to the Hub (index.html)

Find `<div class="hub-missions">`. Add your active mission card:

```html
<a class="mission-card mission-card--active" href="missions/<slug>/<slug>.html" style="--card-accent: #68dbae">
  <div class="mission-preview">
    <div class="mp-topbar">
      <span class="mp-tag">target_repo // live session</span>
      <div class="mp-dots">
        <span class="mp-dot mp-dot--on"></span>
        <span class="mp-dot mp-dot--pulse"></span>
        <span class="mp-dot"></span>
      </div>
    </div>
    <div class="fp-terminal">
      <div class="fp-cmd">$ docker ps -a</div>
      <div class="fp-commit fp-commit--hot"><span class="fp-hash">a1b2c3d</span> container: BREACH_POINT</div>
      <div class="fp-commit"><span class="fp-hash">exited</span> 2 minutes ago</div>
      <div class="fp-spacer"></div>
      <div class="fp-prompt">$ <span class="fp-cursor"></span></div>
    </div>
  </div>
  <div class="mission-body">
    <div class="mission-header">
      <div class="mission-id">MISSION_002 <span class="mission-id-sep">//</span> DOCKER</div>
      <div class="mission-badge mission-badge--active">● Active</div>
    </div>
    <h2 class="mission-title">Docker Breach</h2>
    <p class="mission-story">2–3 sentence narrative hook.</p>
    <div class="mission-tools">
      <div class="mission-tools-label">Tools Required</div>
      <div class="mission-tools-tags">
        <span>docker build</span><span>docker run</span><span>docker logs</span>
      </div>
    </div>
    <div class="mission-meta">
      <span>~40 min</span>
      <span class="mission-diff">
        <span class="diff-pip diff-on"></span>
        <span class="diff-pip diff-on"></span>
        <span class="diff-pip"></span>
        <span class="diff-pip"></span>
        Medium
      </span>
      <span>6 rooms</span>
    </div>
    <div class="mission-cta">[ Enter the Container ]</div>
  </div>
</a>
```

Update hero stats (`<span class="hub-stat-num">`) to reflect new active count. For not-yet-active missions, add to `.hub-upcoming-grid` as a `<div>` with `mission-badge--locked`.

---

## Step 6: Write Tests

Create `tests/<mission-name>.test.js`. Required minimum coverage:

```js
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dir = dirname(fileURLToPath(import.meta.url));

// Copy buildDOM() from engine.test.js — all IDs must be present
function buildDOM() { /* ... */ }

let G, ROOMS, cmdLog, win;

before(() => {
  const dom = new JSDOM(buildDOM(), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  win = dom.window;

  // Stub browser APIs
  win.AudioContext = function() { return { state:'running', sampleRate:44100, currentTime:0, destination:{}, resume:()=>Promise.resolve(), createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)}), createBufferSource:()=>({connect:()=>{},start:()=>{},buffer:null}), createBiquadFilter:()=>({connect:()=>{},type:'',frequency:{value:0},Q:{value:0}}), createGain:()=>({connect:()=>{},gain:{setValueAtTime:()=>{}}}), }; };
  win.webkitAudioContext = win.AudioContext;
  win.SpeechSynthesisUtterance = function(t) { this.text = t; };
  win.speechSynthesis = { speak:()=>{}, cancel:()=>{} };
  win.renderTree = () => {};

  const inject = (file, bridge) => {
    const s = win.document.createElement('script');
    s.textContent = readFileSync(resolve(__dir, '..', file), 'utf8') + '\n' + bridge;
    win.document.head.appendChild(s);
  };

  inject('missions/<slug>/config.js', '');
  inject('missions/<slug>/data.js', `window._ROOMS = ROOMS; window._TREE = TREE;`);
  inject('js/engine.js', `
    window._G      = G;
    window._cmdLog = cmdLog;
    window._resetG = function() {
      G.roomIdx=0; G.stageIdx=0; G.score=0;
      G.stageWrongs=0; G.stageHintLevel=-1;
      G.fileEditDone=false; cmdLog.length=0;
      if (policeActive) clearPolice(true);
    };
  `);

  G = win._G; ROOMS = win._ROOMS; cmdLog = win._cmdLog;
});

function resetG() { win._resetG(); }

// Required: ROOMS data integrity
describe('ROOMS data integrity', () => {
  test('ids are sequential from 0', () => { ROOMS.forEach((r, i) => assert.equal(r.id, i)); });
  test('every room has stages', () => { ROOMS.forEach(r => assert.ok(r.stages.length > 0)); });
  test('hints parallel to stages', () => { ROOMS.forEach(r => assert.equal(r.hints.length, r.stages.length)); });
  test('every hint set has 3 levels', () => { ROOMS.forEach(r => r.hints.forEach((h, si) => assert.equal(h.length, 3))); });
  test('every stage has accepted', () => { ROOMS.forEach(r => r.stages.forEach(s => assert.ok(s.accepted.length > 0))); });
  test('every stage has foxMsg', () => { ROOMS.forEach(r => r.stages.forEach(s => assert.ok(s.foxMsg || s.foxMessage))); });
  test('clue labels unique', () => { const labels = ROOMS.map(r => r.clue.label); assert.equal(new Set(labels).size, labels.length); });
});

// Recommended: mission-specific behaviour
describe('Mission-specific behaviour', () => {
  test('first command in room 0 advances stage', () => {
    resetG(); G.roomIdx = 0; G.stageIdx = 0;
    win.parseCmd(ROOMS[0].stages[0].accepted[0]);
    assert.equal(G.stageIdx, 1);
  });
  test('accepted command awards 10 points', () => {
    resetG(); G.roomIdx = 0; G.stageIdx = 0;
    win.parseCmd(ROOMS[0].stages[0].accepted[0]);
    assert.equal(G.score, 10);
  });
});
```

**Required:** ROOMS integrity checks (sequential IDs, hints parallel, 3 levels each, accepted non-empty, foxMsg present, unique clue labels).

**Strongly recommended:** `parseCmd()` with first accepted command per room. `parseSpecial` handlers — both happy path and alternate form. `validateFile()` — correct input sets `fileEditDone`, incorrect does not. `addScore()` floor — score never negative.

---

## Step 7: Mission Brief Template (for AI agents)

Fill this out completely before implementing. A complete brief contains enough to implement the full mission without follow-up questions.

```
MISSION BRIEF — VAULT ZERO

## Identity
- Slug: <mission-name>
- Display title: <ALL CAPS MISSION NAME>
- Card accent color: <hex>
- Difficulty: Easy / Medium / Hard / Expert
- Estimated time: <X> min
- MISSION_ID: MISSION_001 / MISSION_002 / ...

## Concept
- Primary: <main workflow or tool cluster>
- Secondary: <supporting concepts>
- Commands: <exact list, e.g. "docker build, docker run, docker logs, docker exec -it, docker stop">

## Scenario
One paragraph: what is the heist narrative? Who is Fox? What is the target? What is at stake?

## Rooms
- Room 0: <NAME> — <commands> — <narrative hook>
- Room 1: <NAME> — <commands> — <narrative hook>
- ...

## Special mechanics
- Commands needing flexible/regex matching?
- File-edit stages? Describe the file content and required change.
- Conflict-resolution stages?
- Police trigger points: which stages have policeOnLoad or policeWarnModal?

## Clue design
- Room 0: label=SECTOR, value=V0-CORE
- Room 1: label=NODE, value=relay-7
- ...
(Clues assemble at the end into coherent access credentials)

## Difficulty calibration
- Wrong commands per room: <likely wrong attempts>
- Hint level 3 answers: <exact command per stage>

## Visual tree design
- Room 0: <describe branch/commit layout>
- Room 1: <describe>
- ...
```

### Implementation order

1. `config.js` — identity + boot + glossary
2. `data.js` — ROOMS
3. `data.js` — TREE
4. Validate all TREE keys exist → add `initTreeStates` for cross-references
5. `config.js` — quiz pools
6. `config.js` — `validateFile` if needed
7. HTML
8. Hub card
9. Tests → `npm test` → fix all failures

**Post-`data.js` verify:** `ROOMS.length` matches plan; `hints.length === stages.length` for every room; every hint array has exactly 3 elements; every `tree:` reference exists in TREE or `initTreeStates`.

**Post-`config.js` verify:** every `cmdQuizPool` key exists in `cmdDescriptions`; `policeWarnings` has exactly 3 elements; `validateFile` covers pass and fail with clear output.
