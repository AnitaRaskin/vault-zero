---
name: room-design
description: Use when designing the content layer of a Vault Zero mission — room narratives, Fox voice, stage sequencing, hint writing, clue design, when to use police pressure, when to use fileEdit or flexCommit. Also use when reviewing whether Fox dialogue sounds right, when hints feel too easy or too hard, or when a room's teaching arc doesn't land. Contains AI collaboration prompt templates for reviewing rooms, generating hints, stress-testing command coverage, and improving Fox dialogue.
tools: Read, Edit
---

# Vault Zero — Room Design Guide

> This guide covers the teaching and narrative layer, not the implementation layer.
> For implementation (how to write data.js and config.js), see the `mission-builder` agent.
> For field names and schema, see the `data-schema` agent.

---

## 1. Design Principles

### Narrative earns the command

Every command should feel necessary within the story, not incidental. The player runs `git stash` not because you told them to practice git stash — they run it because police are two blocks away and their working tree is exposed. The scenario is not decoration. It's what makes the command memorable.

### One concept cluster per room

A room teaches one mental model, demonstrated through two to five commands that illuminate different facets of that model. Room 0 in git-heist teaches "orientation in a repo" via `ls`, `git log --oneline`, and `git status` — three angles on the same idea. Mixing concepts from different clusters results in player confusion.

### Wrong paths are half the teaching

A player who types `git branch` when the room wants `git branch -a` has made a meaningful error. The `wrong` entry should name exactly what they got right and what they missed, not just say "incorrect". Write wrong-command responses as micro-lessons, not rejections.

### Every stage completable in under two minutes by someone who read the conceptBrief

If a stage requires more than that without hints, the task description or conceptBrief is not clear enough. Difficulty should come from connecting concepts, not from guessing obscure syntax.

### Never teach more than three new things in one stage

A `conceptBrief` modal should have three to four bullets. Five or more means the concept needs to be split into two stages.

---

## 2. Room Anatomy

Each room accomplishes exactly one teaching arc:

**Introduce** — A `conceptBrief` modal on the first (or second) stage plants the mental model. This is where "why does this concept exist" lives. Keep bullets concrete, one idea each.

**Practice** — Middle stages let the player apply the concept with increasing specificity. First command is usually broad (see all branches), next narrows (switch to the right branch).

**Reward** — Final stage yields the clue. The `completionMsg` should be a one-sentence distillation of what the player just did — the takeaway they'll explain to a colleague tomorrow.

**Pacing check:** Read your room top to bottom as if you know nothing. Does the intro set up the motivation? Does each Fox message set up the *next* command, not explain what was just done? Does the `completionMsg` land as a satisfying conclusion?

---

## 3. Stage Sequencing

### Standard progression within a room

1. **Orientation stage** — Read-only or low-stakes command. `git status`, `docker ps`, `kubectl get pods`. Builds spatial awareness. Rarely has a `conceptBrief`.

2. **Concept introduction stage** — First time something genuinely new appears. Put `conceptBrief` here.

3. **Action stages** — Player applies the concept. One command per stage. If the player needs to `git add` then `git commit`, those are two separate stages with two separate lessons.

4. **Resolution stage** — Final command that unlocks the clue. Gets the `completionMsg`.

### When to use police pressure

Use `policeOnLoad` / `policeWarnModal`:
- At most once or twice per mission, at rooms 2–4.
- On stages where the correct command is simple and fast to type — the pressure teaches the *importance* of knowing it reflexively.
- **Never** on the first time a command is introduced. Police belongs at the practice or resolution stage.

`policeWarnModal` is the most dramatic variant. Use it once per mission for maximum effect. git-heist uses it for `git stash` — the stash emergency in Room 4.

### fileEdit stages

Work best immediately followed by a staging/commit stage: `fileEdit → git add → git commit`. The Fox message for the edit stage should mention what comes next ("open the file, make the edit, then stage that specific file").

### When to use flexCommit

Use `flexCommit: true` when you want the player to write a real commit message rather than copy a fixed string. Preferable in rooms that teach commit workflow. The engine flags low-quality messages but still advances — which itself teaches the lesson.

---

## 4. Hints Strategy

Each stage has exactly three hint levels. Think of them as progressive commitment levels:

**Level 1 — Direction only.** Point toward the concept without naming the command. "git keeps a record of every commit ever made. there's a command that shows it." Enough for someone who understood the `conceptBrief` but blanked on syntax.

