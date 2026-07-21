# Vault Zero — Mission Builder Guide

> Audience: someone (human or AI) building a new Vault Zero mission from scratch.
> Read `docs/ARCHITECTURE.md` first for system internals. This guide covers the build process.

---

## Step 0: Before You Write a Line of Code

### Define the learning concept

A mission must have a **tight, teachable concept**. The scenario is a delivery vehicle. Decide first:

1. **What commands or workflows will the player learn?** Be specific. Not "Docker" — "docker build, docker run, docker logs, docker exec". Not "CI/CD" — "reading a failing pipeline, finding the broken step, fixing the YAML".
2. **What are the 2–3 core mental models** that unlock these commands? These become `conceptBrief` modals.
3. **What is the wrong-path behaviour?** For each stage, what would a confused player try first? Those become `wrong` entries.
4. **What scenario makes these commands feel necessary?** The narrative context motivates the commands. A heist where you need to hide evidence teaches `git stash` better than "now practice git stash."

**Target command count:** 6–14 distinct commands across a full mission. Under 6 is too thin for a complete session. Over 14 is cognitively overwhelming.

**Target room count:** 5–9 rooms. Each room = one logical cluster of commands (e.g. "read the repo", "branch and commit", "undo mistakes"). 3 rooms is too short. 10+ rooms risks player fatigue.

---

## Step 1: Create the Mission Folder

```
missions/
└── <mission-name>/
    ├── config.js
    ├── data.js
    └── <mission-name>.html
```

Choose a short, URL-safe mission slug (lowercase, hyphens). Example: `docker-breach`, `ci-incident`, `vault-recovery`.

```bash
mkdir missions/<mission-name>
touch missions/<mission-name>/config.js
touch missions/<mission-name>/data.js
touch missions/<mission-name>/<mission-name>.html
```

---

## Step 2: Build config.js

`config.js` defines the global `GAME_CONFIG` object. It must be defined before `engine.js` runs.

### Minimal skeleton

