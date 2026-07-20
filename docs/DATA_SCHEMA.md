# Vault Zero — Data Schema Reference

> Derived from the actual source code of `missions/git-heist/data.js` and `missions/git-heist/config.js`.
> When this file conflicts with the code, trust the code. Field names here are verified against real data.
> For implementation guidance (how to build a mission step by step), see `MISSION_BUILDER.md`.
> For engine internals and the GAME_CONFIG plugin interface, see `ARCHITECTURE.md`.

---

## 1. ROOMS Array

`ROOMS` is a plain JS array assigned to `window.ROOMS`. Each element is a **room object**.

### Room Object

```
id            number     Required. 0-based integer. Must equal the element's array index.
name          string     Required. Display name, typically ALL CAPS short phrase.
intro         string     Required. Narrative paragraph printed to terminal when the room loads.
clue          object     Required. { label: string, value: string }
stages        array      Required. Array of stage objects (see below). Length: 2–6.
hints         array      Required. Parallel to stages. Each element is a 3-string array.
initialTree   string     Optional. TREE key used for the first visual state. Defaults to
                         the string 'r<id>_initial' if omitted. Provide when that default
                         key name won't match any TREE entry.
```

**clue fields:**
- `label` — Short uppercase identifier shown as the key in the room-complete modal (e.g. `'SECTOR'`). Must be unique across all rooms.
- `value` — The secret credential fragment type-animated in the modal (e.g. `'V0-CORE'`).

**hints** — `hints.length` must equal `stages.length`. Each element is an array of exactly 3 strings (levels 1, 2, 3). The third string should end with `\n\nrun: <exact command>` — the engine renders anything after the blank line that starts with `run:` or `type:` in a highlighted style.

---

### Stage Object

All fields below are verified against real git-heist stage data.

```
foxMsg          string     Required. Fox panel message. Called 'foxMsg' in data.js.
                           The engine also accepts 'foxMessage' as an alias, but actual
                           git-heist data uses 'foxMsg' throughout.

task            string     Required. One-sentence task description. Shown in 'help' output.

accepted        string[]   Required. Commands that pass this stage. Each entry is normalised
                           (trimmed, single spaces). Supports {{H1}}–{{H8}} placeholders for
                           session-unique commit hashes. All variants that should count as
                           correct must be listed.

output          [string,string][]   Required (may be empty array). Lines printed to terminal
                                    on success. Each element: [text, cssClass]. See §4 for
                                    valid CSS classes. Supports {{H1}}–{{H8}} in text strings.

tree            string     Required. TREE key to render after this stage completes.
                           If the command does not change the visual state, use the same
                           key as the room's current state.

wrong           object     Required (may be {}). Map from wrong-command string to output
                           array. Key is normalised command string. Value is [text, cls][]
                           in the same format as output. Supports {{H1}}–{{H8}} in both
                           keys and values.

completionMsg   string     Optional. Only on the last stage of a room. Text displayed in
                           the "ROOM CLEARED" modal. One sentence. Omit on all other stages.

conceptBrief    object     Optional. If present, a modal is shown BEFORE this stage loads.
                           Shape: { title: string, bullets: string[], ascii?: string }
                           title   — ALL CAPS heading in the modal.
                           bullets — Each string becomes one bullet point.
                           ascii   — Optional pre-formatted diagram (monospace). Omit if
                                     no diagram is needed.

policeOnLoad    boolean    Optional. If true, the 30-second police countdown starts
                           automatically when this stage loads.

policeWarnModal boolean    Optional. Use only together with policeOnLoad: true.
                           If true, shows a Fox popup modal first, waits for the player
                           to dismiss it, then triggers the countdown. Requires policePopupMsg.

policePopupMsg  string     Optional. The message displayed inside the policeWarnModal popup.
                           Multi-line is fine (\n\n separates paragraphs in the popup).

fileEdit        boolean    Optional. If true: (1) the file editor opens automatically on
                           stage load; (2) the engine blocks the accepted match until the
                           player has saved a passing file (G.fileEditDone = true).
                           The player opens the editor by typing 'edit <fileName>',
                           'nano <fileName>', or 'vim <fileName>'.

fileName        string     Optional. The filename shown in the editor title and used to
                           trigger the editor via 'edit <fileName>'. Defaults to 'config.json'
                           if omitted. Room 5 uses 'entry-tokens.txt'; Room 3 uses the default.

fileEditType    string     Optional. Only recognized value: 'conflict'. Selects the
                           GAME_CONFIG.fileContent.conflict slot instead of the default
                           fileContent.edit slot. Omit for regular file edits.

flexCommit      boolean    Optional. Activates the flexible commit handler in parseSpecial.
                           Accepts any 'git commit -m "<message>"' pattern. Validates the
                           message for quality (warns if short/generic but still advances).
                           Used in Room 3 stage 4 and Room 5 stage 2.

flexStashPop    boolean    Optional. Activates the flexible stash-pop handler in parseSpecial.
                           Accepts 'git stash pop' (advances) and 'git stash apply' (advances
                           with an educational note about the difference). Used in Room 4 stage 3.
```

