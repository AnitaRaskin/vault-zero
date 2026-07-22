// ═══════════════════════════════════════════════════════════════════════
// SVG TREE RENDERER  v5  — git-graph style table
// ═══════════════════════════════════════════════════════════════════════

const NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  return el;
}

function _stripAlpha(color) {
  if (typeof color !== 'string') return '#1D9E75';
  return color.length > 7 ? color.slice(0, 7) : color;
}

// ─── Main render ────────────────────────────────────────────────────────

let _currentStateKey = null;

function renderTree(stateKey) {
  _currentStateKey = stateKey;
  const container = document.getElementById('gitTree');
  if (!container) return;
  container.innerHTML = '';

  const state = TREE[stateKey];
  if (!state) {
    const p = document.createElement('div');
    p.className = 'gg-loading';
    p.textContent = stateKey ? `loading: ${stateKey}` : 'initializing...';
    container.appendChild(p);
    return;
  }

  const branches = state.branches || [];
  const h        = state.HEAD;
  const extras   = state.extras || [];

  // ── Lane assignment (left-to-right by branch y value) ────────────────
  const sorted  = [...branches].sort((a, b) => a.y - b.y);
  const laneOf  = {};
  sorted.forEach((b, i) => { laneOf[b.name] = i; });
  const numLanes = sorted.length;

  const LANE_W = 14;
  const ROW_H  = 26;
  const DOT_R  = 3.5;
  const graphW = numLanes * LANE_W + 4;

  // ── Resolve HEAD ──────────────────────────────────────────────────────
  let headBranch   = null;
  let headCommitX  = null;
  let detachedX    = null;
  let detachedLane = null;

  if (h?.type === 'branch') {
    headBranch = branches.find(b =>
      b.name === h.ref || (h.branchY !== undefined && b.y === h.branchY)
    );
    if (headBranch && h.ci != null) {
      headCommitX = headBranch.commits[h.ci]?.x;
    }
  } else if (h?.type === 'detached') {
    detachedX = h.cx;
    const detB = branches.find(b => b.y === h.cy);
    if (detB) detachedLane = laneOf[detB.name];
  }

  // ── All unique depths, newest first ──────────────────────────────────
  const allXs = [...new Set(branches.flatMap(b => b.commits.map(c => c.x)))]
    .sort((a, b) => b - a);

  // ── Inline SVG defs (glow filter) ────────────────────────────────────
  const defsSvg = svgEl('svg', { width: '0', height: '0', style: 'position:absolute;overflow:hidden' });
  const defs    = svgEl('defs', {});
  const flt     = svgEl('filter', { id: 'gg-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' });
  const blr     = svgEl('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '2.5', result: 'blur' });
  const mrg     = svgEl('feMerge', {});
  mrg.appendChild(svgEl('feMergeNode', { in: 'blur' }));
  mrg.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  flt.appendChild(blr); flt.appendChild(mrg);
  defs.appendChild(flt);
  defsSvg.appendChild(defs);
  container.appendChild(defsSvg);

  // ── Rows ──────────────────────────────────────────────────────────────
  allXs.forEach(rowX => {
    const row = document.createElement('div');
    row.className = 'gg-row';

    // Branches with a commit at this depth
    const atRow = branches.filter(b => b.commits.some(c => c.x === rowX));

    // Primary branch for hash/msg: prefer HEAD branch, else first
    const primaryBranch = (headBranch && atRow.includes(headBranch)) ? headBranch : atRow[0];
    const primaryCommit = primaryBranch?.commits.find(c => c.x === rowX);

    const isHead     = headBranch != null && rowX === headCommitX;
    const isDetached = detachedX === rowX;

    if (isHead || isDetached) row.classList.add('gg-row-head');

    // ── Per-row graph SVG ─────────────────────────────────────────────
    const svg = svgEl('svg', {
      width: graphW, height: ROW_H,
      viewBox: `0 0 ${graphW} ${ROW_H}`,
      class: 'gg-graph'
    });

    sorted.forEach(branch => {
      const lane   = laneOf[branch.name];
      const bx     = lane * LANE_W + LANE_W / 2;
      const color  = _stripAlpha(branch.color);
      const isDash = !!branch.dashed;
      const opac   = isDash ? '0.38' : '0.85';
      const sw     = isDash ? '1' : '1.5';

      const xs   = branch.commits.map(c => c.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const has  = xs.includes(rowX);
      const span = rowX >= minX && rowX <= maxX;

      function mkLine(y1, y2) {
        const l = svgEl('line', { x1: bx, y1, x2: bx, y2, stroke: color, 'stroke-width': sw, opacity: opac });
        if (isDash) l.setAttribute('stroke-dasharray', '4,3');
        return l;
      }

      if (has) {
        if (rowX > minX) svg.appendChild(mkLine(0, ROW_H / 2));
        if (rowX < maxX) svg.appendChild(mkLine(ROW_H / 2, ROW_H));

        const isHd     = branch === headBranch && rowX === headCommitX;
        const isDt     = isDetached && detachedLane === lane;
        const glowing  = isHd || isDt;
        const r        = glowing ? DOT_R + 1 : DOT_R;

        const circ = svgEl('circle', {
          cx: bx, cy: ROW_H / 2, r,
          fill: '#0a0c0b', stroke: color,
          'stroke-width': glowing ? '2' : sw,
          opacity: isDash ? '0.5' : '1'
        });
        if (glowing) circ.setAttribute('filter', 'url(#gg-glow)');
        svg.appendChild(circ);

        if (glowing) {
          svg.appendChild(svgEl('circle', {
            cx: bx, cy: ROW_H / 2, r: '2.2',
            fill: color, opacity: '0.9'
          }));
        }
      } else if (span) {
        svg.appendChild(mkLine(0, ROW_H));
      }
    });

    // Horizontal connector for fork/merge rows
    if (atRow.length > 1) {
      const lxs = atRow.map(b => laneOf[b.name] * LANE_W + LANE_W / 2);
      svg.appendChild(svgEl('line', {
        x1: Math.min(...lxs), y1: ROW_H / 2,
        x2: Math.max(...lxs), y2: ROW_H / 2,
        stroke: '#3d4943', 'stroke-width': '1', opacity: '0.5'
      }));
    }

    row.appendChild(svg);

    // ── Content: chips + message (flex: 1) ───────────────────────────
    const contentEl = document.createElement('div');
    contentEl.className = 'gg-content';

    if (isDetached) {
      _chip(contentEl, 'HEAD', '#ffb4ab', true);
    } else if (isHead) {
      _chip(contentEl, `HEAD → ${headBranch.name}`, _stripAlpha(headBranch.color), true);
    }

    // Non-head branch tips at this row
    atRow.forEach(branch => {
      if (branch === headBranch) return;
      const tip = branch.commits[branch.commits.length - 1].x;
      if (tip === rowX) _chip(contentEl, branch.name, _stripAlpha(branch.color), false);
    });

    // Revert label extra
    const revExtra = extras.find(e => e.type === 'revert-label' && e.x === rowX);
    if (revExtra) _chip(contentEl, '↩ revert', '#68dbae', false);

    if (primaryCommit?.msg) {
      const msgEl = document.createElement('span');
      msgEl.className = 'gg-msg';
      msgEl.textContent = primaryCommit.msg;
      contentEl.appendChild(msgEl);
    }

    row.appendChild(contentEl);

    // ── Hash (right side, secondary) ──────────────────────────────────
    const hashEl = document.createElement('span');
    hashEl.className = 'gg-hash';
    hashEl.textContent = (primaryCommit?.hash || '???????').slice(0, 7);
    row.appendChild(hashEl);

    container.appendChild(row);
  });
}

function _chip(parent, label, color, isHead) {
  const el = document.createElement('span');
  el.className = 'gg-chip' + (isHead ? ' gg-chip-head' : '');
  el.textContent = label;
  el.style.color = color;
  el.style.borderColor = color + '55';
  parent.appendChild(el);
}