```js
// ═══════════════════════════════════════════════════════════════════════
// <MISSION NAME> — MISSION CONFIG
// ═══════════════════════════════════════════════════════════════════════

const GAME_CONFIG = {

  // ── Identity ─────────────────────────────────────────────────────────
  title:        'YOUR MISSION TITLE',
  promptSuffix: 'node-01:~/target-dir$',

  // ── Boot sequence ─────────────────────────────────────────────────────
  bootLines: [
    { text: '> connecting to target system...', cls: 'dim',  pause: 200 },
    { text: '> handshake: OK',                  cls: 'ok',   pause: 140 },
    { text: '> WARNING: intrusion detected',    cls: 'warn', pause: 160 },
    { text: '> encrypted tunnel active',        cls: 'ok',   pause: 120 },
  ],

  // ── Command glossary ──────────────────────────────────────────────────
  cmdDescriptions: {
    'docker build': 'build a container image from a Dockerfile',
    'docker run':   'start a container from an image',
    // Add every command that should appear in the cheat sheet.
    // Keys must match exactly how the player types them (normalised: trimmed, single spaces).
  },

  cheatSheetTitle:    'DOCKER BREACH // COMMAND RECORD',
  cheatSheetFilename: 'docker-breach-commands.txt',
  cheatSheetFooter:   'docker-breach-v1 // operative record',

  // ── Help text ─────────────────────────────────────────────────────────
  alwaysAvailableHelp: [
    'docker ps    — always works',
    'docker images — always works',
  ],

  // ── Police ────────────────────────────────────────────────────────────
  policeRiskyCmds: ['docker system prune', 'docker kill'],
  policeWarnings: [
    "scanner picked up anomalies. you've got 30 seconds. move.",
    "IDS alert — they're watching. 30 seconds.",
    "audit bot flagged your session. 30 seconds.",
  ],

  // ── Security layer display ─────────────────────────────────────────────
  securityLayerLabel: (bypassed, probing) => {
    return `${bypassed} layer${bypassed === 1 ? '' : 's'} breached // layer ${probing}: probing`;
  },

  // ── Active branch / context display ────────────────────────────────────
  activeBranchLabel: (treeKey) => {
    return treeKey.includes('r3') ? 'container: running' : 'host: idle';
  },

  // ── Always-available fallbacks ─────────────────────────────────────────
  alwaysAvailable: (cmd, stage) => {
    if (cmd === 'docker ps') return [
      ['CONTAINER ID   IMAGE    STATUS', 'dim'],
      ['(none running)', 'dim'],
    ];
    return null;
  },

  // ── Special command handlers ────────────────────────────────────────────
  // Only needed if any stages require flexible/regex matching.
  // Remove this field entirely if every stage uses exact matching.
  parseSpecial: (cmd, stage, { tprint, logCmd, advance, H }) => {
    if (stage.flexBuild) {
      if (/^docker build -t \S+/.test(cmd)) {
        tprint([['Successfully tagged ' + cmd.split('-t ')[1] + ':latest', 'ok']]);
        logCmd('docker build');
        advance(stage.tree);
        return {};
      }
    }
    return null;
  },

  // ── File editor ────────────────────────────────────────────────────────
  // Required only if any stage uses fileEdit: true.
  fileContent: {
    edit: {
      text: `FROM node:18\nRUN npm install\nCMD ["node", "app.js"]`,
      hint: 'change <code>RUN npm install</code> → <code>RUN npm ci</code>',
    },
    // conflict slot: only needed if any stage uses fileEditType: 'conflict'
    conflict: {
      text: `FROM node:18\n<<<<<<< HEAD\nRUN npm install\n=======\nRUN npm ci\n>>>>>>> origin/main`,
      hint: 'remove the conflict markers and keep the correct RUN command',
    },
  },

  validateFile: (val, isConflict) => {
    if (isConflict) {
      const hasMarkers = ['<<<<<<<', '=======', '>>>>>>>'].some(m => val.includes(m));
      if (!hasMarkers && val.includes('npm ci')) {
        return { pass: true,  output: [['Dockerfile saved — conflict resolved.', 'ok']] };
      }
      if (hasMarkers) {
        return { pass: false, output: [['conflict markers still present.', 'err']] };
      }
      return { pass: false, output: [['npm ci is missing.', 'err']] };
    }
    if (val.includes('npm ci')) {
      return { pass: true,  output: [['Dockerfile saved.', 'ok'], ['change applied.', 'dim']] };
    }
    return { pass: false, output: [['wrong change. use npm ci, not npm install.', 'err']] };
  },

  // ── Tree state bootstrapper ─────────────────────────────────────────────
  // Only needed if some TREE states reference other TREE states.
  initTreeStates: (TREE) => {
    TREE['r0_initial'] = TREE['r0_clean'];
    // or build derived states here
  },

  // ── Quiz pool ─────────────────────────────────────────────────────────
  cmdQuizPool: {
    'docker build': {
      q: 'What does `docker build -t myapp .` do?',
      options: [
        'Runs the container',
        'Builds a container image from the Dockerfile in the current directory, tagged myapp',
        'Pulls the image from DockerHub',
        'Installs Docker',
      ],
      correct: 1,
      explain: 'docker build reads the Dockerfile and creates an image. -t sets the tag (name). The dot is the build context.',
    },
    // One entry per command key in cmdDescriptions that you want to quiz on.
  },

  staticQuiz: [
    {
      q: 'What is a Docker container vs a Docker image?',
      options: [
        'They are identical',
        'An image is a blueprint; a container is a running instance of that image',
        'A container is a blueprint; an image is a running instance',
        'Images are only on DockerHub',
      ],
      correct: 1,
      explain: 'An image is the packaged template. A container is a live process created from that template.',
    },
    // 5–8 static questions, used to fill the quiz to 7 total.
  ],

};
```

### Field-by-field guidance

**`bootLines`** — Write 5–10 lines. Match your scenario's tone. Use `cls: 'ok'` for good news, `'warn'` for danger, `'dim'` for atmosphere. `pause` controls the gap after each line (milliseconds). The sequence is skippable — don't make it too long.

**`cmdDescriptions`** — This map does double duty: it determines what gets logged to the cheat sheet (only prefix-matching commands are logged), and it feeds the cheat sheet download. Include every command your players will type. The key should be the shortest unambiguous form (e.g. `'docker build'`, not `'docker build -t'`).

**`policeRiskyCmds`** — Commands that immediately trigger the police timer. Pick genuinely dangerous commands in your domain. In a Git mission this is `git reset --hard`; in Docker it might be `docker system prune`. The mechanic exists to teach players why certain commands are risky.

**`policeWarnings`** — Exactly 3 strings. They rotate by `stageWrongs % 3`. Write them in ascending urgency. These are Fox's voice — terse, in-character.

**`securityLayerLabel`** — The engine calls this with `(bypassed, probing)` where `bypassed` starts at 1 and increases as the player advances through rooms (roughly `floor(roomIdx/2)+1`). Return a short string that fits in the top bar. Match your mission's theming.

**`activeBranchLabel`** — Return a string that describes the current "active context" shown in the right panel chip. For non-Git missions, adapt this to your domain: container state, server environment, etc. The `treeKey` argument lets you match on the current TREE state.

**`alwaysAvailable`** — One or two commands that make sense at any point in the mission (a `status`-equivalent). Return the output array on match, `null` otherwise. These commands don't advance the stage.

**`parseSpecial`** — Use for: commands where the player types something with a variable part (commit messages, tag names, filenames); stages where two alternate commands both pass (handled differently); any logic requiring regex. The `stage` argument carries all stage flags — add a boolean like `stage.flexBuild` on the stage object to scope your handler to specific stages only.

**`validateFile`** — Keep validation tight. Check for the specific string/pattern that proves the edit was correct. Return clear output either way — the player sees your `output` immediately after clicking SAVE FILE. If `pass: false`, tell them exactly what is wrong and what to do next.

**`cmdQuizPool`** — Every key must exist in `cmdDescriptions`. Aim for 5–8 entries. The engine picks up to 4 from this pool (based on commands the player actually used), then fills to 7 total with `staticQuiz`. Write 4 options per question. `explain` is shown after the player answers — teach the concept, not just the answer.

---

## Step 3: Build data.js

`data.js` defines the global `ROOMS` array and `TREE` object.

### ROOMS — room-by-room design

```js
const ROOMS = [

  // ── ROOM 0 ──────────────────────────────────────────────────────────
  // Teach 2–3 orientation commands. This is the player's first touch.
  // Keep it simple: ls / status / check. No branching, no complexity.
  {
    id: 0,                       // Must equal array index. First room is 0, not 1.
    name: 'THE EQUIPMENT',       // Short, all-caps, thematic name
    initialTree: 'r0_initial',   // TREE key for the initial visual state
    intro: "Narrative framing. Sets context for this room's commands.",
    clue: {
      label: 'SECTOR',           // Short identifier, unique across all rooms, ALL_CAPS
      value: 'V0-CORE',          // The secret fragment revealed after completing this room
    },
    stages: [
      {
        conceptBrief: {          // Optional — shown as a modal before the stage
          title: 'CONCEPT NAME',
          bullets: [
            'first key fact about this concept',
            'second key fact',
            'third key fact',
          ],
          ascii: '  optional diagram  ',
        },
        foxMsg: "Fox's coaching line for this stage. First person, terse, motivating.",
        task: 'One-sentence description of what the player must do.',
        accepted: ['docker ps', 'docker ps -a'],
        output: [
          ['CONTAINER ID   IMAGE   STATUS', 'dim'],
          ['(no containers)', 'dim'],
          ['', ''],
          ['clean environment. ready to work.', 'ok'],
        ],
        tree: 'r0_initial',      // TREE key to render after completing this stage
        wrong: {
          'docker images': [['images, not containers. try: docker ps', 'warn']],
        },
      },
      // ... more stages
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
      // One 3-element array per stage, in the same order as stages.
      [
        'Vague directional hint — no command.',
        'More specific hint — what kind of command to use.',
        'Specific enough to succeed.\n\nrun: docker ps',
      ],
      [
        // stage 1 hints
        'Hint 1', 'Hint 2', 'Hint 3 — the answer.\n\nrun: <command>',
      ],
    ],
  },

  // ── ROOM 1 ──────────────────────────────────────────────────────────
  // ... and so on
];
```

### Stage design rules

**Stage count per room:** 2–6 stages. Under 2 makes the room feel empty. Over 6 is fatiguing for a single concept cluster. Sweet spot is 3–4.

**`accepted` commands:** List every valid form a player could correctly type. Normalised (trimmed, single spaces). Use `{{H1}}`–`{{H8}}` placeholders where commit hashes appear — the engine substitutes session-unique hashes at render time. Example: `['git checkout {{H1}}', 'git switch {{H1}}']`.

**`output` format:** Each entry is `[text, cssClass]`. CSS classes:
- `'ok'` — green, success
- `'err'` — red, error/warning
- `'warn'` — amber, caution
- `'sys'` — teal-ish, system output
- `'dim'` — muted, secondary
- `'hl'` — highlighted, important
- `'br'` — branch name style
- `'cm'` — commit hash style
- `''` — no class, default color

**`wrong` map:** Cover the 2–3 most common mistakes. If the player tries the right direction but wrong syntax, be helpful. If they try something that would make sense in other contexts but not here, explain why. Empty object `{}` is valid if no wrong cases are worth handling.

**`tree` field:** Should always match a key in `TREE` that reflects the visual state after this command runs. If the command doesn't change the visual, use the same key as the previous stage.

**`completionMsg`:** Only on the last stage of each room. One sentence. This is shown in the "ROOM CLEARED" modal — make it a memorable teaching summary.

**Hints — the 3-level rule:**
- Level 1: Direction only. "There's a command for listing running containers." No command name.
- Level 2: Narrower. "docker + a short verb shows running containers." Point to the command family.
- Level 3: The answer. Full command, exact syntax. End with `\n\nrun: docker ps` — the engine renders text after `\n\n` that starts with "run:" in a highlighted code style.

All three levels are required. `hints.length` must equal `stages.length`. Each hint array must have exactly 3 elements. The test suite enforces this.

### Pacing — how to structure rooms across a mission

| Room | Purpose | Typical stage count | Police pressure? |
|---|---|---|---|
| Room 0 | Orientation — read the environment | 2–3 | No |
| Room 1 | First substantive workflow | 3–4 | Optional |
| Room 2 | Add complexity — new concept layer | 3–4 | Yes (one stage) |
| Room 3 | Adversarial — something goes wrong | 3–4 | Yes, intense |
| Room 4 | Recovery / cleanup | 2–3 | Optional |
| Room 5+ | Advanced or synthesis | 3–4 | Yes |
| Last room | Forensics / investigation | 3 | Optional |

**Police pressure** is most effective at rooms 2–4, when the player has enough knowledge to succeed under pressure but still feels challenged. Overusing it across every room desensitises players.

### TREE — designing the visual git graph (or equivalent diagram)

The SVG canvas is `240×360`. The renderer draws horizontal branch lines with commit circles. For non-Git missions, adapt the concept: the "branches" can represent service replicas, container stacks, or other parallel things.

```js
const TREE = {

  // ── Clean initial state ──────────────────────────────────────────────
  r0_initial: {
    branches: [
      {
        name: 'main',
        y: 80,            // Vertical position. Spread branches ~60–80px apart.
        color: '#1D9E75', // Use the Vault Zero green for active/healthy. Use muted tones for remote/stale.
        commits: [
          { x: 40 },
          { x: 90 },
        ],
      },
    ],
    HEAD: {
      type: 'branch',
      ref: 'main',
      ci: 1,       // Index into commits (0-based from left). 1 = second commit = rightmost.
      branchY: 80,
    },
  },

  // ── Feature branch appears ───────────────────────────────────────────
  r1_feature: {
    branches: [
      { name: 'main',             y: 55,  color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] },
      { name: 'feature/new-work', y: 130, color: '#7eb8d4', commits: [{x:140}] },
    ],
    HEAD: { type: 'branch', ref: 'feature/new-work', ci: 0, branchY: 130 },
  },

  // ── Detached HEAD ────────────────────────────────────────────────────
  r1_detached: {
    branches: [
      { name: 'main', y: 80, color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] },
    ],
    HEAD: { type: 'detached', cx: 90, cy: 80 },
  },

  // ── Remote branch (dashed = remote-tracking) ─────────────────────────
  r2_with_remote: {
    branches: [
      { name: 'main',        y: 65,  color: '#1D9E75',   commits: [{x:40},{x:90},{x:140}] },
      { name: 'origin/main', y: 130, color: '#1D9E7566', commits: [{x:40},{x:90},{x:140}], dashed: true },
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 65 },
  },

  // ── Dirty working tree ────────────────────────────────────────────────
  r3_dirty: {
    branches: [
      { name: 'main', y: 80, color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] },
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 },
    extras: [{ type: 'dirty-indicator', x: 10, y: 200 }],
  },

  // ── Stash active ──────────────────────────────────────────────────────
  r3_stashed: {
    branches: [
      { name: 'main', y: 80, color: '#1D9E75', commits: [{x:40},{x:90},{x:140}] },
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 },
    extras: [{ type: 'stash-indicator', x: 10, y: 200 }],
  },

  // ── Merge conflict ────────────────────────────────────────────────────
  r4_conflict: {
    branches: [
      { name: 'main',        y: 60,  color: '#1D9E75',   commits: [{x:40},{x:90},{x:140}] },
      { name: 'origin/main', y: 130, color: '#1D9E7566', commits: [{x:40},{x:90},{x:140},{x:185}], dashed: true },
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 60 },
    extras: [{ type: 'conflict-indicator', x: 10, y: 220 }],
  },

};
```

**TREE design checklist:**
- Every TREE key referenced in a stage's `tree:` field or a room's `initialTree:` must exist in TREE (or be created by `initTreeStates`).
- The number of commits visible should match the narrative — don't show 6 commits in room 0.
- Spread branches vertically with at least 60px between Y values.
- Use `extras` to annotate state (dirty, staged, stash, conflict). These are more informative than just changing the branch diagram.
- For cross-referenced states (`r2_initial = r2_remote`), handle them in `initTreeStates`.

---

## Step 4: Create the HTML File

Copy `missions/git-heist/git-heist.html` and make three targeted changes:

1. **Title tag** — replace with your mission name.
2. **Visible mission-specific text** — update `<div class="vault-tag">`, the top-bar metadata text, and footer spans if they reference mission-specific strings.
3. **Script paths** — the last 5 `<script>` tags must point to the correct files:

```html
<!-- At bottom of body, in this exact order: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="./config.js"></script>
<script src="./data.js"></script>
<script src="../../js/renderer.js"></script>
<script src="../../js/supabase.js"></script>
<script src="../../js/engine.js"></script>
```

Everything else in the HTML (modals, panels, IDs) is used by the engine and must remain intact. The engine reads DOM elements by ID — renaming or removing IDs breaks the game. Do not touch:
- `#termOut`, `#termInput`
- `#foxMessages`, `#foxMessages`
- `#gitTree`
- `#policeAlert`, `#policeCountdown`, `#policeBarFill`, `#policeVignette`
- `#hintModal`, `#hintLvl`, `#hintTxt`, `#nextHintBtn`
- `#roomDone`, `#doneStats`, `#doneMsg`, `#clueFragment`, `#clueKey`, `#clueVal`, `#clueCount`
- `#quizScreen`, `#quizFoxSpeech`, `#quizStartWrap`, `#quizBody`, `#quizNum`, `#quizQ`, `#quizOpts`, `#quizFeedback`
- `#endScreen`, `#assembledKey`
- `#fileEditor`, `#fileContent`, `#editorTitle`, `#editorHint`
- `#conceptModal`, `#conceptTitle`, `#conceptBullets`, `#conceptAscii`
- `#policeWarnModal`, `#pwarnMsg`, `#pwarnBtn`
- `#scoreChip`, `#scoreVal`
- `#progressFill`, `#activeBranch`, `#roomInfo`
- `#introScreen`, `#bootTerminal`, `#txBody`, `#operativeRow`, `#enterBtn`, `#operativeName`
- `#bootSkipBtn`, `#operativeTag`
- `#footerClock`, `#secStatus`, `.sec-dot`
- `#panels`, `#resizeLeft`, `#resizeRight`

