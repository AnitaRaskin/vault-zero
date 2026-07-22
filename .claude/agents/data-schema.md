---
name: data-schema
description: Use when writing or reviewing data.js or config.js — field names, types, required vs optional, valid values, CSS class names, the {{H}} placeholder system, TREE state naming conventions. Reference this before adding a stage, room, TREE state, or GAME_CONFIG field. Also use when debugging "what does this field do" questions.
tools: Read, Edit
---

# Vault Zero — Data Schema Reference

> Derived from `missions/git-heist/data.js` and `missions/git-heist/config.js`.
> When this conflicts with the code, trust the code.

---

## 1. ROOMS Array

`ROOMS` is a plain JS array assigned to `window.ROOMS`. Each element is a room object.

### Room Object

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | number | yes | 0-based, must equal array index |
| `name` | string | yes | Display name, ALL CAPS |
| `intro` | string | yes | Narrative paragraph printed at room load |
| `clue` | object | yes | `{ label: string, value: string }` |
| `stages` | array | yes | 2–6 stage objects |
| `hints` | array | yes | Parallel to stages; each element is a 3-string array |
| `initialTree` | string | no | TREE key for first visual state; defaults to `'r<id>_initial'` |

**clue fields:**
- `label` — Short uppercase identifier shown in room-complete modal (e.g. `'SECTOR'`). Must be **unique across all rooms**.
- `value` — Secret fragment type-animated in the modal (e.g. `'V0-CORE'`).

**hints** — `hints.length` must equal `stages.length`. Each element is an array of exactly 3 strings. The third string should end with `\n\nrun: <exact command>` — the engine renders text after a blank line starting with `run:` or `type:` in a highlighted style.

---

### Stage Object

All fields verified against real git-heist stage data.

| Field | Type | Required | Notes |
|---|---|---|---|
| `foxMsg` | string | yes | Fox panel message. Alias `foxMessage` also accepted. |
| `task` | string | yes | One-sentence task description, shown in `help` output |
| `accepted` | string[] | yes | Commands that pass. Normalised (trimmed, single spaces). Supports `{{H1}}`–`{{H8}}`. |
| `output` | [string,string][] | yes (may be `[]`) | Lines printed on success: `[text, cssClass]` pairs |
| `tree` | string | yes | TREE key to render after stage completes |
| `wrong` | object | yes (may be `{}`) | Map of wrong-command string → `[text, cls][]` |
| `completionMsg` | string | no | Only on last stage of a room. Shown in "ROOM CLEARED" modal. |
| `conceptBrief` | object | no | Modal shown before this stage. Shape: `{ title, bullets, ascii? }` |
| `policeOnLoad` | boolean | no | Auto-starts 30s countdown when stage loads |
| `policeWarnModal` | boolean | no | Use with `policeOnLoad`. Shows Fox popup before countdown. Requires `policePopupMsg`. |
| `policePopupMsg` | string | no | Message for `policeWarnModal` popup. `\n\n` separates paragraphs. |
| `fileEdit` | boolean | no | Editor opens automatically; blocks `accepted` until `G.fileEditDone = true` |
| `fileName` | string | no | Shown in editor title and used to open via `edit <file>`. Default: `'config.json'` |
| `fileEditType` | string | no | Only value: `'conflict'` — selects conflict slot in `fileContent` |
| `flexCommit` | boolean | no | Activates flexible commit handler in `parseSpecial` |
| `flexStashPop` | boolean | no | Activates flexible stash-pop handler; accepts both `pop` and `apply` |

---

## 2. Stage Type Flags

Stages have no explicit `type` field. The engine detects type by checking boolean flags. Flags are composable.

### Standard stage (no flags)
Normalise player input → check `accepted` → if match, print `output`, advance. If matches `wrong` key, print wrong response, increment wrong counter. Otherwise: `alwaysAvailable`, then "command not recognized".

### `conceptBrief` stage
Shows modal **before** `loadNextStageUI()`. Player dismisses → stage begins normally.

### `fileEdit` stage
Editor opens 900ms after stage loads. `accepted` commands are blocked until `G.fileEditDone = true` (set by a passing `validateFile()` call).

### `policeOnLoad` (without `policeWarnModal`)
30s countdown starts 1400ms after stage loads.

### `policeOnLoad` + `policeWarnModal`
800ms after load: police popup shows `policePopupMsg`. After player dismisses: Fox message plays, countdown starts immediately.

### `flexCommit`
`parseSpecial` checks `stage.flexCommit`. Accepts `git commit -m "..."` pattern. Extracts message, prints commit line. Warns on short/generic messages but still advances.