---

## 2. Stage Type Flags — How the Engine Handles Each

Stages are not typed explicitly. The engine detects type by checking for boolean flags. Flags are composable — a single stage can have more than one (e.g. `policeOnLoad: true` + `policeWarnModal: true`).

### Standard stage (no special flags)

The default. The engine normalises the player's input and checks it against `accepted`. If it matches, `output` is printed and the stage advances. If it matches a key in `wrong`, the wrong response is printed and the wrong counter increments. If neither matches, the engine tries `GAME_CONFIG.alwaysAvailable`, then falls back to "command not recognized".

### `conceptBrief` stage

Any stage that has a `conceptBrief` field. The engine shows the modal *before* calling `loadNextStageUI()` — so the player sees the concept before the Fox message for that stage. The player dismisses the modal (click button or press Enter), then the stage begins normally.

### `fileEdit` stage

The editor opens automatically 900ms after the stage loads. The `accepted` list is checked normally, but if `G.fileEditDone` is false when the player types an accepted command, the engine prints a "edit the file first" warning instead of advancing. Once the player saves a file that passes `GAME_CONFIG.validateFile()`, `G.fileEditDone` is set to true and accepted commands work normally.

### `policeOnLoad` stage (without `policeWarnModal`)

The 30-second countdown starts automatically 1400ms after the stage loads. The player must complete the stage within 30 seconds or lose 10 points.

### `policeOnLoad` + `policeWarnModal` stage

800ms after stage load, the police popup modal appears showing `policePopupMsg`. After the player dismisses it, the Fox message plays and the countdown starts immediately. This is the most dramatic police variant — used only in Room 4, Stage 1 (the stash emergency).

### `flexCommit` stage

`parseSpecial` runs before exact matching. If `stage.flexCommit` is true and the input matches `/^git commit -m ['"].+['"]/.test(cmd)` or `/^git commit -m .+/.test(cmd)`, the commit is accepted. The engine extracts the message text and prints a commit line. If the message is fewer than 5 characters or matches a generic pattern (`wip`, `fix`, `test`, `asdf`, `temp`, `x+`, `update`), a warning is printed but the stage still advances.

### `flexStashPop` stage

`parseSpecial` runs before exact matching. If `stage.flexStashPop` is true:
- `git stash pop` → prints `stage.output`, advances normally.
- `git stash apply` → prints a custom note explaining the pop/apply difference, then advances (same tree state). Both commands are accepted as correct.

---

## 3. Output CSS Classes

Used in `output` and `wrong` values: `[text, cssClass]` pairs.

```
"ok"    Green. Success, confirmation, expected output.
"err"   Red. Error messages, alarming output, bad states.
"warn"  Amber/yellow. Caution, near-miss, tip to redirect.
"sys"   Teal-ish. System output, neutral informational lines.
"dim"   Muted grey. Secondary detail, context, comments.
"hl"    Highlighted. Important data the player needs to read.
"br"    Branch name style.
"cm"    Commit hash/message style. Use for lines showing 'abc1234 message'.
""      Default terminal color. Use for blank separator lines ["", ""].
```

The empty string `""` is used for blank lines (blank text + no class). In practice, `["", ""]` creates a visual separator.