The intro screen text (the "From: Fox" message, the `vault-logo`, `vault-sub` elements) is safe to customise. The boot terminal content comes from `config.js:bootLines`, not the HTML.

---

## Step 5: Add to the Hub (index.html)

Find the `<div class="hub-missions">` block in `index.html`. This contains the active mission cards. Add your mission as an active card:

```html
<a class="mission-card mission-card--active" href="missions/<your-slug>/<your-slug>.html" style="--card-accent: #68dbae">
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
      <!-- 4–5 lines of thematic terminal output. Use .fp-commit--hot for the important line. -->
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
    <p class="mission-story">2–3 sentence narrative hook. What's the scenario? What's at stake?</p>
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

Also update the hero stats (`<span class="hub-stat-num">`) to reflect the new active count.

If this mission is not yet active (still in development), add it to `.hub-upcoming-grid` instead, as a `<div>` (not an `<a>`), with `mission-badge--locked` and `mission-cta--locked`. The existing locked missions in git-heist are good templates.

---

## Step 6: Write Tests

Create `tests/<mission-name>.test.js`. The test file structure mirrors `engine.test.js`. Required minimum coverage:

```js
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dir = dirname(fileURLToPath(import.meta.url));

function buildDOM() {
  // Minimal DOM that satisfies engine.js element lookups.
  // Copy from engine.test.js — all IDs must be present.
  return `<!DOCTYPE html><html><body>
    <div id="termOut"></div><input id="termInput">
    <div class="terminal-panel">
      <div id="foxMessages"></div><div id="policeAlert"></div>
      <div id="policeCountdown"></div>
      <div id="policeBarFill" style="width:0"></div>
      <div id="policeVignette"></div>
    </div>
    <!-- ... (copy full buildDOM from engine.test.js) ... -->
  </body></html>`;
}

