// ═══════════════════════════════════════════════════════════════════════
// GIT HEIST — MISSION CONFIG
// All game-specific content lives here.  The engine reads from GAME_CONFIG
// and knows nothing about git, the heist story, or these specific rooms.
// ═══════════════════════════════════════════════════════════════════════

// ─── defaultStatus helper (local to this config) ─────────────────────

function _gitDefaultStatus(stage) {
  const t = (stage && stage.tree) || '';
  if (t.includes('stash_dirty')) {
    return [
      ['On branch operative/entry-window', 'br'],
      ['', ''],
      ['Changes not staged for commit:', 'sys'],
      ['    modified:   firewall-rules.json', 'err'],
      ['    modified:   entry-tokens.txt', 'err'],
    ];
  }
  if (t.includes('stash_clean')) {
    return [
      ['On branch operative/entry-window', 'br'],
      ['nothing to commit, working tree clean', 'ok'],
    ];
  }
  if (t.includes('conflict_initial')) {
    return [
      ['On branch main', 'br'],
      ['You have unmerged paths.', 'err'],
      ['    (fix conflicts and run "git commit")', 'dim'],
      ['', ''],
      ['Unmerged paths:', 'sys'],
      ['    both modified:   entry-tokens.txt', 'err'],
    ];
  }
  if (t.includes('dirty') || t.includes('r5') || t.includes('r6_dirty')) {
    return [
      ['On branch main', 'br'],
      ['', ''],
      ['Changes not staged for commit:', 'sys'],
      ['    modified:   alarm-config.json', 'err'],
      ['    modified:   access-log.txt', 'err'],
      ['', ''],
      ['Untracked files:', 'sys'],
      ['    temp-override.sh', 'warn']
    ];
  }
  const b = (t.includes('feature') || t.includes('r3') || t.includes('stash') || t.includes('entry'))
    ? 'operative/entry-window' : 'main';
  return [
    [`On branch ${b}`, 'br'],
    ['nothing to commit, working tree clean', 'dim']
  ];
}

// ─── GAME_CONFIG ──────────────────────────────────────────────────────

