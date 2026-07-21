// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — RESIZABLE PANELS
// Drag handles between the three main panels (fox / terminal / tree).
// ═══════════════════════════════════════════════════════════════════════

function initResizable() {
  const panels      = document.getElementById('panels');
  const leftHandle  = document.getElementById('resizeLeft');
  const rightHandle = document.getElementById('resizeRight');
  if (!panels || !leftHandle || !rightHandle) return;
  let dragging = null, startX = 0, startW = 0;
  const MIN_SIDE = 120, MIN_CENTER = 280;
  function getSideWidths() {
    const cols = getComputedStyle(panels).gridTemplateColumns.split(' ');
    return { left: parseFloat(cols[0]), right: parseFloat(cols[4]) };
  }
  function startDrag(side, e) {
    dragging = side; startX = e.clientX; startW = getSideWidths()[side];
    leftHandle.classList.toggle('dragging',  side === 'left');
    rightHandle.classList.toggle('dragging', side === 'right');
    document.body.classList.add('resizing-col');
    e.preventDefault();
  }
  leftHandle.addEventListener('mousedown',  e => startDrag('left',  e));
  rightHandle.addEventListener('mousedown', e => startDrag('right', e));
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const total          = panels.offsetWidth - 2;
    const { left, right } = getSideWidths();
    if (dragging === 'left') {
      const newW = Math.max(MIN_SIDE, Math.min(startW + (e.clientX - startX), total - right - MIN_CENTER));
      panels.style.setProperty('--left-w', newW + 'px');
    } else {
      const newW = Math.max(MIN_SIDE, Math.min(startW + (startX - e.clientX), total - left - MIN_CENTER));
      panels.style.setProperty('--right-w', newW + 'px');
    }
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = null;
    leftHandle.classList.remove('dragging');
    rightHandle.classList.remove('dragging');
    document.body.classList.remove('resizing-col');
  });
}
