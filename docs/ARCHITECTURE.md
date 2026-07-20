# Vault Zero — Architecture Reference

> Audience: developer or AI agent who needs to understand the system well enough to extend it.
> Source of truth: the code. When anything here conflicts with the code, trust the code.

---

## 1. What Is Vault Zero

Vault Zero is a browser-based escape room platform for teaching developer concepts to junior engineers. Each **mission** wraps a set of developer commands or workflows inside a heist/thriller narrative. Players type real commands into an in-browser terminal, advance through staged puzzles, and collect clues that unlock at the end.

**Core design constraints (non-negotiable):**

- **No build step, no bundler.** Every file is plain HTML, CSS, and vanilla JS. The game runs by opening an HTML file in a browser or serving it from any static host.
- **No frameworks.** No React, no Vue, no module bundlers. Everything is global script scope.
- **Teachable via inspection.** A player with DevTools can read every source file and understand how the game works. This is intentional — the platform teaches developers, so the platform itself should be readable.
- **Engine is game-agnostic.** `js/engine.js` knows nothing about Git, heists, or any specific mission. All mission-specific content lives inside the mission's own `config.js` and `data.js`.

---

## 2. File and Folder Structure

```
vault-zero/
├── index.html                  # Hub/lobby — lists all missions, links to active ones
├── css/
│   ├── shared.css              # Tokens used by both hub and game (scanline, fonts, base resets)
│   ├── game.css                # All game-UI styles: terminal, panels, modals, police alert
│   └── hub.css                 # Hub-page-only styles: mission cards, hero, telemetry sidebar
├── js/
│   ├── engine.js               # Game loop, command parsing, scoring, police, quiz, boot sequence
│   ├── renderer.js             # SVG git tree renderer (reads TREE global, writes to #gitTree)
│   └── supabase.js             # Leaderboard: saveScore() and getLeaderboard() via Supabase JS SDK
├── missions/
│   └── git-heist/
│       ├── git-heist.html      # Mission page: full HTML shell with all modal scaffolding
│       ├── config.js           # Defines GAME_CONFIG — all mission-specific logic and content
│       └── data.js             # Defines ROOMS array and TREE object
├── docs/                       # AI-agent-ready guides (this file lives here)
└── tests/
    ├── engine.test.js          # Engine unit tests (normalise, scoring, quiz, parseCmd, saveFile)
    └── hub.test.js             # Hub page structure tests (DOM assertions on index.html)
```

**What does NOT exist here:**
- `node_modules/` is present only for `jsdom` (dev dependency for tests). It plays no role at runtime.
- No `dist/`, no `build/`, no transpilation.
- No config files for webpack, vite, rollup, babel, etc.

---

## 3. How a Mission Page Works

### Script loading order

Every mission HTML file loads scripts in this fixed order via `<script>` tags at the bottom of `<body>`:

```html
<!-- 1. External: Supabase client library (provides global `supabase`) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- 2. Mission config — defines window.GAME_CONFIG -->
<script src="./config.js"></script>

<!-- 3. Mission data — defines window.ROOMS and window.TREE -->
<script src="./data.js"></script>

<!-- 4. SVG renderer — defines window.renderTree(stateKey) -->
<script src="../../js/renderer.js"></script>

<!-- 5. Leaderboard — defines window.saveScore() and window.getLeaderboard() -->
<script src="../../js/supabase.js"></script>

<!-- 6. Game engine — reads GAME_CONFIG, ROOMS, TREE; starts the game -->
<script src="../../js/engine.js"></script>
```

**Why order matters:** The engine reads `GAME_CONFIG`, `ROOMS`, and `TREE` as globals the moment it executes. If `config.js` or `data.js` loads after `engine.js`, those globals are undefined and the game crashes. The Supabase CDN script must come before `supabase.js` because `supabase.js` calls `supabase.createClient()`.

### What happens at page load

