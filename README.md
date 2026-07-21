# Vault Zero

A browser-based escape room platform for teaching developer tools and workflows. No install, no setup — open `index.html` to pick a mission.

Players type real commands into an in-browser terminal. Each mission wraps a cluster of developer commands inside a heist/thriller narrative. You can only move forward by typing the correct command. No multiple choice. No slides. Real commands, real output, real feedback.

Designed for junior engineers, bootcamp students, and anyone who learns better by doing than by reading.

## Play

Open `index.html` to access the mission hub, or host it from any static server — no build step, no dependencies.

## Missions

### MISSION_001 — GIT HEIST
*Status: Active · Difficulty: Easy–Medium · ~60 min*

A previous crew left access credentials buried in a target's git repository — never merged, still in there. Navigate branches, resolve conflicts, stash evidence, and extract the data before the police close in.

**Commands taught:** `git log`, `git status`, `git branch`, `git checkout`, `git stash`, `git pull`, `git add`, `git commit`, `git push`, `git revert`, and more — across 8 rooms.

→ `missions/git-heist/git-heist.html`

---

*More missions coming. See `docs/MISSION_BUILDER.md` to build your own.*

## Platform mechanics

- **Terminal panel** — type commands, get real-looking output
- **Fox's comms** — your encrypted crew contact, briefing you stage by stage (typewriter style)
- **Repo state panel** — a live diagram that updates as you work (SVG git tree for git missions; adaptable to any domain)
- **Concept briefs** — modal cards explaining the mental model before each new concept appears
- **Hint system** — 3 levels per stage: nudge → method → full answer. The first hint is free; deeper hints cost points
- **Live score** — +10 per stage, deductions for hints and wrong answers, +5 bonus for a well-written commit message
- **Police mechanic** — wrong commands or destructive operations trigger a 30-second countdown with audio. Complete the stage to evade; fail and lose points
- **Fox verification quiz** — timed quiz at the end, based on commands you actually used during the mission
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
│   ├── engine.js                — game loop, command parsing, scoring, quiz, police, boot
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
