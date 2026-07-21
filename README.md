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

*More missions coming. See `docs/MISSION_BUILDER.md` to build your own.*

## Platform mechanics

- **Terminal panel** — type commands, get real-looking output
- **Fox's comms** — your encrypted crew contact, briefing you stage by stage (typewriter style)
- **Repo state panel** — a live diagram that updates as you work (SVG git tree for git missions; adaptable to any domain)
- **Concept briefs** — modal cards explaining the mental model before each new concept appears
- **Hint system** — 3 levels per stage: nudge → method → full answer. Deeper hints cost score points
- **Near-miss feedback** — incomplete commands (e.g. `git add` with no target, `git commit` with no `-m`, common typos) show a targeted error explaining exactly what's missing, instead of the generic "not recognized" fallback
- **Progress persistence** — game state is saved to localStorage after each room completes. Coming back later shows a resume prompt; players can pick up where they left off or start fresh
- **Live score** — +10 per stage, deductions for hints and wrong answers
- **Police mechanic** — wrong commands or destructive operations trigger a 30-second countdown with audio. Complete the stage to evade; fail and lose points
- **Fox verification quiz** — timed quiz at the end, based on commands you actually used during the mission
- **First-run tour** — interactive spotlight walkthrough of the UI panels, shown once on a player's first fresh run (skipped on resume)
- **Command log** — every command you type is recorded; downloadable as a reference sheet at the end
- **Leaderboard** — save your score via Supabase

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

## Supabase setup

The leaderboard requires a `scores` table with RLS enabled:

```sql
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read"   ON scores FOR SELECT USING (true);
```

Without this, score saves fail silently (shown as a red note in-game and logged to the console).