1. HTML is parsed and all DOM elements exist.
2. Scripts execute top-to-bottom.
3. `config.js` sets `window.GAME_CONFIG`.
4. `data.js` sets `window.ROOMS` and `window.TREE`.
5. `renderer.js` defines `renderTree()` — does nothing yet.
6. `supabase.js` calls `supabase.createClient()` and defines `saveScore()` / `getLeaderboard()`.
7. `engine.js` runs top-to-bottom:
   - Generates 8 session hashes `H[1]`–`H[8]` and stores them in `H`.
   - Initialises global state object `G`.
   - Calls `GAME_CONFIG.initTreeStates(TREE)` if the hook exists (tree states that cross-reference each other must be set here, after `TREE` exists).
   - Calls `initResizable()` — wires the drag handles on the three-panel layout.
   - Calls `runBootSequence()` — shows the animated terminal intro; when the player hits Enter or submits a codename, calls `startGame()`.

---

## 4. The Engine Plugin Interface (GAME_CONFIG)

`GAME_CONFIG` is the only contract between a mission and the engine. The engine never imports any mission file — it reads `GAME_CONFIG` as a global, so the mission is responsible for setting it before `engine.js` runs.

### Identity fields

```js
title:        'GIT HEIST',           // String — displayed on intro screen
promptSuffix: 'layer-01:~/vault-repo$', // String — appended to operative name in terminal header
```

### Boot sequence

```js
bootLines: [
  { text: '> scanning target...', cls: 'dim', pause: 180 },
  // ...5–10 entries
]
```

Each entry has:
- `text`: string to type-animate into `#bootTerminal`
- `cls`: CSS class applied to the `<span>` (e.g. `'dim'`, `'ok'`, `'warn'`)
- `pause`: milliseconds to wait after the line finishes before starting the next

The boot sequence is skippable by clicking or pressing any key.

### Command glossary

```js
cmdDescriptions: {
  'git status': 'show working tree state',
  'git stash':  'hide uncommitted changes temporarily',
  // ...
}
```

Two roles: (1) drives `logCmd()` — a command is only logged if it prefix-matches a key here; (2) provides descriptions for the downloadable cheat sheet. Keys must match exactly how the player types the command (normalised: trimmed, single spaces).

### Cheat sheet config

```js
cheatSheetTitle:    'GIT HEIST // COMMAND RECORD',  // Header line in downloaded .txt
cheatSheetFilename: 'git-heist-commands.txt',       // Downloaded filename
cheatSheetFooter:   'git-heist-v1 // operative record',
```

### Help output

```js
alwaysAvailableHelp: [
  'git status       — always works',
  'git log          — always works',
]
```

These lines are appended (with CSS class `'dim'`) in the output of `help` at every stage.

### Police mechanic

```js
policeRiskyCmds: ['git reset --hard', 'git push --force', 'git push -f'],
policeWarnings: [
  "scanner picked up anomalies. you've got 30 seconds to complete this step. move.",
  "IDS alert — they're watching. 30 seconds. don't freeze.",
  "police bot flagged your session. 30 seconds. finish the step.",
],
```

- Any command that equals or starts with a `policeRiskyCmds` entry triggers `triggerPolice()`.
- The police countdown is 30 seconds. Completing the current stage clears it. Reaching 0 deducts 10 points.
- At 3 wrong commands (`POLICE_TRIGGER_WRONGS = 3`), `triggerPolice()` is also called. The `policeWarnings` array is rotated by `G.stageWrongs % warnings.length` to vary the message.
- Two additional police triggers exist in stage data: `policeOnLoad: true` starts the countdown when the stage loads; `policeWarnModal: true` additionally shows a Fox popup modal before starting the clock.

### Security layer display hook

