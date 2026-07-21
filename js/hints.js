// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — HINT SYSTEM
// Three-level progressive hints per stage. Each level costs score.
// ═══════════════════════════════════════════════════════════════════════

function setHintDisplay(lvl, hints) {
  document.getElementById('hintLvl').textContent = `HINT ${lvl + 1} OF ${hints.length}`;
  const bar = document.getElementById('hintProgressBar');
  if (bar) bar.style.width = (((lvl + 1) / hints.length) * 100) + '%';
  const hintTxt  = document.getElementById('hintTxt');
  const text     = interp(hints[lvl]);
  const cmdMatch = text.match(/^([\s\S]+)\n\n((?:run|type): .+)$/);
  if (cmdMatch) hintTxt.innerHTML = cmdMatch[1] + '<br><br><span class="hint-cmd">' + cmdMatch[2] + '</span>';
  else          hintTxt.textContent = text;
  const nextBtn = document.getElementById('nextHintBtn');
  nextBtn.classList.remove('reveal-answer');
  nextBtn.textContent = 'DEEPER HINT →';
  if (lvl >= hints.length - 1) { nextBtn.style.display = 'none'; return; }
  nextBtn.style.display = '';
  if (lvl === hints.length - 2) { nextBtn.textContent = 'REVEAL ANSWER'; nextBtn.classList.add('reveal-answer'); }
}

function openHint() {
  const hints = room().hints[G.stageIdx];
  if (!hints) return;
  const lvl = Math.min(G.hintLevel, hints.length - 1);
  setHintDisplay(lvl, hints);
  document.getElementById('hintModal').classList.add('open');
  G.hintsUsed++;
  G.totalHints++;
  if (G.stageHintLevel < 0) { G.stageHintLevel = 0; }
}

function moreHint() {
  const hints = room().hints[G.stageIdx];
  G.hintLevel = Math.min(G.hintLevel + 1, hints.length - 1);
  if (G.hintLevel === 1 && G.stageHintLevel < 1) {
    G.stageHintLevel = 1; addScore(-5);
  } else if (G.hintLevel === hints.length - 1 && G.stageHintLevel < hints.length - 1) {
    G.stageHintLevel = hints.length - 1;
    addScore(-15);
    G.totalHints += 3;
    G.hintsUsed  += 3;
  }
  setHintDisplay(G.hintLevel, hints);
}

function closeHint() {
  document.getElementById('hintModal').classList.remove('open');
  G.hintLevel = 0;
  inp.focus();
}
