// ═══════════════════════════════════════════════════════════════════════
// GIT HEIST — MISSION CONFIG
// All game-specific content lives here.  The engine reads from GAME_CONFIG
// and knows nothing about git, the heist story, or these specific rooms.
// ═══════════════════════════════════════════════════════════════════════

window.HANDLER_NAME = 'fox';

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

  missionKey: 'git-heist',

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
    "security sweep triggered. 30 seconds. don't freeze.",
    "guard bot flagged your session. 30 seconds. finish the step.",
  ],
  policeSound:      'pulse',
  policeVoiceText:  'alert — movement detected',
  policeVoiceRate:  0.9,
  policeVoicePitch: 0.4,

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
  // 100 questions — 8 chosen at random each game.
  quizPool: [
    // ── correct: 0 ──────────────────────────────────────────────────────
    { q: 'What does `git status` report about your repo?', options: ['Staged, unstaged, and untracked file states', 'Only files ready to commit', 'The full commit history', 'Remote vs local differences'], correct: 0, explain: 'git status shows three categories: staged changes, unstaged changes, and untracked files git has never seen.' },
    { q: 'What is the staging area (index)?', options: ['A preview of the next commit\'s contents', 'A backup of the working directory', 'A mirror of the remote branch', 'The most recent commit snapshot'], correct: 0, explain: 'The index holds exactly what the next commit will include. You control it with git add and git restore --staged.' },
    { q: 'What does a git commit permanently record?', options: ['A snapshot of all staged files at that moment', 'A diff of every file since repo creation', 'Only files changed since the last push', 'The current working directory state'], correct: 0, explain: 'Each commit is a full snapshot of the staging area — not just a diff. Git computes diffs on demand from snapshots.' },
    { q: 'What does `git log --oneline` show?', options: ['One compact line per commit: hash + message', 'Only the latest commit in full detail', 'Commits on all branches at once', 'A diff of each commit\'s changes'], correct: 0, explain: '--oneline condenses each commit to short hash + subject. Great for scanning history without the full author/date/body block.' },
    { q: 'What is a git branch fundamentally?', options: ['A movable pointer to a commit', 'A full copy of all tracked files', 'A permanent snapshot of the codebase', 'A separate remote connection'], correct: 0, explain: 'A branch is just a pointer — creating one is instant. It automatically advances to each new commit you make on it.' },
    { q: 'What does `git clone <url>` set up automatically?', options: ['A local repo with full history and origin remote', 'An empty repo with no commits', 'A local branch named after the URL', 'A compressed archive of the remote'], correct: 0, explain: 'git clone copies the full repo history and wires up the remote as origin — ready to fetch and push immediately.' },
    { q: 'Where do your changes go when you run `git stash`?', options: ['A private LIFO stack, separate from commits', 'A temporary hidden branch', 'The staging area, cleared after restart', 'A backup file in the .git folder'], correct: 0, explain: 'The stash is a stack (LIFO). git stash list shows all entries; stash@{0} is always the most recent.' },
    { q: 'What does `git remote -v` display?', options: ['Each remote name with its fetch and push URLs', 'All local and remote branch names', 'The verbose commit log', 'Your global git config settings'], correct: 0, explain: 'git remote -v lists named remotes (usually origin) and the URLs git uses to download and upload commits.' },
    { q: 'What does `git diff` with no arguments compare?', options: ['Working directory vs the staging area', 'Staging area vs the last commit', 'Two different branches', 'Local branch vs remote branch'], correct: 0, explain: 'git diff (no flags) = unstaged changes only. Use --staged (or --cached) to compare staged vs last commit.' },
    { q: 'What does `git restore <file>` do to an unstaged change?', options: ['Discards it, reverting the file to last commit', 'Moves the change into the stash', 'Stages the file for the next commit', 'Creates a backup of the file first'], correct: 0, explain: 'git restore discards the working-directory change — the modern replacement for git checkout -- <file>.' },
    { q: 'What does a `.gitignore` file control?', options: ['Which files git never tracks or shows in status', 'Which files are staged automatically', 'Which branches are protected from deletion', 'Which remotes git connects to'], correct: 0, explain: 'Files listed in .gitignore are invisible to git — they won\'t appear in git status and won\'t be staged by git add .' },
    { q: 'What does `git revert <hash>` create?', options: ['A new commit that undoes the specified commit', 'A branch rewound to before that commit', 'A stash entry with the reverted state', 'A tag marking the revert point'], correct: 0, explain: 'git revert is non-destructive — it adds a new commit that reverses the named commit. History is never rewritten.' },
    { q: 'What does HEAD refer to in git?', options: ['A pointer to the currently checked-out position', 'The very first commit ever made', 'The latest commit pushed to the remote', 'The default remote branch name'], correct: 0, explain: 'HEAD is just a pointer — usually to your current branch tip. In detached HEAD state, it points directly to a commit.' },
    { q: '"Nothing to commit, working tree clean" means what?', options: ['All tracked files match the last commit', 'No files exist in the repo yet', 'No staged changes, but unstaged ones remain', 'The remote and local are in sync'], correct: 0, explain: 'A clean working tree means staged area and working directory both match HEAD — nothing has changed since the last commit.' },
    { q: 'What does `git push` send to the remote?', options: ['Only commits the remote doesn\'t have yet', 'All local files regardless of history', 'Your entire working directory', 'All staged and unstaged changes'], correct: 0, explain: 'git push sends only the delta — commits the remote is missing. Not your working directory, not your full history.' },
    { q: 'What triggers "untracked files" in `git status`?', options: ['Files git has never seen before', 'Files changed since the last commit', 'Files staged but not yet committed', 'Files that exist only on the remote'], correct: 0, explain: 'Untracked = git has never tracked this file. Run git add to start tracking it and include it in your next commit.' },
    { q: 'After resolving a merge conflict, what\'s the correct next step?', options: ['git add the file, then git commit', 'git merge again with a different flag', 'git pull to download the resolved version', 'git reset --hard to restart cleanly'], correct: 0, explain: 'git add marks the conflict resolved in the index. git commit then seals the merge. Both steps are required.' },
    { q: 'What does `git init` do to a folder?', options: ['Creates an empty git repo with a .git directory', 'Downloads a remote repo into the folder', 'Stages all existing files for commit', 'Connects the folder to a remote URL'], correct: 0, explain: 'git init creates a hidden .git directory that starts tracking the folder. There are no commits yet — that\'s your first task.' },
    { q: 'What is a fast-forward merge?', options: ['Moving a branch pointer forward without a merge commit', 'Merging two branches at high speed', 'A merge that skips conflict detection', 'Pulling and merging in a single step'], correct: 0, explain: 'A fast-forward happens when one branch is directly ahead of another — git just advances the pointer, no merge commit needed.' },
    { q: 'What does `git cherry-pick <hash>` do?', options: ['Applies that commit\'s changes to your current branch', 'Merges the full branch containing that commit', 'Deletes that commit from its original branch', 'Checks out the repo at that commit'], correct: 0, explain: 'Cherry-pick takes one specific commit\'s changes and applies them as a new commit on your current branch.' },
    { q: 'What is a commit hash?', options: ['A unique fingerprint (SHA) of that commit\'s content', 'A sequential number git assigns to commits', 'The author\'s encrypted username and timestamp', 'The branch name at the time of commit'], correct: 0, explain: 'A commit hash is a 40-char SHA-1 fingerprint derived from the commit\'s content. Same content always → same hash.' },
    { q: 'What does `git branch -d <name>` do?', options: ['Deletes the branch locally if fully merged', 'Force-deletes the branch regardless of state', 'Removes the branch from the remote server', 'Renames the branch to the default'], correct: 0, explain: 'git branch -d is safe — it refuses to delete a branch with unmerged commits. Use -D to force-delete without the check.' },
    { q: 'What does `git show <hash>` display?', options: ['That commit\'s message, author, and full diff', 'The current unstaged changes only', 'All commits in the repository', 'The remote URL for that commit'], correct: 0, explain: 'git show <hash> prints the commit\'s metadata AND the exact line-by-line diff it introduced.' },
    { q: 'Why run `git clean -n` before `git clean -fd`?', options: ['To preview which files would be deleted', 'To ensure the remote is up to date first', 'To stage all untracked files safely', 'To create backups before deletion'], correct: 0, explain: 'git clean -n (dry run) shows what would be deleted without actually deleting anything. git clean -fd has no undo.' },
    { q: 'What does `git add -p` let you do?', options: ['Stage individual change hunks interactively', 'Stage all files in a given path', 'Preview what is staged without changing it', 'Add a new remote connection'], correct: 0, explain: 'git add -p (patch mode) shows each change hunk and asks you to stage, skip, or split it — perfect for clean commits.' },
    // ── correct: 1 ──────────────────────────────────────────────────────
    { q: 'What is the difference between `git stash pop` and `git stash apply`?', options: ['apply deletes the entry; pop keeps it', 'pop restores and removes the entry; apply just restores', 'They are identical in all versions', 'pop only works on stash@{0}'], correct: 1, explain: 'pop = restore + delete the stash entry. apply = restore only. Use apply when you want to keep the stash for reference.' },
    { q: 'What does `git pull` do under the hood?', options: ['It is identical to git fetch', 'git fetch + git merge in one step', 'It overwrites local uncommitted changes', 'It is git push run in reverse'], correct: 1, explain: 'git pull = git fetch (download commits from remote) + git merge (integrate into your branch). You can split these for more control.' },
    { q: 'When you `git checkout <branch>`, what actually changes?', options: ['Only HEAD moves to the new branch', 'HEAD moves and working directory updates to match', 'Nothing visible — checkout is read-only', 'The remote branch pointer is updated'], correct: 1, explain: 'git checkout (or git switch) updates HEAD AND rewrites your working directory to reflect the checked-out branch state.' },
    { q: 'What does `git log --all` include that plain `git log` doesn\'t?', options: ['Commits with no author assigned', 'Commits reachable from all branches and tags', 'Commits that were force-pushed', 'Deleted commits still on the remote'], correct: 1, explain: 'Without --all, git log only follows commits reachable from HEAD. --all includes every branch and tag ref in the repo.' },
    { q: 'What does `git diff --staged` compare?', options: ['Working directory vs the remote branch', 'The staging area vs the last commit', 'Two named branches against each other', 'Unstaged changes vs the staging area'], correct: 1, explain: 'git diff --staged (or --cached) shows exactly what would go into the next commit — staged changes vs the previous commit.' },
    { q: 'What does `git reset --soft HEAD~1` do to the last commit?', options: ['Deletes the commit and its changes permanently', 'Moves the commit back into the staging area', 'Discards the commit and all file changes', 'Pushes the revert to the remote'], correct: 1, explain: 'git reset --soft moves HEAD back but keeps all changes staged — as if you never ran git commit.' },
    { q: 'What does `git add <file>` do to a modified file?', options: ['Commits it to history immediately', 'Moves its current state into the staging index', 'Uploads the file to the remote server', 'Creates a versioned copy alongside it'], correct: 1, explain: 'git add moves the file\'s current state into the index (staging area). It\'s not in history until git commit runs.' },
    { q: 'What does `git branch -a` show over plain `git branch`?', options: ['All authors who ever committed to branches', 'Remote-tracking branches alongside local ones', 'All branches sorted alphabetically', 'Archived and deleted branches'], correct: 1, explain: 'git branch shows local branches only. -a (all) also includes remotes/origin/* — the local cache of remote branch positions.' },
    { q: 'What does `git stash list` show with stash@{0} at the top?', options: ['The oldest stash entry is first', 'The newest stash entry is first — LIFO order', 'Entries sorted by file size', 'The stash entry on the current branch'], correct: 1, explain: 'The stash is a LIFO stack. stash@{0} is always the most recently stashed item. Each new stash pushes older entries down.' },
    { q: 'What does `git commit --amend` do?', options: ['Creates an extra commit on top of the last', 'Replaces the last commit with a new one', 'Pushes the last commit to the remote', 'Reverts the last commit permanently'], correct: 1, explain: 'git commit --amend rewrites the last commit — you can update the message, add staged changes, or both. Avoid if already pushed.' },
    { q: 'What does `git switch -c <name>` do?', options: ['Creates the branch without switching to it', 'Creates the branch AND switches to it', 'Switches to an existing branch safely', 'Renames the current branch'], correct: 1, explain: 'git switch -c (create) = git branch + git switch in one step. HEAD moves to the new branch immediately.' },
    { q: 'What does `git blame <file>` show per line?', options: ['Every edit made to that line since creation', 'Which commit and author last modified each line', 'Conflicts in that file from recent merges', 'Staged vs unstaged state of each line'], correct: 1, explain: 'git blame annotates every line with the commit hash and author that last touched it. Great for tracing who introduced a change.' },
    { q: 'What is a remote-tracking branch like origin/main?', options: ['A live view of the remote that updates constantly', 'A local read-only copy of where the remote was last fetched', 'A separate branch that auto-merges with main', 'A branch that can only be pushed, not pulled'], correct: 1, explain: 'origin/main is a local bookmark updated by git fetch. It shows where the remote was last time you fetched — not live.' },
    { q: 'What does `git restore --staged <file>` do?', options: ['Discards all working-directory changes to the file', 'Removes the file from staging without touching working dir', 'Commits the file then unstages it', 'Moves the file\'s staged changes to stash'], correct: 1, explain: 'git restore --staged removes the file from the index only. Working-directory changes are untouched — nothing is lost.' },
    { q: 'Why use `git fetch` before `git merge` instead of just `git pull`?', options: ['git fetch is always faster than git pull', 'fetch lets you inspect remote changes before merging', 'git pull doesn\'t work on feature branches', 'fetch is required before any git merge'], correct: 1, explain: 'git fetch downloads remote changes without merging. You can inspect with git log origin/main before deciding to integrate.' },
    { q: 'What does `git push --force` risk on a shared branch?', options: ['It is always safe on any branch', 'It overwrites remote history that others may have pulled', 'It only affects your local repo', 'It is slower but otherwise identical to push'], correct: 1, explain: 'Force-push rewrites the remote branch tip. Anyone who pulled before now has diverged history — their next pull will fail.' },
    { q: 'What is detached HEAD state?', options: ['HEAD is missing from the .git directory', 'HEAD points to a commit, not a branch name', 'The current branch has no remote tracking branch', 'HEAD and origin/HEAD are out of sync'], correct: 1, explain: 'Detached HEAD means HEAD points directly to a commit hash instead of a branch. New commits here are orphaned unless you branch off.' },
    { q: 'What does `git log -p` add to normal log output?', options: ['Only the file names changed per commit', 'The full line-by-line diff for each commit', 'Commits from all branches at once', 'A graph view of branch structure'], correct: 1, explain: 'git log -p (patch) shows each commit\'s message AND the diff it introduced. Use it to review exactly what each commit changed.' },
    { q: 'What does `git merge` always create when two branches have diverged?', options: ['A rebase of the feature branch onto main', 'A merge commit with two parent commits', 'A tagged snapshot of the merged state', 'A stash entry for any conflicting changes'], correct: 1, explain: 'When branches have diverged, git merge creates a merge commit that has two parents — one from each branch. History is preserved.' },
    { q: 'What does `git reset HEAD~1 --mixed` (the default) do?', options: ['Deletes the commit and its changes permanently', 'Moves the commit back to the working directory as unstaged', 'Keeps the commit but removes staged changes', 'Pushes an undo commit to the remote'], correct: 1, explain: 'git reset --mixed (default) moves HEAD back and unstages the changes — they\'re still in your working directory as modified files.' },
    { q: 'What is "origin" in a cloned git repo?', options: ['The first commit ever made in the repo', 'The default name for the remote you cloned from', 'A special branch that mirrors the remote', 'The URL stored in your global git config'], correct: 1, explain: 'origin is just a name — git\'s default shorthand for the remote you cloned from. You can rename it or add other remotes.' },
    { q: 'What does `git log -- <file>` show?', options: ['All git commands run on that file', 'Only commits that modified that specific file', 'The file\'s current content in all branches', 'Conflicts involving that file'], correct: 1, explain: 'git log -- <file> filters the commit log to show only commits that touched the named file.' },
    { q: 'What does `git push -u origin <branch>` do differently?', options: ['It pushes all local branches at once', 'It pushes AND sets the upstream tracking link', 'It force-pushes without a safety check', 'It creates the remote repo if it doesn\'t exist'], correct: 1, explain: '-u (--set-upstream) pushes the branch and links it to origin/<branch> — future git push and git pull work with no arguments.' },
    { q: 'What does `git stash drop stash@{N}` do?', options: ['Applies the stash and then removes it', 'Removes that single stash entry without applying it', 'Clears all stash entries permanently', 'Marks the stash as applied but keeps it'], correct: 1, explain: 'git stash drop removes just that entry from the stack without restoring its changes. git stash pop does apply + drop together.' },
    { q: 'What does `git log --graph --oneline --all` visualise?', options: ['Only the commits reachable from HEAD', 'The full branch and merge structure across all branches', 'A graph of file change frequency', 'Commits sorted by number of files changed'], correct: 1, explain: '--graph draws ASCII branch lines, --oneline keeps it compact, --all includes every branch. Classic command for understanding repo shape.' },
    // ── correct: 2 ──────────────────────────────────────────────────────
    { q: 'What does `git diff --staged` compare?', options: ['Working directory vs two branches', 'Working directory vs the last commit', 'Staging area vs the last commit', 'Local commits vs the remote branch'], correct: 2, explain: 'git diff --staged shows changes you\'ve staged but not yet committed — exactly what the next commit would record.' },
    { q: 'Why is `git clean -fd` risky?', options: ['It corrupts the staging area', 'It removes all commit history', 'It permanently deletes untracked files with no undo', 'It deletes the remote branch'], correct: 2, explain: 'Untracked files are not in git\'s history — once deleted by git clean, they\'re gone forever. Always run git clean -n first.' },
    { q: 'When would you stash instead of commit?', options: ['When your changes are final and tested', 'When you want to permanently discard changes', 'When WIP isn\'t ready but you must switch context', 'When the remote server is unreachable'], correct: 2, explain: 'Stash is a temporary holding area. Hide unfinished work, do other tasks, come back and restore it with git stash pop.' },
    { q: 'What is the safest way to undo a commit on a shared branch?', options: ['git reset --hard to an earlier commit', 'git push --force to overwrite the remote', 'git revert to add an undo commit on top', 'git checkout to an earlier state'], correct: 2, explain: 'git revert adds a new commit that reverses the changes — history is never rewritten, so collaborators aren\'t affected.' },
    { q: 'What does `git remote -v` show?', options: ['All remote branches with their last commit', 'The verbose git log from the remote', 'Each remote name with fetch and push URLs', 'Remote branch protection rules'], correct: 2, explain: 'git remote -v lists named remotes (usually origin) and the URLs used for fetching and pushing.' },
    { q: 'What is the key difference between `git merge` and `git rebase`?', options: ['They are functionally identical commands', 'Rebase always creates a merge commit; merge does not', 'Merge preserves history with a merge commit; rebase replays commits linearly', 'Merge only works on the main branch'], correct: 2, explain: 'Merge adds a merge commit that shows branch history. Rebase replays commits as if they were written on top of the target branch.' },
    { q: 'What does `HEAD~1` refer to?', options: ['The first commit in the repo', 'The most recent commit on main', 'The commit one step before HEAD', 'The commit one push before HEAD'], correct: 2, explain: 'HEAD~N means N commits behind HEAD. HEAD~1 is the previous commit, HEAD~2 is two back, and so on.' },
    { q: 'What does `git checkout <hash>` do to HEAD?', options: ['Creates a new branch at that commit', 'Deletes all commits after that hash', 'Puts HEAD in detached state, pointing at that commit', 'Merges that commit into the current branch'], correct: 2, explain: 'Checking out a hash enters detached HEAD — HEAD points directly to that commit, not a branch. Useful for read-only inspection.' },
    { q: 'What does `git branch -m <new-name>` do?', options: ['Creates a new branch with that name', 'Moves commits to a different branch', 'Renames the current branch', 'Merges two branches together'], correct: 2, explain: 'git branch -m (move/rename) renames the current branch. To rename a different branch: git branch -m <old> <new>.' },
    { q: 'What does `git stash clear` do?', options: ['Applies all stashes and removes them', 'Unstages all currently staged changes', 'Removes all stash entries permanently', 'Clears the git log of stash references'], correct: 2, explain: 'git stash clear deletes every entry in the stash stack — there is no undo. Use git stash drop to remove just one.' },
    { q: 'What does `git add .` stage compared to `git add -A`?', options: ['Exactly the same — no difference at all', 'add . stages new files only; add -A stages all', 'add . stages from the current directory; add -A from the repo root', 'add . requires confirmation; add -A does not'], correct: 2, explain: 'git add . stages from your current directory and below. git add -A stages from the repo root regardless of where you are.' },
    { q: 'What does `git log --stat` add to each commit entry?', options: ['The full diff for every changed file', 'The author\'s commit signing status', 'A summary of which files changed and by how many lines', 'The remote push timestamp'], correct: 2, explain: 'git log --stat shows a compact summary per commit: which files changed, how many insertions and deletions.' },
    { q: 'What does `git rebase` risk on a branch others have pulled?', options: ['It moves the branch to a different remote', 'It creates duplicate commits on the remote', 'It rewrites commit hashes, causing diverged history for others', 'It deletes the branch on the remote'], correct: 2, explain: 'Rebase rewrites commit hashes. Anyone who already pulled now has a different history — their next push will conflict.' },
    { q: 'How do you see which files a commit changed, without the full diff?', options: ['git show --no-patch <hash>', 'git log --patch <hash>', 'git show --stat <hash>', 'git diff --name <hash>'], correct: 2, explain: 'git show --stat <hash> lists the files changed and line counts without showing the full diff text.' },
    { q: 'What does `git fetch` do that `git pull` does not?', options: ['Downloads commits and merges immediately', 'Downloads commits without touching your branches', 'Downloads commits and creates a new local branch', 'Deletes remote branches that no longer exist'], correct: 1, explain: 'git fetch updates your remote-tracking branches (origin/*) without merging anything — your local branches are untouched.' },
    { q: 'What is origin/main in your local repo?', options: ['A branch that auto-syncs with the remote', 'The main branch after a merge', 'A read-only snapshot of where the remote was at last fetch', 'A backup of the main branch'], correct: 2, explain: 'origin/main is a remote-tracking branch — a local bookmark updated when you run git fetch. It\'s not live.' },
    { q: 'What does `git push origin --delete <branch>` do?', options: ['Deletes the local branch named branch', 'Unlinks the local branch from origin', 'Removes the branch from the remote server', 'Stashes then deletes the branch'], correct: 2, explain: 'git push origin --delete removes the branch from the actual remote server. Local branches are untouched.' },
    { q: 'What does `git log --follow <file>` do that `git log -- <file>` does not?', options: ['Filters commits by the file\'s author', 'Shows only commits where the file was deleted', 'Follows the file across renames in history', 'Shows commits from all branches for that file'], correct: 2, explain: 'Without --follow, git log stops at a rename. --follow traces the file back through renames so you see the full history.' },
    { q: 'What is the asterisk (*) in `git branch` output?', options: ['A branch with unresolved conflicts', 'A branch that has unpushed commits', 'The currently checked-out branch', 'A branch created by another author'], correct: 2, explain: 'The asterisk marks your current branch — the one HEAD points to. All new commits go to this branch.' },
    { q: 'What is the purpose of `git tag -a v1.0 -m "release"`?', options: ['Creates a lightweight tag pointing at HEAD', 'Marks a branch as read-only permanently', 'Creates an annotated tag with a message at HEAD', 'Pushes a tag to the remote immediately'], correct: 2, explain: 'git tag -a creates an annotated tag — it has its own object with author, date, and message, unlike a lightweight tag.' },
    { q: 'What does `git remote add <name> <url>` do?', options: ['Downloads the repo from that URL immediately', 'Sets the URL for an existing remote', 'Registers a new named remote connection', 'Creates a branch linked to that remote'], correct: 2, explain: 'git remote add names a URL as a remote shorthand. Then you can fetch, pull, and push to it using that name.' },
    { q: 'What does `git log -S "keyword"` search for?', options: ['Commit messages containing that keyword', 'Authors with that keyword in their name', 'Commits that added or removed that string in code', 'Branches with that keyword in the name'], correct: 2, explain: 'git log -S (pickaxe) finds commits where the number of occurrences of that string changed — i.e., it was added or removed.' },
    { q: 'What does `git merge --no-ff` force?', options: ['A fast-forward merge only', 'A merge that ignores conflicts', 'A merge commit even when fast-forward is possible', 'A push before merging'], correct: 2, explain: 'git merge --no-ff always creates a merge commit — useful when you want the branch history preserved even if the merge could fast-forward.' },
    { q: 'What happens to untracked files when you `git checkout` another branch?', options: ['They are stashed automatically', 'They are deleted if the branch tracks different files', 'They carry over — git does not touch untracked files on checkout', 'They become staged on the new branch'], correct: 2, explain: 'Untracked files are invisible to git, so checkout leaves them alone. Only tracked files are updated to match the new branch.' },
    // ── correct: 3 ──────────────────────────────────────────────────────
    { q: 'What does `git push --force-with-lease` do differently from `--force`?', options: ['It is identical to --force in all cases', 'It refuses to push if there are merge conflicts', 'It skips authentication checks', 'It aborts if the remote has commits you haven\'t fetched yet'], correct: 3, explain: '--force-with-lease checks that the remote hasn\'t changed since your last fetch. It\'s --force with a safety net.' },
    { q: 'In `git stash list`, what is stash@{0}?', options: ['The oldest stash entry', 'The stash entry from the current branch', 'The stash entry with the most files', 'The most recently stashed entry'], correct: 3, explain: 'The stash is LIFO. stash@{0} is always the newest. Each git stash push increments existing entries by 1.' },
    { q: 'What does `git log --author="name"` filter?', options: ['Commits that modified files owned by that user', 'Commits on branches created by that author', 'Commits that were pushed by that user', 'Commits where the commit author matches the name'], correct: 3, explain: 'git log --author filters by the commit author field — the person who wrote the code, which may differ from the committer.' },
    { q: 'What does `git diff main..feature` compare?', options: ['Changes in main that feature doesn\'t have', 'All commits in both branches combined', 'Only the merge commit between them', 'All changes in feature that main doesn\'t have'], correct: 3, explain: 'git diff main..feature shows what is in feature but not in main — the changes the feature branch would bring in.' },
    { q: 'What is `git bisect` used for?', options: ['Splitting a large commit into smaller ones', 'Comparing two branches for differences', 'Merging two branches interactively', 'Binary search through commit history to find a regression'], correct: 3, explain: 'git bisect does a binary search — you mark commits as good or bad, and git narrows down to the exact commit that introduced a bug.' },
    { q: 'What does `git fetch --prune` clean up?', options: ['Unreachable commits from the local object store', 'Empty commits with no changed files', 'Stash entries older than 90 days', 'Local remote-tracking branches whose remote no longer exists'], correct: 3, explain: 'git fetch --prune removes origin/* pointers for remote branches that have been deleted on the server.' },
    { q: 'What does `git rebase -i HEAD~3` let you do?', options: ['Merge the last 3 commits into main', 'Revert the last 3 commits safely', 'Cherry-pick the last 3 commits onto another branch', 'Edit, reorder, squash, or drop the last 3 commits'], correct: 3, explain: 'Interactive rebase opens an editor where you can pick, squash, reword, edit, or drop commits — powerful history cleanup tool.' },
    { q: 'Can you make git ignore a file that is already committed?', options: ['Yes — add it to .gitignore and it disappears', 'Yes — git status will stop showing it immediately', 'Yes — delete it and push; it will be ignored from then on', 'Not with .gitignore alone — you must also run git rm --cached'], correct: 3, explain: '.gitignore only affects untracked files. To stop tracking a committed file: git rm --cached <file> then add it to .gitignore.' },
    { q: 'What does `git push origin HEAD` push?', options: ['All local branches to origin', 'The latest commit only, not the branch', 'The main branch regardless of current branch', 'The current branch to its matching remote branch'], correct: 3, explain: 'git push origin HEAD pushes whatever branch you\'re on to origin under the same name — no need to type the branch name.' },
    { q: 'What does `git log --since="2 weeks ago"` do?', options: ['Shows commits that affected files modified in the last 2 weeks', 'Shows commits older than 2 weeks', 'Shows commits authored in the last 2 weeks', 'Limits log output to 2 commits'], correct: 2, explain: 'git log --since filters by commit date. You can also use --until to set an end date.' },
    { q: 'What does `git diff HEAD` compare?', options: ['Two remote branches', 'Staged area vs the last commit only', 'Remote HEAD vs local HEAD', 'Working directory vs the last commit (all changes, staged + unstaged)'], correct: 3, explain: 'git diff HEAD shows all changes since the last commit — both staged and unstaged combined.' },
    { q: 'How do you recover commits made in detached HEAD state?', options: ['They are automatically saved to a branch', 'Run git restore to retrieve them', 'They are permanently lost immediately', 'Create a branch at that commit before leaving detached HEAD'], correct: 3, explain: 'Commits in detached HEAD are orphaned once you switch branches. git branch <name> before leaving saves them to a proper branch.' },
    { q: 'What is the difference between a lightweight and an annotated git tag?', options: ['Lightweight tags can be pushed; annotated ones cannot', 'Annotated tags are deleted on push; lightweight tags persist', 'Lightweight tags only work on the main branch', 'Annotated tags have their own object with message and author; lightweight tags are just pointers'], correct: 3, explain: 'A lightweight tag is just a pointer to a commit. An annotated tag (-a) has its own git object with tagger, date, and message.' },
    { q: 'What does `git blame -L 10,20 <file>` show?', options: ['The 10 most recent edits to the file', 'All authors who touched the file in any branch', 'Blame output only for commits before line 10', 'Who last modified each line from line 10 to 20'], correct: 3, explain: 'git blame -L restricts output to a line range. Useful for focusing on one function or section without scrolling through the whole file.' },
    { q: 'What is `git remote rename origin upstream` useful for?', options: ['It converts origin into a read-only remote', 'It moves all origin branches to a new server', 'It deletes origin and creates a new remote', 'It renames the remote so you can add a fork as origin'], correct: 3, explain: 'Renaming origin to upstream is a common pattern when contributing to open source — then you add your fork as the new origin.' },
    { q: 'What does `git reset HEAD~1` do without a mode flag?', options: ['Deletes the last commit and all its changes permanently', 'Keeps the commit but removes it from the branch', 'Stages the last commit\'s changes for re-commit', 'Moves the last commit\'s changes back to the working directory'], correct: 3, explain: 'git reset without a flag defaults to --mixed: HEAD moves back and changes land in the working directory as unstaged modifications.' },
    { q: 'What does `git stash show stash@{1}` display?', options: ['Applies the stash and shows what changed', 'The commit message when the stash was created', 'The branch name at stash time', 'A summary of files modified in that stash entry'], correct: 3, explain: 'git stash show displays a summary of files in the stash. Add -p to see the full line-by-line diff without applying it.' },
    { q: 'What does `git log --decorate` add to output?', options: ['Each commit\'s full file diff', 'The number of files changed per commit', 'The push timestamps for each commit', 'Branch and tag names shown next to commit hashes'], correct: 3, explain: 'git log --decorate annotates commits with the names of any branches or tags that point to them. --oneline --decorate --all is a classic combo.' },
    { q: 'After `git reset --hard HEAD~1`, is there any way to get that commit back?', options: ['No — hard reset is permanent', 'Only if you have a remote backup', 'Only within the same terminal session', 'Yes — git reflog still records the lost commit hash'], correct: 3, explain: 'git reflog records every HEAD movement, including hard resets. The orphaned commit is retrievable by hash for ~90 days.' },
    { q: 'What does `git merge --abort` do during an unresolved conflict?', options: ['Commits the conflict markers as-is', 'Pushes the conflicted state to the remote', 'Accepts the incoming changes automatically', 'Abandons the merge and restores the pre-merge state'], correct: 3, explain: 'git merge --abort cancels an in-progress merge and restores your branch to the state it was in before you ran git merge.' },
    { q: 'What does `git tag` (no arguments) list?', options: ['Tags on the current branch only', 'Only annotated tags with messages', 'Tags pushed to the remote only', 'All local tags in the repository'], correct: 3, explain: 'git tag with no arguments lists all local tags alphabetically. It shows both lightweight and annotated tags.' },
    { q: 'What does `git push origin :<branch>` do?', options: ['Downloads that branch from origin', 'Pushes an empty commit to the branch', 'Creates a new branch on origin', 'Deletes that branch from the remote server'], correct: 3, explain: 'Pushing an empty refspec deletes the remote branch: you\'re saying "set origin/<branch> to nothing." Same as git push origin --delete <branch>.' },
    { q: 'What does `git log --merges` filter for?', options: ['Commits authored by multiple people', 'Commits with more than 10 files changed', 'Commits on the main branch only', 'Only merge commits (commits with two or more parents)'], correct: 3, explain: 'git log --merges filters to show only merge commits. --no-merges is the inverse — useful to see only regular commits.' },
    { q: 'What does `git shortlog -sn` produce?', options: ['A short log of the last N commits only', 'Commits grouped by branch with counts', 'A summary of recent push activity', 'Commit counts sorted by author, most commits first'], correct: 3, explain: 'git shortlog -sn shows each author\'s commit count, sorted highest to lowest. Great for seeing who contributed most.' },
    { q: 'What does `git cherry-pick A..B` do?', options: ['Merges branches A and B together', 'Picks only commits present in A but not B', 'Picks commits from the common ancestor of A and B', 'Applies commits after A up to and including B to the current branch'], correct: 3, explain: 'git cherry-pick A..B applies all commits strictly after A up to and including B onto the current branch in order.' },
  ],

};