const GAME_CONFIG = {

  // ── Identity ────────────────────────────────────────────────────────
  title:        'GIT HEIST',
  promptSuffix: 'layer-01:~/vault-repo$',

  // ── Boot sequence ───────────────────────────────────────────────────
  bootLines: [
    { text: '> initializing secure tunnel to git_heist_banking_system...', cls: 'dim',  pause: 180 },
    { text: '> handshake 0x4f22 — success',                                cls: 'ok',   pause: 140 },
    { text: '> bypassing firewall node layer_01...',                        cls: 'dim',  pause: 200 },
    { text: '> LAYER_01: ACCESS BYPASSED',                                  cls: 'ok',   pause: 120 },
    { text: '> WARNING: intrusion_detection_system active on layer_02',     cls: 'warn', pause: 160 },
    { text: '> encrypted tunnel established. trace protection: active',     cls: 'ok',   pause: 120 },
    { text: '> incoming transmission — source: unknown // signal encrypted',cls: 'dim',  pause: 80  },
  ],

  // ── Command glossary (drives logCmd dedup + cheat sheet) ────────────
  cmdDescriptions: {
    'ls':                  'list files in the current directory',
    'git status':          'show working tree state (modified, staged, untracked)',
    'git log --oneline':   'compact commit history',
    'git log':             'full commit history with author and date',
    'git branch -a':       'list all branches — local and remote',
    'git checkout':        'switch to a branch or commit',
    'git switch':          'switch branches',
    'git checkout -b':     'create a new branch and switch to it',
    'git switch -c':       'create a new branch and switch to it',
    'git stash':           'hide uncommitted changes temporarily',
    'git stash push':      'hide uncommitted changes temporarily',
    'git stash list':      'list all stashed changes',
    'git stash pop':       'restore latest stash and remove it from the list',
    'git stash apply':     'restore latest stash (keeps it in the list)',
    'git pull':            'fetch remote changes and merge them locally',
    'git add':             'stage file changes for the next commit',
    'git commit':          'save staged changes as a snapshot with a message',
    'git push':            'upload local commits to the remote server',
    'git show':            "inspect a specific commit's changes",
    'git diff':            'compare working directory or commits',
    'git clean -fd':       'remove untracked files and directories',
    'git clean -f':        'remove untracked files',
    'git restore':         'discard working directory changes for a file',
    'git revert':          'safely undo a commit on a shared branch',
    'git remote -v':       'show remote server connections',
    'gh repo fork':        'fork a repo to your own account',
    'git clone':           'download a repo to your local machine',
  },

  cheatSheetTitle:    'GIT HEIST // COMMAND RECORD',
  cheatSheetFilename: 'git-heist-commands.txt',
  cheatSheetFooter:   'git-heist-v1 // operative record',

  // ── Help "always-available" lines ───────────────────────────────────
  alwaysAvailableHelp: [
    'git status       — always works',
    'git log          — always works',
  ],

  // ── Police ──────────────────────────────────────────────────────────
  policeRiskyCmds: ['git reset --hard', 'git push --force', 'git push -f'],
  policeWarnings: [
    "scanner picked up anomalies. you've got 30 seconds to complete this step. move.",
    "IDS alert — they're watching. 30 seconds. don't freeze.",
    "police bot flagged your session. 30 seconds. finish the step.",
  ],

  // ── Security layer display ───────────────────────────────────────────
  securityLayerLabel: (bypassed, probing) => {
    const bStr = bypassed === 1 ? 'layer_01: bypassed'
               : bypassed === 2 ? 'layer_01+02: bypassed'
               :                  'layer_01+02+03: bypassed';
    return `${bStr} // layer_0${probing}: probing`;
  },

  // ── Active branch display ────────────────────────────────────────────
  activeBranchLabel: (treeKey) => {
    const isFeature = treeKey && (
      treeKey.includes('r3') || treeKey.includes('r4') ||
      treeKey.includes('entry') || treeKey.includes('stash')
    );
    return isFeature ? 'local/operative' : 'local/main';
  },

  // ── Always-available command fallbacks ──────────────────────────────
  // Called after wrong-command check if no match found.
  // Return output array to print, or null to fall through to "unknown command".
  alwaysAvailable: (cmd, stage) => {
    if (cmd === 'git status') return _gitDefaultStatus(stage);
    if (cmd === 'git log' || cmd === 'git log --oneline') {
      return [["view git log once you're on the right branch", 'dim']];
    }
    return null;
  },

  // ── Special command handlers ─────────────────────────────────────────
  // Called before exact/wrong matching for game-specific command patterns.
  // Return {} (any truthy object) if the command was handled, null to continue.
  parseSpecial: (cmd, stage, { tprint, logCmd, advance, H }) => {

    // Flexible stash pop (HIDE THE EVIDENCE)
    if (stage.flexStashPop) {
      if (cmd === 'git stash pop') {
        tprint(stage.output || []);
        logCmd(cmd);
        advance(stage.tree);
        return {};
      }
      if (cmd === 'git stash apply') {
        tprint([
          ['On branch operative/entry-window', 'br'],
          ['Changes not staged for commit:', 'sys'],
          ['    modified:   firewall-rules.json', 'ok'],
          ['    modified:   entry-tokens.txt', 'ok'],
          ['', ''],
          ['apply restores the stash but keeps it in the list — use git stash drop to clean up.', 'dim'],
          ['git stash pop does both in one step. worth knowing the difference.', 'dim'],
        ]);
        logCmd('git stash apply');
        advance(stage.tree);
        return {};
      }
    }

    // Flexible commit (INTO POSITION + THE CREW CONFLICT)
    if (stage.flexCommit) {
      if (/^git commit -m ['"].+['"]/.test(cmd) || /^git commit -m .+/.test(cmd)) {
        const m   = cmd.match(/^git commit -m ['"]?(.+?)['"]?$/) || [];
        const msg = m[1] || 'committed';
        const branch = (stage.tree || '').includes('conflict') ? 'main' : 'operative/entry-window';
        const output = [
          [`[${branch} ${H[3]}] ${msg}`, 'cm'],
          [' 1 file changed, 1 insertion(+), 1 deletion(-)', 'sys'],
          ['', '']
        ];
        const isBadMsg = !msg || msg.length < 5 || /^(wip|fix|test|asdf|temp|x+|update|commit|change|stuff|done|ok|a)$/i.test(msg);
        if (isBadMsg) {
          output.push(["commit messages are for the crew. make them readable.", "warn"]);
          output.push(['', '']);
        } else if (msg.length >= 10 && /\w+ \w+/.test(msg)) {
          addScore(5);
          output.push(["good commit message — the crew can read this. +5 pts", "ok"]);
          output.push(['', '']);
        }
        tprint(output);
        logCmd('git commit');
        advance(stage.tree);
        return {};
      }
    }

    return null;
  },

  // ── File editor ──────────────────────────────────────────────────────
  fileContent: {
    edit: {
      text: `{
  "system": "git-heist",
  "maintenance_window": null,
  "ids_threshold": 5,
  "monitoring_cycle": "04:00"
}`,
      hint: 'change <code>"maintenance_window": null</code> → <code>"maintenance_window": "02:00"</code>',
    },
    conflict: {
      text: `{
  "system": "git-heist",
  "entry_tokens": [
<<<<<<< HEAD
    "tok_operative_7a2f",
    "tok_crew_3b1e"
=======
    "tok_operative_7a2f",
    "tok_crew_3b1e",
    "tok_override_9x77"
>>>>>>> origin/main
  ],
  "expiry": "02:15"
}`,
      hint: 'remove the <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers — keep all three tokens',
    },
  },

  // Returns { pass: bool, output: [[text, cls]] }
  validateFile: (val, isConflict) => {
    if (isConflict) {
      const hasMarkers = val.includes('<<<<<<<') || val.includes('=======') || val.includes('>>>>>>>');
      if (!hasMarkers && val.includes('tok_override_9x77')) {
        return {
          pass: true,
          output: [
            ['entry-tokens.txt saved — conflict resolved.', 'ok'],
            ['', ''],
            ['all three tokens preserved. markers removed.', 'dim'],
            ['', ''],
            ['now stage the resolved file.', 'sys'],
          ]
        };
      }
      if (hasMarkers) {
        return {
          pass: false,
          output: [
            ['conflict markers still present.', 'err'],
            ['remove the <<<<<<, ======, >>>>>>> lines and keep all three tokens.', 'warn'],
            ['type: edit entry-tokens.txt to try again.', 'dim'],
          ]
        };
      }
      return {
        pass: false,
        output: [
          ['file saved but tok_override_9x77 is missing.', 'err'],
          ["keep all three tokens — that's the combined correct version.", 'warn'],
          ['type: edit entry-tokens.txt to try again.', 'dim'],
        ]
      };
    }

    // Regular file edit
    if (val.includes('"maintenance_window": "02:00"')) {
      return {
        pass: true,
        output: [
          ['security-config.json saved.', 'ok'],
          ['', ''],
          ['  "maintenance_window": null  →  "maintenance_window": "02:00"', 'dim'],
          ['', ''],
          ['now stage the change.', 'sys'],
        ]
      };
    }
    return {
      pass: false,
      output: [
        ['file saved but the change is wrong.', 'err'],
        ['"maintenance_window" should be "02:00", not null.', 'warn'],
        ['type: edit security-config.json to try again.', 'dim'],
      ]
    };
  },

  // ── Tree state bootstrapping ──────────────────────────────────────────
  // Called from engine.js after data.js is loaded.
  // Add any tree states that can't be fully defined inside data.js
  // (e.g. states that reference other TREE entries).
  initTreeStates: (TREE) => {
    TREE['r1_initial'] = {
      branches: [{ name: 'main', y: 90, color: '#1D9E75', commits: [{ x: 40 }, { x: 100 }] }],
      HEAD: { type: 'branch', ref: 'main', ci: 1, branchY: 90 }
    };
    TREE['r2_initial'] = TREE['r2_remote'];
    TREE['r3_initial'] = TREE['r3_clean'];
  },

  // ── Quiz pool ────────────────────────────────────────────────────────
  // Dynamic questions: pulled based on which commands the player actually ran.
  cmdQuizPool: {
    'git stash': {
      q: 'You ran `git stash` to hide your changes. Where do they go?',
      options: ['Permanently deleted', 'A private LIFO stack, separate from commits', 'A temporary branch', 'The staging area'],
      correct: 1,
      explain: 'git stash saves to a private stack. git stash list shows everything in it. git stash pop restores the latest.'
    },
    'git stash pop': {
      q: 'What\'s the difference between `git stash pop` and `git stash apply`?',
      options: ['No difference', 'pop restores and removes the entry; apply restores but keeps it in the list', 'apply is faster', 'pop only works on the latest stash'],
      correct: 1,
      explain: 'pop = restore + delete the stash entry. apply = restore only. Use apply when you want the stash to stay for reuse.'
    },
    'git push': {
      q: 'When you ran `git push`, what was actually sent to the remote?',
      options: ['All local files', 'Your entire git history', 'Only the commits the remote didn\'t already have', 'Your working directory changes'],
      correct: 2,
      explain: 'git push sends only the delta — commits the remote is missing. Not your working directory, not your whole history.'
    },
    'git pull': {
      q: 'What does `git pull` do under the hood?',
      options: ['It\'s just git fetch', 'git fetch + git merge combined', 'It overwrites local files', 'It\'s git push in reverse'],
      correct: 1,
      explain: 'git pull = git fetch (download) + git merge (integrate). You can split these for more control.'
    },
    'git revert': {
      q: 'Why use `git revert` instead of `git reset` to undo a commit on a shared branch?',
      options: ['git reset doesn\'t work on commits', 'git revert is faster', 'git revert adds an undo commit — history stays intact, safe for others who have pulled', 'They\'re identical on shared branches'],
      correct: 2,
      explain: 'git revert is non-destructive — it adds a new commit. git reset rewrites history, which breaks anyone who already pulled.'
    },
    'git checkout': {
      q: 'When you used `git checkout` to switch branches, what actually changed?',
      options: ['Only HEAD moved', 'HEAD moved and your working directory updated to match that branch', 'Nothing — checkout is read-only', 'The remote was updated'],
      correct: 1,
      explain: 'git checkout updates HEAD AND rewrites your working directory to reflect the checked-out state.'
    },
    'git branch -a': {
      q: 'What does the `-a` flag in `git branch -a` add over plain `git branch`?',
      options: ['Alphabetically sorted output', 'All authors who created branches', 'Remote-tracking branches alongside local ones', 'Archived branches'],
      correct: 2,
      explain: 'git branch shows local only. -a (all) also shows remotes/origin/* — the local cache of what the remote has.'
    },
    'git show': {
      q: 'What does `git show <hash>` display?',
      options: ['Current unstaged diff', 'The full diff of that specific commit — what changed, in which files', 'The full commit list', 'The remote URL'],
      correct: 1,
      explain: 'git show <hash> = that commit\'s message, author, and exact line-by-line diff.'
    },
    'git diff': {
      q: 'With no arguments, what does `git diff` compare?',
      options: ['Two branches', 'The last two commits', 'Your working directory vs the staging area', 'Local vs remote'],
      correct: 2,
      explain: 'git diff (no args) = unstaged changes. git diff --cached = staged vs last commit. git diff <branch> = branch comparison.'
    },
    'git clean -fd': {
      q: 'Why is `git clean -fd` potentially dangerous?',
      options: ['It\'s not dangerous', 'It force-pushes to the remote', 'It permanently deletes untracked files — no undo', 'It resets staged changes'],
      correct: 2,
      explain: 'Untracked files aren\'t in git history, so clean removes them forever. Run git clean -n first to preview.'
    },
    'git restore': {
      q: 'What does `git restore <file>` do to an unstaged change?',
      options: ['Stages the file', 'Discards the working-directory change, reverting to the last commit', 'Creates a file backup', 'Moves the change to stash'],
      correct: 1,
      explain: 'git restore discards unstaged changes. It\'s the modern replacement for git checkout -- <file>.'
    },
    'git add': {
      q: 'What does staging a file with `git add` actually do?',
      options: ['Commits it immediately', 'Adds it to the index — marks it for inclusion in the next commit', 'Uploads it to the remote', 'Creates a copy'],
      correct: 1,
      explain: 'Staging adds the file to git\'s index (staging area). git commit then includes everything currently staged.'
    },
    'git clone': {
      q: 'What does `git clone` do that `git init` doesn\'t?',
      options: ['Nothing — they\'re equivalent', 'Creates a copy of an existing remote repo including full history and origin remote', 'Initialises git tracking in any folder', 'Downloads only the latest commit'],
      correct: 1,
      explain: 'git init starts a new empty repo. git clone copies a remote repo with all history and the origin remote already wired up.'
    },
    'git remote -v': {
      q: 'What does `git remote -v` show?',
      options: ['All local branches', 'The verbose git log', 'The remote connections and their fetch/push URLs', 'Your git config'],
      correct: 2,
      explain: 'git remote -v lists each named remote (usually origin) and the URLs git uses to fetch and push.'
    },
  },

  // Static questions: always included (fill up to 4 total)
  staticQuiz: [
    {
      q: 'You resolve a merge conflict in a file. What\'s the next step?',
      options: ['git merge again', 'git pull to update', 'git add the file, then git commit', 'git reset --hard to restart'],
      correct: 2,
      explain: 'After manually resolving: git add marks the conflict resolved, then git commit seals the merge.'
    },
    {
      q: 'What does HEAD mean in a git repo?',
      options: ['The first commit ever made', 'The latest commit pushed to the remote', 'A pointer to the currently checked-out commit or branch tip', 'The main branch'],
      correct: 2,
      explain: 'HEAD is just a pointer — usually to your current branch tip. Detached HEAD means it points directly to a commit, not a branch.'
    },
    {
      q: 'What\'s the key difference between `git merge` and `git rebase`?',
      options: ['They\'re identical', 'Merge keeps full history with a merge commit; rebase replays commits linearly', 'Rebase is always safer', 'Merge only works on main'],
      correct: 1,
      explain: 'Merge adds a merge commit showing where branches joined. Rebase rewrites commits as if they branched off later — never rebase shared branches.'
    },
    {
      q: 'When would you stash instead of commit?',
      options: ['When changes are final', 'When you want to discard changes', 'When work-in-progress isn\'t commit-ready but you need to switch context', 'When the remote is down'],
      correct: 2,
      explain: 'Stash is for temporary context-switching — hide WIP, do other work, restore later. Commit when work is logically complete.'
    },
    {
      q: 'Why is `git push --force` dangerous on a shared branch?',
      options: ['It\'s not dangerous', 'It rewrites remote history, overwriting commits others may have pulled', 'It\'s slower', 'It only works on private repos'],
      correct: 1,
      explain: 'Force-push overwrites the remote branch tip. Anyone who pulled before now has diverged history. Only force-push branches only you own.'
    },
    {
      q: 'What does `git log --oneline` show that `git log` doesn\'t?',
      options: ['More detail per commit', 'A compact one-line-per-commit view — hash + message only', 'Remote branch info', 'Author names'],
      correct: 1,
      explain: '--oneline condenses each commit to one line: short hash + subject. Useful for scanning history quickly.'
    },
    {
      q: 'If you committed to the wrong branch by mistake, what\'s the safest fix?',
      options: ['Delete the branch', 'git push --force', 'git revert on the wrong branch, then cherry-pick or re-commit on the right one', 'Nothing you can do'],
      correct: 2,
      explain: 'Revert undoes it safely on the wrong branch. Then bring the change to the right branch via cherry-pick or re-doing the work.'
    },
  ],

};
