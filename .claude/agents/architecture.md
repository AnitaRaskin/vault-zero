---
name: architecture
description: Use when asked about Vault Zero's system structure, file layout, engine internals, script load order, the GAME_CONFIG plugin interface, how ROOMS drives the game loop, how TREE drives the SVG renderer, or how tests work (jsdom bridge pattern, state reset, what is covered). Also use when deciding where code belongs or how a new file fits into the existing structure.
tools: Read, Bash, Edit
---

# Vault Zero — Architecture Reference

> Source of truth: the code. When anything here conflicts with the code, trust the code.

---

## 1. What Is Vault Zero

Browser-based escape room platform for teaching developer concepts to junior engineers. Each **mission** wraps a set of developer commands inside a heist/thriller narrative. Players type real commands into an in-browser terminal, advance through staged puzzles, and collect clues.

**Core constraints (non-negotiable):**

- **No build step, no bundler.** Plain HTML, CSS, and vanilla JS. Runs by opening an HTML file or serving from any static host.
- **No frameworks.** No React, no Vue, no bundlers. Everything is global script scope.
- **Teachable via inspection.** DevTools can read every source file. The platform teaches developers, so the platform itself is readable.
- **Engine is game-agnostic.** `js/engine.js` knows nothing about Git, heists, or any specific mission. All mission-specific content lives in the mission's `config.js` and `data.js`.

---

## 2. File and Folder Structure

```
vault-zero/
├── index.html                  # Hub/lobby — lists all missions
├── css/
│   ├── shared.css              # Tokens: scanline, fonts, base resets
│   ├── game.css                # Game UI: terminal, panels, modals, police alert
│   └── hub.css                 # Hub-only: mission cards, hero, telemetry sidebar
├── js/
│   ├── engine.js               # Game loop, command parsing, scoring, police, quiz, boot
│   ├── renderer.js             # SVG git tree renderer (reads TREE global, writes to #gitTree)
│   └── supabase.js             # Leaderboard: saveScore() and getLeaderboard()
├── missions/
│   └── git-heist/
│       ├── git-heist.html      # Mission page: full HTML shell with all modal scaffolding
│       ├── config.js           # Defines GAME_CONFIG — all mission-specific logic
│       └── data.js             # Defines ROOMS array and TREE object
├── .claude/agents/             # AI-agent-ready reference files (this file lives here)
└── tests/
    ├── engine.test.js          # Engine unit tests
    └── hub.test.js             # Hub page DOM tests
```

No `dist/`, no `build/`, no transpilation. `node_modules/` is only for `jsdom` (dev/test).

---

## 3. How a Mission Page Works

### Script loading order (fixed, must not change)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="./config.js"></script>      <!-- sets window.GAME_CONFIG -->
<script src="./data.js"></script>        <!-- sets window.ROOMS and window.TREE -->
<script src="../../js/renderer.js"></script>
<script src="../../js/supabase.js"></script>
<script src="../../js/engine.js"></script>  <!-- reads globals, starts game -->
```

The engine reads `GAME_CONFIG`, `ROOMS`, and `TREE` as globals the moment it executes. Wrong order = crash.

### Page load sequence

1. HTML parsed, all DOM elements exist.
2. Scripts execute top-to-bottom.
3. `config.js` → `window.GAME_CONFIG`
4. `data.js` → `window.ROOMS` and `window.TREE`
5. `renderer.js` → defines `renderTree()` (no-op until called)
6. `supabase.js` → calls `supabase.createClient()`, defines `saveScore()` / `getLeaderboard()`
7. `engine.js` runs:
   - Generates 8 session hashes `H[1]`–`H[8]`
   - Initialises global state `G`
   - Calls `GAME_CONFIG.initTreeStates(TREE)` if it exists
   - Calls `initResizable()` — wires drag handles on the three-panel layout
   - Calls `runBootSequence()` → when player hits Enter, calls `startGame()`

---

## 4. The Engine Plugin Interface (GAME_CONFIG)

`GAME_CONFIG` is the only contract between a mission and the engine.

### Identity

```js
title:        'GIT HEIST',
promptSuffix: 'layer-01:~/vault-repo$',
```

### Boot sequence

```js
bootLines: [
  { text: '> scanning target...', cls: 'dim', pause: 180 },
]
// text: string, cls: CSS class, pause: ms after line
```

Skippable by clicking or pressing any key.

### Command glossary

```js
cmdDescriptions: {
  'git status': 'show working tree state',
}
// Two roles: (1) drives logCmd() — only prefix-matching commands get logged;
// (2) provides descriptions for the downloadable cheat sheet
```

### Cheat sheet

```js
cheatSheetTitle:    'GIT HEIST // COMMAND RECORD',
cheatSheetFilename: 'git-heist-commands.txt',
cheatSheetFooter:   'git-heist-v1 // operative record',
```

### Help output

```js
alwaysAvailableHelp: ['git status — always works']
// Appended with class 'dim' to 'help' output at every stage
```

### Police mechanic

```js
policeRiskyCmds: ['git reset --hard', 'git push --force'],
policeWarnings:  ['scanner picked up anomalies. 30 seconds.', ...]
// Risky command match → triggerPolice(). 3 wrong commands → triggerPolice().
// Countdown: 30s. Completing stage clears it. Reaching 0: -10 points.
// Stage flags: policeOnLoad: true (auto-start), policeWarnModal: true (Fox popup first)
```

### Display hooks

```js
securityLayerLabel(bypassed, probing) { return '...'; }
// bypassed = floor(roomIdx/2)+1, probing = bypassed+1 (cap 4)
// Returns string for top-bar security status

