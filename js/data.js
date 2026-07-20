const ROOMS = [

  // ──────────────────────────────────────────────────────
  // ROOM 0: THE EQUIPMENT
  // ls, git log --oneline, git status
  // ──────────────────────────────────────────────────────
  {
    id: 0,
    name: 'THE EQUIPMENT',
    initialTree: 'r0_initial',
    clue: { label: 'SECTOR', value: 'V0-CORE' },
    intro: "Before you breach anything, you need to know your tools. A repo is the mission folder — git tracks every change made inside it.",
    stages: [
      {
        foxMsg: "before we start — know your environment. look around. what files are in this repo?",
        task: "List the files in the repository.",
        accepted: ["ls", "ls -la", "ls -l", "ls -a"],
        output: [
          ["README.md", "sys"],
          ["vault.txt", "sys"],
          ["access-routes.json", "sys"],
          ["", ""],
          ["three files. git watches every change made to each of them.", "dim"],
        ],
        tree: "r0_initial",
        wrong: {}
      },
      {
        foxMsg: "git keeps a full history of every change ever made — like a paper trail you can walk back through. check who made what, and when.",
        task: "View the commit history of this repo.",
        accepted: ["git log --oneline", "git log"],
        output: [
          ["c1a8f33 (HEAD -> main) initial repo setup", "cm"],
          ["", ""],
          ["one commit. the repo is fresh. everything that happens next — you'll be able to trace.", "dim"],
        ],
        tree: "r0_initial",
        wrong: {
          "ls": [["you already checked the files. now check the history — who made changes, and when.", "dim"]]
        }
      },
      {
        foxMsg: "now check the current state. is anything changed? anything waiting to be saved?",
        task: "Check whether any files have been modified.",
        accepted: ["git status"],
        output: [
          ["On branch main", "br"],
          ["nothing to commit, working tree clean", "ok"],
          ["", ""],
          ["clean. no changes. you know what you have.", "dim"],
        ],
        tree: "r0_initial",
        wrong: {},
        completionMsg: "you know what a repo is, what's in it, and how to read its state. that's the foundation."
      }
    ],
    hints: [
      [
        "you need to see what files exist in the current directory.",
        "ls lists files — works anywhere, including inside a git repo.",
        "ls stands for 'list' — it prints every file and directory in the current location.\n\nrun: ls"
      ],
      [
        "every repo has a history of commits — saved snapshots with timestamps and messages.",
        "git log shows that history. --oneline makes it compact.",
        "--oneline compresses each commit to one line: the short hash followed by the message. git log alone shows author, date, and the full message.\n\nrun: git log --oneline"
      ],
      [
        "git status tells you whether anything has changed since the last commit.",
        "it's the most-used git command. two words.",
        "git status shows which branch you're on, which files changed, and what's staged — always a safe first command.\n\nrun: git status"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 1: THE BLUEPRINT
  // git branch -a, checkout, log --oneline, cat / git show
  // ──────────────────────────────────────────────────────
  {
    id: 1,
    name: 'THE BLUEPRINT',
    clue: { label: 'ENDPOINT', value: '/internal/v0' },
    intro: "A previous operative breached the target's banking system and buried the access credentials inside their own repo. Never merged. We know it's in here — find the branch, find the commit, read the file.",
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
          ["│     GIT HEIST — SYSTEM MAP      │", "hl"],
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
        "the -a flag means 'all' — it shows local branches AND remote-tracking branches together. remote ones appear as remotes/origin/<name>.\n\nrun: git branch -a"
      ],
      [
        "look at the branch names. one of them was created by someone on the inside.",
        "you switch branches with git checkout or git switch, followed by the branch name.",
        "git checkout <name> switches to that branch. the full name is exactly what appeared in git branch -a — copy it precisely, including the prefix.\n\nrun: git checkout fox/vault-schematics"
      ],
      [
        "you need to see the history of this branch — every commit that was made, in order.",
        "git log shows the commit history. --oneline makes it compact and readable.",
        "git log --oneline gives one line per commit: short hash on the left, message on the right. look for the commit with the suspicious message.\n\nrun: git log --oneline"
      ],
      [
        "you found the commit hash in the log. now you need to go TO that exact commit.",
        "git checkout works with commit hashes, not just branch names. use the 7-character hash.",
        "a commit hash is its unique ID. git checkout works with hashes the same way it works with branch names. you'll enter 'detached HEAD' state — that's expected for read-only exploration.\n\nrun: git checkout a3f9c12"
      ],
      [
        "you're at the right commit. the file is there — just read it.",
        "cat reads a file's contents. git show displays what a commit contains.",
        "cat reads a file and prints it to the terminal. the filename is already in the directory listing — look at what ls showed you earlier.\n\nrun: cat vault.txt"
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
    clue: { label: 'NODE', value: 'banking-core-relay' },
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
        "git remote -v lists every remote connection with its full URL. -v stands for verbose. you'll see at least one entry: origin.\n\nrun: git remote -v"
      ],
      [
        "forking means creating a copy of the repo on the server under your own account — not downloading it yet.",
        "the GitHub CLI command for forking is a single command.",
        "forking creates a server-side copy under your account — safe to write to, no risk to the original. the GitHub CLI command is two words.\n\nrun: gh repo fork"
      ],
      [
        "cloning downloads the repo to your local machine. you want to clone YOUR fork, not the syndicate's.",
        "git clone <url> — use the URL of your fork: https://operative.vault/access-system.git",
        "git clone <url> downloads a repo to your machine. clone YOUR fork — its URL points to your account, not the syndicate's server.\n\nrun: git clone https://operative.vault/access-system.git"
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
    clue: { label: 'WINDOW', value: '02:00 — 02:15' },
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
        "git status shows your current branch, any modified files, and whether anything is staged — always your first move.\n\nrun: git status"
      ],
      [
        "you need to create a new branch AND switch to it — both at once.",
        "git checkout -b <name> does both: create and switch. same with git switch -c.",
        "git checkout -b <name> creates a new branch and switches to it in one command. git switch -c <name> does the same. the branch name goes right after the flag.\n\nrun: git checkout -b operative/entry-window"
      ],
      [
        "after editing the file, you need to tell git you want this change in the next commit.",
        "git add stages files. you can specify a filename or use . for all changes.",
        "git add stages files for the next commit. you can name a file specifically or use . to stage all changes at once.\n\nrun: git add security-config.json"
      ],
      [
        "a commit is a saved snapshot with a message describing what you did.",
        "git commit -m \"...\" sets the message inline. make it readable.",
        "git commit -m saves staged changes as a snapshot. the message goes in quotes after -m. it stays in the history permanently — make it readable for the crew.\n\nrun: git commit -m \"set maintenance window to 02:00\""
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 4: HIDE THE EVIDENCE
  // git stash, git stash list, git stash pop
  // ──────────────────────────────────────────────────────
  {
    id: 4,
    name: 'HIDE THE EVIDENCE',
    initialTree: 'r_stash_dirty',
    clue: { label: 'BYPASS', value: 'sweep_clean' },
    intro: "Scanner just picked up a police sweep. You're mid-change — files are open, work is half done. You can't commit yet. You need to hide everything, fast.",
    stages: [
      {
        foxMsg: "police scanner just lit up. check what you have open right now.",
        task: "Check the current state of the working directory.",
        accepted: ["git status"],
        output: [
          ["On branch operative/entry-window", "br"],
          ["", ""],
          ["Changes not staged for commit:", "sys"],
          ["    modified:   firewall-rules.json", "err"],
          ["    modified:   entry-tokens.txt", "err"],
          ["", ""],
          ["⚠  open changes. if they sweep this — we're burned.", "warn"],
        ],
        tree: "r_stash_dirty",
        wrong: {}
      },
      {
        foxMsg: "they're two blocks away. stash it. hide everything. NOW.",
        task: "Stash your current changes to hide them.",
        policeOnLoad: true,
        accepted: ["git stash", "git stash push"],
        output: [
          ["Saved working directory and index state", "sys"],
          ["  stash@{0}: WIP on operative/entry-window: f4a2b19 set maintenance window to 02:00", "dim"],
          ["", ""],
          ["working tree clean. nothing to see here.", "ok"],
        ],
        tree: "r_stash_clean",
        wrong: {
          "git add .": [
            ["⚠  staging makes it MORE visible, not less.", "err"],
            ["you need to HIDE the work. git stash saves it and cleans the working tree.", "warn"],
          ],
          "git add": [
            ["⚠  staging is not hiding. use git stash to disappear the changes.", "warn"],
          ],
          "git commit": [["you can't commit half-done work under pressure. stash it first.", "warn"]],
        }
      },
      {
        foxMsg: "they passed. check what's in your stash — make sure nothing was lost.",
        task: "List your stashed changes.",
        accepted: ["git stash list"],
        output: [
          ["stash@{0}: WIP on operative/entry-window: f4a2b19 set maintenance window to 02:00", "sys"],
          ["", ""],
          ["your work is safe. hidden. waiting.", "dim"],
        ],
        tree: "r_stash_clean",
        wrong: {
          "git stash": [["it's already stashed. check the list — git stash list", "dim"]],
        }
      },
      {
        foxMsg: "coast is clear. retrieve your work and keep going.",
        task: "Restore your stashed changes.",
        flexStashPop: true,
        accepted: ["git stash pop"],
        output: [
          ["On branch operative/entry-window", "br"],
          ["Changes not staged for commit:", "sys"],
          ["    modified:   firewall-rules.json", "ok"],
          ["    modified:   entry-tokens.txt", "ok"],
          ["", ""],
          ["Dropped stash@{0}", "dim"],
          ["", ""],
          ["everything's back. like it never happened.", "ok"],
        ],
        tree: "r_stash_dirty",
        wrong: {},
        completionMsg: "stash when you need to disappear fast. pop when the coast is clear."
      }
    ],
    hints: [
      [
        "you need to see what's currently modified in your working directory.",
        "git status shows the full picture — modified files, staged files, untracked files.",
        "git status always shows the current picture — which files are modified, staged, or untracked. read the full output.\n\nrun: git status"
      ],
      [
        "git has a temporary hiding place for uncommitted changes — the stash.",
        "git stash saves your work and leaves the working tree completely clean.",
        "git stash saves all uncommitted changes to a private stack and cleans the working tree. the work isn't gone — it's hidden, waiting for you.\n\nrun: git stash"
      ],
      [
        "the stash keeps a list of everything you've hidden.",
        "git stash list shows every stash entry — with its index and the commit it was saved from.",
        "git stash list shows every entry in the stash stack. entries are labelled stash@{0}, stash@{1}, etc. — 0 is always the most recent.\n\nrun: git stash list"
      ],
      [
        "you need to bring the stashed work back so you can continue.",
        "git stash pop restores the latest stash and removes it from the list.",
        "git stash pop restores the most recent stash and removes it from the list. git stash apply also restores — but keeps the entry in the list for later.\n\nrun: git stash pop"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 5: SEND THE SIGNAL
  // git push, git push -u
  // ──────────────────────────────────────────────────────
  {
    id: 5,
    name: 'SEND THE SIGNAL',
    initialTree: 'r4_ahead',
    clue: { label: 'SIGNAL', value: 'branch_live' },
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
        "git status shows whether your local branch is ahead of the remote — meaning you have commits the server hasn't seen yet.\n\nrun: git status"
      ],
      [
        "pushing uploads your commits from local to remote so others can see them.",
        "git push origin <branchname> — or just git push if upstream is already set.",
        "git push origin <branch> sends local commits to the remote server. if the branch doesn't exist there yet, this creates it. add -u to track it automatically going forward.\n\nrun: git push origin operative/entry-window"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 6: THE CREW CONFLICT
  // git pull, resolve conflict, git add, git commit
  // ──────────────────────────────────────────────────────
  {
    id: 6,
    name: 'THE CREW CONFLICT',
    initialTree: 'r_conflict_initial',
    clue: { label: 'TOKEN', value: 'tok_override_9x77' },
    intro: "Two operatives edited the same file at the same time. The repo is in conflict. You need to resolve it — or the whole job falls apart.",
    stages: [
      {
        foxMsg: "another operative pushed changes while you were working. pull their work down.",
        task: "Pull the latest changes from origin.",
        accepted: ["git pull", "git pull origin main"],
        output: [
          ["remote: Counting objects: 3, done.", "dim"],
          ["Unpacking objects: 100% (3/3), done.", "dim"],
          ["", ""],
          ["Auto-merging entry-tokens.txt", "sys"],
          ["CONFLICT (content): Merge conflict in entry-tokens.txt", "err"],
          ["Automatic merge failed; fix conflicts and then commit the result.", "warn"],
        ],
        tree: "r_conflict_initial",
        wrong: {
          "git fetch": [
            ["fetched. but the conflict is still there — you need to merge.", "dim"],
            ["run: git pull to fetch AND merge in one step.", "dim"]
          ]
        }
      },
      {
        foxMsg: "conflict in entry-tokens.txt. two operatives changed the same line. open the file — pick the correct version, remove the markers.",
        task: "Resolve the merge conflict in entry-tokens.txt, then stage it.",
        fileEdit: true,
        fileName: "entry-tokens.txt",
        fileEditType: "conflict",
        accepted: ["git add entry-tokens.txt", "git add ."],
        output: [
          ["Changes staged for commit:", "sys"],
          ["    modified:   entry-tokens.txt", "ok"],
        ],
        tree: "r_conflict_resolved",
        wrong: {
          "git commit": [["resolve the conflict first. edit entry-tokens.txt, remove the markers, then: git add entry-tokens.txt", "warn"]],
          "git commit -m": [["resolve the conflict first. open the file, fix it, then stage it.", "warn"]],
        }
      },
      {
        foxMsg: "good. close the merge — save the resolution as a commit.",
        task: "Commit the merge resolution.",
        flexCommit: true,
        accepted: ["git commit -m \"resolve merge conflict in entry-tokens.txt\""],
        output: [],
        tree: "r_conflict_merged",
        wrong: {
          "git commit": [["add -m and a message: git commit -m \"resolve merge conflict in entry-tokens.txt\"", "warn"]]
        },
        completionMsg: "conflicts happen when two people work at the same time. you resolve them, you merge, you move on."
      }
    ],
    hints: [
      [
        "you need to fetch and merge the remote changes in one step.",
        "git pull does both — fetch from origin and merge into your branch.",
        "git pull = git fetch + git merge in one command. it downloads remote changes and immediately tries to merge them into your current branch.\n\nrun: git pull"
      ],
      [
        "the conflict is in entry-tokens.txt. open it to see the conflict markers.",
        "remove the <<<<<<, ======, >>>>>>> lines and keep the correct content. then: git add entry-tokens.txt",
        "the editor shows the conflict markers. the <<<<<<< section is your version (HEAD), the >>>>>>> section is theirs (origin/main). remove all three marker lines and keep all three tokens.\n\ntype: edit entry-tokens.txt"
      ],
      [
        "once the conflict is resolved and staged, you complete the merge with a commit.",
        "git commit -m \"...\" saves the resolution as a new commit.",
        "after staging the resolved file, a plain git commit closes the merge. no special flags needed — just write a clear message explaining what you fixed.\n\nrun: git commit -m \"resolve merge conflict in entry-tokens.txt\""
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 7: READ THE ROOM
  // git status, git log --oneline, git show / git diff
  // ──────────────────────────────────────────────────────
  {
    id: 7,
    name: 'READ THE ROOM',
    initialTree: 'r5_dirty',
    clue: { label: 'VECTOR', value: 'ids_threshold' },
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
        "git status is always your first move — it shows modified files, staged files, and untracked files. read the full output before doing anything else.\n\nrun: git status"
      ],
      [
        "git records every commit with a timestamp. there's a way to list them all.",
        "git log --oneline gives a compact history. look for anything that doesn't belong.",
        "git log --oneline gives the full history in compact form: hash + message. look for anything suspicious — commits that say 'temp', 'wip', or 'remove before push' are red flags.\n\nrun: git log --oneline"
      ],
      [
        "you have the commit hash. you can see exactly what changed in that commit.",
        "git show <hash> displays the commit message and the full diff of what changed.",
        "git show <hash> displays the full diff of a specific commit — exactly which lines were added (+) and removed (-). use the 7-character hash from the log output.\n\nrun: git show e3c4b20"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 8: ERASE THE TRAIL
  // git clean -fd, git restore, git revert, git reset
  // ──────────────────────────────────────────────────────
  {
    id: 8,
    initialTree: 'r6_dirty',
    clue: { label: 'STATUS', value: 'history_clean' },
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
        "git clean removes untracked files from the working tree. -f forces the operation (required), -d extends it to directories too. this can't be undone.\n\nrun: git clean -fd"
      ],
      [
        "you want to throw away the current working-directory changes to one file and go back to what was last committed.",
        "git restore <filename> discards working directory changes for that file.",
        "git restore <file> discards unstaged changes to that file, reverting it to the last committed state. target just the one file — don't use --hard which resets everything.\n\nrun: git restore alarm-config.json"
      ],
      [
        "the commit is on a shared branch that others have already pulled. you can't erase it — you must officially undo it.",
        "git revert <hash> creates a new commit that reverses the changes from that commit.",
        "git revert <hash> creates a new commit that undoes a specific commit's changes — safe for shared branches because it adds to history rather than rewriting it.\n\nrun: git revert e3c4b20"
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
  },

  // Room 0: THE EQUIPMENT
  r0_initial: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [{x:40}, {x:90}] }
    ],
    HEAD: { type: "branch", ref: "main", ci: 1, branchY: 80 }
  },

  // Room 4: HIDE THE EVIDENCE
  r_stash_dirty: {
    branches: [
      { name: "operative/entry-window", y: 80, color: "#7eb8d4", commits: [{x:40}, {x:90}, {x:140}] }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 2, branchY: 80 },
    extras: [{ type: "dirty-indicator", x: 10, y: 200 }]
  },
  r_stash_clean: {
    branches: [
      { name: "operative/entry-window", y: 80, color: "#7eb8d4", commits: [{x:40}, {x:90}, {x:140}] }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 2, branchY: 80 },
    extras: [{ type: "stash-indicator", x: 10, y: 200 }]
  },

  // Room 6: THE CREW CONFLICT
  r_conflict_initial: {
    branches: [
      { name: "main",         y: 60,  color: "#1D9E75",   commits: [{x:40}, {x:85}, {x:130}] },
      { name: "origin/main",  y: 130, color: "#1D9E7566", commits: [{x:40}, {x:85}, {x:130}, {x:175}], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 60 },
    extras: [{ type: "conflict-indicator", x: 10, y: 220 }]
  },
  r_conflict_resolved: {
    branches: [
      { name: "main",         y: 60,  color: "#1D9E75",   commits: [{x:40}, {x:85}, {x:130}] },
      { name: "origin/main",  y: 130, color: "#1D9E7566", commits: [{x:40}, {x:85}, {x:130}, {x:175}], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 60 },
    extras: [{ type: "staged-indicator", x: 10, y: 220 }]
  },
  r_conflict_merged: {
    branches: [
      { name: "main",         y: 65,  color: "#1D9E75",   commits: [{x:35}, {x:75}, {x:115}, {x:160}] },
      { name: "origin/main",  y: 130, color: "#1D9E7566", commits: [{x:35}, {x:75}, {x:115}, {x:160}], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 3, branchY: 65 }
  }
};


// ═══════════════════════════════════════════════════════════════════════
// SVG TREE RENDERER
// ═══════════════════════════════════════════════════════════════════════

