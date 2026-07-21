// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — MODALS
// Concept brief (shown once per room/stage), police warn popup,
// and maybeShowConceptBrief (dedup guard using localStorage).
// ═══════════════════════════════════════════════════════════════════════

function showConceptBrief(brief, callback) {
  const modal     = document.getElementById('conceptModal');
  const titleEl   = document.getElementById('conceptTitle');
  const bulletsEl = document.getElementById('conceptBullets');
  const asciiEl   = document.getElementById('conceptAscii');
  const btn       = document.getElementById('conceptBtn');
  if (!modal) { callback(); return; }
  titleEl.textContent = brief.title || '';
  bulletsEl.innerHTML = '';
  (brief.bullets || []).forEach(text => {
    const d = document.createElement('div');
    d.className  = 'concept-bullet';
    d.textContent = text;
    bulletsEl.appendChild(d);
  });
  if (brief.ascii) { asciiEl.textContent = brief.ascii; asciiEl.style.display = ''; }
  else              { asciiEl.style.display = 'none'; }
  modal.classList.add('open');
  function close() { document.removeEventListener('keydown', onEnter); modal.classList.remove('open'); callback(); }
  function onEnter(e) { if (e.key === 'Enter') close(); }
  btn.onclick = close;
  document.addEventListener('keydown', onEnter);
}

function showPoliceWarnModal(msg, callback) {
  const modal = document.getElementById('policeWarnModal');
  const msgEl = document.getElementById('pwarnMsg');
  const btn   = document.getElementById('pwarnBtn');
  if (!modal) { callback(); return; }
  msgEl.textContent = '';
  modal.classList.add('open');
  const fullText = `[${window.HANDLER_NAME || 'fox'}] > ${msg}`;
  let i = 0;
  function next() { if (i < fullText.length) { msgEl.textContent += fullText[i++]; setTimeout(next, 18); } }
  next();
  function close() { document.removeEventListener('keydown', onEnter); modal.classList.remove('open'); callback(); }
  function onEnter(e) { if (e.key === 'Enter') close(); }
  btn.onclick = close;
  document.addEventListener('keydown', onEnter);
}

function maybeShowConceptBrief(brief, callback) {
  const key = `vz_brief_${G.roomIdx}_${G.stageIdx}`;
  if (brief && !localStorage.getItem(key)) {
    localStorage.setItem(key, '1');
    showConceptBrief(brief, callback);
  } else {
    callback();
  }
}