```js
securityLayerLabel(bypassed, probing) {
  // bypassed: int — how many rooms completed (floor(roomIdx/2)+1)
  // probing: int — bypassed + 1, capped at 4
  // returns string shown in top-bar sec status
  return `layer_0${bypassed}: bypassed // layer_0${probing}: probing`;
}
```

Called every time a room loads (`updateSecurityDots()`).

### Active branch display hook

```js
activeBranchLabel(treeKey) {
  // treeKey: string — the TREE key just rendered
  // returns string shown in the "active_env" chip in the right panel
  return treeKey.includes('r3') ? 'local/operative' : 'local/main';
}
```

Called by `updateActiveBranch(treeKey)` whenever the tree state changes.

### Always-available command fallback

```js
alwaysAvailable(cmd, stage) {
  // cmd: normalised command string (trimmed, single spaces)
  // stage: current stage object
  // return: array of [text, cssClass] pairs to print, OR null to fall through
  if (cmd === 'git status') return [['On branch main', 'br'], ...];
  return null;
}
```

Called after all other matching (exact accepted, wrong map) fails. If it returns a non-null value, that output is printed and the command is treated as handled (no wrong-counter increment, no "command not recognized" message). Return `null` to let the engine print the default error.

### Special command parser

```js
parseSpecial(cmd, stage, { tprint, logCmd, advance, H }) {
  // cmd: normalised command string
  // stage: current stage object
  // tprint(lines): print to terminal — lines is [[text, cls], ...]
  // logCmd(cmd): log a command to the cheat sheet
  // advance(treeKey): complete the current stage, optionally updating the tree
  // H: array of session hashes (H[1]–H[8])
  // return: truthy (e.g. {}) if handled, null to continue to standard matching
}
```

Called before exact-match checking. Use for stages that require flexible parsing: regex matching on commit messages (`flexCommit`), accepting multiple equivalent commands (`flexStashPop`), etc. The stage must have a boolean flag (e.g. `stage.flexCommit`) that `parseSpecial` checks before acting, so it ignores stages it doesn't own.

### File editor

```js
fileContent: {
  edit: {
    text: `...initial file content...`,   // Pre-filled textarea content
    hint: 'change <code>x</code> → <code>y</code>',  // HTML shown below textarea
  },
  conflict: {
    text: `...file with <<<<<<< markers...`,
    hint: 'remove the markers...',
  },
},
```

Two named slots: `edit` (regular file edit) and `conflict` (merge conflict). A stage uses `fileEdit: true` to show the editor; `fileEditType: 'conflict'` selects the conflict slot. The engine calls `openEditor()` automatically when the stage loads if `fileEdit: true` is set.

### File validator

```js
validateFile(val, isConflict) {
  // val: string — current textarea content
  // isConflict: boolean — whether this is the conflict editor
  // returns { pass: boolean, output: [[text, cls], ...] }
}
```

Called by `saveFile()` when the player clicks SAVE FILE. If `pass` is true, `G.fileEditDone` is set to `true`, which unblocks the `git add` stage that follows. The `output` lines are printed to the terminal either way.

### Tree state bootstrapper

```js
initTreeStates(TREE) {
  // Called once, immediately after data.js loads TREE, before the game starts.
  // Use to define states that reference other TREE entries.
  TREE['r1_initial'] = { ... };
  TREE['r2_initial'] = TREE['r2_remote'];  // reference copy
}
```

Optional. If `GAME_CONFIG.initTreeStates` exists, the engine calls it at the bottom of its own script execution, passing the `TREE` object. This is the only hook for derived or reference-copied states that can't be defined inside `data.js` (because `data.js` runs top-to-bottom, so a key can't reference another key that hasn't been defined yet).

### Quiz pool

```js
cmdQuizPool: {
  'git stash': {
    q: 'Question text?',
    options: ['A', 'B', 'C', 'D'],
    correct: 1,        // 0-indexed
    explain: 'Explanation shown after answering.',
  },
  // Keys must match cmdDescriptions keys exactly.
},
staticQuiz: [
  { q: '...', options: [...], correct: 0, explain: '...' },
  // ...
],
```

After all rooms are complete, `buildQuiz()` assembles 4 questions: up to 2 from `cmdQuizPool` (chosen based on commands the player actually used — matched against `cmdLog`), filled to 4 with shuffled `staticQuiz` entries. All `cmdQuizPool` keys must exist as keys in `cmdDescriptions`.

---

## 5. How ROOMS Drives the Game Loop

`ROOMS` is a plain JS array. Each entry is one room. Rooms are 0-indexed (`id: 0` is the first room). The engine tracks position with `G.roomIdx` and `G.stageIdx`.

### Room object shape (actual fields used by engine)

```js
{
  id: 0,                    // Integer, 0-based, sequential — must equal array index
  name: 'THE EQUIPMENT',    // String — shown in room header
  intro: 'Narrative text.', // String — printed to terminal when room loads
  initialTree: 'r0_initial',// String key into TREE — defaults to 'r<id>_initial' if omitted
  clue: {
    label: 'SECTOR',        // String — shown as key in room-complete modal
    value: 'V0-CORE',       // String — type-animated as the clue value; must be unique across rooms
  },
  stages: [ /* stage objects */ ],
  hints: [
    ['hint level 1', 'hint level 2', 'hint level 3'],  // one array per stage
    // hints.length must equal stages.length
    // each inner array must have exactly 3 elements
  ],
}
```

### Stage object shape

```js
{
  // Required:
  accepted: ['git status', 'git status -s'],  // Commands that pass this stage (normalised strings)
  foxMsg: 'Text shown in Fox panel.',          // OR foxMessage — either key works

  // Optional narrative:
  task: 'Visible task description.',           // Shown in `help` output
  output: [['text', 'cssClass'], ...],         // Printed to terminal on success
  wrong: {
    'git add': [['wrong-response text', 'warn']],  // Per-command wrong responses
  },
  tree: 'r0_initial',         // TREE key to render when stage is completed (advance's argument)
  completionMsg: 'Shown in room-done modal.',  // Only on last stage of a room

  // Concept brief (shown as a modal before the stage):
  conceptBrief: {
    title: 'CONCEPT NAME',
    bullets: ['point 1', 'point 2'],
    ascii: '  diagram  ',   // optional
  },

  // File editor stages:
  fileEdit: true,             // Open editor automatically when stage loads
  fileName: 'entry-tokens.txt', // Default is 'config.json'
  fileEditType: 'conflict',   // 'conflict' selects the conflict slot in fileContent

  // Flexible/special command stages (handled by parseSpecial):
  flexCommit: true,           // parseSpecial checks this to handle flexible git commit -m
  flexStashPop: true,         // parseSpecial checks this to handle git stash pop/apply

  // Police triggers:
  policeOnLoad: true,         // Start police countdown when this stage loads
  policeWarnModal: true,      // Show a Fox popup before starting the clock
  policePopupMsg: 'Text in popup.', // Text shown in policeWarnModal
}
```

### Game loop sequence

```
startGame()
  └── loadRoom()
        ├── print room header to terminal
        ├── renderTree(room.initialTree)
        ├── updateActiveBranch(room.initialTree)
        └── [show conceptBrief modal if stage 0 has one]
              └── loadNextStageUI()
                    ├── foxMsg(stage.foxMsg)
                    ├── if stage.fileEdit: openEditor() after 900ms
                    └── if stage.policeOnLoad: triggerPolice() or showPoliceWarnModal()