let G, ROOMS, cmdLog, win;

before(() => {
  const dom = new JSDOM(buildDOM(), {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost/',
  });
  win = dom.window;

  // Stub browser APIs
  win.AudioContext = function() { return { state:'running', sampleRate:44100, currentTime:0,
    destination:{}, resume:()=>Promise.resolve(),
    createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)}),
    createBufferSource:()=>({connect:()=>{},start:()=>{},buffer:null}),
    createBiquadFilter:()=>({connect:()=>{},type:'',frequency:{value:0},Q:{value:0}}),
    createGain:()=>({connect:()=>{},gain:{setValueAtTime:()=>{}}}),
  }; };
  win.webkitAudioContext = win.AudioContext;
  win.SpeechSynthesisUtterance = function(t) { this.text = t; };
  win.speechSynthesis = { speak:()=>{}, cancel:()=>{} };
  win.renderTree = () => {};

  const inject = (file, bridge) => {
    const s = win.document.createElement('script');
    s.textContent = readFileSync(resolve(__dir, '..', file), 'utf8') + '\n' + bridge;
    win.document.head.appendChild(s);
  };

  inject('missions/<your-slug>/config.js', '');
  inject('missions/<your-slug>/data.js', `
    window._ROOMS = ROOMS;
    window._TREE  = TREE;
  `);
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

  G      = win._G;
  ROOMS  = win._ROOMS;
  cmdLog = win._cmdLog;
});

