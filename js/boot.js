// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — BOOT SEQUENCE
// Typewriter animation on the intro screen. Reads GAME_CONFIG.bootLines.
// ═══════════════════════════════════════════════════════════════════════

function runBootSequence() {
  const container = document.getElementById('bootTerminal');
  const txBody    = document.getElementById('txBody');
  const opRow     = document.getElementById('operativeRow');
  const enterBtn  = document.getElementById('enterBtn');
  const nameInput = document.getElementById('operativeName');
  if (!container) return;

  const BOOT_LINES = GAME_CONFIG.bootLines || [];
  let idx = 0, skipped = false;

  function hideSkipBtn() {
    const sb = document.getElementById('bootSkipBtn');
    if (sb) { sb.style.visibility = 'hidden'; sb.style.pointerEvents = 'none'; }
  }

  function revealEnd() {
    if (skipped) return;
    hideSkipBtn();
    txBody.style.opacity   = '1';
    txBody.style.transform = 'translateY(0)';
    setTimeout(() => {
      opRow.style.opacity   = '1';
      opRow.style.transform = 'translateY(0)';
      setTimeout(() => {
        enterBtn.style.opacity      = '1';
        enterBtn.style.pointerEvents = '';
        nameInput.focus();
        nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
      }, 300);
    }, 600);
  }

  function skip() {
    if (skipped) return;
    skipped = true;
    hideSkipBtn();
    container.innerHTML = BOOT_LINES.map(l =>
      `<span class="boot-line ${l.cls || 'dim'}">${l.text}</span>`
    ).join('');
    txBody.style.opacity   = '1';
    txBody.style.transform = 'translateY(0)';
    opRow.style.opacity    = '1';
    opRow.style.transform  = 'translateY(0)';
    enterBtn.style.opacity      = '1';
    enterBtn.style.pointerEvents = '';
    nameInput.focus();
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
  }

  function nextLine() {
    if (skipped) return;
    if (idx >= BOOT_LINES.length) { revealEnd(); return; }
    const line = BOOT_LINES[idx++];
    const el   = document.createElement('span');
    el.className = 'boot-line ' + (line.cls || 'dim');
    container.appendChild(el);
    let ci = 0;
    const txt = line.text;
    function typeChar() {
      if (skipped) return;
      if (ci < txt.length) { el.textContent += txt[ci++]; setTimeout(typeChar, 6); }
      else                  { setTimeout(nextLine, line.pause || 120); }
    }
    typeChar();
  }

  nextLine();
  document.addEventListener('keydown', skip, { once: true });
  container.addEventListener('click', skip, { once: true });
  const skipBtn = document.getElementById('bootSkipBtn');
  if (skipBtn) skipBtn.addEventListener('click', skip, { once: true });
}
