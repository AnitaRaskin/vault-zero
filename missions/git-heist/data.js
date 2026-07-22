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
    intro: "You've breached the outer layer. You're inside the target's repository. Fox needs you to get oriented — you can't run a heist in a codebase you don't understand. Three commands. Get your bearings.",
    stages: [
      {
        conceptBrief: {
          title: "WHAT IS A GIT REPOSITORY",
          bullets: [
            "a git repository is a folder that git watches — every change ever made is tracked and stored permanently",
            "nothing is ever truly lost: you can always go back to any previous version of any file",
            "the REPO STATE panel on the right shows your repo's structure in real time — it updates as you work",
            "each circle in the tree = one commit. the lines between them show the history chain. the label shows where you are right now"
          ]
        },
        foxMsg: "first move — check what you're working with. we're starting with 'ls' — it's not a git command, it's a shell command. it talks to the operating system and lists what's in the current folder. you'll use it constantly alongside git. run it.",
        task: "List all files in the repository.",
        accepted: ["ls", "ls -la", "ls -l", "ls -a"],
        output: [
          ["README.md", "sys"],
          [".gitignore", "dim"],
          ["vault.txt", "sys"],
          ["access-routes.json", "sys"],
          ["", ""],
          ["four files. three are tracked by git.", "dim"],
          ["the .gitignore tells git what to skip entirely — passwords, build", "dim"],
          ["artifacts, temp files. those never show up in git status.", "dim"],
          ["git acts like they don't exist.", "dim"],
        ],
        tree: "r0_initial",
        wrong: {}
      },
      {
        conceptBrief: {
          title: "COMMITS + HEAD",
          bullets: [
            "a commit is a permanent snapshot of your project at a specific moment in time",
            "every commit has: a message (what changed), an author (who), a timestamp (when), and a short hash ID — its unique address in history",
            "commits are linked in a chain — each one points to the one before it",
            "HEAD is a pointer that always marks where you are right now in that chain"
          ],
          ascii: "  [a1b2c3] ──→ [d4e5f6] ──→ [g7h8i9]\n   'init'        'config'     'fix'   ← HEAD"
        },
        foxMsg: "git keeps a full record of every commit ever made. 'git log' shows you that history. '--oneline' makes it compact: one line per commit. read the trail.",
        task: "View the commit history of this repo.",
        accepted: ["git log --oneline", "git log"],
        output: [
          ["{{H7}} (HEAD -> main) initial repo setup", "cm"],
          ["", ""],
          ["one commit. this repo was just created.", "dim"],
          ["HEAD means 'you are here' — your current position in history.", "dim"],
          ["main is the branch you're on. we'll get to branches later.", "dim"],
          ["", ""],
          ["every action you take from here gets added to this log, permanently.", "dim"],
        ],
        tree: "r0_initial",
        wrong: {
          "ls": [["you already checked the files. now check the history — who saved what, and when.", "dim"]]
        }
      },
      {
        foxMsg: "last one. this is the command you'll use more than any other — memorize it now. 'git status' tells you the exact state of the repo at this moment: what files have changed, what's ready to be saved, what git hasn't seen yet. always run it before you start. always run it when you're confused. it never changes anything — it only shows you what's there.",
        task: "Check whether any files have been modified.",
        accepted: ["git status"],
        output: [
          ["On branch main", "br"],
          ["Your branch is up to date with 'origin/main'.", "dim"],
          ["", ""],
          ["nothing to commit, working tree clean", "ok"],
          ["", ""],
          ["clean. no changes. this is your baseline.", "dim"],
          ["remember what 'clean' looks like — you'll want to come back to it.", "dim"],
        ],
        tree: "r0_initial",
        wrong: {},
        completionMsg: "ls to see files. git log to see history. git status to see the current state. three commands. that's the foundation — everything else builds on these."
      }
    ],
    hints: [
      [
        "you need to see what files exist in the current folder. this is a terminal command, not a git command.",
        "ls lists everything in the current directory. it works on any unix-based system, including this terminal.",
        "ls stands for 'list' — it prints every file and directory in the current location. it's a shell command, not git. you'll use it constantly to orient yourself before running any git commands.\n\nrun: ls"
      ],
      [
        "git keeps a complete record of every save ever made. there's a command that shows you the full history of commits.",
        "git log shows the history. add --oneline to make it compact — one commit per line.",
        "--oneline compresses each commit to one line: short hash on the left, message on the right. the full git log also shows the author name, full date, and full message.\n\nrun: git log --oneline"
      ],
      [
        "you need to check what the repo's current state is — what's changed, what's staged, what git is tracking.",
        "git status is your compass. two words. always safe to run — it never modifies anything.",
        "git status shows which branch you're on, which files have changed, and what's staged for the next save. run it before anything else and when you're lost — it's never wrong to check.\n\nrun: git status"
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
        conceptBrief: {
          title: "BRANCHES",
          bullets: [
            "a branch is a separate line of development — you can work without touching the main code",
            "main is the default branch. every new branch splits off from some existing commit",
            "HEAD follows you — it always points to the branch you're currently on",
            "branches are cheap: they're just a pointer to a commit. creating one is instant"
          ],
          ascii: "  main:     [A] ──→ [B] ──→ [C]\n                        ↘\n  feature:              [D] ──→ [E]  ← HEAD"
        },
        foxMsg: "the access map exists. someone on the inside hid it and never merged it. start by figuring out what branches are in this repo.",
        task: "Find ALL branches including remote ones.",
        accepted: ["git branch -a"],
        output: [
          ["* main", "br"],
          ["  remotes/origin/main", "dim"],
          ["  remotes/origin/security-audit-2019", "dim"],
          ["  remotes/origin/vault-schematics", "hl"],
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
        conceptBrief: {
          title: "GIT SWITCH vs GIT CHECKOUT",
          bullets: [
            "git switch <name> — modern command for changing to an existing branch",
            "git switch -c <name> — creates a new branch AND switches to it in one step",
            "git checkout <name> — the classic command; does the same for branches, plus works on commits and individual files",
            "both commands work — this game accepts both. real teams today prefer git switch"
          ]
        },
        foxMsg: "one of those branches has what you need. the name should give it away.",
        task: "Switch to the branch that has the access credentials.",
        accepted: ["git checkout vault-schematics", "git switch vault-schematics",
                   "git checkout origin/vault-schematics"],
        output: [
          ["Branch 'vault-schematics' set up to track 'origin/vault-schematics'.", "sys"],
          ["Switched to a new branch 'vault-schematics'", "ok"],
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
          ["{{H1}} (HEAD -> vault-schematics) hide the access map — do not merge", "cm"],
          ["{{H2}} update access routes", "sys"],
          ["{{H7}} initial repo setup", "dim"],
        ],
        tree: "r1_on_fox",
        wrong: {}
      },
      {
        foxMsg: "that commit at {{H1}}. go there. you'll detach from the branch — that's expected. read-only.",
        task: "Checkout the specific commit where the access map was hidden.",
        accepted: ["git checkout {{H1}}"],
        output: [
          ["Note: switching to '{{H1}}'.", "sys"],
          ["", ""],
          ["You are in 'detached HEAD' state. You can look around and make experimental", "warn"],
          ["changes and commit them, but they won't be tracked to any branch.", "warn"],
          ["", ""],
          ["HEAD is now at {{H1}} hide the access map — do not merge", "cm"],
        ],
        tree: "r1_detached",
        wrong: {
          "git checkout {{H2}}": [["that's the wrong commit. check the log again — you want {{H1}}.", "warn"]]
        }
      },
      {
        foxMsg: "you're at the commit. the files here are exactly what was saved at this point in history — same as any working directory. check what's in it.",
        task: "List the files in this commit.",
        accepted: ["ls"],
        output: [
          ["README.md  access-routes.json  vault.txt", "sys"]
        ],
        tree: "r1_detached",
        wrong: {}
      },
      {
        foxMsg: "there's vault.txt. open it — cat reads it raw. or use git show HEAD:vault.txt if you want to read it the git way, straight from the commit object.",
        task: "Read the vault file.",
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
        wrong: {},
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
        "git checkout <name> switches to that branch. the full name is exactly what appeared in git branch -a — copy it precisely.\n\nrun: git checkout vault-schematics"
      ],
      [
        "you need to see the history of this branch — every commit that was made, in order.",
        "git log shows the commit history. --oneline makes it compact and readable.",
        "git log --oneline gives one line per commit: short hash on the left, message on the right. look for the commit with the suspicious message.\n\nrun: git log --oneline"
      ],
      [
        "you found the commit hash in the log. now you need to go TO that exact commit.",
        "git checkout works with commit hashes, not just branch names. use the 7-character hash.",
        "a commit hash is its unique ID. git checkout works with hashes the same way it works with branch names. you'll enter 'detached HEAD' state — that's expected for read-only exploration.\n\nrun: git checkout {{H1}}"
      ],
      [
        "you're at the commit. what files are here?",
        "ls shows the contents of the current directory.",
        "run: ls"
      ],
      [
        "you found the file. now read it.",
        "cat reads a file's contents. git show displays what a commit contains.",
        "cat reads a file and prints it to the terminal.\n\nrun: cat vault.txt"
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
        conceptBrief: {
          title: "WHAT IS A REMOTE",
          bullets: [
            "a remote is a copy of your repository stored on another server — like GitHub",
            "your local repo and the remote are separate: changes don't sync automatically",
            "git uses a short name for each remote — 'origin' is the default name for where you cloned from",
            "git remote -v shows you the server URL for fetching (downloading) and pushing (uploading)"
          ]
        },
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
        conceptBrief: {
          title: "FORK vs CLONE",
          bullets: [
            "fork — creates a server-side copy of someone else's repo under your own account (e.g. GitHub)",
            "clone — downloads a repo from a server to your local machine",
            "the typical workflow: fork first (you now own a copy on the server), then clone it locally",
            "forking is a GitHub/GitLab feature — not a core git command — used so you can push without touching the original"
          ]
        },
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
        conceptBrief: {
          title: "HOW GIT TRACKS FILES",
          bullets: [
            "every file in a git repo is in one of four states:",
            "UNTRACKED — git sees it exists but isn't watching it yet",
            "MODIFIED — a tracked file that changed since the last commit",
            "STAGED — selected for the next commit (sitting in the staging area)",
            "COMMITTED — saved permanently in history",
            "git add moves files into the staging area. git commit saves everything staged."
          ],
          ascii: "  UNTRACKED ──git add──▶ STAGED ──git commit──▶ COMMITTED\n  MODIFIED  ──git add──▶ STAGED"
        },
        foxMsg: "scanner picked up activity on this node. files are open. stage everything now — git add . covers it all at once.",
        task: "Stage all current changes immediately — one command, full sweep.",
        policeOnLoad: true,
        policeWarnModal: true,
        policePopupMsg: "scanner picked up activity on this node.\n\nthis is standard git workflow — you have modified files open and need to stage them before moving on.\n\nuse git add . to stage everything at once. one command, covers all files.\n\nthe 30-second clock starts when you close this. no pressure — git add . is the only command you need.",
        accepted: ["git add ."],
        output: [
          ["Changes staged for commit:", "sys"],
          ["    modified:   README.md", "ok"],
          ["    modified:   access-routes.json", "ok"],
          ["    modified:   vault.txt", "ok"],
          ["", ""],
          ["all changes staged. working tree looks clean to their scanners.", "ok"],
          ["git add . — the dot means 'everything here'. fast when you need broad coverage.", "dim"],
        ],
        tree: "r3_staged",
        wrong: {
          "git add security-config.json": [
            ["too slow — they're scanning right now. you've got multiple open files.", "warn"],
            ["use git add . to stage everything at once — one command, full sweep.", "dim"]
          ],
          "git stash": [["stashing hides the work. we need to stage it, not hide it. git add .", "warn"]],
          "git commit": [["nothing staged yet. git add . first — then commit.", "warn"]],
        }
      },
      {
        foxMsg: "police cleared. good. now be precise. the real mission: modify the maintenance window in security-config.json and commit ONLY that change. open the file, make the edit, then stage that specific file — not everything.",
        task: "Edit security-config.json, then stage only that specific file.",
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
        }
      },
      {
        foxMsg: "the commit exists locally — the crew doesn't have it yet. it lives only on your machine. push the branch to the shared server. that's how the change reaches everyone else.",
        task: "Push your branch to the remote server.",
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
          "git push origin main": [["you're not on main. push your feature branch — operative/entry-window.", "warn"]]
        },
        completionMsg: "commit saves it locally. push sends it to the crew. both steps, every time."
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
        "you need to stage ALL changes in one shot — a single command that catches every modified file.",
        "git add followed by a dot stages every change in the current directory at once.",
        "git add . stages all modified and new files in one move. the dot means 'everything here' — fast when you need full coverage under pressure.\n\nrun: git add ."
      ],
      [
        "after editing the file, you need to tell git you want this specific change in the next commit.",
        "git add <filename> stages just that one file — surgical, not broad.",
        "git add <file> stages exactly that file for the next commit. naming it explicitly means only that change is included — nothing else gets swept in.\n\nrun: git add security-config.json"
      ],
      [
        "a commit is a saved snapshot with a message describing what you did.",
        "git commit -m \"...\" sets the message inline. make it readable.",
        "git commit -m saves staged changes as a snapshot. the message goes in quotes after -m. it stays in the history permanently — write it for the crew.\n\nrun: git commit -m \"set maintenance window to 02:00\""
      ],
      [
        "the commit is only local right now. pushing uploads it to the remote server so the crew can see it.",
        "git push origin <branchname> — or just git push if the upstream is already set.",
        "git push origin <branch> uploads local commits to the remote. if the branch doesn't exist on the server yet, this creates it there. -u sets the upstream tracking so future pushes just need git push.\n\nrun: git push origin operative/entry-window"
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
        policePopupMsg: "scanner just lit up.\n\npolice unit detected — two blocks out, moving fast.\n\nyou have 30 seconds before they sweep this node.\n\nyour working tree CANNOT have open changes — they'll see everything.\n\nhide it. clean the tree. go.",
        task: "Stash your current changes to hide them.",
        policeOnLoad: true,
        policeWarnModal: true,
        accepted: ["git stash", "git stash push"],
        output: [
          ["Saved working directory and index state", "sys"],
          ["  stash@{0}: WIP on operative/entry-window: {{H3}} set maintenance window to 02:00", "dim"],
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
          ["stash@{0}: WIP on operative/entry-window: {{H3}} set maintenance window to 02:00", "sys"],
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
  // ROOM 5: THE CREW CONFLICT
  // git pull, resolve conflict, git add, git commit
  // ──────────────────────────────────────────────────────
  {
    id: 5,
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
  // ROOM 6: READ THE ROOM
  // git status, git log --oneline, git show / git diff
  // ──────────────────────────────────────────────────────
  {
    id: 6,
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
        conceptBrief: {
          title: "GIT STATUS vs GIT LOG",
          bullets: [
            "git status — answers 'what is happening RIGHT NOW?' — shows modified, staged, and untracked files in your working directory",
            "git log — answers 'what happened in the PAST?' — shows the full commit history: who saved what, when, and with what message",
            "you just used git status to see the PRESENT state (dirty files, untracked scripts)",
            "now use git log to investigate the PAST — find which commit introduced the problem"
          ]
        },
        foxMsg: "when did this happen? walk back through the history.",
        task: "Find the suspicious commit in the log.",
        accepted: ["git log --oneline", "git log", "git log --all --oneline", "git log --oneline --all"],
        output: [
          ["{{H5}} (HEAD -> main) merge alarm bypass — URGENT", "cm"],
          ["{{H4}} temp fix — remove before push", "err"],
          ["{{H6}} update monitoring cycle config", "sys"],
          ["{{H1}} set maintenance window to 02:00", "sys"],
          ["{{H7}} initial repo setup", "dim"],
          ["", ""],
          ["⚠  note {{H4}} — 'remove before push'. it was pushed.", "warn"],
        ],
        tree: "r5_dirty",
        wrong: {}
      },
      {
        foxMsg: "what did commit {{H4}} actually do? line by line.",
        task: "Inspect the exact changes made by commit {{H4}}.",
        accepted: ["git show {{H4}}", "git diff {{H4}}^ {{H4}}", "git diff {{H4}}^..{{H4}}"],
        output: [
          ["commit {{H4}}", "cm"],
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
            ["try: git show {{H4}}  to inspect a specific commit's changes.", "dim"]
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
        "git show <hash> displays the full diff of a specific commit — exactly which lines were added (+) and removed (-). use the 7-character hash from the log output.\n\nrun: git show {{H4}}"
      ]
    ]
  },

  // ──────────────────────────────────────────────────────
  // ROOM 7: ERASE THE TRAIL
  // git clean -fd, git restore, git revert, git reset
  // ──────────────────────────────────────────────────────
  {
    id: 7,
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
        foxMsg: "before you undo it — confirm the hash. check the log and find the bad commit.",
        task: "View the commit log to find the hash of the commit to undo.",
        accepted: ["git log --oneline", "git log", "git log --all --oneline", "git log --oneline --all"],
        output: [
          ["{{H5}} (HEAD -> main) merge alarm bypass — URGENT", "cm"],
          ["{{H4}} temp fix — remove before push", "err"],
          ["{{H6}} update monitoring cycle config", "sys"],
          ["{{H1}} set maintenance window to 02:00", "sys"],
          ["{{H7}} initial repo setup", "dim"],
          ["", ""],
          ["there it is. {{H4}} — 'temp fix — remove before push'. that's the one to undo.", "warn"],
        ],
        tree: "r6_partial",
        wrong: {}
      },
      {
        foxMsg: "that bad commit is on the shared branch. you can't rewrite history — the server logs every push. undo it officially.",
        task: "Safely undo commit {{H4}} without rewriting shared history.",
        accepted: ["git revert {{H4}}", "git revert {{H4}} --no-edit"],
        output: [
          ["[main {{H8}}] Revert \"temp fix — remove before push\"", "cm"],
          [" 1 file changed, 1 deletion(-), 1 insertion(+)", "sys"],
          ["", ""],
          ["✓ a new commit was created. the bad change is undone.", "ok"],
          ["  the original commit {{H4}} is still in history — that's correct.", "dim"],
          ["  revert adds a commit that cancels it out. history stays intact.", "dim"],
        ],
        tree: "r6_reverted",
        wrong: {
          "git reset --hard {{H4}}": [
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
        "you need to look up the hash of the commit you want to undo. check the history.",
        "git log --oneline shows all commits with short hashes — look for the suspicious one.",
        "git log --oneline gives one line per commit: hash on the left, message on the right. find 'temp fix — remove before push' — its hash is what you need.\n\nrun: git log --oneline"
      ],
      [
        "the commit is on a shared branch that others have already pulled. you can't erase it — you must officially undo it.",
        "git revert <hash> creates a new commit that reverses the changes from that commit.",
        "git revert <hash> creates a new commit that undoes a specific commit's changes — safe for shared branches because it adds to history rather than rewriting it.\n\nrun: git revert {{H4}}"
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
      { name: "main", y: 60, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 1 }
  },
  r1_branches: {
    branches: [
      { name: "main", y: 50, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'}
      ]},
      { name: "security-audit-2019", y: 130, color: "#3d4943", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'9d0e1f2', msg:'archive audit log'}
      ]},
      { name: "vault-schematics", y: 210, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'9d0e1f2', msg:'archive audit log'},
        {x:175, hash:'2a3b4c5', msg:'upload schematics'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 1 },
    headBranchY: 50
  },
  r1_on_fox: {
    branches: [
      { name: "main", y: 55, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'}
      ]},
      { name: "vault-schematics", y: 160, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'9d0e1f2', msg:'archive audit log'},
        {x:175, hash:'2a3b4c5', msg:'upload schematics'}
      ]}
    ],
    HEAD: { type: "branch", ref: "vault-schematics", ci: 3, branchY: 160 }
  },
  r1_detached: {
    branches: [
      { name: "main", y: 55, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'}
      ]},
      { name: "vault-schematics", y: 160, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'9d0e1f2', msg:'archive audit log'},
        {x:175, hash:'2a3b4c5', msg:'upload schematics'}
      ]}
    ],
    HEAD: { type: "detached", cx: 130, cy: 160 }
  },
  r2_remote: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 },
    extras: [
      { type: "remote-box", x: 165, y: 65, label: "origin (syndicate)", color: "#cc4444" }
    ]
  },
  r2_fork: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 }
  },
  r2_cloned: {
    branches: [
      { name: "main (local)", y: 70, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]},
      { name: "origin/main", y: 140, color: "#1D9E7566", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 70 }
  },
  r3_clean: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 80 }
  },
  r3_feature: {
    branches: [
      { name: "main", y: 60, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]},
      { name: "operative/entry-window", y: 140, color: "#7eb8d4", commits: [
        {x:140, hash:'5c6d7e8', msg:'create entry window'}
      ]}
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 0, branchY: 140 }
  },
  r3_staged: {
    branches: [
      { name: "main", y: 60, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]},
      { name: "operative/entry-window", y: 140, color: "#7eb8d4", commits: [
        {x:140, hash:'5c6d7e8', msg:'create entry window'}
      ]}
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 0, branchY: 140 },
    extras: [{ type: "staged-indicator", x: 10, y: 240 }]
  },
  r3_committed: {
    branches: [
      { name: "main", y: 60, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'},
        {x:140, hash:'b2c3d4e', msg:'update route table'}
      ]},
      { name: "operative/entry-window", y: 140, color: "#7eb8d4", commits: [
        {x:140, hash:'5c6d7e8', msg:'create entry window'},
        {x:190, hash:'6d7e8f9', msg:'plant access key'}
      ]}
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 1, branchY: 140 }
  },
  r4_ahead: {
    branches: [
      { name: "main", y: 55, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'b2c3d4e', msg:'update route table'}
      ]},
      { name: "operative/entry-window", y: 120, color: "#7eb8d4", commits: [
        {x:130, hash:'5c6d7e8', msg:'create entry window'},
        {x:180, hash:'6d7e8f9', msg:'plant access key'}
      ]},
      { name: "origin/entry-window", y: 185, color: "#7eb8d455", commits: [
        {x:130, hash:'5c6d7e8', msg:'create entry window'}
      ], dashed: true }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 1, branchY: 120 }
  },
  r4_pushed: {
    branches: [
      { name: "main", y: 55, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'b2c3d4e', msg:'update route table'}
      ]},
      { name: "operative/entry-window", y: 120, color: "#7eb8d4", commits: [
        {x:130, hash:'5c6d7e8', msg:'create entry window'},
        {x:180, hash:'6d7e8f9', msg:'plant access key'}
      ]},
      { name: "origin/entry-window", y: 185, color: "#7eb8d455", commits: [
        {x:130, hash:'5c6d7e8', msg:'create entry window'},
        {x:180, hash:'6d7e8f9', msg:'plant access key'}
      ], dashed: true }
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 1, branchY: 120 }
  },
  r5_dirty: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:30, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:70, hash:'f4e5b6a', msg:'add vault config'},
        {x:110, hash:'b2c3d4e', msg:'update route table'},
        {x:150, hash:'c3d4e5f', msg:'patch security layer'},
        {x:190, hash:'d4e5f6a', msg:'clean vault state'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 4, branchY: 80 },
    extras: [{ type: "dirty-indicator", x: 10, y: 200 }]
  },
  r6_dirty: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:30, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:70, hash:'f4e5b6a', msg:'add vault config'},
        {x:110, hash:'b2c3d4e', msg:'update route table'},
        {x:150, hash:'c3d4e5f', msg:'patch security layer'},
        {x:190, hash:'d4e5f6a', msg:'clean vault state'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 4, branchY: 80 },
    extras: [{ type: "dirty-indicator", x: 10, y: 200 }]
  },
  r6_partial: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:30, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:70, hash:'f4e5b6a', msg:'add vault config'},
        {x:110, hash:'b2c3d4e', msg:'update route table'},
        {x:150, hash:'c3d4e5f', msg:'patch security layer'},
        {x:190, hash:'d4e5f6a', msg:'clean vault state'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 4, branchY: 80 }
  },
  r6_reverted: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:25, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:60, hash:'f4e5b6a', msg:'add vault config'},
        {x:95, hash:'b2c3d4e', msg:'update route table'},
        {x:130, hash:'c3d4e5f', msg:'patch security layer'},
        {x:165, hash:'d4e5f6a', msg:'clean vault state'},
        {x:205, hash:'e5f6a7b', msg:'revert: clean vault state'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 5, branchY: 80 },
    extras: [{ type: "revert-label", x: 205, y: 80 }]
  },

  // Room 0: THE EQUIPMENT
  r0_initial: {
    branches: [
      { name: "main", y: 80, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:90, hash:'f4e5b6a', msg:'add vault config'}
      ]}
    ],
    HEAD: { type: "branch", ref: "main", ci: 1, branchY: 80 }
  },

  // Room 4: HIDE THE EVIDENCE
  r_stash_dirty: {
    branches: [
      { name: "operative/entry-window", y: 80, color: "#7eb8d4", commits: [
        {x:40, hash:'5c6d7e8', msg:'create entry window'},
        {x:90, hash:'6d7e8f9', msg:'plant access key'},
        {x:140, hash:'7e8f9a0', msg:'inject bypass route'}
      ]}
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 2, branchY: 80 },
    extras: [{ type: "dirty-indicator", x: 10, y: 200 }]
  },
  r_stash_clean: {
    branches: [
      { name: "operative/entry-window", y: 80, color: "#7eb8d4", commits: [
        {x:40, hash:'5c6d7e8', msg:'create entry window'},
        {x:90, hash:'6d7e8f9', msg:'plant access key'},
        {x:140, hash:'7e8f9a0', msg:'inject bypass route'}
      ]}
    ],
    HEAD: { type: "branch", ref: "operative/entry-window", ci: 2, branchY: 80 },
    extras: [{ type: "stash-indicator", x: 10, y: 200 }]
  },

  // Room 6: THE CREW CONFLICT
  r_conflict_initial: {
    branches: [
      { name: "main", y: 60, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'b2c3d4e', msg:'local: update manifest'}
      ]},
      { name: "origin/main", y: 130, color: "#1D9E7566", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'e6f7a8b', msg:'remote: update manifest'},
        {x:175, hash:'7a8b9c0', msg:'remote: sync config'}
      ], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 60 },
    extras: [{ type: "conflict-indicator", x: 10, y: 220 }]
  },
  r_conflict_resolved: {
    branches: [
      { name: "main", y: 60, color: "#1D9E75", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'b2c3d4e', msg:'local: update manifest'}
      ]},
      { name: "origin/main", y: 130, color: "#1D9E7566", commits: [
        {x:40, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:85, hash:'f4e5b6a', msg:'add vault config'},
        {x:130, hash:'e6f7a8b', msg:'remote: update manifest'},
        {x:175, hash:'7a8b9c0', msg:'remote: sync config'}
      ], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 2, branchY: 60 },
    extras: [{ type: "staged-indicator", x: 10, y: 220 }]
  },
  r_conflict_merged: {
    branches: [
      { name: "main", y: 65, color: "#1D9E75", commits: [
        {x:35, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:75, hash:'f4e5b6a', msg:'add vault config'},
        {x:115, hash:'b2c3d4e', msg:'local: update manifest'},
        {x:160, hash:'8b9c0d1', msg:'merge: origin/main'}
      ]},
      { name: "origin/main", y: 130, color: "#1D9E7566", commits: [
        {x:35, hash:'a1b2c3d', msg:'initial repo setup'},
        {x:75, hash:'f4e5b6a', msg:'add vault config'},
        {x:115, hash:'e6f7a8b', msg:'remote: update manifest'},
        {x:160, hash:'8b9c0d1', msg:'merge: origin/main'}
      ], dashed: true }
    ],
    HEAD: { type: "branch", ref: "main", ci: 3, branchY: 65 }
  }
};

