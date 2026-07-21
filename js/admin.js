// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — ADMIN PANEL (ROOM JUMP)
// Type //jump or Ctrl+Shift+J to skip between rooms.
// Only available to users with isAdmin = true.
// ═══════════════════════════════════════════════════════════════════════

function _ensureAdminPanel() {
  if (document.getElementById('adminPanel')) return;
  const el = document.createElement('div');
  el.id = 'adminPanel';
  el.className = 'admin-panel';
  document.body.appendChild(el);
  el.addEventListener('click', e => e.stopPropagation());
}

function toggleAdminPanel() {
  _ensureAdminPanel();
  const panel = document.getElementById('adminPanel');
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
    return;
  }
  const rooms = ROOMS.map((r, i) => `
    <button class="admin-room-btn ${i === G.roomIdx ? 'admin-room-btn--active' : ''}" onclick="adminJumpToRoom(${i})">
      <span class="admin-room-id">ROOM ${r.id}</span>
      <span class="admin-room-name">${r.name}</span>
      <span class="admin-room-stages">${r.stages.length} stages</span>
    </button>
  `).join('');
  panel.innerHTML = `
    <div class="admin-panel-hdr">
      <span>▓ ADMIN // ROOM SELECT ▓</span>
      <button class="admin-panel-close" onclick="toggleAdminPanel()">✕</button>
    </div>
    <div class="admin-panel-rooms">${rooms}</div>
    <div class="admin-panel-tip">Ctrl+Shift+J · or type //jump</div>
  `;
  panel.classList.add('open');
}

function adminJumpToRoom(idx) {
  toggleAdminPanel();
  ['roomDone', 'quizScreen', 'fileEditor', 'hintModal', 'leaveModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  });
  clearPolice(true);
  G.roomIdx        = idx;
  G.stageIdx       = 0;
  G.hintsUsed      = 0;
  G.hintLevel      = 0;
  G.fileEditDone   = false;
  G.stageWrongs    = 0;
  G.stageHintLevel = -1;
  G.roomStart      = Date.now();
  loadRoom();
}