player types command → inp keydown → parseCmd(raw)
  ├── universal commands: clear, hint, help
  ├── risky command check → triggerPolice() if match
  ├── fileEdit trigger: 'edit <filename>' → openEditor()
  ├── GAME_CONFIG.parseSpecial() → if returns truthy, stop
  ├── exact match in stage.accepted → advance(stage.tree)
  ├── wrong map check → print wrong response, countWrong()
  ├── GAME_CONFIG.alwaysAvailable() → if returns non-null, print output
  └── fallback → 'command not recognized', flashTerminal(), countWrong()

advance(treeKey)
  ├── if treeKey: renderTree(treeKey) + updateActiveBranch(treeKey)
  ├── clearPolice()
  ├── addScore(+10)
  ├── G.stageIdx++
  ├── if last stage in room → completeRoom()
  │     ├── save progress to localStorage
  │     ├── push clue to G.clues
  │     └── show #roomDone modal
  └── else → loadNextStageUI() for next stage

goNextRoom()  [triggered by Enter on roomDone modal]
  ├── G.roomIdx++
  ├── if last room → buildQuiz() → show #quizScreen
  └── else → loadRoom()
```

### Hint system

Hints are stored on the room, not the stage. `room().hints[G.stageIdx]` gives the 3-level array for the current stage. Opening the hint costs 1 point. Advancing to hint 2 costs 5 more. Advancing to hint 3 (the answer) costs 15 more and adds 3 to `G.totalHints`. Hint level resets to 0 when the stage advances.

### Scoring

| Event | Points |
|---|---|
| Stage completed | +10 |
| Hint opened (first level) | -1 |
| Hint level 2 | -5 |
| Hint level 3 (answer) | -15 |
| 2nd+ wrong command in a stage | -1 per |
| Police raid (countdown reaches 0) | -10 |
| Correct quiz answer | +5 |
| Score floor | 0 (never negative) |

---

## 6. How TREE Drives the Visual Git Graph

`renderer.js` exposes a single function: `renderTree(stateKey)`. It reads `TREE[stateKey]`, clears `#gitTree` (an SVG element), and redraws from scratch.