activeBranchLabel(treeKey) { return '...'; }
// Returns string for "active_env" chip in right panel
```

### Always-available fallback

```js
alwaysAvailable(cmd, stage) {
  if (cmd === 'git status') return [['On branch main', 'br'], ...];
  return null; // fall through to "command not recognized"
}
// Called after all matching fails. Non-null return: handled (no wrong-counter increment).
```

### Special command parser

```js
parseSpecial(cmd, stage, { tprint, logCmd, advance, H }) {
  // Called BEFORE exact-match. Return truthy ({}) if handled, null to continue.
  // Gate on stage flags (e.g. stage.flexCommit) to scope to specific stages only.
  return null;
}
```

### File editor

```js
fileContent: {
  edit:     { text: '...', hint: 'HTML hint' },
  conflict: { text: '...with <<<<<<< markers...', hint: '...' },
}
validateFile(val, isConflict) {
  return { pass: boolean, output: [[text, cls], ...] };
}
// Stage flag: fileEdit: true → editor opens automatically.
// G.fileEditDone must be true before accepted commands unblock.
```

### Tree state bootstrapper

```js
initTreeStates(TREE) {
  TREE['r1_initial'] = { ... };
  TREE['r2_initial'] = TREE['r2_remote']; // reference copy
}
// Called once after data.js loads TREE. Use for states that cross-reference each other.
```

### Quiz pool

```js
cmdQuizPool: {
  'git stash': { q: '...', options: ['A','B','C','D'], correct: 1, explain: '...' },
  // Keys must match cmdDescriptions keys exactly
},
staticQuiz: [{ q: '...', options: [...], correct: 0, explain: '...' }],
// buildQuiz(): up to 4 from cmdQuizPool (based on used commands) + shuffled staticQuiz to fill 7 total
```

---

## 5. How ROOMS Drives the Game Loop

`ROOMS` is a plain JS array. Rooms are 0-indexed (`id: 0` = first room). Engine tracks position with `G.roomIdx` and `G.stageIdx`.

### Room object (fields used by engine)

```js
{
  id: 0,                    // Integer, 0-based, must equal array index
  name: 'THE EQUIPMENT',    // Shown in room header
  intro: 'Narrative text.', // Printed to terminal when room loads
  initialTree: 'r0_initial',// TREE key; defaults to 'r<id>_initial' if omitted
  clue: { label: 'SECTOR', value: 'V0-CORE' },
  stages: [ /* stage objects */ ],
  hints: [
    ['level 1', 'level 2', 'level 3'], // one array per stage; must equal stages.length
  ],
}
```

### Stage object (all engine-used fields)

```js
{
  // Required:
  accepted: ['git status'],          // Commands that pass (normalised: trimmed, single spaces)
  foxMsg: 'Fox panel text.',         // alias: foxMessage

  // Optional narrative:
  task: 'Visible task description.',
  output: [['text', 'cssClass'], ...],
  wrong: { 'git add': [['response', 'warn']] },
  tree: 'r0_initial',                // TREE key rendered on stage completion
  completionMsg: 'Room-done modal.', // Only on last stage of a room

  // Concept brief (modal before stage):
  conceptBrief: { title: 'CONCEPT', bullets: ['...'], ascii: '...' },

  // File editor:
  fileEdit: true, fileName: 'config.json', fileEditType: 'conflict',

  // Flexible parsing:
  flexCommit: true, flexStashPop: true,

  // Police:
  policeOnLoad: true, policeWarnModal: true, policePopupMsg: 'Text.',
}
```

### Game loop sequence

```
startGame() → loadRoom()
  ├── print room header, renderTree(initialTree), updateActiveBranch()
  └── loadNextStageUI()
        ├── foxMsg(), openEditor() if fileEdit, triggerPolice() if policeOnLoad