function resetG() { win._resetG(); }


// ── ROOMS data integrity (REQUIRED for every mission) ────────────────
describe('ROOMS data integrity', () => {
  test('ids are sequential from 0', () => {
    ROOMS.forEach((r, i) => assert.equal(r.id, i));
  });
  test('every room has a non-empty stages array', () => {
    ROOMS.forEach(r => assert.ok(Array.isArray(r.stages) && r.stages.length > 0));
  });
  test('hints.length matches stages.length in every room', () => {
    ROOMS.forEach(r => assert.equal(r.hints.length, r.stages.length,
      `Room ${r.id}: ${r.hints.length} hint sets vs ${r.stages.length} stages`));
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
  test('all clue labels are unique', () => {
    const labels = ROOMS.map(r => r.clue.label);
    assert.equal(new Set(labels).size, labels.length);
  });
});


// ── Mission-specific stage tests ─────────────────────────────────────
describe('Mission-specific behaviour', () => {
  test('first accepted command in room 0 advances stage', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0;
    win.parseCmd(ROOMS[0].stages[0].accepted[0]);
    assert.equal(G.stageIdx, 1);
  });
  test('accepted command awards 10 points', () => {
    resetG();
    G.roomIdx = 0; G.stageIdx = 0;
    win.parseCmd(ROOMS[0].stages[0].accepted[0]);
    assert.equal(G.score, 10);
  });
  // Add tests for any flexCommit, flexStashPop, or other parseSpecial handlers.
  // Add tests for validateFile if the mission uses fileEdit stages.
});
```

### What must be tested

**Required (test suite will catch if missing):**
- ROOMS integrity: sequential IDs, stages non-empty, hints parallel to stages, 3 hint levels each, accepted non-empty, foxMsg present, clue labels unique.

**Strongly recommended:**
- `parseCmd()` with the first accepted command of each room — advances stage, awards points.
- Any `parseSpecial` handlers — test both the happy path and the alternate form (e.g. `git stash apply` as well as `git stash pop`).
- `validateFile()` — correct input sets `fileEditDone`, incorrect input does not.
- `addScore()` floor — verify score never goes negative.

---

## Step 7: AI-Assisted Iteration — Mission Brief Template

This section is specifically for AI agents. Fill in the template below to define a complete mission concept before implementing it. A complete brief contains enough information to implement the full mission without follow-up questions.

---

### Mission Brief Template

```
MISSION BRIEF — VAULT ZERO

## Identity
- Slug: <mission-name>  (lowercase, hyphens, URL-safe)
- Display title: <ALL CAPS MISSION NAME>
- Card accent color: <hex color for hub card>
- Difficulty: Easy / Medium / Hard / Expert
- Estimated time: <X> min
- MISSION_ID: <MISSION_001 / MISSION_002 / ...>

## Concept
What developer concepts does this mission teach?
- Primary: <the main workflow or tool cluster>
- Secondary: <supporting concepts or related commands>
- Commands to cover: <exact command list, e.g. "docker build, docker run, docker logs, docker exec -it, docker stop">

## Scenario
One paragraph: what is the heist/thriller narrative? Who is Fox? What is the target? What is at stake?

## Rooms
List each room with:
- Room N: <NAME> — <which commands> — <one-sentence narrative hook>

Example:
- Room 0: THE CONTAINER — docker images, docker ps — "You're inside the target's host. Find what's already running."
- Room 1: BUILD THE BREACH — docker build, docker run — "Their image is broken. Fix the Dockerfile and spin up your own."
- Room 2: READ THE LOGS — docker logs, docker exec — "Something crashed. Find what went wrong before they notice."
- Room 3: THE SWEEP — docker stop, docker rm — "Security sweep incoming. Clean your traces."

## Special mechanics (optional)
Any commands that need flexible/regex matching?
Any file-edit stages? If so, describe the file content and what change must be made.
Any conflict-resolution stages?
Police trigger points: which stages have policeOnLoad or policeWarnModal?

## Clue design
List the clue label and value for each room:
- Room 0: label=SECTOR, value=V0-CORE
- Room 1: label=NODE, value=relay-7
- ...

The clues assemble at the end into "access credentials". Design them to form a coherent secret when read together.

## Difficulty calibration
- Wrong commands the player will try: <for each room, list likely wrong attempts>
- Hint level 3 answers: <list the exact command for each stage>

## Visual tree design
For each room, describe what the git tree (or equivalent diagram) should show:
- Room 0: single branch 'main', 2 commits, HEAD at tip
- Room 1: main branch + new 'feature/exploit' branch forking off
- ...
```

---

### How to use this template as an AI agent

1. Fill in the brief completely before writing any code.
2. Resolve any ambiguities in the brief before proceeding — a missing clue value or an underspecified wrong-command list will result in thin data.
3. Implement in order: `config.js` identity + boot + glossary → `data.js` ROOMS → `data.js` TREE → validate all TREE keys exist → add `initTreeStates` for cross-references → `config.js` quiz pools → `config.js` validateFile if needed → HTML → hub card → tests.
4. After writing `data.js`, verify: `ROOMS.length` matches the planned room count; `hints.length === stages.length` for every room; every hint array has exactly 3 elements; every `tree:` reference in stages exists as a key in `TREE` or will be created by `initTreeStates`.
5. After writing `config.js`, verify: every `cmdQuizPool` key exists in `cmdDescriptions`; `policeWarnings` has exactly 3 elements; `validateFile` covers both pass and fail cases with clear output.
6. Run tests: `npm test` from the project root. Fix all failures before declaring the mission complete.