### `flexStashPop`
`parseSpecial` checks `stage.flexStashPop`.
- `git stash pop` → `stage.output`, advance
- `git stash apply` → educational note about pop/apply difference, then advance

---

## 3. Output CSS Classes

Used in `output` and `wrong` arrays: `[text, cssClass]` pairs.

| Class | Color | Use for |
|---|---|---|
| `"ok"` | Green | Success, confirmation, expected output |
| `"err"` | Red | Errors, alarming output, bad states |
| `"warn"` | Amber | Caution, near-miss, tips to redirect |
| `"sys"` | Teal | System output, neutral informational |
| `"dim"` | Muted grey | Secondary detail, context, comments |
| `"hl"` | Highlighted | Important data the player must read |
| `"br"` | Branch style | Branch names |
| `"cm"` | Commit style | Lines with `abc1234 message` format |
| `""` | Default | Blank separator lines: `["", ""]` |

---

## 4. TREE Object

`TREE` is a plain JS object assigned to `window.TREE`. Each key is a state name, each value is a tree state object.

### Tree State Object

```js
{
  branches: [
    {
      name: 'main',          // Label displayed right of last commit circle
      y: 80,                 // Vertical position in SVG viewBox (0–360)
      color: '#1D9E75',      // Hex. Use alpha for dimmed remotes (e.g. '#1D9E7566')
      dashed: false,         // Optional. True = dashed line, reduced opacity (remote branches)
      commits: [
        { x: 40 },           // x position in SVG viewBox (0–240)
        { x: 90 },
      ],
    },
  ],
  HEAD: {
    // Branch mode:
    type: 'branch',
    ref: 'main',             // Must match a branch.name in this state
    ci: 1,                   // Commit index (0-based from left)
    branchY: 80,             // Optional explicit Y
    // Detached mode:
    type: 'detached',
    cx: 130,                 // X of the HEAD diamond
    cy: 160,                 // Y of the HEAD diamond
  },
  extras: [
    { type: 'remote-box',         x, y, label, color },
    { type: 'arrow',              x1, y1, x2, y2 },
    { type: 'staged-indicator',   x, y },   // Green: '● changes staged'
    { type: 'dirty-indicator',    x, y },   // Red:   '⚠ working tree dirty'
    { type: 'stash-indicator',    x, y },   // Amber: '◎ stash@{0}: WIP saved'
    { type: 'conflict-indicator', x, y },   // Red:   '✕ CONFLICT: <filename>'
    { type: 'revert-label',       x, y },   // Green: 'revert↑' above a commit
  ],
}
```

**SVG coordinate system:** viewBox `0 0 240 360`. Branch Y: 50–210 (spread ~60–80px apart). Commit X: 25–205. Leave right-side space (x > 140) for branch name labels.

**Color conventions:**
- `#1D9E75` — active branches, healthy state
- `#7eb8d4` — feature/operative branches
- `#3d4943` — inactive/old branches
- `#1D9E7566` — remote-tracking (with alpha, usually also `dashed: true`)

---

## 5. GAME_CONFIG Object

Defined in `config.js`, read by the engine as `window.GAME_CONFIG`.

### Identity

```js
title:        string   // Mission name. Shown on intro screen.
promptSuffix: string   // Appended to operative name in terminal header.
```

### Boot sequence

```js
bootLines: [
  { text: string, cls: string, pause: number }
  // text: line content
  // cls: CSS class ('ok', 'warn', 'dim', etc.)
  // pause: ms to wait after line finishes
]
```

### Command glossary

```js
cmdDescriptions: {
  'git status': 'show working tree state',
  // Keys: normalised command strings (trimmed, single spaces)
  // Values: one-line descriptions
  // Two roles: cheat-sheet logging (prefix match) + cheat-sheet download content
}
cheatSheetTitle:    string
cheatSheetFilename: string
cheatSheetFooter:   string
```

### Help text

```js
alwaysAvailableHelp: string[]
// Each string rendered with class 'dim' in 'help' output at every stage
```

### Police

```js
policeRiskyCmds: string[]
// Commands that immediately trigger countdown (exact match or prefix)

policeWarnings: string[]
// Fox messages when police triggers via wrong-command accumulation
// Rotated by G.stageWrongs % length. git-heist uses exactly 3.
```

### Display hooks

```js
securityLayerLabel(bypassed: number, probing: number): string
// bypassed = floor(roomIdx/2)+1. probing = bypassed+1 (cap 4).
// Returns string for top-bar security status.

activeBranchLabel(treeKey: string): string
// Returns string for "active branch" chip in right panel.
```

### Command handlers

