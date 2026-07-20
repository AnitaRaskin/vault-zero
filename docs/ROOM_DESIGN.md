# Vault Zero — Room Design Guide

> Audience: someone designing mission content — rooms, stages, dialogue, clues, hints.
> This guide covers the teaching and narrative layer, not the implementation layer.
> For implementation (how to write data.js and config.js), see `MISSION_BUILDER.md`.
> For field names and schema, see `DATA_SCHEMA.md`.

---

## 1. Design Principles

### Narrative earns the command

Every command should feel necessary within the story, not incidental. The player runs `git stash` not because you told them to practice git stash — they run it because police are two blocks away and their working tree is exposed. The scenario is not decoration. It's what makes the command memorable.

### One concept cluster per room

A room teaches one mental model, demonstrated through two to five commands that illuminate different facets of that model. Room 0 in git-heist teaches "orientation in a repo" via `ls`, `git log --oneline`, and `git status` — three different angles on the same idea (what is here, what happened, what's changed). Mixing concepts from different clusters (branching and merge conflicts in the same room) results in player confusion.

### Wrong paths are half the teaching

A player who types `git branch` when the room wants `git branch -a` has made a meaningful error — they know the command family but missed the flag. The `wrong` entry for that command should name exactly what they got right and what they missed, not just say "incorrect". Write wrong-command responses as micro-lessons, not rejections.

### Every stage should be completable in under two minutes by someone who read the conceptBrief

If a stage requires more than that without hints, the task description or conceptBrief is not clear enough. Difficulty should come from connecting concepts, not from guessing obscure syntax.

### Never teach more than three new things in one stage

A `conceptBrief` modal should have three to four bullets. If you need five or more to explain the concept, split it into two stages.

---

## 2. Room Anatomy

Each room should accomplish exactly one teaching arc:

**Introduce** — A conceptBrief modal on the first (or second) stage plants the mental model. This is where the "why does this concept exist" lives. Keep bullets concrete, one idea each.

**Practice** — The middle stages let the player apply the concept with increasing specificity. The first command is usually broad (see all branches), the next narrows (switch to the right branch).

**Reward** — The final stage yields the clue. The completionMsg should be a one-sentence distillation of what the player just did — the takeaway they'll remember. Write it as the single sentence you'd want them to be able to explain to a colleague tomorrow.

**Pacing check:** Read your room top to bottom as if you know nothing. Does the intro set up the motivation? Does each Fox message set up the *next* command, not explain what was just done? Does the completionMsg land as a satisfying conclusion?

---

## 3. Stage Sequencing

### Standard progression within a room

1. **Orientation stage** — Run a read-only or low-stakes command that confirms the player's context. `git status`, `docker ps`, `kubectl get pods`. This stage rarely has a conceptBrief. It builds spatial awareness.

2. **Concept introduction stage** — The first time something genuinely new appears (branches, the staging area, merge conflicts). Put the conceptBrief here.

3. **Action stages** — The player applies the concept. One command per stage. Resist combining two commands into one stage — if the player needs to `git add` then `git commit`, those are two separate stages with two separate lessons.

4. **Resolution stage** — The final command that unlocks the clue. Often this is the most satisfying moment: reading the hidden file, completing the push, seeing the clean working tree. This stage gets the `completionMsg`.

### When to use police pressure

Police pressure (via `policeOnLoad` or `policeWarnModal`) creates urgency. Use it:

- At most once or twice per mission, at rooms 2–4 when the player has enough knowledge to succeed under pressure.
- On stages where the correct command is actually simple and fast to type — the pressure teaches the *importance* of knowing the command reflexively, not just intellectually.
- Never on the first time a command is introduced. Police pressure belongs at the practice or resolution stage, not the concept introduction.

The `policeWarnModal` variant is the most dramatic. Use it once per mission for maximum effect. git-heist uses it for `git stash` — the stash emergency in Room 4 — which is the most kinetically charged moment in the game.

### fileEdit stages

File edit stages work best immediately followed by a staging/commit stage. The sequence `fileEdit stage → git add stage → git commit stage` is a natural three-step workflow that mirrors real development. The file edit stage teaches that "editing a file" is separate from "telling git about the edit".

Place the fileEdit stage so the player can see the connection: Fox's message for the edit stage should mention what will happen next ("open the file, make the edit, then stage that specific file").

### When to use flexCommit

Use `flexCommit: true` any time you want the player to write a real commit message rather than type a fixed string. This is preferable in rooms that teach commit workflow — it lets the player practice writing a message rather than copying one. The engine will flag low-quality messages but still advance, which itself teaches the lesson.

---

## 4. Hints Strategy

Each stage has exactly three hint levels. Think of them as progressive commitment levels:

**Level 1 — Direction only.** Point toward the concept without naming the command. "git keeps a record of every commit ever made. there's a command that shows it." This level should be enough for someone who understood the conceptBrief but blanked on the exact syntax.

**Level 2 — Command family.** Name the command or subcommand without giving the full syntax. "git log shows the history. add --oneline to make it compact." A player who reads this should be able to construct the correct command from their prior knowledge.

**Level 3 — The answer.** Full exact syntax. End with `\n\nrun: git log --oneline` — the engine renders text after a blank line that starts with "run:" or "type:" in a styled code block. This level is a last resort and costs 15 points. Write it as if you're explaining to someone who is genuinely stuck, not as a reprimand.

**What to avoid:**
- Repeating the same information across levels with slightly different wording. Each level should add new information.
- Giving the answer at level 1 or the command name at level 1. The cost gradient (1pt → 5pt → 15pt) only works if each level is meaningfully more helpful.
- Writing hints in a different tone from Fox. The hints panel is part of the game's voice.

---

## 5. Fox Voice Guide

Fox is terse, mission-focused, and knowledgeable. He speaks in lowercase. He doesn't congratulate the player — he calibrates them. He treats mistakes as information, not failures.

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

Fox messages for action stages: one to three sentences. Concept-heavy stages can have four. Never more than four — if you need more, move the information into a conceptBrief bullet.

### When to be dramatic vs. informative

Fox is dramatic when the narrative stakes are high (police approach, something goes wrong, a critical file is found) and informative when setting up a new command or concept. The dramatic moments should feel earned — if every Fox message is urgent, none of them are.

**Dramatic:** "scanner alert — police unit picking up traffic on this node. forensic tools are running. you've got modified files sitting open everywhere."

**Informative:** "git keeps a full record of every commit ever made. 'git log' shows you that history. '--oneline' makes it compact: one line per commit. read the trail."

### Advancing the narrative

Fox messages should do double duty: advance the story and set up the next command. Look at each Fox message and ask: does this tell the player what they're about to do AND why it matters to the heist? If only one of those, revise.

The room `intro` field (printed to the terminal at room load) sets the scene. Fox's first stage message should assume the player just read the intro and immediately narrow to the first action.

---

## 6. Command Selection

### Teach a cluster, not a list

Commands in a room should illuminate the same concept from different angles, not be a random collection of git commands. In git-heist Room 0, `ls` (what files exist), `git log --oneline` (what commits exist), and `git status` (what has changed) are all "how to see the current state of things." That cluster has a unifying mental model.

### Avoid teaching an advanced variant before the basic form

If the player will use `git branch -a`, they should know what `git branch` does first. If you want to teach the `-a` flag, make sure the conceptBrief explains what plain `git branch` does and why `-a` extends it. The `wrong` entry for `git branch` (without `-a`) in git-heist Room 1 does exactly this: it shows the local-only output and then explains why `-a` is needed.

### Never introduce two new command families in one room

`git checkout` and `git rebase` in the same room is too much. One family per room, with its variants and flags. In a later room you can assume the earlier command is known and build on it.

### Write the wrong cases before writing the stage

Before you write the `accepted` and `output` for a stage, ask: "What would a confused player type here?" Those answers become your `wrong` entries. If you can't predict wrong attempts, the stage task is probably not clear enough.

---

## 7. Clue Design

### The assembled key should tell a story

Each room's clue is a fragment that gets collected and assembled at the end. The full set should read as coherent access credentials — something that looks like it unlocks a system. In git-heist, the assembled credentials are:

```
[SECTOR]  V0-CORE
[ENDPOINT] /internal/v0
[NODE]    banking-core-relay
[WINDOW]  02:00 — 02:15
[BYPASS]  sweep_clean
[TOKEN]   tok_override_9x77
[VECTOR]  ids_threshold
[STATUS]  history_clean
```

These form a plausible "vault access packet" — sector, endpoint, node, time window, bypass method, token, detection vector, final status. The player can imagine what system they just breached.

### Thematic matching

Each clue should feel thematically tied to what that room taught. Room 4 ("HIDE THE EVIDENCE" — git stash) yields `BYPASS: sweep_clean`. Room 7 ("ERASE THE TRAIL" — git revert) yields `STATUS: history_clean`. The clue label and value should echo the room's narrative.

### Reveal pacing

The clue value is type-animated one character at a time in the room-complete modal. Short values (under 20 characters) feel like a fast reveal — good for tension. Longer values feel more elaborate. Match the pacing to the room's emotional register.

---

## 8. AI Collaboration Guide

AI is well-suited to reviewing mission content, generating alternatives, and stress-testing logic — as long as you give it the right context. The prompts below assume the AI has access to `DATA_SCHEMA.md` and the mission's `data.js`.

---

### 8a. Review room narrative consistency

Use this when your room's intro, Fox messages, and completionMsg feel disconnected or don't reinforce each other.

**Prompt template:**

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

Use this when you've written hints that are either too obvious at level 1 or too cryptic at level 3.

**Prompt template:**

```
Improve the hint set for this stage from a Vault Zero mission.

The mission teaches [TOPIC]. The stage task is:
"[paste stage.task]"

The correct commands are: [paste stage.accepted]

The current hints are:
Level 1: [paste hint[0]]
Level 2: [paste hint[1]]
Level 3: [paste hint[2]]

The hint system works like this:
- Level 1: Direction only. No command name. Should help someone who understood the
  concept but blanked on the exact syntax.
- Level 2: Command family or partial syntax. Should help someone who knows the concept
  but not the specific flag.
- Level 3: The complete answer, exact syntax. Must end with a blank line followed by
  "run: <exact command>".

Rules:
- Each level adds new information (no rephrasing the same hint).
- Voice is Fox: lowercase, terse, no "great job" or "you should".
- Level 1 must not name the command. Level 2 may name the command but not the flags.

Rewrite all three levels.
```

---

### 8c. Stress-test command coverage

Use this to find edge cases — commands the player might reasonably try that are not in `accepted` or `wrong`.

**Prompt template:**

```
I'm designing a stage in a terminal-based escape room that teaches git.
The stage task is: "[paste stage.task]"

The correct commands (accepted) are:
[paste stage.accepted]

The handled wrong commands are:
[paste stage.wrong keys]

Imagine a junior developer who has read the task and the Fox message below but
has not seen the correct answer:
"[paste stage.foxMsg]"

What other commands might they plausibly try? Consider:
- Misspellings or missing flags (e.g. 'git branch' instead of 'git branch -a')
- Commands that do something adjacent but wrong
- Commands from other rooms that are always available (git status, git log)
- Commands that partially work but don't complete the task

For each candidate, say:
1. Why a player might try it
2. Whether it should be added to 'accepted', added to 'wrong', or left as-is
3. If added to 'wrong', suggest the response text (lowercase Fox voice)
```

---

### 8d. Improve Fox dialogue

Use this to sharpen individual Fox messages — especially ones that feel too instructional or too chatty.

**Prompt template:**

```
Rewrite this Fox message from a terminal escape room. Fox is a terse, professional
handler who speaks in lowercase and never congratulates the player. He gives exactly
the context needed for the next move and nothing extra.

The room scenario is: [one sentence about the heist context]
The stage task is: "[paste stage.task]"
The player must type: [paste the primary accepted command]

Current Fox message:
"[paste current foxMsg]"

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

Use this before writing any data.js, to pressure-test a planned room.

**Prompt template:**

```
Review this planned room for a Vault Zero escape room mission before I implement it.
The mission is about [TOPIC]. The game format: players type real terminal commands,
each room has 2–6 stages, each stage has one correct command (or a small set of variants).

Planned room:
- Name: [ROOM NAME]
- Teaching goal: [one sentence about what this room teaches]
- Intro: [paste planned intro]
- Stage 1: [command] — [what it shows/does]
- Stage 2: [command] — [what it shows/does]
- Stage 3: [command] — [what it shows/does]
- Clue: label=[LABEL] value=[VALUE]
- CompletionMsg: [planned completion message]

Check:
1. Do all stages cluster around the same mental model, or are concepts mixed?
2. Is the clue label/value thematically tied to what the room teaches?
3. Is there a natural "wrong path" for each stage — what will confused players try?
4. Does the progression build: orientation → concept → action → resolution?
5. Is the completionMsg a useful one-sentence takeaway, not a summary of steps?

Point out any structural issues and suggest improvements.
```

---

### Tips for effective AI collaboration on mission content

**Always provide the Fox voice constraints.** Without them, AI-generated dialogue tends toward cheerful and verbose. The lowercase, terse, mission-focused constraints are non-negotiable.

**Give the full stage context when reviewing a single stage.** An AI reviewing a Fox message in isolation doesn't know what the previous stage established or what comes next. Paste the surrounding stages.

**Ask for alternatives, not revisions.** "Write 3 versions" produces better output than "fix this" because you can choose the direction, and the variation helps you see what's possible.

**Verify generated commands against the engine.** AI may suggest `wrong` entries with plausible-sounding commands that don't actually work as written. Cross-check every suggested command against `DATA_SCHEMA.md` — confirm the normalised form, that it's not already in `accepted`, and that it would actually be caught by the wrong-map matching logic.

**Use AI to check internal consistency across all rooms.** Paste all room `completionMsg` values and ask: "Do these eight takeaways build on each other? Is anything repeated? Is anything contradicted?" This is a use of AI that is genuinely hard to do manually when you're deep in writing individual rooms.
