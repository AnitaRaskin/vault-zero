// ═══════════════════════════════════════════════════════════════════════
// OPERATION: NIGHTSHADE — MISSION CONFIG
// British intelligence theme. LION is the handler. ATLAS is the repo.
// ═══════════════════════════════════════════════════════════════════════

window.HANDLER_NAME = 'lion';

function _nsDefaultStatus(stage) {
  const t = (stage && stage.tree) || '';
  if (t === 'n2_conflict') {
    return [
      ['On branch main', 'br'],
      ['You have unmerged paths.', 'err'],
      ['  both modified:   assets.enc', 'err'],
    ];
  }
  if (t === 'n0_staged' || t === 'n0_initial') {
    return [
      ['On branch main', 'br'],
      ['', ''],
      ['Changes to be committed:', 'sys'],
      ['    modified:   meridian_ops.log', 'ok'],
      ['', ''],
      ['Changes not staged for commit:', 'sys'],
      ['    modified:   assets.enc', 'warn'],
    ];
  }
  if (t === 'n5_applied') {
    return [
      ['On branch main', 'br'],
      ['', ''],
      ['Changes not staged for commit:', 'sys'],
      ['    modified:   shutdown.key', 'ok'],
    ];
  }
  if (t === 'n5_stash') {
    return [
      ['On branch main', 'br'],
      ['nothing to commit, working tree clean', 'dim'],
      ['', ''],
      ['stash entries: 3', 'warn'],
    ];
  }
  const branch = (t.includes('n1_evidence') || t.includes('n1_detached'))
    ? 'forensics/cardinal-evidence' : 'main';
  return [
    [`On branch ${branch}`, 'br'],
    ['nothing to commit, working tree clean', 'dim']
  ];
}

// ─── GAME_CONFIG ──────────────────────────────────────────────────────

