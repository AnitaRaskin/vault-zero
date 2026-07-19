const ROOMS = [

  // ──────────────────────────────────────────────────────
  // ROOM 1: THE BLUEPRINT
  // git branch -a, checkout, log --oneline, cat / git show
  // ──────────────────────────────────────────────────────
  {
    id: 1,
    name: 'THE BLUEPRINT',
    intro: "A previous operative breached Vault Zero's system and buried the access credentials inside their own repo. Never merged. We know it's in here — find the branch, find the commit, read the file.",
    stages: [
      {
        foxMsg: "the access map exists. someone on the inside hid it and never merged it. start by figuring out what branches are in this repo.",
        task: "Find ALL branches including remote ones.",
        accepted: ["git branch -a"],
        output: [
          ["* main", "br"],
          ["  remotes/origin/main", "dim"],
          ["  remotes/origin/security-audit-2019", "dim"],
          ["  remotes/origin/fox/vault-schematics", "hl"],
        ],
        tree: "r1_branches",
        wrong: {
          "git branch": [
            ["* main", "br"],
            ["", ""],
            ["Tip: that only shows local branches. try -a to see all branches including remote.", "warn"]
          ],
          "git log": [["fatal: unable to read history — find the branches first.", "err"]],
          "ls": [["README.md  access-routes.json  vault.txt", "sys"]],
          "git status": [["On branch main", "br"], ["nothing to commit, working tree clean", "dim"]]
        }
      },
      {
        foxMsg: "one of those branches has what you need. the name should give it away.",
        task: "Switch to the branch that has the access credentials.",
        accepted: ["git checkout fox/vault-schematics", "git switch fox/vault-schematics",
                   "git checkout origin/fox/vault-schematics"],
        output: [
          ["Branch 'fox/vault-schematics' set up to track 'origin/fox/vault-schematics'.", "sys"],
          ["Switched to a new branch 'fox/vault-schematics'", "ok"],
        ],
        tree: "r1_on_fox",
        wrong: {
          "git checkout security-audit-2019": [
            ["Switched to branch 'security-audit-2019'", "warn"],
            ["", ""],
            ["old audit logs from 2019. dead end. try the other one.", "err"]
          ],
          "git checkout main": [["you're already on main. look for a different branch.", "warn"]]
        }
      },
      {
        foxMsg: "someone was here before you. check the history. find the commit where it was hidden.",
        task: "View the commit log on this branch.",
        accepted: ["git log --oneline", "git log", "git log --all", "git log --oneline --all"],
        output: [
          ["a3f9c12 (HEAD -> fox/vault-schematics) hide the access map — do not merge", "cm"],
          ["b7e2d45 update access routes", "sys"],
          ["c1a8f33 initial repo setup", "dim"],
        ],
        tree: "r1_on_fox",
        wrong: {}
      },
      {
        foxMsg: "that commit at a3f9c12. go there. you'll detach from the branch — that's expected. read-only.",
        task: "Checkout the specific commit where the access map was hidden.",
        accepted: ["git checkout a3f9c12"],
        output: [
          ["Note: switching to 'a3f9c12'.", "sys"],
          ["", ""],
          ["You are in 'detached HEAD' state. You can look around and make experimental", "warn"],
          ["changes and commit them, but they won't be tracked to any branch.", "warn"],
          ["", ""],
          ["HEAD is now at a3f9c12 hide the access map — do not merge", "cm"],
        ],
        tree: "r1_detached",
        wrong: {
          "git checkout b7e2d45": [["that's the wrong commit. check the log again — you want a3f9c12.", "warn"]]
        }
      },
      {
        foxMsg: "you're there. read it.",
        task: "Read the contents of vault.txt.",
        accepted: ["cat vault.txt", "git show HEAD:vault.txt", "git show"],
        output: [
          ["", ""],
          ["┌─────────────────────────────────┐", "hl"],
          ["│     VAULT ZERO — SYSTEM MAP     │", "hl"],
          ["│                                 │", "hl"],
          ["│  [INTERNET]                     │", "hl"],
          ["│      │                          │", "hl"],
          ["│  [API GATEWAY]  ←── public      │", "hl"],
          ["│      │                          │", "hl"],
          ["│  [AUTH SERVICE] ←── target      │", "hl"],
          ["│      │                          │", "hl"],
          ["│  [CORE DB / V0] ←── the vault   │", "hl"],
          ["│                                 │", "hl"],
          ["│  Admin endpoint: /internal/v0   │", "hl"],
          ["│  Monitoring off: 02:00 — 02:15  │", "hl"],
          ["└─────────────────────────────────┘", "hl"],
          ["", ""],
          ["monitoring goes dark at 02:00. fifteen minutes.", "ok"],
        ],
        tree: "r1_detached",
        wrong: {
          "ls": [["README.md  access-routes.json  vault.txt", "sys"]]
        },
        completionMsg: "good. you know how to read a repo. now we can talk about the real job."
      }
    ],
    hints: [
      // per stage, 3 levels each
      [
        "the repo has more than just main. there's a command that lists ALL branches — local and remote.",
        "the command starts with 'git branch'. there's a flag that means 'all'.",
        "run: git branch -a"
      ],
      [
        "look at the branch names. one of them was created by someone on the inside.",
        "you switch branches with git checkout or git switch, followed by the branch name.",
        "run: git checkout fox/vault-schematics"
      ],
      [
        "you need to see the history of this branch — every commit that was made, in order.",
        "git log shows the commit history. --oneline makes it compact and readable.",
        "run: git log --oneline"
      ],
      [
        "you found the commit hash in the log. now you need to go TO that exact commit.",
        "git checkout works with commit hashes, not just branch names. use the 7-character hash.",
        "run: git checkout a3f9c12"
      ],
      [
        "you're at the right commit. the file is there — just read it.",
        "cat reads a file's contents. git show displays what a commit contains.",
        "run: cat vault.txt"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 2: GET A COPY
  // git remote -v, fork, git clone
  // ──────────────────────────────────────────────────────
  {
    id: 2,
    name: 'GET A COPY',
    intro: "The syndicate's server has the live vault access system. You can't touch the original — any write operation trips the alarm. You need your own working copy.",
    stages: [
      {
        foxMsg: "the access system is on their server. you touch the original, we're burned. first — check where this repo came from.",
        task: "Inspect the remote connections for this repo.",
        accepted: ["git remote -v", "git remote"],
        output: [
          ["origin  https://syndicate-server.vault/access-system.git (fetch)", "sys"],
          ["origin  https://syndicate-server.vault/access-system.git (push)", "sys"],
          ["", ""],
          ["⚠  this is their server. writing here triggers the alarm.", "warn"],
        ],
        tree: "r2_remote",
        wrong: {
          "git remote show": [
            ["* remote origin", "sys"],
            ["  Fetch URL: https://syndicate-server.vault/access-system.git", "sys"],
            ["  Push  URL: https://syndicate-server.vault/access-system.git", "sys"]
          ]
        }
      },
      {
        foxMsg: "fork it first. create a version that belongs to you — on your own account on the server. no writes to theirs.",
        task: "Fork the repository to your own account.",
        accepted: ["gh repo fork", "fork"],
        output: [
          ["✓ Created fork operative/access-system", "ok"],
          ["", ""],
          ["  Your fork: https://operative.vault/access-system.git", "hl"],
          ["  Upstream:  https://syndicate-server.vault/access-system.git", "dim"],
          ["", ""],
          ["the original is untouched. you now have your own copy on the server.", "sys"],
        ],
        tree: "r2_fork",
        wrong: {
          "git fork": [["not a standard git command. use: gh repo fork (GitHub CLI style)", "warn"]]
        }
      },
      {
        foxMsg: "now pull it down to your machine. you need it local.",
        task: "Clone your fork locally.",
        accepted: [
          "git clone https://operative.vault/access-system.git",
          "git clone operative/access-system"
        ],
        output: [
          ["Cloning into 'access-system'...", "sys"],
          ["remote: Counting objects: 47, done.", "dim"],
          ["remote: Compressing objects: 100% (31/31), done.", "dim"],
          ["Receiving objects: 100% (47/47), 22.1 KiB | 4.4 MiB/s, done.", "sys"],
          ["", ""],
          ["✓ local copy ready. origin points to your fork.", "ok"],
          ["  upstream (syndicate) is read-only — no trace.", "dim"],
        ],
        tree: "r2_cloned",
        wrong: {
          "git clone https://syndicate-server.vault/access-system.git": [
            ["⚠  ALARM TRIGGERED — write access to syndicate server detected.", "err"],
            ["", ""],
            ["clone from YOUR fork, not the original.", "warn"]
          ]
        },
        completionMsg: "it's yours. local copy, your remote, no trace on theirs. now we can work."
      }
    ],
    hints: [
      [
        "there's a command to see what remote server this repo is connected to.",
        "it starts with 'git remote'. the -v flag gives you the full URLs.",
        "run: git remote -v"
      ],
      [
        "forking means creating a copy of the repo on the server under your own account — not downloading it yet.",
        "the GitHub CLI command for forking is a single command.",
        "run: gh repo fork"
      ],
      [
        "cloning downloads the repo to your local machine. you want to clone YOUR fork, not the syndicate's.",
        "git clone <url> — use the URL of your fork: https://operative.vault/access-system.git",
        "run: git clone https://operative.vault/access-system.git"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 3: INTO POSITION
  // git status, git checkout -b, edit file, git add, git commit
  // ──────────────────────────────────────────────────────
  {
    id: 3,
    name: 'INTO POSITION',
    intro: "You're inside the access system. You need to modify the security config — but not on main. Work on your own route. Save checkpoints as you go.",
    stages: [
      {
        foxMsg: "before you touch anything — where are you? what state is the repo in?",
        task: "Check the current state of the repository.",
        accepted: ["git status"],
        output: [
          ["On branch main", "br"],
          ["Your branch is up to date with 'origin/main'.", "dim"],
          ["", ""],
          ["nothing to commit, working tree clean", "ok"],
        ],
        tree: "r3_clean",
        wrong: {}
      },
      {
        foxMsg: "don't work on main. create your own branch and switch to it. call it operative/entry-window.",
        task: "Create and switch to a new branch called operative/entry-window.",
        accepted: ["git checkout -b operative/entry-window", "git switch -c operative/entry-window"],
        output: [
          ["Switched to a new branch 'operative/entry-window'", "ok"],
        ],
        tree: "r3_feature",
        wrong: {
          "git branch operative/entry-window": [
            ["branch created. but you're still on main.", "warn"],
            ["", ""],
            ["Tip: use -b with checkout or -c with switch to create AND switch in one step.", "warn"],
          ]
        }
      },
      {
        foxMsg: "modify the config. the maintenance window — when their monitoring goes offline — needs to be set to 02:00. i've opened the file for you.",
        task: "Edit security-config.json, then stage it with git add.",
        fileEdit: true,
        accepted: ["git add security-config.json", "git add ."],
        output: [
          ["Changes staged for commit:", "sys"],
          ["    modified:   security-config.json", "ok"],
        ],
        tree: "r3_staged",
        wrong: {
          "git commit": [["nothing staged yet. edit the file first, then: git add security-config.json", "warn"]],
          "git commit -m": [["stage the file first: git add security-config.json", "warn"]]
        }
      },
      {
        foxMsg: "save your work. every checkpoint matters — write a useful message. this is for the crew.",
        task: "Commit the staged change with a descriptive message.",
        flexCommit: true,
        accepted: ["git commit -m \"set maintenance window to 02:00\""],
        output: [],
        tree: "r3_committed",
        wrong: {
          "git commit": [["add -m and a message in quotes: git commit -m \"your message\"", "warn"]]
        },
        completionMsg: "good. that's a checkpoint. the repo remembers exactly what you did and when."
      }
    ],
    hints: [
      [
        "there's a command that tells you which branch you're on and what files have changed.",
        "it's one of the most-used git commands. just two words.",
        "run: git status"
      ],
      [
        "you need to create a new branch AND switch to it — both at once.",
        "git checkout -b <name> does both: create and switch. same with git switch -c.",
        "run: git checkout -b operative/entry-window"
      ],
      [
        "after editing the file, you need to tell git you want this change in the next commit.",
        "git add stages files. you can specify a filename or use . for all changes.",
        "run: git add security-config.json"
      ],
      [
        "a commit is a saved snapshot with a message describing what you did.",
        "git commit -m \"...\" sets the message inline. make it readable.",
        "run: git commit -m \"set maintenance window to 02:00\""
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 4: SEND THE SIGNAL
  // git push, git push -u
  // ──────────────────────────────────────────────────────
  {
    id: 4,
    name: 'SEND THE SIGNAL',
    intro: "Your modified config is ready locally. The rest of the crew needs it. Upload your branch to the shared server.",
    stages: [
      {
        foxMsg: "you've got the change locally. the crew doesn't have it yet. check what you have that hasn't been pushed.",
        task: "Check the status — see that you're ahead of remote.",
        accepted: ["git status"],
        output: [
          ["On branch operative/entry-window", "br"],
          ["Your branch is 1 commit ahead of 'origin/operative/entry-window'.", "warn"],
          ["", ""],
          ["  (use \"git push\" to publish your local commits)", "dim"],
        ],
        tree: "r4_ahead",
        wrong: {}
      },
      {
        foxMsg: "send it. upload your branch to the crew server.",
        task: "Push your branch to origin.",
        accepted: [
          "git push origin operative/entry-window",
          "git push -u origin operative/entry-window",
          "git push"
        ],
        output: [
          ["Enumerating objects: 5, done.", "dim"],
          ["Counting objects: 100% (5/5), done.", "dim"],
          ["Writing objects: 100% (3/3), 312 bytes, done.", "dim"],
          ["", ""],
          ["To https://operative.vault/access-system.git", "sys"],
          [" * [new branch]      operative/entry-window -> operative/entry-window", "ok"],
          ["", ""],
          ["Branch 'operative/entry-window' set up to track 'origin/operative/entry-window'.", "dim"],
        ],
        tree: "r4_pushed",
        wrong: {
          "git push origin main": [["you're not on main. push your feature branch.", "warn"]]
        },
        completionMsg: "the crew has it. your branch is on the server."
      }
    ],
    hints: [
      [
        "git has a way to show you how your local branch compares to the remote version.",
        "git status always shows if you're ahead or behind the remote.",
        "run: git status"
      ],
      [
        "pushing uploads your commits from local to remote so others can see them.",
        "git push origin <branchname> — or just git push if upstream is already set.",
        "run: git push origin operative/entry-window"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 5: READ THE ROOM
  // git status, git log --oneline, git show / git diff
  // ──────────────────────────────────────────────────────
  {
    id: 5,
    name: 'READ THE ROOM',
    intro: "The IDS tripped at 01:47. Something changed that shouldn't have. Find what happened, when, and who did it — before their security team traces the intrusion back to us.",
    stages: [
      {
        foxMsg: "something's wrong. before anything else — what state is the repo in right now?",
        task: "Check the current repo state.",
        accepted: ["git status"],
        output: [
          ["On branch main", "br"],
          ["", ""],
          ["Changes not staged for commit:", "sys"],
          ["    modified:   alarm-config.json", "err"],
          ["    modified:   access-log.txt", "err"],
          ["", ""],
          ["Untracked files:", "sys"],
          ["    temp-override.sh", "warn"],
        ],
        tree: "r5_dirty",
        wrong: {}
      },
      {
        foxMsg: "when did this happen? walk back through the history.",
        task: "Find the suspicious commit in the log.",
        accepted: ["git log --oneline", "git log", "git log --all --oneline", "git log --oneline --all"],
        output: [
          ["d8f2a11 (HEAD -> main) merge alarm bypass — URGENT", "cm"],
          ["e3c4b20 temp fix — remove before push", "err"],
          ["f1a9c33 update monitoring cycle config", "sys"],
          ["a3f9c12 set maintenance window to 02:00", "sys"],
          ["c1a8f33 initial repo setup", "dim"],
          ["", ""],
          ["⚠  note e3c4b20 — 'remove before push'. it was pushed.", "warn"],
        ],
        tree: "r5_dirty",
        wrong: {}
      },
      {
        foxMsg: "what did commit e3c4b20 actually do? line by line.",
        task: "Inspect the exact changes made by commit e3c4b20.",
        accepted: ["git show e3c4b20", "git diff e3c4b20^ e3c4b20", "git diff e3c4b20^..e3c4b20"],
        output: [
          ["commit e3c4b20", "cm"],
          ["Author: unknown operative <redacted@vault.local>", "dim"],
          ["Date:   Sat Jul 19 01:44:03 2026 +0000", "dim"],
          ["", ""],
          ["    temp fix — remove before push", "sys"],
          ["", ""],
          ["diff --git a/alarm-config.json b/alarm-config.json", "dim"],
          ["--- a/alarm-config.json", "dim"],
          ["+++ b/alarm-config.json", "dim"],
          ["-    \"ids_threshold\": 5", "err"],
          ["+    \"ids_threshold\": 1", "ok"],
          ["", ""],
          ["⚠  there it is. threshold lowered from 5 to 1. IDS triggered on the first login attempt.", "warn"],
        ],
        tree: "r5_dirty",
        wrong: {
          "git diff": [
            ["--- a/alarm-config.json  b/alarm-config.json (working dir)", "dim"],
            ["shows current working directory changes — not what's IN a commit.", "warn"],
            ["try: git show e3c4b20  to inspect a specific commit's changes.", "dim"]
          ]
        },
        completionMsg: "there it is. now you know. now fix it."
      }
    ],
    hints: [
      [
        "before anything else, find out what git thinks is dirty — what's changed, staged, or untracked.",
        "there's a two-word command for this.",
        "run: git status"
      ],
      [
        "git records every commit with a timestamp. there's a way to list them all.",
        "git log --oneline gives a compact history. look for anything that doesn't belong.",
        "run: git log --oneline"
      ],
      [
        "you have the commit hash. you can see exactly what changed in that commit.",
        "git show <hash> displays the commit message and the full diff of what changed.",
        "run: git show e3c4b20"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 6: ERASE THE TRAIL
  // git clean -fd, git restore, git revert, git reset
  // ──────────────────────────────────────────────────────
  {
    id: 6,
    name: 'ERASE THE TRAIL',
    intro: "The 'temp fix' commit is in shared history. It needs to go — but logs are monitored. You can't rewrite shared history. Undo it officially. And clean up the local mess first.",
    stages: [
      {
        foxMsg: "there are untracked files lying around. temp-override.sh. clean them up — no trace.",
        task: "Remove all untracked files from the working directory.",
        accepted: ["git clean -fd", "git clean -f"],
        output: [
          ["Removing temp-override.sh", "warn"],
          ["", ""],
          ["working directory clean.", "ok"],
        ],
        tree: "r6_dirty",
        wrong: {
          "git clean -n": [
            ["Would remove temp-override.sh", "dim"],
            ["", ""],
            ["-n is a dry run — shows what WOULD be removed. use -f to actually do it.", "warn"],
          ],
          "rm temp-override.sh": [
            ["removed. but git clean -fd is the git-aware way — handles all untracked files and dirs.", "dim"]
          ]
        }
      },
      {
        foxMsg: "alarm-config.json has an unstaged modification. discard it — restore the version from the last commit.",
        task: "Discard the unstaged change to alarm-config.json.",
        accepted: ["git restore alarm-config.json", "git checkout -- alarm-config.json"],
        output: [
          ["restored alarm-config.json to last committed state.", "ok"],
          ["trigger_threshold is back to 5.", "dim"],
        ],
        tree: "r6_partial",
        wrong: {
          "git reset alarm-config.json": [
            ["that unstages a staged file — alarm-config.json isn't staged, it's modified in the working dir.", "warn"],
            ["use git restore <file> to discard working directory changes.", "dim"]
          ],
          "git reset --hard": [
            ["that resets the entire working directory — too broad. target just the one file.", "warn"],
            ["use: git restore alarm-config.json", "dim"]
          ]
        }
      },
      {
        foxMsg: "that bad commit is on the shared branch. you can't rewrite history — the server logs every push. undo it officially.",
        task: "Safely undo commit e3c4b20 without rewriting shared history.",
        accepted: ["git revert e3c4b20", "git revert e3c4b20 --no-edit"],
        output: [
          ["[main 9a1c3e7] Revert \"temp fix — remove before push\"", "cm"],
          [" 1 file changed, 1 deletion(-), 1 insertion(+)", "sys"],
          ["", ""],
          ["✓ a new commit was created. the bad change is undone.", "ok"],
          ["  the original commit e3c4b20 is still in history — that's correct.", "dim"],
          ["  revert adds a commit that cancels it out. history stays intact.", "dim"],
        ],
        tree: "r6_reverted",
        wrong: {
          "git reset --hard e3c4b20": [
            ["⚠  that rewrites history — removes commits entirely.", "err"],
            ["this is a SHARED branch. others have already pulled it.", "err"],
            ["rewriting it would break their repos.", "err"],
            ["", ""],
            ["use git revert instead — it adds a new commit that undoes the change.", "warn"],
          ],
          "git reset --soft HEAD~1": [
            ["⚠  this is a shared branch. don't reset shared history.", "err"],
            ["use git revert instead.", "warn"]
          ],
          "git reset --hard HEAD~1": [
            ["⚠  this is a shared branch. don't reset shared history.", "err"],
            ["use git revert instead.", "warn"]
          ]
        },
        completionMsg: "revert when it's shared. reset when it's only yours. never the other way around."
      }
    ],
    hints: [
      [
        "there are untracked files (not tracked by git at all). git clean handles these.",
        "git clean removes untracked files. -f forces the removal (required safety flag).",
        "run: git clean -fd"
      ],
      [
        "you want to throw away the current working-directory changes to one file and go back to what was last committed.",
        "git restore <filename> discards working directory changes for that file.",
        "run: git restore alarm-config.json"
      ],
      [
        "the commit is on a shared branch that others have already pulled. you can't erase it — you must officially undo it.",
        "git revert <hash> creates a new commit that reverses the changes from that commit.",
        "run: git revert e3c4b20"
      ]
    ]
  }

]; // end ROOMS


// ═══════════════════════════════════════════════════════════════════════
// GIT TREE STATE DEFINITIONS
// Each state defines: branches (name, commits, y, color, dashed?),
//                     HEAD (type, ref/commitId),
//                     labels [], extras []
// ═══════════════════════════════════════════════════════════════════════

const TREE = {
  r1_initial: {
    branches: [
      { name: "main", y: 60, color: "#1D9E75", commits: [{x:40}, {x:90}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 1 }
  },
  r1_branches: {
    branches: [
      { name: "main",                   y: 50,  color: "#1D9E75", commits: [{x:40}, {x:85}] },
      { name: "security-audit-2019",    y: 130, color: "#3d4943", commits: [{x:40}, {x:85}, {x:130}] },
      { name: "fox/vault-schematics",   y: 210, color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}, {x:175}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 1 },
    headBranchY: 50
  },
  r1_on_fox: {
    branches: [
      { name: "main",                 y: 55,  color: "#1D9E75", commits: [{x:40}, {x:85}] },
      { name: "fox/vault-schematics", y: 160, color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}, {x:175}] }
    ],
    HEAD: { type: "branch", ref: "fox/vault-schematics", ci: 3, branchY: 160 }
  },
  r1_detached: {
    branches: [
      { name: "main",                 y: 55,  color: "#1D9E75", commits: [{x:40}, {x:85}] },
      { name: "fox/vault-schematics", y: 160, color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}, {x:175}] }
    ],
    HEAD: { type: "detached", cx: 130, cy: 160 }
  },
  r2_remote: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 },
    extras: [
      { type: "remote-box", x: 165, y: 65, label: "origin (syndicate)", color: "#cc4444" }
    ]
  },
  r2_fork: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 },
    extras: [
      { type: "remote-box", x: 30,  y: 160, label: "upstream (syndicate)", color: "#3d4943" },
      { type: "remote-box", x: 130, y: 160, label: "origin (your fork)",   color: "#1D9E75" },
      { type: "arrow", x1: 140, y1: 100, x2: 170, y2: 155 }
    ]
  },
  r2_cloned: {
    branches: [
      { name: "main (local)",  y: 70,  color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] },
      { name: "origin/main",   y: 140, color: "#1D9E7566", commits: [{x:40}, {x:90}, {x:140}], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 70 }
  },
  r3_clean: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 }
  },
  r3_feature: {
    branches: [
      { name: "main",                    y: 60,  color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] },
      { name: "operative/entry-window",  y: 140, color: "#7eb8d4", commits: [{x:140}] }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 0, branchY: 140 }
  },
  r3_staged: {
    branches: [
      { name: "main",                    y: 60,  color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] },
      { name: "operative/entry-window",  y: 140, color: "#7eb8d4", commits: [{x:140}] }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 0, branchY: 140 },
    extras: [{ type: "staged-indicator", x: 10, y: 240 }]
  },
  r3_committed: {
    branches: [
      { name: "main",                    y: 60,  color: "#1D9E75", commits: [{x:40}, {x:90}, {x:140}] },
      { name: "operative/entry-window",  y: 140, color: "#7eb8d4", commits: [{x:140}, {x:190}] }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 1, branchY: 140 }
  },
  r4_ahead: {
    branches: [
      { name: "main",                    y: 55,  color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}] },
      { name: "operative/entry-window",  y: 120, color: "#7eb8d4", commits: [{x:130}, {x:180}] },
      { name: "origin/entry-window",     y: 185, color: "#7eb8d455", commits: [{x:130}], dashed: true }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 1, branchY: 120 }
  },
  r4_pushed: {
    branches: [
      { name: "main",                    y: 55,  color: "#1D9E75", commits: [{x:40}, {x:85}, {x:130}] },
      { name: "operative/entry-window",  y: 120, color: "#7eb8d4", commits: [{x:130}, {x:180}] },
      { name: "origin/entry-window",     y: 185, color: "#7eb8d455", commits: [{x:130}, {x:180}], dashed: true }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 1, branchY: 120 }
  },
  r5_dirty: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:30}, {x:70}, {x:110}, {x:150}, {x:190}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 4, branchY: 80 },
    extras: [{ type: "dirty-indicator", x: 10, y: 200 }]
  },
  r6_dirty: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:30}, {x:70}, {x:110}, {x:150}, {x:190}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 4, branchY: 80 },
    extras: [{ type: "dirty-indicator", x: 10, y: 200 }]
  },
  r6_partial: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:30}, {x:70}, {x:110}, {x:150}, {x:190}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 4, branchY: 80 }
  },
  r6_reverted: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:25}, {x:60}, {x:95}, {x:130}, {x:165}, {x:205}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 5, branchY: 80 },
    extras: [{ type: "revert-label", x: 205, y: 80 }]
  }
};


// ═══════════════════════════════════════════════════════════════════════
// SVG TREE RENDERER
// ═══════════════════════════════════════════════════════════════════════

