// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — FILE EDITOR
// In-game textarea overlay for conflict resolution and config edits.
// ═══════════════════════════════════════════════════════════════════════

function openEditor() {
  const s          = stage();
  const isConflict = s.fileEditType === 'conflict';
  const fc         = document.getElementById('fileContent');
  const fileConf   = GAME_CONFIG.fileContent || {};
  const which      = isConflict ? (fileConf.conflict || {}) : (fileConf.edit || {});
  fc.value = which.text || '';
  const title = document.getElementById('editorTitle');
  if (title) title.textContent = 'EDIT FILE: ' + (s.fileName || 'file');
  const hint = document.getElementById('editorHint');
  if (hint) hint.innerHTML = which.hint || '';
  document.getElementById('fileEditor').classList.add('open');
  document.getElementById('fileEditor').classList.toggle('conflict-mode', isConflict);
  fc.focus();
}

function saveFile() {
  const s          = stage();
  const isConflict = s.fileEditType === 'conflict';
  const val        = document.getElementById('fileContent').value;
  document.getElementById('fileEditor').classList.remove('open');
  if (GAME_CONFIG.validateFile) {
    const result = GAME_CONFIG.validateFile(val, isConflict);
    if (result.pass) G.fileEditDone = true;
    tprint(result.output || []);
  }
  inp.focus();
}

function cancelFile() {
  document.getElementById('fileEditor').classList.remove('open');
  inp.focus();
}
