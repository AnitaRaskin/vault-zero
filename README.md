# Vault Zero — Git Escape Rooms

A browser-based Git learning game. No install, no setup — open `index.html` to pick a mission.

Designed for people who are new to Git: junior engineers, bootcamp students, anyone who's heard of Git but never really understood it. You can only move forward by typing the correct Git command. No clicking through slides. No multiple choice. Real commands, real output, real feedback.

## Play it

**[→ Open the hub](https://anitaraskin.github.io/git-heist)** *(enable GitHub Pages to activate this link)*

Or clone and open locally:
```bash
git clone https://github.com/AnitaRaskin/git-heist.git
open git-heist/index.html
```

## What it is

A hub of cyber heist escape rooms, each teaching a cluster of Git concepts. You're a hacker. Fox — your encrypted crew contact — guides you through each mission stage by stage.

### GIT_HEIST (`missions/git-heist/git-heist.html`)

A previous crew left access credentials buried in a repo — never merged, still in there. Navigate branches, resolve conflicts, stash evidence, and extract the data before the police close in.

## The rooms

| Room | Name | Concepts taught |
|------|------|-----------------|
| 0 | The Equipment | `ls`, `git log`, `git status` — repo basics, commits, HEAD, `.gitignore` |
| 1 | The Blueprint | `git branch -a`, `git switch`, `git checkout`, `git log`, `git show` — branches |
| 2 | Get a Copy | `git remote -v`, fork, `git clone` |
| 3 | Into Position | `git checkout -b`, `git add .`, `git add <file>`, `git commit`, `git push` — staging area, file states |
| 4 | Hide the Evidence | `git stash`, `git stash list`, `git stash pop` — police sweep mechanic |
| 5 | The Crew Conflict | `git pull`, merge conflict resolution, `git add`, `git commit` |
| 6 | Read the Room | `git log --oneline`, `git show`, `git diff` |
| 7 | Erase the Trail | `git clean`, `git restore`, `git revert` |

## How it works

### Concept briefs
Before stages that introduce a new idea, a **Concept Brief** modal appears — a quick card covering the Git concept about to be used. Currently taught: what a git repository is, what commits and HEAD are, `.gitignore`, branches, `git switch` vs `git checkout`, and the four file states (untracked / modified / staged / committed) + the staging area. Close the card to begin the stage.

### Core mechanics
- **Terminal panel** — type Git commands, get real-looking output
- **Fox's comms** — mission briefing from your encrypted crew contact, stage by stage (typewriter style)
- **Repo state panel** — live SVG diagram of branches, commits, and HEAD — updates as you work
- **Hint system** — 3 levels per stage (nudge → method → explanation). Level 3 requires a two-click confirm and costs the most points
- **Live score** — +10 per stage, deductions for hints and wrong answers

### Police Are Coming
3 wrong answers or a destructive command (`git reset --hard`, `git push --force`) triggers a 30-second countdown:
- Red border pulses on the terminal panel
- At 10 seconds: screen vignette, synthesised footsteps
- At 6 seconds: browser text-to-speech says *"who's there?"*
- Complete the step in time to evade; fail and lose 10 points

In the stash room (Room 4), police arrival is preceded by a **Fox popup** — a dramatic full-screen warning from Fox. The 30-second clock only starts once you dismiss it.

Room 3 also teaches the difference between `git add .` (broad, fast — under police pressure) and `git add <file>` (surgical, precise — when only one change should be committed).

### Other mechanics
- **Command log** — `[cmd: log]` button records every command used this run; downloadable as a cheat sheet
- **Per-room clue fragments** — each room reveals a piece of the access credentials, typewriter-revealed and assembled on the final screen
- **Fox verification quiz** — 4 questions after the last room; 2 drawn from commands you actually used, 2 static questions on Git concepts. Timed per question
- **Leaderboard** — finish and save your score (Supabase backend)
- **Enter key on room-done modal** — after clearing a room, press Enter to move to the next without reaching for the mouse
- **Progress** saves to `localStorage` — pick up where you left off

## Architecture

The engine is fully game-agnostic. All mission-specific content (commands, quiz questions, file content, police flavour text, boot sequence) lives in the mission's own `config.js` and `data.js`. Adding a new mission requires no changes to the engine.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the complete architecture reference, including the `GAME_CONFIG` plugin interface, ROOMS/TREE data schemas, the game loop sequence, and test patterns.

## File structure

```
vault-zero/
├── index.html                   — hub landing page (mission select)
├── css/
│   ├── shared.css               — design tokens, reset, scanline, shared keyframes
│   ├── hub.css                  — hub landing page styles
│   └── game.css                 — game styles (terminal, panels, modals, police mechanic)
├── js/
│   ├── engine.js                — game loop, command parsing, scoring, quiz, police, boot
│   ├── renderer.js              — SVG git tree renderer
│   └── supabase.js              — score saving + leaderboard
├── missions/
│   └── git-heist/
│       ├── git-heist.html       — mission page shell
│       ├── config.js            — GAME_CONFIG: all mission-specific logic and content
│       └── data.js              — ROOMS array and TREE object
├── docs/
│   ├── ARCHITECTURE.md          — full system reference for developers
│   ├── MISSION_BUILDER.md       — step-by-step guide to adding a new mission
│   ├── DATA_SCHEMA.md           — ROOMS/TREE field reference
│   └── ROOM_DESIGN.md           — room and stage design notes
└── tests/
    ├── engine.test.js           — engine unit tests (56 tests)
    └── hub.test.js              — hub page DOM tests
```

## Tests

```bash
npm test
```

Uses Node's native test runner (`node:test`). The only dev dependency is `jsdom`. Tests cover: command parsing, scoring, hint system, quiz assembly, file editor validation, ROOMS data integrity, and hub page DOM structure.

## Built with

Vanilla JS + Supabase for the leaderboard. No build step, no framework, no bundler.

## Supabase setup

The leaderboard requires a `scores` table with RLS enabled:

```sql
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read"   ON scores FOR SELECT USING (true);
```

Without this, score saves fail silently (shown as a red note in-game).