**Level 2 — Command family.** Name the command or subcommand without giving full syntax. "git log shows the history. add --oneline to make it compact." A player who reads this should be able to construct the correct command.

**Level 3 — The answer.** Full exact syntax. End with `\n\nrun: git log --oneline` — the engine renders text after a blank line starting with "run:" or "type:" in a styled code block.

**What to avoid:**
- Repeating the same information across levels with slightly different wording. Each level must add new information.
- Giving the answer at level 1, or the command name at level 1.
- Writing hints in a different tone from Fox. The hints panel is part of the game's voice.

---

## 5. Fox Voice Guide

Fox is terse, mission-focused, and knowledgeable. He speaks in lowercase. He doesn't congratulate — he calibrates. He treats mistakes as information, not failures.

### Tone

Fox is not cheerful ("Great work!") and not cold ("Error. Retry."). He's a professional who respects the player enough to be direct. He gives exactly the information needed for the next move and nothing extra.

**Good Fox messages:**
- "the access map exists. someone on the inside hid it and never merged it. start by figuring out what branches are in this repo."
- "police cleared. good. now be precise."
- "you're there. read it."

**Not Fox:**
- "Great job on the last step! Now let's look at the branches."
- "Please use git branch -a to see all branches."
- "You've made an error. The correct command is..."

### Length

Action stages: 1–3 sentences. Concept-heavy stages: up to 4. Never more than 4 — move the excess into a `conceptBrief` bullet.

### Dramatic vs. informative

Fox is dramatic when narrative stakes are high (police approach, something goes wrong, critical file found) and informative when setting up a new command. Dramatic moments should feel earned — if every Fox message is urgent, none of them are.

**Dramatic:** "scanner alert — police unit picking up traffic on this node. forensic tools are running. you've got modified files sitting open everywhere."

**Informative:** "git keeps a full record of every commit ever made. 'git log' shows you that history. '--oneline' makes it compact: one line per commit. read the trail."

### Fox messages do double duty

Advance the story AND set up the next command. Ask of each Fox message: does this tell the player what they're about to do AND why it matters to the heist? If only one of those, revise.

The room `intro` sets the scene. Fox's first stage message should assume the player just read the intro and immediately narrow to the first action.

---

## 6. Command Selection

### Teach a cluster, not a list

Commands in a room should illuminate the same concept from different angles. In Room 0, `ls` (what files exist), `git log --oneline` (what commits exist), and `git status` (what has changed) all answer "how to see the current state of things."

### Don't teach an advanced variant before the basic form

If the player will use `git branch -a`, they should know what `git branch` does first. The `wrong` entry for `git branch` (without `-a`) in Room 1 shows the local-only output and explains why `-a` is needed.

### Never introduce two new command families in one room

One family per room, with its variants and flags. In a later room you can assume the earlier command is known.

### Write the wrong cases before writing the stage

Ask: "What would a confused player type here?" Those answers become your `wrong` entries. If you can't predict wrong attempts, the stage task is probably not clear enough.

---

## 7. Clue Design

### The assembled key should tell a story

Each room's clue is a fragment that gets collected and assembled at the end. The full set should read as coherent access credentials. In git-heist:

```
[SECTOR]   V0-CORE
[ENDPOINT] /internal/v0
[NODE]     banking-core-relay
[WINDOW]   02:00 — 02:15
[BYPASS]   sweep_clean
[TOKEN]    tok_override_9x77
[VECTOR]   ids_threshold
[STATUS]   history_clean
```

These form a plausible "vault access packet" — sector, endpoint, node, time window, bypass method, token, detection vector, status.

### Thematic matching

Each clue should feel tied to what that room taught. Room 4 ("HIDE THE EVIDENCE" — `git stash`) yields `BYPASS: sweep_clean`. Room 7 ("ERASE THE TRAIL" — `git revert`) yields `STATUS: history_clean`.

### Reveal pacing

The clue value is type-animated one character at a time in the room-complete modal. Short values (under 20 chars) feel like a fast reveal — good for tension. Match pacing to the room's emotional register.

---

## 8. AI Collaboration Prompt Templates

Use these when working with an AI (or asking Claude) to review or generate mission content.

---

### 8a. Review room narrative consistency

