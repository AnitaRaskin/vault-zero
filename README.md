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

A rogue operative codenamed NIGHTSHADE has infiltrated GCHQ's classified ATLAS repository — staging malicious changes alongside legitimate ones, rewriting history, injecting a merge conflict, and planting a dead man switch that will auto-exfiltrate asset data if not neutralised in time. Your handler, LION, guides you through six rooms to contain, trace, and erase the intrusion before the countdown triggers.

**Rooms:**
1. **CONTAINMENT** — Read the staging area before committing. Identify and unstage NIGHTSHADE's injected file without touching the legitimate change.
2. **DEAD RECKONING** — Navigate detached HEAD state. Check out an orphaned commit, inspect historical evidence, and name it with a branch before you lose it.
3. **CONFLICTED LOYALTIES** — Resolve a merge conflict in a classified asset registry. Keep GCHQ's version, discard NIGHTSHADE's exfiltration config.
4. **THE GREAT ERASURE** — NIGHTSHADE wiped three commits with `git reset --hard`. Use `git reflog` to find the orphaned hash and `git cherry-pick` to recover it.
5. **INCOMING SIGNAL** — Intercept and inspect incoming remote changes before merging. Use `git fetch`, inspect with `git diff`, then selectively delete the threat branch from the remote.
6. **THE DEAD DROP** — Three stashes from different operatives. Inspect each with `git stash show -p` to find the shutdown key, apply it without popping, then drop the rest cleanly.

**Commands taught:** `git diff --staged`, `git restore --staged`, `git checkout` (detached HEAD), `git switch -c`, `git reflog`, `git cherry-pick`, `git fetch`, `git push origin --delete`, `git stash list`, `git stash show -p`, `git stash apply`, `git stash drop`, `git merge` (conflict resolution), and more — across 6 rooms.

→ [https://anitaraskin.github.io/git-heist/missions/nightshade/nightshade.html](https://anitaraskin.github.io/git-heist/missions/nightshade/nightshade.html)

---

*See `docs/MISSION_BUILDER.md` to build your own.*

## Building a new mission

See [`docs/MISSION_BUILDER.md`](docs/MISSION_BUILDER.md) for a complete step-by-step guide, including a mission brief template designed for AI-assisted generation.

The engine is fully game-agnostic. All mission-specific content (commands, rooms, quiz questions, file content, police flavour text, boot sequence) lives in the mission's own `config.js` and `data.js`. **Adding a new mission requires no changes to the shared engine.**

## File structure

```
vault-zero/
├── index.html                   — hub landing page (mission select)
├── css/
│   ├── shared.css               — design tokens, reset, scanline, shared keyframes
│   ├── hub.css                  — hub landing page styles
│   └── game.css                 — game styles (terminal, panels, modals, police mechanic)
├── js/
│   ├── engine.js                — game loop, command parsing, scoring, quiz, police, boot, persistence
│   ├── renderer.js              — SVG git tree renderer
│   └── supabase.js              — score saving + leaderboard
├── missions/
│   └── git-heist/               — Mission 001: GIT HEIST
│       ├── git-heist.html       — mission page shell (all modals and panel scaffolding)
│       ├── config.js            — GAME_CONFIG: all mission-specific logic and content
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