---

## 4. TREE Object

`TREE` is a plain JS object assigned to `window.TREE`. Each key is a state name (string), each value is a **tree state object**.

### Tree State Object

```
branches    object[]   Required. Each element: { name, y, color, commits, dashed? }
HEAD        object     Required. Either branch HEAD or detached HEAD (see below).
extras      object[]   Optional. Visual annotations overlaid on the graph.
```

**Branch object:**
```
name      string     Branch label displayed to the right of the last commit circle.
y         number     Vertical position in SVG viewBox (0–360). Spread branches 60–80px apart.
color     string     Hex color for the line and commit circles. Include alpha for dimmed
                     remote branches (e.g. '#1D9E7566'). Active branches use '#1D9E75'.
                     Feature branches use '#7eb8d4'. Inactive/old branches use '#3d4943'.
commits   object[]   Array of { x: number }, left to right. x is horizontal position
                     in SVG viewBox (0–240). Typical range: x 25–205.
dashed    boolean    Optional. If true, renders as a dashed line with reduced opacity.
                     Used for remote-tracking branches (origin/main, origin/entry-window).
```

**HEAD object — branch mode:**
```
type      "branch"   Required literal.
ref       string     Branch name. Must match a branch.name in this state's branches array.
ci        number     Index into that branch's commits array (0-based from left).
                     0 = leftmost commit, length-1 = rightmost (tip).
branchY   number     Optional. Explicit Y coordinate of the branch. Use when the branch
                     lookup by ref could be ambiguous or when multiple branches share a name.
```

**HEAD object — detached mode:**
```
type      "detached"   Required literal.
cx        number       X position of the detached HEAD diamond.
cy        number       Y position of the detached HEAD diamond.
```

**Extras array — known types:**

```
{ type: "remote-box",         x, y, label, color }   Bordered rectangle labelled with 'label'.
{ type: "arrow",              x1, y1, x2, y2 }        Dashed arrow from (x1,y1) to (x2,y2).
{ type: "staged-indicator",   x, y }                  Green annotation: '● changes staged'.
{ type: "dirty-indicator",    x, y }                  Red annotation: '⚠ working tree dirty'.
{ type: "stash-indicator",    x, y }                  Amber annotation: '◎ stash@{0}: WIP saved'.
{ type: "conflict-indicator", x, y }                  Red annotation: '✕ CONFLICT: <filename>'.
{ type: "revert-label",       x, y }                  Green annotation: 'revert↑' above a commit.
```

---

## 5. GAME_CONFIG Object

`GAME_CONFIG` is a plain JS object defined in `config.js`, read by the engine as a global. All fields listed here are verified against `missions/git-heist/config.js`.

### Identity

```
title           string    Mission name. Used on the intro screen.
promptSuffix    string    Appended to the operative's codename in the terminal header.
                          e.g. 'layer-01:~/vault-repo$'
```

### Boot sequence

```
bootLines    object[]    Animated terminal intro lines. Each:
                         { text: string, cls: string, pause: number }
                         text  — line content
                         cls   — CSS class applied to the span ('ok', 'warn', 'dim', etc.)
                         pause — milliseconds to wait after line finishes before next line
```

### Command glossary

```
cmdDescriptions    object    Map of command string → description string.
                             Keys: normalised command strings (trimmed, single spaces).
                             Values: one-line descriptions for the cheat sheet.
                             Two roles: (1) drives which commands get logged to the cheat
                             sheet (only prefix-matching commands are recorded); (2) feeds
                             the downloadable cheat sheet file.

cheatSheetTitle     string   Header printed at top of downloaded cheat sheet.
cheatSheetFilename  string   Filename for the downloaded .txt file.
cheatSheetFooter    string   Footer line at bottom of downloaded cheat sheet.
```

### Help text

```
alwaysAvailableHelp    string[]    Lines appended to 'help' output at every stage.
                                   Each string is rendered with CSS class 'dim'.
```

### Police mechanic

```
policeRiskyCmds    string[]    Commands that immediately trigger the police countdown if
                               typed. Each entry is matched as exact or as a prefix.

policeWarnings     string[]    Fox messages shown when police triggers via wrong-command
                               accumulation. Rotated by G.stageWrongs % length.
                               git-heist uses 3 entries.
```