player types → parseCmd(raw)
  ├── universal: clear, hint, help
  ├── risky check → triggerPolice()
  ├── 'edit <file>' → openEditor()
  ├── GAME_CONFIG.parseSpecial() → if truthy, stop
  ├── exact match in accepted → advance(stage.tree)
  ├── wrong map → print wrong, countWrong()
  ├── GAME_CONFIG.alwaysAvailable() → if non-null, print
  └── fallback → 'command not recognized', flashTerminal(), countWrong()

advance(treeKey)
  ├── renderTree(treeKey), clearPolice(), addScore(+10), G.stageIdx++
  ├── if last stage → completeRoom() → save progress, push clue, show #roomDone
  └── else → loadNextStageUI()
```

### Hint system

`room().hints[G.stageIdx]` gives the 3-level array. Level 1: free. Level 2: -5 pts. Level 3: -15 pts, +1 to `G.totalHints`. Resets to 0 on stage advance.

### Scoring

| Event | Points |
|---|---|
| Stage completed | +10 |
| Hint level 2 | -5 |
| Hint level 3 | -15 |
| 2nd+ wrong command | -1 per |
| Police raid (0s) | -10 |
| Correct quiz answer | +5 |
| Good commit message | +5 |
| Floor | 0 (never negative) |

---

## 6. How TREE Drives the SVG Graph

`renderer.js` exposes `renderTree(stateKey)`. Reads `TREE[stateKey]`, clears `#gitTree`, redraws.

### TREE state object

```js
{
  branches: [{
    name: 'main', y: 80, color: '#1D9E75',
    dashed: false,             // true = remote-tracking branch
    commits: [{ x: 40 }, { x: 90 }],
  }],
  HEAD: {
    type: 'branch',            // or 'detached'
    ref: 'main',               // branch.name (for type:'branch')
    ci: 1,                     // commit index (0-based from left)
    branchY: 80,               // optional explicit Y
    // for type:'detached':
    cx: 130, cy: 160,
  },
  extras: [
    { type: 'remote-box',        x, y, label, color },
    { type: 'arrow',             x1, y1, x2, y2 },
    { type: 'staged-indicator',  x, y },
    { type: 'dirty-indicator',   x, y },
    { type: 'stash-indicator',   x, y },
    { type: 'conflict-indicator',x, y },
    { type: 'revert-label',      x, y },
  ],
}
// SVG viewBox: 0 0 240 360. Branch Y: 50–210. Commit X: 25–205.
```

---

## 7. How Tests Work

```
npm test   # → node --test tests/*.test.js
```

Only dev dependency: `jsdom` (simulates browser DOM in Node).

### The bridge pattern (critical)

`const`/`let` inside a script tag don't become `window` properties. The `inject()` helper appends a bridge snippet to copy them:

```js
inject('missions/git-heist/data.js', `
  window._ROOMS = ROOMS;
  window._TREE  = TREE;
`);
inject('js/engine.js', `
  window._G    = G;
  window._H    = H;
  window._resetG = function() { G.roomIdx=0; G.stageIdx=0; /* ... */ };
  // For let primitives that get reassigned, expose a getter:
  window._getQuizIdx = () => quizIdx;
`);
```

After injection: `G = win._G` — object reference, mutations propagate back into engine scope.

### State reset between tests

Engine state persists across tests (one shared jsdom instance). Tests that modify state must call `resetG()` → `win._resetG()` which runs inside engine scope and can directly mutate `let` variables.

### What is tested

- `normalise()`, `genHash()`, `interp()`, `logCmd()`
- ROOMS data integrity (sequential IDs, stage/hint counts, clue uniqueness)
- Quiz pool integrity, `buildQuiz()`
- `addScore()` floor
- `saveFile()` validation
- `parseCmd()` — accepted, wrong counter, flex handlers

---

## 8. Adding a New Mission (Overview)

Requires: `missions/<name>/config.js`, `data.js`, `<name>.html`, a hub card in `index.html`, optionally a test file. The engine requires no changes — all mission behaviour is in `GAME_CONFIG`. See `mission-builder` agent for the full step-by-step guide.
