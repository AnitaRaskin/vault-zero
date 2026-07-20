# Vault Zero — Git Escape Rooms

A browser-based Git learning game for junior engineers. No install. No setup. Open `index.html` to pick a mission.

## Play it

**[→ Open the hub](https://anitaraskin.github.io/git-heist)** *(enable GitHub Pages to activate this link)*

Or clone and open locally:
```bash
git clone https://github.com/AnitaRaskin/git-heist.git
open git-heist/index.html
```

## What it is

A hub of cyber heist escape rooms, each teaching a cluster of Git concepts. You're a hacker. Fox — your encrypted crew contact — guides you through each mission.

You can only move forward by typing the correct Git command. No clicking through slides. No multiple choice. Real commands, real output, real feedback.

## Missions

### GIT_HEIST (`git-heist.html`)

A previous crew left access credentials buried in a repo — never merged, still in there. Navigate branches, stash work, rebase history, and extract the data before the police close in.

## The rooms

| Room | Name | Concepts |
|------|------|----------|
| 0 | The Equipment | `ls`, `git log`, `git status` — repo basics |
| 1 | The Blueprint | `git branch -a`, `git checkout`, `git log`, `git show` |
| 2 | Get a Copy | `git remote -v`, fork, `git clone` |
| 3 | Into Position | `git status`, `git checkout -b`, `git add`, `git commit` |
| 4 | Hide the Evidence | `git stash`, `git stash list`, `git stash pop` |
| 5 | Send the Signal | `git push`, upstream tracking |
| 6 | The Crew Conflict | `git pull`, merge conflict resolution, `git add`, `git commit` |
| 7 | Read the Room | `git log --oneline`, `git show`, `git diff` |
| 8 | Erase the Trail | `git clean`, `git restore`, `git revert`, `git reset` |

## How it works

- **Terminal panel** — type Git commands, get real-looking output
- **Fox's comms** — mission briefing, stage by stage
- **Repo state panel** — live SVG diagram of branches, commits, and HEAD — updates as you work
- **Hint system** — 3 levels per stage; the third reveals the answer and costs points
- **Live score** — starts at 0, +10 per stage, deductions for hints and wrong answers
- **Police Are Coming** — alarm mechanic: 3 wrong answers or a destructive command (e.g. `git reset --hard`) triggers a 30-second countdown. Beat the step in time or lose 10 points. At 10 seconds: red screen vignette, pulsing alert, synthesised footsteps. At 6 seconds: browser speaks *"who's there?"*
- **Command log** — `[cmd: log]` button tracks every command you've used; downloadable as a cheat sheet
- **Per-room clue fragments** — each room leaves a piece of the access credentials, assembled on the end screen
- **Leaderboard** — finish the game and your score is saved (Supabase)
- **Progress** saves to localStorage — pick up where you left off

## Built with

Vanilla JS + Supabase for the leaderboard. No build step, no framework.

```
index.html          — hub landing page (mission select)
git-heist.html      — GIT_HEIST escape room

css/
  shared.css        — design tokens, reset, scanline, shared keyframes
  hub.css           — hub landing page styles
  game.css          — game (terminal, panels, modals, police mechanic)

js/
  data.js           — room content, commands, tree state definitions
  renderer.js       — SVG git tree renderer
  engine.js         — game logic (terminal, hints, scoring, quiz)
  supabase.js       — score saving + leaderboard
```