const GAME_CONFIG = {

  // ── Identity ────────────────────────────────────────────────────────
  title:        'OPERATION: NIGHTSHADE',
  promptSuffix: 'gchq-atlas:~/atlas-repo$',

  // ── Boot sequence ───────────────────────────────────────────────────
  bootLines: [
    { text: '> establishing encrypted channel to gchq-atlas-01...', cls: 'dim',  pause: 180 },
    { text: '> authentication: EYES_ONLY — clearance verified',      cls: 'ok',   pause: 140 },
    { text: '> connecting to atlas-repo // classification: TOP_SECRET/SCI', cls: 'dim', pause: 200 },
    { text: '> ATLAS-NODE: ACCESS GRANTED',                          cls: 'ok',   pause: 120 },
    { text: '> WARNING: nightshade intrusion — last session active', cls: 'warn', pause: 160 },
    { text: '> dead man switch status: ARMED // countdown: active',  cls: 'err',  pause: 140 },
    { text: '> incoming transmission — source: CONTROL // encrypted', cls: 'dim', pause: 80  },
  ],

  // ── Command glossary ────────────────────────────────────────────────
  cmdDescriptions: {
    'ls':                                  'list files in the current directory',
    'git status':                          'show working tree state — staged, modified, untracked',
    'git log':                             'full commit history with author and date',
    'git log --oneline':                   'compact one-line-per-commit history',
    'git log --oneline --all':             'compact history across all branches',
    'git diff':                            'compare working directory changes (unstaged)',
    'git diff --staged':                   'compare staged changes vs last commit',
    'git diff --cached':                   'alias for git diff --staged',
    'git restore --staged':                'remove a file from the staging area without modifying it',
    'git add':                             'stage file changes for the next commit',
    'git commit':                          'save staged changes as a snapshot with a message',
    'git checkout':                        'switch to a branch or commit hash',
    'git switch':                          'switch branches (modern syntax)',
    'git switch -c':                       'create a new branch and switch to it',
    'git reflog':                          "git's private diary — every HEAD movement ever recorded",
    'git cherry-pick':                     'apply a single commit from anywhere in history to current branch',
    'git fetch':                           'download remote changes without merging',
    'git fetch origin':                    'download remote changes without merging',
    'git pull':                            'fetch remote changes and merge immediately — use fetch instead',
    'git push':                            'upload local commits to the remote server',
    'git push origin --delete':            'delete a branch on the remote server',
    'git stash list':                      'list all stashed entries — newest first',
    'git stash show -p':                   'inspect the full diff of a stash entry without applying it',
    'git stash apply':                     'restore a stash without removing it from the stack',
    'git stash drop':                      'remove a stash entry without applying it',
    'git branch':                          'list, create or delete branches',
    'git branch -a':                       'list all branches — local and remote',
    'git merge':                           'join two branches together',
  },

  cheatSheetTitle:    'NIGHTSHADE // COMMAND RECORD',
  cheatSheetFilename: 'nightshade-commands.txt',
  cheatSheetFooter:   'operation-nightshade-v1 // operative record // eyes only',

  // ── Help "always-available" lines ───────────────────────────────────
  alwaysAvailableHelp: [
    'git status       — always works',
    'git log          — always works',
  ],

  // ── Police (repurposed as "NIGHTSHADE ALERT" for this mission) ──────
  policeRiskyCmds: ['git reset --hard', 'git push --force', 'git push -f', 'git stash pop'],
  policeWarnings: [
    "dead man switch ping detected. they're monitoring the repo. complete this step immediately.",
    "NIGHTSHADE's contingency triggered. 30 seconds before auto-transmit. finish the step.",
    "signal anomaly on the atlas node. 30 seconds. move.",
  ],

  // ── Security layer display (repurposed as mission progress) ─────────
  securityLayerLabel: (bypassed, probing) => {
    const labels = ['CONTAINMENT', 'DEAD RECKONING', 'CONFLICTED', 'ERASURE', 'SIGNAL', 'DEAD DROP'];
    const done = labels.slice(0, bypassed).join(' // ');
    const next = labels[bypassed] || 'COMPLETE';
    return `cleared: ${done || 'none'} // active: ${next}`;
  },

  // ── Active branch display ────────────────────────────────────────────
  activeBranchLabel: (treeKey) => {
    if (treeKey && (treeKey.includes('n1_evidence') || treeKey.includes('n1_detached'))) {
      return 'forensics/cardinal-evidence';
    }
    return 'local/main';
  },

  // ── Always-available command fallbacks ──────────────────────────────
  alwaysAvailable: (cmd, stage) => {
    if (cmd === 'git status') return _nsDefaultStatus(stage);
    if (cmd === 'git log' || cmd === 'git log --oneline') {
      return [['run git log once the relevant commit history is available', 'dim']];
    }
    if (cmd === 'ls') {
      return [
        ['assets.enc', 'sys'],
        ['meridian_ops.log', 'sys'],
        ['config/', 'dim'],
        ['shutdown.key', 'sys'],
        ['', ''],
        ['.gitignore', 'dim'],
      ];
    }
    return null;
  },

  // ── Special command handlers ─────────────────────────────────────────
  parseSpecial: (cmd, stage, { tprint, logCmd, advance, H }) => {

    // Flexible commit (CONTAINMENT room 0 final stage, and CONFLICTED LOYALTIES room 2 final stage)
    if (stage.flexCommit) {
      if (/^git commit -m ['"].+['"]/.test(cmd) || /^git commit -m .+/.test(cmd)) {
        const m   = cmd.match(/^git commit -m ['"]?(.+?)['"]?$/) || [];
        const msg = m[1] || 'committed';
        const output = [
          [`[main ${H[3]}] ${msg}`, 'cm'],
          [' 1 file changed, 1 insertion(+)', 'sys'],
          ['', '']
        ];
        const isBadMsg = !msg || msg.length < 5 || /^(wip|fix|test|asdf|temp|x+|update|commit|change|stuff|done|ok|a)$/i.test(msg);
        if (isBadMsg) {
          output.push(['commit messages matter. make them readable.', 'warn']);
          output.push(['', '']);
        } else if (msg.length >= 10 && /\w+ \w+/.test(msg)) {
          addScore(5);
          output.push(['good commit message — clear, specific. +5 pts', 'ok']);
          output.push(['', '']);
        }
        tprint(output);
        logCmd('git commit');
        advance(stage.tree);
        return {};
      }
      // bare git commit also works (merge commits)
      if (cmd === 'git commit' || cmd === 'git commit --no-edit') {
        tprint([
          [`[main ${H[4]}] merge resolved`, 'cm'],
          [' 1 file changed', 'sys'],
          ['', ''],
        ]);
        logCmd('git commit');
        advance(stage.tree);
        return {};
      }
    }

    return null;
  },

  // ── File editor ──────────────────────────────────────────────────────
  fileContent: {
    conflict: {
      text: `ATLAS_ASSET_REGISTRY v4.7
CLASSIFICATION: TOP_SECRET/SCI
ASSET_COUNT: 47
<<<<<<< HEAD
FORMAT: aes-256-enc
EXPORT_ENABLED: false
EXFIL_TARGET: none
=======
FORMAT: plaintext
EXPORT_ENABLED: true
EXFIL_TARGET: darknet://mirror-01.onion:9001
>>>>>>> nightshade/inject

ARCHIVE_DATE: 2024-03-15`,
      hint: 'keep the <code>HEAD</code> block — remove the <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers and NIGHTSHADE\'s block',
    },
  },

  // Returns { pass: bool, output: [[text, cls]] }
  validateFile: (val, isConflict) => {
    if (isConflict) {
      const hasMarkers = val.includes('<<<<<<<') || val.includes('=======') || val.includes('>>>>>>>');
      const hasNightshade = val.includes('EXPORT_ENABLED: true') || val.includes('EXFIL_TARGET: darknet');
      const hasCleanExport = val.includes('EXPORT_ENABLED: false') && val.includes('EXFIL_TARGET: none');

      if (hasMarkers) {
        return {
          pass: false,
          output: [
            ['conflict markers still present.', 'err'],
            ['remove the <<<<<<, ======, >>>>>>> lines completely.', 'warn'],
            ['type: edit assets.enc to try again.', 'dim'],
          ]
        };
      }
      if (hasNightshade) {
        return {
          pass: false,
          output: [
            ["NIGHTSHADE's export configuration is still in the file.", 'err'],
            ['keep the HEAD block — EXPORT_ENABLED: false, EXFIL_TARGET: none.', 'warn'],
            ['type: edit assets.enc to try again.', 'dim'],
          ]
        };
      }
      if (hasCleanExport) {
        return {
          pass: true,
          output: [
            ['assets.enc saved — conflict resolved.', 'ok'],
            ['', ''],
            ['EXPORT_ENABLED: false. EXFIL_TARGET: none.', 'ok'],
            ['markers removed. HEAD version preserved.', 'dim'],
            ['', ''],
            ['now stage the resolved file.', 'sys'],
          ]
        };
      }
      return {
        pass: false,
        output: [
          ['file saved but the content looks wrong.', 'err'],
          ['keep the HEAD block: FORMAT: aes-256-enc, EXPORT_ENABLED: false, EXFIL_TARGET: none.', 'warn'],
          ['type: edit assets.enc to try again.', 'dim'],
        ]
      };
    }
    // No regular file edit in nightshade — only conflict
    return { pass: false, output: [['unexpected file edit', 'err']] };
  },

  // ── Tree state bootstrapping ──────────────────────────────────────────
  initTreeStates: (TREE) => {
    TREE['n0_initial_start'] = TREE['n0_initial'];
    TREE['n1_initial'] = TREE['n1_log'];
    TREE['n2_initial'] = TREE['n2_conflict'];
    TREE['n3_initial'] = TREE['n3_reset'];
    TREE['n4_initial'] = TREE['n4_local'];
    TREE['n5_initial'] = TREE['n5_stash'];
  },

  // ── Quiz pool ────────────────────────────────────────────────────────
  cmdQuizPool: {
    'git diff --staged': {
      q: 'What does `git diff --staged` show that plain `git diff` does not?',
      options: [
        'Changes between two branches',
        'Changes in the working directory vs the staging area',
        'Staged changes vs the last commit — what would go into the next commit',
        'Remote vs local differences'
      ],
      correct: 2,
      explain: 'git diff (no flags) = unstaged changes. git diff --staged = staged changes vs last commit — exactly what the next commit would contain.'
    },
    'git restore --staged': {
      q: 'What does `git restore --staged <file>` do?',
      options: [
        'Deletes the file from the working directory',
        'Discards all changes in the file',
        'Removes the file from the staging area without touching the working directory',
        'Restores the file to the last commit in the working directory'
      ],
      correct: 2,
      explain: 'git restore --staged removes a file from the index (staging area) only — the working directory is untouched. The file still exists with all changes.'
    },
    'git reflog': {
      q: 'Why does git reflog find commits that `git log --all` cannot?',
      options: [
        'It searches remote branches',
        'It records every HEAD movement — including commits orphaned by git reset',
        'It shows deleted files',
        'It has a longer history window'
      ],
      correct: 1,
      explain: 'git log --all only follows branch pointers. Orphaned commits have no branch — reflog finds them because it records every position HEAD has ever occupied.'
    },
    'git cherry-pick': {
      q: 'What does `git cherry-pick <hash>` do?',
      options: [
        'Merges an entire branch into the current branch',
        'Deletes the commit at that hash',
        'Applies the changes from one specific commit to your current branch as a new commit',
        'Moves your branch pointer to that commit'
      ],
      correct: 2,
      explain: 'Cherry-pick applies one specific commit\'s changes to your current branch — it does not merge the full history, only that one set of changes.'
    },
    'git fetch': {
      q: 'What is the key difference between `git fetch` and `git pull`?',
      options: [
        'fetch is faster than pull',
        'fetch downloads remote changes without merging; pull downloads and merges immediately',
        'fetch only works on main; pull works on all branches',
        'They are identical'
      ],
      correct: 1,
      explain: 'git fetch updates origin/* pointers without touching your branches. git pull = fetch + merge. Always fetch + inspect before merging on critical branches.'
    },
    'git push origin --delete': {
      q: 'What does `git push origin --delete <branch>` do?',
      options: [
        'Deletes the branch locally',
        'Force-pushes an empty branch to the remote',
        'Removes the branch from the remote server',
        'Removes the branch from your local origin/* cache only'
      ],
      correct: 2,
      explain: 'git push origin --delete removes the branch from the actual remote server — not just your local copy. Anyone who has fetched will still have their origin/* pointer until they fetch again.'
    },
    'git stash show -p': {
      q: 'Why use `git stash show -p stash@{N}` before applying a stash?',
      options: [
        'It is faster than git stash apply',
        'It shows the full line-by-line diff of the stash without applying it — lets you verify before committing',
        'It is required before applying',
        'It compresses the stash'
      ],
      correct: 1,
      explain: 'git stash show -p shows the full patch without any side effects. Essential when you have multiple stashes and need to verify which one to apply — especially if any could be malicious.'
    },
    'git stash apply': {
      q: 'What is the difference between `git stash apply` and `git stash pop`?',
      options: [
        'apply is faster',
        'pop only works on the newest stash',
        'apply restores the stash and keeps it in the list; pop restores and removes it',
        'They are identical'
      ],
      correct: 2,
      explain: 'apply = restore only. pop = restore + delete the entry. Use apply when you want to keep the stash for reference or potential cleanup later.'
    },
    'git log --oneline --all': {
      q: 'What does the `--all` flag add to `git log --oneline`?',
      options: [
        'More detail per commit',
        'Includes commits on all branches — not just the current one',
        'Shows all authors',
        'Shows the full diff for each commit'
      ],
      correct: 1,
      explain: 'Without --all, git log only shows commits reachable from your current branch. --all includes commits on other branches — essential when the commit you need is on a different branch.'
    },
    'git checkout': {
      q: 'When you `git checkout` a commit hash (not a branch), what happens?',
      options: [
        'A new branch is created automatically',
        'HEAD enters detached state — pointing directly at that commit, not a branch',
        'The commit is copied to your current branch',
        'Nothing — checkout only works with branch names'
      ],
      correct: 1,
      explain: 'Checking out a hash puts you in detached HEAD state — HEAD points directly at that commit. Any commits made here are orphaned unless you create a branch.'
    },
    'git switch -c': {
      q: 'What does `git switch -c <name>` do that plain `git branch <name>` does not?',
      options: [
        'It creates the branch AND switches to it in one step',
        'It creates the branch at a different position',
        'It is faster',
        'Nothing — they are identical'
      ],
      correct: 0,
      explain: 'git branch <name> creates a branch but leaves HEAD on your current branch. git switch -c creates AND immediately switches — HEAD points to the new branch.'
    },
    'git stash list': {
      q: 'In `git stash list`, which entry is the newest?',
      options: [
        'The one with the highest index number',
        'stash@{0} — the stack is LIFO, newest first',
        'The last one in the list',
        'They are in alphabetical order'
      ],
      correct: 1,
      explain: 'The stash is a LIFO stack. stash@{0} is always the most recently stashed. stash@{1} is one older. Popping without checking stash@{0} applies whatever was stashed last.'
    },
  },

  // Static questions always included
  staticQuiz: [
    {
      q: 'NIGHTSHADE staged a malicious file alongside a legitimate one. What is the safest way to remove only the malicious file from staging?',
      options: [
        'git restore <filename>',
        'git reset --hard',
        'git restore --staged <filename>',
        'git rm <filename>'
      ],
      correct: 2,
      explain: 'git restore --staged <file> removes only that file from the staging area without touching the working directory or other staged files.'
    },
    {
      q: 'You ran `git reset --hard HEAD~3` to wipe commits. Later you need one of those commits back. What is the only way to find it?',
      options: [
        'git log --all',
        'git branch -a',
        'It is gone permanently',
        'git reflog — it records every HEAD movement including the commits that were orphaned'
      ],
      correct: 3,
      explain: 'git log --all only follows branch pointers — orphaned commits have none. git reflog records every position HEAD has ever been, so the hash is still retrievable for ~90 days.'
    },
    {
      q: 'You are in detached HEAD state at an important commit. What is the correct next step?',
      options: [
        'Immediately switch back to main',
        'git switch -c <branch-name> to attach HEAD to a new branch before leaving',
        'Make commits freely — they will be saved',
        'git commit --head to re-attach'
      ],
      correct: 1,
      explain: 'In detached HEAD, commits are orphaned when you leave without naming them. git switch -c creates a branch at your current position, making the location permanent and reachable.'
    },
    {
      q: 'Why is it better to `git fetch` then inspect before merging, rather than `git pull` directly?',
      options: [
        'git pull is slower',
        'git fetch allows you to see what is incoming before it changes your branch — you control what and when to merge',
        'git pull requires internet access',
        'They produce identical results'
      ],
      correct: 1,
      explain: 'git pull merges immediately. On critical branches, always fetch first — inspect the incoming commits with git log and git diff — then decide whether and how to merge.'
    },
    {
      q: 'A stash contains three entries. You want to apply entry stash@{1} without touching stash@{0}. What do you run?',
      options: [
        'git stash pop stash@{1}',
        'git stash apply',
        'git stash apply stash@{1}',
        'git stash restore stash@{1}'
      ],
      correct: 2,
      explain: 'git stash apply stash@{N} applies a specific stash by index without removing it. git stash pop always takes stash@{0} regardless of arguments.'
    },
    {
      q: 'After resolving a merge conflict manually, what two steps are required before the merge is complete?',
      options: [
        'git add <file>, then git commit',
        'git merge again',
        'git push to the remote',
        'git reset then git commit'
      ],
      correct: 0,
      explain: 'git add marks the conflict as resolved in the staging area. git commit seals the merge. Both steps are required — skipping either leaves the merge unfinished.'
    },
    {
      q: 'What is the safest way to remove a remote branch that should never be merged?',
      options: [
        'git branch -D <branch>',
        'git push origin --delete <branch>',
        'git reset --hard origin/<branch>',
        'Delete it in the hosting UI only'
      ],
      correct: 1,
      explain: 'git branch -D only deletes the local copy. git push origin --delete removes the branch from the actual remote server — what the CI pipeline and other collaborators see.'
    },
  ],

};