### Display hooks

```
securityLayerLabel    function(bypassed: number, probing: number): string
                      Called on every room load. Returns the string shown in the top bar
                      security status. bypassed = floor(roomIdx/2)+1. probing = bypassed+1
                      (capped at 4).

activeBranchLabel     function(treeKey: string): string
                      Called whenever the tree state changes. Returns the string shown in
                      the "active branch" chip in the right panel.
```

### Command handlers

```
alwaysAvailable    function(cmd: string, stage: object): [string,string][] | null
                   Called after exact-match and wrong-map checks fail. Return output array
                   to handle the command (no wrong counter increment). Return null to fall
                   through to "command not recognized".
                   git-heist uses this for 'git status' (returns state-aware output).

parseSpecial       function(cmd: string, stage: object, ctx: object): {} | null
                   Called BEFORE exact matching. ctx = { tprint, logCmd, advance, H }.
                   Return any truthy object (e.g. {}) if the command was handled.
                   Return null to continue to standard matching.
                   Use for: flexCommit, flexStashPop, or any regex-based matching.
                   Gate each handler on a stage flag (e.g. stage.flexCommit) so it
                   only activates for the relevant stages.
```

### File editor

```
fileContent    object    Provides content for the in-browser text editor.
                         {
                           edit:     { text: string, hint: string (HTML) }
                           conflict: { text: string, hint: string (HTML) }
                         }
                         'edit' slot: regular file-edit stages (fileEdit: true, no fileEditType).
                         'conflict' slot: conflict-resolution stages (fileEditType: 'conflict').

validateFile   function(val: string, isConflict: boolean): { pass: boolean, output: [...] }
               Called when the player clicks SAVE FILE. val is the current textarea content.
               If pass is true, G.fileEditDone is set to true (unblocks accepted commands).
               output is printed to the terminal either way — always provide clear feedback.
```

### Tree bootstrapper

```
initTreeStates    function(TREE: object): void
                  Called once immediately after data.js loads TREE. Use for derived states
                  that reference other TREE entries (which can't be forward-referenced inside
                  data.js itself).
                  git-heist uses this to set r1_initial, r2_initial, and r3_initial as copies
                  of other states.
```

### Quiz pool

```
cmdQuizPool    object    Map of command string → quiz question object.
                         Keys must match keys in cmdDescriptions.
                         Each value: { q: string, options: string[4], correct: number, explain: string }
                         correct: 0-indexed position of the correct answer.
                         explain: shown after the player answers — teach the concept.
                         The engine picks up to 2 from this pool based on commands the player
                         actually used during play.

staticQuiz     object[]  Always-included questions. Same shape as cmdQuizPool values.
                         The engine shuffles these and fills the quiz to 4 total questions.
```

---

## 6. Full Real Example — Room 0, Stage 1 (git-heist)

This is the actual second stage of Room 0 ("THE EQUIPMENT"), unabridged.

```js
{
  conceptBrief: {
    title: "COMMITS + HEAD",
    bullets: [
      "a commit is a permanent snapshot of your project at a specific moment in time",
      "every commit has: a message (what changed), an author (who), a timestamp (when), and a short hash ID — its unique address in history",
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
    ["", ""],
    ["every action you take from here gets added to this log, permanently.", "dim"],
  ],
  tree: "r0_initial",
  wrong: {
    "ls": [["you already checked the files. now check the history — who saved what, and when.", "dim"]]
  }
}
```

And its matching hint entry in `room.hints[1]`:

```js
[
  "git keeps a complete record of every save ever made. there's a command that shows you the full history of commits.",
  "git log shows the history. add --oneline to make it compact — one commit per line.",
  "--oneline compresses each commit to one line: short hash on the left, message on the right. the full git log also shows the author name, full date, and full message.\n\nrun: git log --oneline"
]
```

---

## 7. Full Real Example — TREE Entry

`r1_branches` — the state after all branches are visible in Room 1:

