// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — PROGRESS & STATUS INDICATORS
// Progress bar, active branch label, tree status chip, security dots.
// ═══════════════════════════════════════════════════════════════════════

function updateActiveBranch(treeKey) {
  const el = document.getElementById('activeBranch');
  if (el) {
    const label = GAME_CONFIG.activeBranchLabel
      ? GAME_CONFIG.activeBranchLabel(treeKey)
      : 'local/main';
    el.textContent = label;
  }
  const statusEl = document.getElementById('treeStatus');
  if (statusEl) {
    const { text, cls } = _treeStatus(treeKey);
    statusEl.textContent = text;
    statusEl.className   = 'tree-stat-val ' + cls;
  }
}

function _treeStatus(key) {
  if (!key) return { text: 'clean', cls: 'ts-clean' };
  if (key.includes('conflict'))    return { text: '✕ conflict', cls: 'ts-err' };
  if (key.includes('dirty'))       return { text: '⚠ dirty',   cls: 'ts-warn' };
  if (key.includes('staged'))      return { text: '● staged',  cls: 'ts-ok' };
  if (key.includes('stash_clean')) return { text: '◎ stashed', cls: 'ts-amber' };
  if (key.includes('reverted'))    return { text: '↩ reverted',cls: 'ts-ok' };
  if (key.includes('pushed') || key.includes('cloned')) return { text: '↑ synced', cls: 'ts-ok' };
  return { text: 'clean', cls: 'ts-clean' };
}

function updateProgress() {
  const total = ROOMS.reduce((s, r) => s + r.stages.length, 0);
  const done  = ROOMS.slice(0, G.roomIdx).reduce((s, r) => s + r.stages.length, 0) + G.stageIdx;
  document.getElementById('progressFill').style.width = ((done / total) * 100) + '%';
}

function updateSecurityDots() {
  const dots     = document.querySelectorAll('.sec-dot');
  const statusEl = document.getElementById('secStatus');
  const bypassed = Math.floor(G.roomIdx / 2) + 1;
  const probing  = Math.min(bypassed + 1, 4);
  dots.forEach((dot, i) => {
    dot.className = 'sec-dot';
    if (i < bypassed)        dot.classList.add('active');
    else if (i === bypassed) dot.classList.add('probing');
  });
  if (statusEl && GAME_CONFIG.securityLayerLabel) {
    statusEl.textContent = GAME_CONFIG.securityLayerLabel(bypassed, probing);
  }
}