```
Review the narrative consistency of this room from a Vault Zero mission.
The mission teaches [TOPIC] inside a heist/thriller scenario.

The room data is:
[paste the full room object from data.js, including all stages and hints]

Check:
1. Does the intro set up the motivation for all stages in the room?
2. Does each Fox message (foxMsg) set up the NEXT command without spoiling it?
3. Does the completionMsg distill the room's teaching into one memorable sentence?
4. Is the Fox voice consistent across all stages — lowercase, terse, mission-focused?
5. Are there any stages where the Fox message describes what JUST happened instead of
   what the player SHOULD DO NEXT?

For each issue, quote the specific text and suggest a revised version.
```

---

### 8b. Generate better hints

```
Improve the hint set for this stage from a Vault Zero mission.

The mission teaches [TOPIC]. The stage task is:
"[paste stage.task]"

The correct commands are: [paste stage.accepted]

Current hints:
Level 1: [paste hint[0]]
Level 2: [paste hint[1]]
Level 3: [paste hint[2]]

Rules:
- Level 1: Direction only. No command name.
- Level 2: Command family or partial syntax. No full flags.
- Level 3: Complete answer. Must end with blank line + "run: <exact command>".
- Each level adds new information (no rephrasing).
- Voice is Fox: lowercase, terse, no "great job" or "you should".

Rewrite all three levels.
```

---

### 8c. Stress-test command coverage

```
I'm designing a stage in a terminal-based escape room that teaches [TOPIC].
Stage task: "[paste stage.task]"

Accepted commands: [paste stage.accepted]
Handled wrong commands: [paste stage.wrong keys]
Fox message: "[paste stage.foxMsg]"

Imagine a junior developer who read the task and Fox message but hasn't seen the answer.
What other commands might they plausibly try? Consider:
- Misspellings or missing flags
- Commands that do something adjacent but wrong
- Always-available commands (git status, git log)
- Commands that partially work but don't complete the task

For each candidate:
1. Why a player might try it
2. Whether it should be: added to 'accepted', added to 'wrong', or left as-is
3. If 'wrong', suggest the response text (lowercase Fox voice)
```

---

### 8d. Improve Fox dialogue

```
Rewrite this Fox message from a terminal escape room. Fox is a terse, professional
handler who speaks in lowercase and never congratulates the player. He gives exactly
the context needed for the next move and nothing extra.

Room scenario: [one sentence]
Stage task: "[paste stage.task]"
Player must type: [paste primary accepted command]

Current Fox message: "[paste current foxMsg]"

Constraints:
- Lowercase throughout
- Maximum 4 sentences
- Must set up the next action without naming the exact command syntax
- Must fit the heist/thriller tone (urgency, stakes, professional competence)
- No "great", "well done", "good job", "now let's", "in order to"

Write 3 alternative versions, then recommend the best one and explain why.
```

---

### 8e. Full room brief review (before implementation)

```
Review this planned room for a Vault Zero escape room mission before I implement it.
The mission is about [TOPIC]. Format: players type real terminal commands,
each room has 2–6 stages, each stage has one correct command (or small set of variants).

Planned room:
- Name: [ROOM NAME]
- Teaching goal: [one sentence]
- Intro: [paste planned intro]
- Stage 1: [command] — [what it shows/does]
- Stage 2: [command] — [what it shows/does]
- Stage 3: [command] — [what it shows/does]
- Clue: label=[LABEL] value=[VALUE]
- CompletionMsg: [planned message]

Check:
1. Do all stages cluster around the same mental model, or are concepts mixed?
2. Is the clue label/value thematically tied to what the room teaches?
3. Is there a natural wrong path for each stage?
4. Does the progression build: orientation → concept → action → resolution?
5. Is the completionMsg a useful one-sentence takeaway, not a summary of steps?

Point out structural issues and suggest improvements.
```

---

### Tips for effective AI collaboration

- **Always provide the Fox voice constraints.** Without them, AI-generated dialogue tends toward cheerful and verbose.
- **Give the full stage context when reviewing a single stage.** An AI reviewing a Fox message in isolation doesn't know what the previous stage established or what comes next.
- **Ask for alternatives, not revisions.** "Write 3 versions" produces better output than "fix this" — variation helps you see what's possible.
- **Verify generated commands against the engine.** AI may suggest `wrong` entries with plausible-sounding commands that don't work as written. Cross-check against `data-schema` — confirm the normalised form, that it's not in `accepted`, and that it would be caught by wrong-map matching.
- **Use AI to check internal consistency across all rooms.** Paste all `completionMsg` values and ask: "Do these eight takeaways build on each other? Is anything repeated? Is anything contradicted?" Hard to do manually when deep in writing individual rooms.