### TREE state object shape

```js
{
  branches: [
    {
      name: 'main',          // String — label rendered to the right of last commit
      y: 80,                 // Number — vertical position in the SVG viewBox (0–360)
      color: '#1D9E75',      // Hex color for the line and commit circles
      dashed: false,         // Optional boolean — dashed line, reduced opacity (for remote branches)
      commits: [
        { x: 40 },           // Each commit: x position in the SVG viewBox (0–240)
        { x: 90 },
        // ...
      ],
    },
    // ...
  ],
  HEAD: {
    type: 'branch',          // 'branch' or 'detached'
    ref: 'main',             // Branch name (for type:'branch') — must match a branch.name
    ci: 1,                   // Commit index into branch.commits (0-based, from left)
    branchY: 80,             // Optional — explicitly specify the branch Y if ref lookup is ambiguous
    // For type:'detached':
    cx: 130,                 // X position of the detached HEAD diamond
    cy: 160,                 // Y position
  },
  extras: [
    // Optional visual annotations:
    { type: 'remote-box',        x, y, label, color },   // Bordered rectangle with label
    { type: 'arrow',             x1, y1, x2, y2 },       // Dashed arrow between two points
    { type: 'staged-indicator',  x, y },                 // Green text: '● changes staged'
    { type: 'dirty-indicator',   x, y },                 // Red text: '⚠ working tree dirty'
    { type: 'stash-indicator',   x, y },                 // Amber text: '◎ stash@{0}: WIP saved'
    { type: 'conflict-indicator',x, y },                 // Red text: '✕ CONFLICT: <filename>'
    { type: 'revert-label',      x, y },                 // Green text: 'revert↑' above a commit
  ],
}
```

**SVG coordinate system:** viewBox is `0 0 240 360`. Typical branch Y values: 50–210 (spread vertically to avoid overlap). Typical commit X values: 25–205 (evenly spaced). Leave right-side space (x > 140) for branch name labels.

**HEAD rendering:**
- `type: 'branch'` → small downward arrow above the commit at `branch.commits[ci]`, labelled `HEAD`.
- `type: 'detached'` → diamond shape at `(cx, cy)`, labelled `HEAD (detached)` above.

**Derived states via initTreeStates:** When one TREE state should equal another (e.g. `r2_initial` starts identical to `r2_remote`), set `TREE['r2_initial'] = TREE['r2_remote']` inside `initTreeStates`. This is a reference copy — the same object is shared. If the state needs to differ, assign a new object.

---

## 7. How Tests Work

Tests use Node.js's native test runner (`node:test` + `node:assert/strict`). Run with:

