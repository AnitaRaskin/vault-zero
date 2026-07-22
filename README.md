# Vault Zero — A Learning Escape Room

A browser-based escape room platform for learning developer tools. Each mission wraps a set of real commands inside a heist/thriller narrative — you can only move forward by typing the right thing. No multiple choice, no slides, no hand-holding.

Designed for junior engineers, bootcamp students, and anyone who learns better by doing than by reading.

## Play

**Live:** [https://anitaraskin.github.io/git-heist/](https://anitaraskin.github.io/git-heist/)

Or clone and open `index.html` locally — no build step, no dependencies.

## Missions

### MISSION_001 — GIT HEIST
*Status: Active · Difficulty: Easy–Medium · ~60 min*

A previous crew left access credentials buried in a target's git repository — never merged, still in there. Navigate branches, resolve conflicts, stash evidence, and extract the data before the police close in.

**Commands taught:** `git log`, `git status`, `git branch`, `git checkout`, `git stash`, `git pull`, `git add`, `git commit`, `git push`, `git revert`, and more — across 8 rooms.

→ [https://anitaraskin.github.io/git-heist/missions/git-heist/git-heist.html](https://anitaraskin.github.io/git-heist/missions/git-heist/git-heist.html)

---

### MISSION_002 — OPERATION: NIGHTSHADE
*Status: Active · Difficulty: Medium–Hard · ~75 min*

A rogue operative has infiltrated GCHQ's classified ATLAS repository — staging malicious changes, rewriting history, injecting a merge conflict, and arming a dead man switch that will exfiltrate asset data if not neutralised in time. Navigate detached HEAD state, recover orphaned commits, resolve a live conflict, and inspect a stack of suspicious stashes before the countdown triggers.

**Commands taught:** `git diff --staged`, `git restore --staged`, `git checkout` (detached HEAD), `git switch -c`, `git reflog`, `git cherry-pick`, `git fetch`, `git push origin --delete`, `git stash list`, `git stash show -p`, `git stash apply`, `git stash drop`, `git merge` (conflict resolution), and more — across 6 rooms.

→ [https://anitaraskin.github.io/git-heist/missions/nightshade/nightshade.html](https://anitaraskin.github.io/git-heist/missions/nightshade/nightshade.html)

---

*See `docs/MISSION_BUILDER.md` to build your own.*

## Features

- **Per-mission quiz pool** — each mission has 100+ questions; 8 are chosen at random per game, so two players sitting side by side get different questions
- **Randomised answer options** — all four options are written at similar length so the correct answer never stands out as "the longest one"
- **Per-mission leaderboard** — hub top bar has a `[ RANKINGS ]` button that opens a tabbed modal with separate leaderboards for each mission
- **CMD LOG download** — every accepted command is logged and downloadable as a `.txt` file from the end screen or the header button
- **Police mechanic** — 3 wrong answers triggers a 30-second countdown with mission-specific sound and voice (deep pulse + "alert — movement detected" for git-heist; electronic alert + "intrusion detected" for Nightshade)
- **Nightshade leak timer** — a visible countdown to the next ATLAS data leak; syncs with the police countdown when the alarm fires, then resets to the full cycle when it clears
- **Concept briefs** — each room's first stage triggers an educational modal explaining the underlying git concept before the player types their first command
- **Persistent save state** — progress is saved to localStorage; continue from where you left off at any time

## Building a new mission

See [`docs/MISSION_BUILDER.md`](docs/MISSION_BUILDER.md) for a complete step-by-step guide, including a mission brief template designed for AI-assisted generation.

The engine is fully game-agnostic. All mission-specific content (commands, rooms, quiz questions, file content, police flavour text, boot sequence) lives in the mission's own `config.js` and `data.js`. **Adding a new mission requires no changes to the shared engine.**

### Key `GAME_CONFIG` fields

| Field | Description |
|---|---|
| `quizPool` | Flat array of questions; engine picks 8 at random per game |
| `missionKey` | Identifies the mission in the Supabase leaderboard |
| `policeSound` | `'footstep'` \| `'alert'` \| `'pulse'` — audio style when the countdown goes urgent |
| `policeVoiceText` | Text spoken by the browser's speech synthesis at 6 seconds remaining |
| `quizMessages` | `{ perfect, pass, fail }` — mission-flavoured end-of-quiz verdict lines |

## File structure

```
vault-zero/
├── index.html                   — hub landing page (mission select + leaderboard modal)
├── css/
│   ├── shared.css               — design tokens, reset, scanline, shared keyframes
│   ├── hub.css                  — hub landing page styles (incl. leaderboard modal)
│   └── game.css                 — game styles (terminal, panels, modals, police mechanic)
├── js/
│   ├── hashes.js                — session commit hash generation (H[1]–H[8]) + interp()
│   ├── state.js                 — G state object, room() / stage() accessors
│   ├── audio.js                 — AudioContext, playFootstep / playAlert / playPulse
│   ├── terminal.js              — DOM refs, tprint / tcmd / foxMsg / flashTerminal
│   ├── score.js                 — addScore, showScoreDelta
│   ├── police.js                — police mechanic: countWrong, triggerPolice, clearPolice, nsLeakTimer sync
│   ├── cheatsheet.js            — command log, openCheatSheet, downloadCheatSheet (data URI)
│   ├── modals.js                — concept brief and police-warn modals
│   ├── editor.js                — file editor: openEditor, saveFile, cancelFile
│   ├── hints.js                 — hint system: openHint, moreHint, closeHint
│   ├── progress.js              — header progress bar, branch badge, security dots
│   ├── resize.js                — drag-to-resize split panel (terminal / git tree)
│   ├── admin.js                 — admin room-jump panel (//jump, Ctrl+Shift+J)
│   ├── boot.js                  — typewriter boot sequence animation
│   ├── engine.js                — core game loop: parseCmd, advance, quiz (random pool), tour, persistence
│   ├── renderer.js              — SVG git tree renderer
│   └── supabase.js              — score saving + per-mission leaderboard
├── missions/
│   ├── git-heist/               — Mission 001: GIT HEIST
│   │   ├── git-heist.html       — mission page shell
│   │   ├── config.js            — GAME_CONFIG: 103-question quiz pool, police config, room logic
│   │   └── data.js              — ROOMS array and TREE object
│   └── nightshade/              — Mission 002: OPERATION NIGHTSHADE
│       ├── nightshade.html      — mission page shell (incl. leak countdown timer)
│       ├── nightshade-theme.css — Nightshade-specific UI overrides
│       ├── config.js            — GAME_CONFIG: 100-question quiz pool, LION handler, British theme
│       └── data.js              — ROOMS array and TREE object
├── docs/
│   ├── ARCHITECTURE.md          — full system reference: engine internals, plugin interface, test patterns
│   ├── MISSION_BUILDER.md       — step-by-step guide to building a new mission (includes AI brief template)
│   ├── DATA_SCHEMA.md           — complete field reference for ROOMS, TREE, and GAME_CONFIG
│   └── ROOM_DESIGN.md           — room and stage design principles: narrative, hints, Fox voice
└── tests/
    ├── engine.test.js           — engine unit tests
    └── hub.test.js              — hub page DOM tests
```

## Tests

```bash
npm test
```

Uses Node's native test runner (`node:test`). The only dev dependency is `jsdom`. Tests cover command parsing, scoring, hint system, quiz assembly, file editor validation, ROOMS data integrity, and hub page DOM structure.

## Tech stack

Vanilla JS + Supabase for the leaderboard. No build step, no framework, no bundler.

