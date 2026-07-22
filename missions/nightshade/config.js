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

  // ── Tour behaviour ──────────────────────────────────────────────────
  tourAfterConceptBrief: true, // show Room 0 brief first, then tour

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

  missionKey: 'nightshade',

  quizMessages: {
    perfect: '"Confirmed. You dismantled NIGHTSHADE\'s operation completely. Every agent on the ATLAS list is safe."',
    pass:    '"Close enough. The pipeline is down. The names weren\'t published. The agents are safe — this time."',
    fail:    '"Shaky. But the trigger is offline. The identities held. Study the tools before the next operation."',
  },

  cheatSheetTitle:    'NIGHTSHADE // COMMAND RECORD',
  cheatSheetFilename: 'nightshade-commands.txt',
  cheatSheetFooter:   'operation-nightshade-v1 // operative record // eyes only',

  // ── Help "always-available" lines ───────────────────────────────────
  alwaysAvailableHelp: [
    'git status       — always works',
    'git log          — always works',
  ],

  // ── Quiz verdicts ────────────────────────────────────────────────────
  quizVerdicts: [
    '"Clean sweep. The pipeline is dead. Every name on that list — protected. NIGHTSHADE\'s machine is dismantled. They won\'t publish."',
    '"Close. The pipeline is down. Most of the registry is safe. The names weren\'t published tonight. Know the gaps."',
    '"Shaky on the theory. But the layers are gone — the machine stopped. The names are safe. Study what you missed."',
  ],

  // ── Police (repurposed as "NIGHTSHADE ALERT" for this mission) ──────
  policeSound:      'alert',
  policeVoiceText:  'intrusion detected',
  policeVoiceRate:  1.1,
  policeVoicePitch: 1.5,
  policeRiskyCmds: ['git reset --hard', 'git push --force', 'git push -f', 'git stash pop'],
  policeWarnings: [
    "3 errors logged. the dead man switch is watching. fix this now — or the next 5 names publish in 30 seconds.",
    "NIGHTSHADE's contingency is live. one more failure and 5 identities go to the mirror. 30 seconds.",
    "atlas node flagged your mistakes. 30 seconds before auto-publish. fix it.",
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
            ['run: git add assets.enc', 'dim'],
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
  // 100 questions — 8 chosen at random each game.
  quizPool: [
    // ── correct: 0 ──────────────────────────────────────────────────────
    { q: 'What does `git reflog` find that `git log --all` cannot?', options: ['Commits orphaned by git reset or checkout', 'Commits on deleted remote branches', 'Commits pushed by other team members', 'Commits with empty commit messages'], correct: 0, explain: 'git log --all only follows branch pointers. Orphaned commits have no branch — reflog finds them because it records every HEAD position ever occupied.' },
    { q: 'After `git reset --hard HEAD~3`, how do you recover one of the lost commits?', options: ['Use git reflog to find the hash, then git checkout or cherry-pick', 'Run git log --all to list orphaned commits', 'Run git pull to restore from the remote', 'The commits are permanently gone'], correct: 0, explain: 'git reflog records every HEAD movement including resets. The lost commit hash is retrievable for ~90 days — then use cherry-pick or checkout.' },
    { q: 'What does `git stash show -p stash@{N}` do before applying?', options: ['Shows the full diff of that stash without applying it', 'Applies the stash and shows what changed', 'Marks the stash as safe to apply', 'Shows only the file names in the stash'], correct: 0, explain: 'git stash show -p previews the full line-by-line diff without side effects — essential when stashes might be malicious or unknown.' },
    { q: 'What is a detached HEAD state?', options: ['HEAD pointing directly at a commit, not a branch', 'HEAD pointing at a deleted branch reference', 'HEAD missing from the .git directory', 'HEAD and origin/HEAD are diverged'], correct: 0, explain: 'Detached HEAD means HEAD holds a commit hash, not a branch name. Commits made here are orphaned when you switch away without branching.' },
    { q: 'What does `git push --force` risk on a shared branch?', options: ['It overwrites remote history others may have pulled', 'It only affects your local repository', 'It is always safe on feature branches', 'It is slower than a normal push'], correct: 0, explain: 'Force-push rewrites the remote branch tip. Anyone who pulled before now has diverged history — their next push or pull will conflict.' },
    { q: 'What does `git cherry-pick <hash>` apply to your branch?', options: ['That one commit\'s changes as a new commit', 'The entire branch containing that commit', 'All commits since that hash to HEAD', 'A revert of that commit\'s changes'], correct: 0, explain: 'Cherry-pick takes one specific commit\'s diff and applies it on top of your current branch as a brand-new commit with a new hash.' },
    { q: 'What does `git diff --staged` show?', options: ['Staged changes vs the last commit', 'Working directory vs the last commit', 'Two branches compared to each other', 'Remote branch vs local staging area'], correct: 0, explain: 'git diff --staged (alias --cached) shows exactly what the next commit would record — staged changes vs HEAD.' },
    { q: 'What does `git log --all` include over plain `git log`?', options: ['Commits reachable from every branch and tag', 'Commits pushed to the remote only', 'Commits with no branch pointer', 'Author history for all files'], correct: 0, explain: 'Without --all, git log only follows commits reachable from HEAD. --all includes all branch tips — critical when the commit you need is on another branch.' },
    { q: 'After resolving a merge conflict manually, what must happen before the merge is complete?', options: ['git add the resolved file, then git commit', 'Run git merge again with --continue', 'Run git pull to finalize the merge', 'Run git reset then git commit'], correct: 0, explain: 'git add marks the conflict resolved in the index. git commit seals the merge. Skipping either step leaves the repo in a mid-merge state.' },
    { q: 'What does `git restore --staged <file>` do?', options: ['Removes the file from staging without losing working-dir changes', 'Discards all changes to the file', 'Commits the file and then unstages it', 'Moves the file\'s staged state into stash'], correct: 0, explain: 'git restore --staged removes a file from the index only — working directory is untouched. Changes are preserved, just unstaged.' },
    { q: 'What does `git switch -c <branch>` do that `git branch <branch>` does not?', options: ['Creates the branch AND switches HEAD to it', 'Creates the branch at a specific commit', 'Creates the branch faster than git branch', 'Creates the branch on the remote too'], correct: 0, explain: 'git branch <name> creates but leaves HEAD on current branch. git switch -c (or checkout -b) creates AND immediately switches.' },
    { q: 'What does `git bisect start` begin?', options: ['A binary search through history to find a regression', 'An interactive rebase on HEAD', 'A merge of two specified branches', 'A scan of the working directory for conflicts'], correct: 0, explain: 'git bisect performs a binary search — you mark commits good or bad and git narrows down to the exact commit that introduced a bug.' },
    { q: 'What is an orphaned commit?', options: ['A commit unreachable from any branch or tag', 'A commit with no author assigned', 'A commit that failed to push to the remote', 'A commit on a deleted remote branch'], correct: 0, explain: 'Orphaned commits exist in the object store but have no branch or tag pointing to them — only reflog can find them for ~90 days.' },
    { q: 'What does `git fetch --prune` clean up locally?', options: ['Remote-tracking branches for deleted remote branches', 'Stash entries older than 90 days', 'Unreachable objects from the local database', 'Commits made before the last push'], correct: 0, explain: 'git fetch --prune deletes your local origin/* pointers for branches that no longer exist on the remote.' },
    { q: 'What is the key difference between `git reset --hard` and `git reset --soft`?', options: ['--hard discards changes; --soft keeps them staged', '--hard keeps staged changes; --soft discards all', '--hard resets the remote; --soft resets locally', '--hard is safer; --soft is irreversible'], correct: 0, explain: 'git reset --hard moves HEAD and discards all changes. git reset --soft moves HEAD but keeps changes staged for re-commit.' },
    { q: 'What does `git tag -a v2.0 -m "release"` create?', options: ['An annotated tag with its own object and message', 'A lightweight pointer to HEAD with a message', 'A new branch pinned to HEAD permanently', 'A signed commit at the current position'], correct: 0, explain: 'Annotated tags (-a) have their own git object storing tagger, date, and message — unlike lightweight tags which are just pointers.' },
    { q: 'What does `git stash list` output in order?', options: ['Newest entry first (stash@{0}), LIFO order', 'Oldest entry first (stash@{0}), FIFO order', 'Entries sorted by file count', 'Entries sorted by branch name'], correct: 0, explain: 'The stash is a LIFO stack. stash@{0} is always the most recently created entry; each new stash pushes older ones up by one index.' },
    { q: 'What does `git push origin --delete <branch>` do?', options: ['Removes the branch from the actual remote server', 'Deletes the local branch and its remote ref', 'Clears all commits on the remote branch', 'Removes the remote tracking pointer only'], correct: 0, explain: 'git push origin --delete sends a deletion request to the remote server — the branch is removed there, affecting all collaborators.' },
    { q: 'What does `git log -S "keyword"` find?', options: ['Commits that added or removed that string in code', 'Commits with that keyword in the commit message', 'Branches with that keyword in the name', 'Authors with that keyword in their username'], correct: 0, explain: 'git log -S (pickaxe) searches for commits that changed the number of occurrences of a string — great for tracing when code was added or deleted.' },
    { q: 'What does `git blame <file>` annotate per line?', options: ['Which commit and author last modified each line', 'Whether each line is staged or unstaged', 'The number of times each line was edited', 'The remote push date for each line'], correct: 0, explain: 'git blame shows the commit hash and author responsible for the most recent change to each line — essential for forensics.' },
    { q: 'What does `git remote rename origin upstream` accomplish?', options: ['Renames the remote so you can add your fork as origin', 'Copies all remote branches under the new name', 'Changes the remote URL permanently', 'Creates a new read-only remote connection'], correct: 0, explain: 'Renaming origin to upstream is standard when contributing to open source — then you add your fork as origin for clean push/pull flow.' },
    { q: 'What is `git rebase -i` primarily used for?', options: ['Editing, squashing, or reordering commits interactively', 'Merging two branches with conflict resolution', 'Rebasing the remote branch onto local', 'Reverting a series of commits at once'], correct: 0, explain: 'Interactive rebase opens an editor where you pick, squash, reword, edit, or drop commits — the main tool for clean history before a PR.' },
    { q: 'When does git reflog expire by default?', options: ['After 90 days (30 days for unreachable commits)', 'After 7 days for all entries', 'After 1 year for all entries', 'It never expires unless manually cleared'], correct: 0, explain: 'By default reflog keeps reachable entries 90 days and unreachable (orphaned) entries 30 days before git gc removes them.' },
    { q: 'What is the `.git/HEAD` file?', options: ['A text file containing the current branch ref or commit hash', 'A binary index of all commits in the repo', 'A log of every command run in this repo', 'A copy of the latest commit object'], correct: 0, explain: '.git/HEAD usually contains "ref: refs/heads/main" — the name of the current branch. In detached HEAD it holds a raw commit hash.' },
    { q: 'What does `git push --force-with-lease` verify before pushing?', options: ['That the remote has not advanced beyond what you last fetched', 'That all tests pass before overwriting the remote', 'That no other users are currently pushing', 'That the branch has no unresolved conflicts'], correct: 0, explain: '--force-with-lease checks that origin hasn\'t moved since your last fetch. Safer than --force — aborts if someone pushed while you worked.' },
    // ── correct: 1 ──────────────────────────────────────────────────────
    { q: 'Why does `git reflog` find commits that `git log --all` misses?', options: ['It searches deleted remote branches', 'It records every HEAD position including orphaned commits', 'It has a longer memory window than git log', 'It reads the remote object store directly'], correct: 1, explain: 'git log --all follows branch pointers only. git reflog tracks every HEAD movement — even commits with no branch pointing to them.' },
    { q: 'What does `git reset --mixed HEAD~1` do to the last commit?', options: ['Deletes the commit and all file changes permanently', 'Moves the commit\'s changes back to the working directory as unstaged', 'Keeps the commit but removes the branch pointer', 'Stages the commit\'s changes for re-commit'], correct: 1, explain: 'git reset --mixed (the default) moves HEAD back and leaves the changes as unstaged modifications in the working directory.' },
    { q: 'What is the difference between `git fetch` and `git pull`?', options: ['fetch is faster than pull in all cases', 'fetch downloads without merging; pull downloads and merges', 'fetch only works on the main branch', 'They are identical on feature branches'], correct: 1, explain: 'git fetch updates your origin/* tracking branches without touching your working branch. git pull = fetch + merge in one step.' },
    { q: 'What happens to commits in detached HEAD when you switch branches?', options: ['They are automatically saved to the last branch', 'They become orphaned — unreachable except via reflog', 'They are pushed to the remote automatically', 'They are stashed and restored on return'], correct: 1, explain: 'Without a branch name, those commits have no pointer. They become orphaned — only findable via git reflog until gc removes them.' },
    { q: 'What does `git cherry-pick A..B` apply?', options: ['Only commit A to the current branch', 'All commits strictly after A up to and including B', 'The diff between A and B as one commit', 'Commits common to both A and B'], correct: 1, explain: 'git cherry-pick A..B applies commits in order from after A to B (exclusive of A itself) onto the current branch.' },
    { q: 'What does `git stash apply stash@{2}` do differently from `git stash pop`?', options: ['apply is faster and skips conflict checks', 'apply restores and keeps the entry; pop restores and removes stash@{0}', 'apply only works on the newest stash', 'They are identical for stash@{2}'], correct: 1, explain: 'git stash apply restores the entry but keeps it in the list. git stash pop restores AND removes stash@{0} — a specific index requires apply.' },
    { q: 'What does `git log --patch` show per commit?', options: ['Only the files changed, not the content', 'The full line-by-line diff the commit introduced', 'A graph of which branch the commit came from', 'The remote timestamp of when it was pushed'], correct: 1, explain: 'git log --patch (or -p) shows each commit\'s message AND its full diff — great for understanding exactly what changed and why.' },
    { q: 'What does `git rebase <base>` do to your current branch?', options: ['Merges base into your branch with a merge commit', 'Replays your commits on top of base as new commits', 'Squashes your branch into one commit on base', 'Syncs your branch pointer to match base'], correct: 1, explain: 'Rebase replays your branch\'s commits on top of base — rewriting hashes. The result looks like you branched off base just now.' },
    { q: 'What does `git diff HEAD` compare?', options: ['Two remote branch tips', 'All changes since last commit including staged and unstaged', 'Only staged changes vs HEAD', 'Local HEAD vs remote HEAD'], correct: 1, explain: 'git diff HEAD shows ALL changes since the last commit — staged and unstaged combined. Unlike git diff (unstaged only) or git diff --staged.' },
    { q: 'In `git stash list`, which entry is applied by plain `git stash pop`?', options: ['The oldest entry (highest index number)', 'stash@{0} — the most recently stashed entry', 'The entry from the current branch', 'The entry with the most modified files'], correct: 1, explain: 'git stash pop always operates on stash@{0}. To pop a different entry, you must use git stash apply stash@{N} then git stash drop stash@{N}.' },
    { q: 'What does `git log --decorate` add to commit output?', options: ['Each commit\'s full diff of changed files', 'Branch and tag names shown next to commit hashes', 'The author\'s email address per commit', 'The push timestamp from the remote'], correct: 1, explain: 'git log --decorate annotates commits with the names of any refs (branches, tags, HEAD) that point to them.' },
    { q: 'What does `git merge --abort` do during an active conflict?', options: ['Commits the conflict markers as-is', 'Abandons the merge and restores the pre-merge state', 'Accepts all incoming changes over yours', 'Pushes the conflicted state to the remote'], correct: 1, explain: 'git merge --abort cancels an in-progress merge and restores your branch to exactly the state it was before you ran git merge.' },
    { q: 'What does `git push origin HEAD` push?', options: ['All local branches to origin', 'Only the latest commit without a branch reference', 'The main branch regardless of current position', 'The current branch to its matching remote name'], correct: 3, explain: 'git push origin HEAD is a portable way to push the current branch — it works regardless of what the branch is named.' },
    { q: 'What does `git log --follow <file>` track that `git log -- <file>` does not?', options: ['All branches that modified the file', 'File history across git renames', 'Commits where the file was deleted', 'Commits from all authors on the file'], correct: 1, explain: 'Without --follow, git log stops at a rename. --follow traces the file back through rename events to show the complete history.' },
    { q: 'What does `git tag` (no arguments) list?', options: ['Only annotated tags with messages', 'All local tags in the repository', 'Tags that have been pushed to the remote', 'Tags on the current branch only'], correct: 1, explain: 'git tag with no arguments lists all local tags alphabetically — both lightweight and annotated.' },
    { q: 'How do you recover a commit made in detached HEAD after switching away?', options: ['It cannot be recovered after switching', 'Find the hash in git reflog, then cherry-pick or branch', 'Run git stash pop to restore it', 'Run git pull to get it from the remote'], correct: 1, explain: 'git reflog still records the orphaned commit. Find its hash, then create a branch there or cherry-pick it onto your current branch.' },
    { q: 'What does `git diff <branch>` compare against your working directory?', options: ['The merge base of your branch and the target', 'All changes in your branch that the target doesn\'t have', 'The full history of both branches combined', 'Only the commits unique to the target branch'], correct: 1, explain: 'git diff <branch> compares your current working directory state against the tip of that branch — showing what would change in a merge.' },
    { q: 'What does `git rebase -i HEAD~5` open?', options: ['A diff of the last 5 commits combined', 'An interactive editor to edit the last 5 commits', 'A merge view of the last 5 commits against main', 'A log of who authored the last 5 commits'], correct: 1, explain: 'Interactive rebase on HEAD~5 opens a todo list for the last 5 commits — you can pick, squash, reword, edit, or drop each one.' },
    { q: 'What does `git fetch origin <branch>` download?', options: ['Only the latest commit of that branch', 'All branches from origin at once', 'The remote branch\'s commits into origin/<branch> locally', 'The branch and merges it into your current one'], correct: 2, explain: 'git fetch origin <branch> updates origin/<branch> with the remote\'s current state — without touching your local branches.' },
    { q: 'What does `git bisect good <hash>` tell git during a bisect session?', options: ['To skip that commit and move on', 'That commit does not have the bug — search later commits', 'That commit is the cause of the regression', 'To mark that commit as a branch point'], correct: 1, explain: 'During bisect, marking a commit "good" tells git the bug isn\'t present there. Git then searches the commits AFTER that point.' },
    { q: 'What does `git remote -v` display per remote?', options: ['All branches associated with that remote', 'The remote name with its fetch and push URLs', 'The last fetch timestamp per remote', 'The diff between local and remote HEAD'], correct: 1, explain: 'git remote -v shows each remote\'s name and the URLs used for fetching (download) and pushing (upload). Often fetch and push URLs are identical.' },
    { q: 'What does `git log --author="name"` filter for?', options: ['Commits touched by any file owned by that author', 'Commits whose author field matches the name', 'Commits reviewed or approved by that author', 'Commits pushed by that author to the remote'], correct: 1, explain: 'git log --author filters by the commit\'s author field — the person who wrote the code, which can differ from the committer.' },
    { q: 'What does `git stash branch <name>` do?', options: ['Creates a branch and pushes all stashes to it', 'Creates a branch from the stash\'s parent commit and applies the stash', 'Renames the current stash entry', 'Moves the stash to a named branch for long-term storage'], correct: 1, explain: 'git stash branch creates a new branch at the commit where the stash was made, then applies the stash — cleanly handling potential conflicts.' },
    // ── correct: 2 ──────────────────────────────────────────────────────
    { q: 'What does `git reset --hard` do to uncommitted changes?', options: ['Moves them to the stash automatically', 'Keeps them staged for re-commit', 'Discards them permanently with no recovery', 'Moves them to the working directory as unstaged'], correct: 2, explain: 'git reset --hard discards everything — staged, unstaged, all of it. There is no undo. Use git stash first if you need to keep the changes.' },
    { q: 'Why can\'t `git log --all` find an orphaned commit?', options: ['It only searches the remote object store', 'It requires --reflog to be passed too', 'It only follows commits reachable from a branch or tag ref', 'It only shows commits from the last 90 days'], correct: 2, explain: 'git log --all follows refs (branch and tag pointers). An orphaned commit has no ref pointing to it — reflog is the only way to find it.' },
    { q: 'What is the safest alternative to `git push --force`?', options: ['git push --no-verify', 'git push origin :branch then re-push', 'git push --force-with-lease', 'git push --allow-unrelated-histories'], correct: 2, explain: '--force-with-lease aborts if someone pushed to the remote since your last fetch — preventing accidental overwrites of others\' work.' },
    { q: 'What is a merge commit different from a regular commit?', options: ['It has no author or timestamp', 'It contains the merged file contents only', 'It has two parent commits instead of one', 'It is unsigned and cannot be verified'], correct: 2, explain: 'A merge commit is created when two diverged branches are joined. It records two parents — one from each branch — preserving the full history.' },
    { q: 'What does `git log --merges` filter for?', options: ['Commits authored by multiple people', 'Commits with more than one file changed', 'Commits with two or more parents (merge commits)', 'Commits that triggered CI pipeline merges'], correct: 2, explain: 'git log --merges shows only merge commits. --no-merges is the inverse, filtering them out for a cleaner linear commit view.' },
    { q: 'What does `git diff <commitA> <commitB>` show?', options: ['All commits between A and B', 'Only files present in commit A but not B', 'The differences between the two commit snapshots', 'The merge base of A and B'], correct: 2, explain: 'git diff A B compares the two commit snapshots directly — what changed between the state at A and the state at B.' },
    { q: 'What does `git clean -fd` do to untracked directories?', options: ['Stages them for the next commit', 'Adds them to .gitignore automatically', 'Permanently deletes them with no undo', 'Moves them to the stash temporarily'], correct: 2, explain: 'git clean -f deletes untracked files; -d also deletes untracked directories. Both are permanent — there is no undo.' },
    { q: 'What does `git stash show stash@{1}` display by default?', options: ['The stash is applied to the working directory', 'The commit message saved with the stash', 'A summary of files changed in that stash entry', 'The parent commit hash of the stash'], correct: 2, explain: 'git stash show shows a stat summary (files changed, insertions, deletions) for a stash. Add -p for the full diff.' },
    { q: 'What does `git rebase` rewrite that `git merge` does not?', options: ['The working directory state after the operation', 'The author and timestamp of commits', 'Commit hashes on the rebased branch', 'The remote tracking branch pointer'], correct: 2, explain: 'Rebase creates new commits with new hashes. This is why rebasing shared branches breaks collaborators — they have the old hashes.' },
    { q: 'What happens to stash@{0} after `git stash pop`?', options: ['It is kept in the list marked as applied', 'It is moved to stash@{1} position', 'It is removed from the stash stack entirely', 'It is committed to the current branch'], correct: 2, explain: 'git stash pop = git stash apply + git stash drop. stash@{0} is applied to your working directory and then deleted from the stash list.' },
    { q: 'What does `git log --stat` add to each commit entry?', options: ['The full diff for each file changed', 'The remote push timestamp per commit', 'A summary of files changed and line counts', 'The branch name each commit was made on'], correct: 2, explain: 'git log --stat adds a summary showing which files changed, how many lines were added, and how many deleted — without the full diff.' },
    { q: 'What does `git blame -L 10,20 <file>` restrict output to?', options: ['The 10 most recent authors of the file', 'Lines authored since 20 days ago', 'Lines 10 through 20 of the file', 'The 10 commits before line 20'], correct: 2, explain: 'git blame -L <start>,<end> limits output to that line range — useful for focusing on one function without scrolling through the whole file.' },
    { q: 'In a `.git` directory, what does `refs/heads/main` contain?', options: ['All commits on the main branch', 'The parent commit of the first commit', 'The SHA of the commit that main points to', 'A log of all pushes to main'], correct: 2, explain: 'refs/heads/<branch> is a file containing just one commit hash — the tip of that branch. That\'s all a branch pointer is.' },
    { q: 'What does `git fetch origin <branch>:<local-branch>` do?', options: ['Pushes your local branch to the named remote branch', 'Merges the remote branch into the local branch', 'Fetches the remote branch into a specific local branch name', 'Tracks the remote branch under a different local name'], correct: 2, explain: 'git fetch origin remote:local downloads the remote ref into a specifically named local branch — without checking it out.' },
    { q: 'What does `git log --since="2024-01-01"` filter?', options: ['Commits modified after that date by any author', 'Commits with timestamps after that date', 'Commits authored on or after that date', 'Commits pushed to the remote after that date'], correct: 2, explain: 'git log --since filters by commit author date. You can combine it with --until to define a time window.' },
    { q: 'What does `git stash drop stash@{0}` do?', options: ['Applies the stash and then removes it', 'Moves the stash to the bottom of the stack', 'Removes that stash entry without applying it', 'Commits the stash changes and deletes it'], correct: 2, explain: 'git stash drop removes the stash entry from the stack without applying it. git stash pop is apply + drop combined.' },
    { q: 'What does a merge conflict happen?', options: ['When you forget to run git add before commit', 'When you push without pulling first', 'When two branches changed the same lines differently', 'When git cannot find the common ancestor'], correct: 2, explain: 'A conflict occurs when the same lines were modified differently in two branches. Git can\'t decide which version is correct — you must resolve it manually.' },
    { q: 'What does `git shortlog -sn` produce?', options: ['A one-line summary of the last N commits', 'The last N commits in short format', 'Commit counts per author sorted by most commits', 'Commits shorter than N lines in the diff'], correct: 2, explain: 'git shortlog -sn groups commits by author, shows the count per author (-s), and sorts by count descending (-n).' },
    { q: 'What does `git remote set-url origin <url>` do?', options: ['Creates a new remote named origin', 'Adds a second push URL to origin', 'Changes the URL of an existing remote', 'Clones the repo to the new URL'], correct: 2, explain: 'git remote set-url changes the URL associated with an existing remote — useful after a repo is moved or renamed on the server.' },
    { q: 'What does `git bisect bad <hash>` tell git during bisect?', options: ['To skip that commit and continue bisecting', 'To end the bisect and restore HEAD', 'That commit contains the regression — search earlier commits', 'To cherry-pick that commit onto a clean branch'], correct: 2, explain: 'Marking a commit "bad" tells git the bug is present. Git will then search commits BEFORE that point to narrow down the regression.' },
    { q: 'What does `git push origin :<branch>` do?', options: ['Downloads that branch from origin', 'Creates a new empty branch on origin', 'Deletes that branch on the remote server', 'Pushes HEAD to that branch name on origin'], correct: 2, explain: 'Pushing an empty source ref deletes the remote branch. It\'s equivalent to git push origin --delete <branch>.' },
    // ── correct: 3 ──────────────────────────────────────────────────────
    { q: 'What is the purpose of `git reflog` in forensics?', options: ['It reads the remote object database', 'It shows all commits on all branches', 'It checks integrity of the git object store', 'It records every position HEAD has ever occupied'], correct: 3, explain: 'git reflog is the local history of every HEAD movement — resets, checkouts, merges — essential for recovering from mistakes.' },
    { q: 'What does `git reset --soft HEAD~1` keep that `--hard` discards?', options: ['The commit itself in the log', 'The branch pointer at its current position', 'The remote tracking state', 'All the commit\'s changes in the staging area'], correct: 3, explain: '--soft moves HEAD back but keeps changes staged. --hard moves HEAD back AND discards all changes — no recovery without reflog.' },
    { q: 'Why should you never rebase a branch that others have pulled?', options: ['It creates an extra merge commit for each person', 'It corrupts the .git directory on other machines', 'It marks the branch as read-only on the remote', 'It rewrites commit hashes, causing diverged history for others'], correct: 3, explain: 'Rebase creates new commits with new hashes. Anyone who pulled the original hashes will have a different history — their next push fails.' },
    { q: 'What does `git log --oneline --all --graph` show?', options: ['Only commits reachable from HEAD', 'A list of commits sorted by author', 'Commits from the last 30 days only', 'A text graph of every branch and merge relationship'], correct: 3, explain: '--all includes every branch and tag, --graph draws branch lines, --oneline keeps it compact. Classic "repo shape" command.' },
    { q: 'After `git reset --hard`, which tool can still find the lost commit?', options: ['git log --all searches orphaned objects', 'git stash list shows reverted changes', 'git diff HEAD shows the removed content', 'git reflog records the hash before reset'], correct: 3, explain: 'git reflog tracks every HEAD position. Even after --hard, the old commit hash appears in reflog and is retrievable until gc runs.' },
    { q: 'What does `git rebase -i HEAD~3` allow you to do?', options: ['Merge the last 3 commits into main', 'Revert the last 3 commits in order', 'Cherry-pick the last 3 commits elsewhere', 'Edit, squash, reorder, or drop the last 3 commits'], correct: 3, explain: 'Interactive rebase on HEAD~3 presents a todo list — pick to keep, squash to combine, reword to rename, drop to delete, edit to amend.' },
    { q: 'What does `git stash show -p stash@{N}` output?', options: ['The commit message from when the stash was made', 'The list of stash entries with their ages', 'The branch name where the stash was created', 'The full line-by-line diff of that stash entry'], correct: 3, explain: 'git stash show -p adds the patch (-p) flag — you see the full diff without applying it. Critical for inspecting unknown stashes safely.' },
    { q: 'What is the `.git/ORIG_HEAD` file created for?', options: ['It records the original remote HEAD at clone time', 'It holds the HEAD state before a rebase began', 'It caches the most recent fetch result', 'It stores the HEAD before a merge or reset so you can undo it'], correct: 3, explain: 'ORIG_HEAD is written by operations like merge and reset -- it records the previous HEAD so you can quickly undo with git reset ORIG_HEAD.' },
    { q: 'What does `git cherry-pick --no-commit <hash>` do?', options: ['Picks the commit and immediately pushes it', 'Skips the commit without applying it', 'Applies the commit and squashes it into HEAD', 'Applies the commit\'s changes but doesn\'t create a commit yet'], correct: 3, explain: '--no-commit applies the cherry-picked changes to your working directory and staging area without creating a commit — useful for combining picks.' },
    { q: 'When does `git gc` actually remove orphaned commits?', options: ['Immediately when you run git reset --hard', 'When the remote is out of sync with local', 'When you close the terminal session', 'After the reflog expiry period (default: 30 days for unreachable commits)'], correct: 3, explain: 'git gc respects reflog expiry. Orphaned commits are safe for 30 days (by default) — after expiry, git gc can permanently delete them.' },
    { q: 'What does `git log --no-merges` filter out?', options: ['Commits pushed directly to main', 'Commits with empty messages', 'Commits modified by more than one author', 'Merge commits (commits with two or more parents)'], correct: 3, explain: 'git log --no-merges hides merge commits, leaving only regular commits. Useful for a clean changelog or linear history view.' },
    { q: 'What is the refspec `refs/heads/*:refs/remotes/origin/*` used for?', options: ['Deleting all remote branches', 'Pushing all local branches at once', 'Mapping remote branches to local remote-tracking refs during fetch', 'Cloning only selected branches'], correct: 2, explain: 'This is the default fetch refspec — it maps every remote branch (refs/heads/*) to a local remote-tracking ref (refs/remotes/origin/*).' },
    { q: 'What does `git tag -d <tagname>` do?', options: ['Deletes the tag from the remote server', 'Marks the tag as deprecated but keeps it', 'Creates a deletion commit for the tag', 'Deletes the tag from the local repository only'], correct: 3, explain: 'git tag -d removes the tag locally. To remove it from the remote too, you must also run git push origin --delete <tagname>.' },
    { q: 'What does `git log --diff-filter=D` find?', options: ['Commits where all files were deleted', 'Commits where the diff contains only additions', 'Commits that were reverted somewhere later', 'Commits where at least one file was deleted'], correct: 3, explain: 'git log --diff-filter=D shows only commits that deleted at least one file. A (added), M (modified), R (renamed) are other common filters.' },
    { q: 'What does `git worktree add <path> <branch>` create?', options: ['A stash entry pointing to that branch', 'A backup of the branch at a given path', 'A detached HEAD at the branch tip', 'A second working directory linked to the same repo'], correct: 3, explain: 'git worktree add lets you check out a second branch into a separate folder without cloning — useful for working on two things at once.' },
    { q: 'What is the risk of `git push --force` on a branch used by CI/CD?', options: ['It slows down the CI pipeline execution', 'It prevents future pushes to that branch', 'It marks the branch as unprotected permanently', 'It can overwrite commits that CI was running against, breaking build state'], correct: 3, explain: 'CI typically checks out the commit hash at push time. Force-pushing changes the tip — if CI already fetched the old hash, results are orphaned or misattributed.' },
    { q: 'What does `git log --pretty=format:"%H %s"` customize?', options: ['The merge strategy for the log output', 'The sorting order of commits displayed', 'The file filter for the log query', 'The output format showing full hash and subject per commit'], correct: 3, explain: 'git log --pretty=format lets you build custom output. %H = full hash, %s = subject, %an = author name, %ai = author date ISO.' },
  ],
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
  ],

};