```js
r1_branches: {
  branches: [
    { name: "main",                 y: 50,  color: "#1D9E75", commits: [{x:40}, {x:85}] },
    { name: "security-audit-2019",  y: 130, color: "#3d4943", commits: [{x:40}, {x:85}, {x:130}] },
    { name: "fox/vault-schematics", y: 210, color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}, {x:175}] }
  ],
  HEAD: { type: "branch", ref: "main", ci: 1 },
  headBranchY: 50
}
```

`r1_detached` — HEAD not on any branch:

```js
r1_detached: {
  branches: [
    { name: "main",                 y: 55,  color: "#1D9E75", commits: [{x:40}, {x:85}] },
    { name: "fox/vault-schematics", y: 160, color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}, {x:175}] }
  ],
  HEAD: { type: "detached", cx: 130, cy: 160 }
}
```

`r_stash_clean` — stash indicator + clean tree:

```js
r_stash_clean: {
  branches: [
    { name: "operative/entry-window", y: 80, color: "#7eb8d4", commits: [{x:40}, {x:90}, {x:140}] }
  ],
  HEAD: { type: "branch", ref: "operative/entry-window", ci: 2, branchY: 80 },
  extras: [{ type: "stash-indicator", x: 10, y: 200 }]
}
```

`r2_fork` — two remote boxes connected by an arrow:

```js
r2_fork: {
  branches: [
    { name: "main", y: 80, color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] }
  ],
  HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 },
  extras: [
    { type: "remote-box", x: 30,  y: 160, label: "upstream (syndicate)", color: "#3d4943" },
    { type: "remote-box", x: 130, y: 160, label: "origin (your fork)",   color: "#1D9E75" },
    { type: "arrow", x1: 140, y1: 100, x2: 170, y2: 155 }
  ]
}
```

---

## 8. {{H}} Placeholder System

The engine generates 8 session-unique 7-character hex hashes at startup: `H[1]` through `H[8]`. Any string in `accepted`, `output`, `wrong` keys/values, and hint text can contain `{{H1}}` through `{{H8}}` — the engine substitutes the session hash before matching or rendering.

This means every playthrough shows different "commit hashes" while the matching logic still works. When writing `accepted` entries that use a hash placeholder, the `wrong` entries can also use the same placeholder (e.g. `"git checkout {{H2}}": [["that's the wrong commit..."]`).

Hashes are 1-indexed. `H[0]` is an empty string and is never used in data. Only `{{H1}}`–`{{H8}}` are valid placeholders.

---

## 9. TREE State Naming Conventions (git-heist)

This table documents the naming pattern used in git-heist. New missions should adopt a consistent naming convention.

```
r0_initial        Room 0: single-commit main branch (initial state)
r1_branches       Room 1: all branches visible
r1_on_fox         Room 1: HEAD switched to fox/vault-schematics
r1_detached       Room 1: HEAD detached at commit
r2_remote         Room 2: single branch, remote-box extra
r2_fork           Room 2: two remote-box extras + arrow
r2_cloned         Room 2: local + remote-tracking (dashed)
r3_clean          Room 3: clean main before branch creation
r3_feature        Room 3: feature branch appears, HEAD on it
r3_staged         Room 3: staged-indicator extra added
r3_committed      Room 3: feature branch gains a new commit
r4_ahead          Room 3: feature branch ahead of remote
r4_pushed         Room 3: remote-tracking branch catches up
r_stash_dirty     Room 4: dirty-indicator extra
r_stash_clean     Room 4: stash-indicator extra
r5_dirty          Room 6 (READ THE ROOM): dirty-indicator extra
r6_dirty          Room 7 (ERASE THE TRAIL): same as r5_dirty
r6_partial        Room 7: dirty indicator removed, partial cleanup
r6_reverted       Room 7: extra commit, revert-label extra
r_conflict_initial   Room 5: conflict-indicator extra, diverged branches
r_conflict_resolved  Room 5: staged-indicator replacing conflict marker
r_conflict_merged    Room 5: branches aligned after merge
```

Note: `r0_initial`, `r1_initial`, `r2_initial`, and `r3_initial` are all defined in `GAME_CONFIG.initTreeStates` (not in `data.js` directly) because they reference or alias other states.