```
npm test
# expands to: node --test tests/*.test.js
```

The only dev dependency is `jsdom` — used to simulate a browser DOM in Node.

### The bridge pattern for const/let globals

This is the critical non-obvious pattern. When jsdom runs a `<script>` tag, each script runs in its own V8 context/scope. A variable declared with `const` or `let` inside that script **does not** become a property of `window`. Only `var` declarations and explicit `window.foo = ...` assignments do.

Vault Zero's source files use `const ROOMS = [...]` and `const G = {...}` — which means they're invisible to tests via `win.ROOMS` or `win.G` after the script loads.

**The fix:** The `inject()` helper in tests appends a bridge snippet to each script's source code. The bridge runs in the same script scope, so it can read the `const`/`let` variables and copy them to `window` with a `_` prefix:

```js
function inject(file, bridge) {
  const s = win.document.createElement('script');
  s.textContent = readFileSync(resolve(__dir, '..', file), 'utf8') + '\n' + bridge;
  win.document.head.appendChild(s);
}

inject('missions/git-heist/data.js', `
  window._ROOMS = ROOMS;
  window._TREE  = TREE;
`);

inject('js/engine.js', `
  window._G     = G;
  window._H     = H;
  window._cmdLog = cmdLog;
  // Expose getters for let-reassigned primitives:
  window._getQuizQs      = () => quizQuestions;
  window._getQuizIdx     = () => quizIdx;
  window._getQuizCorrect = () => quizCorrect;
  // Mutation helper inside engine scope:
  window._resetG = function() {
    G.roomIdx = 0; G.stageIdx = 0; /* ... */
    if (policeActive) clearPolice(true);
  };
`);
```

After injection, tests reference the exports:
```js
G     = win._G;      // Object reference — mutations propagate back into engine scope
ROOMS = win._ROOMS;  // Same object ROOMS refers to inside engine scope
```

**For `let` primitives that get reassigned** (like `quizIdx = 0`), storing the primitive in `window._quizIdx` captures only the value at injection time. Instead, expose a getter closure: `window._getQuizIdx = () => quizIdx`. This captures the variable itself, so calling `win._getQuizIdx()` always returns the current value.

### State reset between tests

Engine state (`G`, `cmdLog`, `policeActive`) persists across tests because there's one shared jsdom instance (created in `before()`). Tests that modify state must call `resetG()` at the start. `resetG()` calls `win._resetG()` which runs inside the engine scope and can directly mutate all `let` variables:

```js
window._resetG = function() {
  G.roomIdx = 0; G.stageIdx = 0;
  G.score = 0; G.stageWrongs = 0;
  cmdLog.length = 0;
  if (policeActive) clearPolice(true);
};
```

### What is tested

`engine.test.js` covers:
- `normalise()` — whitespace collapsing
- `genHash()` / `interp()` — hash generation and `{{H1}}` substitution
- `logCmd()` — deduplication and prefix matching
- ROOMS data integrity — sequential IDs, stage/hint counts, clue uniqueness
- Quiz pool data integrity — field presence, `correct` in bounds, keys in cmdDescriptions
- `buildQuiz()` — question selection, count, no duplicates
- `addScore()` — floor at 0, positive/negative deltas
- `saveFile()` — validation pass/fail for both edit and conflict types
- `parseCmd()` — accepted commands advance stage, unrecognised increment wrong counter, flex handlers

`hub.test.js` covers:
- DOM structure of `index.html` — brand elements, hero stats, mission cards, locked cards, inline scripts

---

## 8. Adding a New Mission (Overview)

A new mission requires:
1. A folder under `missions/<mission-name>/` with three files: `config.js`, `data.js`, `<mission-name>.html`
2. A mission card in `index.html`
3. Optionally, a test file in `tests/`

See `docs/MISSION_BUILDER.md` for the complete step-by-step guide.

The engine requires no changes for a new mission. All mission-specific behaviour is provided through `GAME_CONFIG` hooks.
