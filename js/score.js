// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — SCORING
// addScore animates the score chip and updates G.score.
// ═══════════════════════════════════════════════════════════════════════

function addScore(delta) {
  const chip = document.getElementById('scoreChip');
  const el   = document.getElementById('scoreVal');
  if (!chip || !el) return;
  const from   = G.score;
  G.score      = Math.max(0, G.score + delta);
  const actual = G.score - from;
  if (actual === 0) return;
  const cls = actual > 0 ? 'gaining' : 'dropping';
  chip.classList.remove('gaining', 'dropping');
  void chip.offsetWidth;
  chip.classList.add(cls);
  setTimeout(() => chip.classList.remove(cls), 700);
  showScoreDelta(actual);
  const frameDelay = Math.abs(actual) <= 1 ? 0 : Math.abs(actual) <= 5 ? 50 : 35;
  let current = from;
  function tick() {
    current += actual > 0 ? 1 : -1;
    el.textContent = current;
    if (current !== G.score) setTimeout(tick, frameDelay);
  }
  tick();
}

function showScoreDelta(delta) {
  const chip = document.getElementById('scoreChip');
  if (!chip) return;
  const ind = document.createElement('div');
  ind.className  = 'score-delta ' + (delta > 0 ? 'pos' : 'neg');
  ind.textContent = (delta > 0 ? '+' : '') + delta;
  chip.appendChild(ind);
  setTimeout(() => ind.remove(), 850);
}