```js
alwaysAvailable(cmd: string, stage: object): [string,string][] | null
// Called after exact-match and wrong-map fail. Non-null = handled (no wrong counter).

parseSpecial(cmd: string, stage: object, ctx: object): {} | null
// ctx = { tprint, logCmd, advance, H }
// Called BEFORE exact matching. Return truthy if handled. Gate on stage flags.
```

### File editor

```js
fileContent: {
  edit:     { text: string, hint: string },     // HTML in hint
  conflict: { text: string, hint: string },
}
validateFile(val: string, isConflict: boolean): { pass: boolean, output: [...] }
// Called on SAVE FILE. pass: true → G.fileEditDone = true.
```

### Tree bootstrapper

```js
initTreeStates(TREE: object): void
// Called once after data.js loads TREE.
// Use for states that reference other TREE entries.
```

### Quiz pool

```js
cmdQuizPool: {
  'git stash': {
    q: string,
    options: string[4],    // exactly 4
    correct: number,       // 0-indexed
    explain: string,
  }
  // Keys MUST exist in cmdDescriptions
}
staticQuiz: Array<same shape as cmdQuizPool values>
// Engine fills quiz to 7 total: up to 4 from cmdQuizPool + shuffled staticQuiz
```

---

## 6. {{H}} Placeholder System

The engine generates 8 session-unique 7-character hex hashes at startup: `H[1]`–`H[8]`. Any string in `accepted`, `output`, `wrong` keys/values, and hint text can use `{{H1}}`–`{{H8}}` — the engine substitutes before matching or rendering.

Every playthrough shows different "commit hashes" while matching logic still works. `H[0]` is empty and unused. Only `{{H1}}`–`{{H8}}` are valid.

---

## 7. TREE State Naming Conventions (git-heist)

```
r0_initial        Room 0: single-commit main (initial)
r1_branches       Room 1: all branches visible
r1_on_fox         Room 1: HEAD on vault-schematics
r1_detached       Room 1: HEAD detached at commit
r2_remote         Room 2: single branch + remote-box extra
r2_fork           Room 2: two remote-box extras + arrow
r2_cloned         Room 2: local + remote-tracking (dashed)
r3_clean          Room 3: clean main before branch creation
r3_feature        Room 3: feature branch, HEAD on it
r3_staged         Room 3: staged-indicator extra
r3_committed      Room 3: feature branch gains a commit
r4_ahead          Room 3: feature ahead of remote
r4_pushed         Room 3: remote-tracking catches up
r_stash_dirty     Room 4: dirty-indicator
r_stash_clean     Room 4: stash-indicator
r5_dirty          Room 6: dirty-indicator
r6_dirty          Room 7: dirty-indicator
r6_partial        Room 7: partial cleanup
r6_reverted       Room 7: revert-label extra
r_conflict_initial   Room 5: conflict-indicator, diverged branches
r_conflict_resolved  Room 5: staged-indicator
r_conflict_merged    Room 5: branches aligned
```

`r0_initial`, `r1_initial`, `r2_initial`, `r3_initial` are all defined in `GAME_CONFIG.initTreeStates`, not in `data.js` directly.

---

## 8. Full Real Example — Stage Object

Room 0, Stage 1 (git-heist), unabridged:

```js
{
  conceptBrief: {
    title: "COMMITS + HEAD",
    bullets: [
      "a commit is a permanent snapshot of your project at a specific moment in time",
      "every commit has: a message, an author, a timestamp, and a short hash ID",
      "commits are linked in a chain — each one points to the one before it",
      "HEAD is a pointer that always marks where you are right now in that chain"
    ],
    ascii: "  [a1b2c3] ──→ [d4e5f6] ──→ [g7h8i9]\n   'init'        'config'     'fix'   ← HEAD"
  },
  foxMsg: "git keeps a full record of every commit ever made. 'git log' shows you that history. '--oneline' makes it compact: one line per commit. read the trail.",
  task: "View the commit history of this repo.",
  accepted: ["git log --oneline", "git log"],
  output: [
    ["{{H7}} (HEAD -> main) initial repo setup", "cm"],
    ["", ""],
    ["one commit. this repo was just created.", "dim"],
    ["HEAD means 'you are here' — your current position in history.", "dim"],
    ["main is the branch you're on. we'll get to branches later.", "dim"],
  ],
  tree: "r0_initial",
  wrong: {
    "ls": [["you already checked the files. now check the history.", "dim"]]
  }
}
```

Matching hint (`room.hints[1]`):

```js
[
  "git keeps a complete record of every save ever made. there's a command that shows the full history.",
  "git log shows the history. add --oneline to make it compact — one commit per line.",
  "--oneline compresses each commit to one line: hash + message.\n\nrun: git log --oneline"
]
```
