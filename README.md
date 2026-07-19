# Vault Zero — Git Escape Room

A browser-based Git learning game for junior engineers. No install. No setup. Open `index.html` in a tab and start playing.

## Play it

**[→ Open the game](https://anitaraskin.github.io/vault-zero)** *(enable GitHub Pages to activate this link)*

Or clone and open locally:
```bash
git clone https://github.com/AnitaRaskin/vault-zero.git
open vault-zero/index.html
```

## What it is

A bank heist escape room where each "room" teaches one cluster of Git concepts. You play a rookie operative proving yourself to the crew before the real job. Fox — your crew contact — guides you through via encrypted comms.

You can only move forward by typing the correct Git command. No clicking through slides. No multiple choice. Real commands, real output, real feedback.

## The rooms

| Room | Name | Concepts |
|------|------|----------|
| 1 | The Blueprint | `git branch -a`, `git checkout`, `git log`, `git show` |
| 2 | Get a Copy | `git remote -v`, fork, `git clone` |
| 3 | Into Position | `git status`, `git checkout -b`, `git add`, `git commit` |
| 4 | Send the Signal | `git push`, upstream tracking |
| 5 | Read the Room | `git log --oneline`, `git show`, `git diff` |
| 6 | Erase the Trail | `git clean`, `git restore`, `git revert`, `git reset` |

## How it works

- **Terminal panel** — type Git commands, get real-looking output
- **Fox's comms** — mission briefing, stage by stage
- **Repo state panel** — live SVG diagram of branches, commits, and HEAD — updates as you work
- **Hint system** — 3 levels per stage, no penalty, just tracking
- **Progress** saves to localStorage — pick up where you left off

## Curriculum

Based on [Beginner Git Guide for Beginners](https://www.wix.engineering) by Maor Galapo (Wix Engineering). The 6 rooms cover the course's core sections in difficulty order, from reading a repo to safely undoing shared history.

## Built with

Vanilla JS. Single HTML file. No dependencies, no build step, no login.
