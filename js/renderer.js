// ═══════════════════════════════════════════════════════════════════════
// SVG TREE RENDERER  v4  — vertical, normalized coords
// Data convention (unchanged): branch.y = lane, commit.x = depth.
// Rendering: normalizes branch.y → display x, commit.x → display y
// so the tree always fills the canvas regardless of raw data values.
// ═══════════════════════════════════════════════════════════════════════

const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  return el;
}

// ─── Tooltip ────────────────────────────────────────────────────────────

let _ttBound = false;

function setupTooltip(svg) {
  if (_ttBound) return;
  _ttBound = true;
  const tt = document.getElementById('treeTooltip');
  if (!tt) return;
  svg.addEventListener('mousemove', e => {
    const hit = e.target.closest('[data-tip]');
    if (!hit) { tt.style.display = 'none'; return; }
    const parts = (hit.dataset.tip || '').split('|');
    tt.innerHTML = parts.map((p, i) =>
      `<span class="tt-${i === 0 ? 'main' : 'sub'}">${p.trim()}</span>`
    ).join('');
    tt.style.display = 'block';
    const r = svg.getBoundingClientRect();
    let tx = e.clientX - r.left + 14;
    let ty = e.clientY - r.top  - 42;
    if (tx + 170 > r.width)  tx = e.clientX - r.left - 175;
    if (ty < 0)               ty = e.clientY - r.top  + 16;
    tt.style.left = tx + 'px';
    tt.style.top  = ty + 'px';
  });
  svg.addEventListener('mouseleave', () => { if (tt) tt.style.display = 'none'; });
}


// ─── Main render ────────────────────────────────────────────────────────

function renderTree(stateKey) {
  const svg = document.getElementById('gitTree');
  svg.innerHTML = '';
  _ttBound = false;
  setupTooltip(svg);

  const state = TREE[stateKey];
  if (!state) {
    const t = svgEl('text', {
      x: '20', y: '30', fill: '#333',
      'font-size': '10', 'font-family': 'JetBrains Mono, Courier New'
    });
    t.textContent = stateKey ? `loading: ${stateKey}` : 'initializing...';
    svg.appendChild(t);
    return;
  }

  // ── Canvas & normalization ────────────────────────────────────────────
  // Use actual rendered SVG size for the viewBox.
  const CW = svg.clientWidth  || 220;
  const CH = svg.clientHeight || 320;
  svg.setAttribute('viewBox', `0 0 ${CW} ${CH}`);

  const branches = state.branches || [];
  const h        = state.HEAD;

  // Quantize: assign a discrete row to each unique depth value, and a
  // discrete column to each unique lane value. This means commit spacing
  // is always fixed (ROW_H px) regardless of raw data coordinate spread.
  const ROW_H = 68, COL_W = 68;
  const PAD_X = 76, PAD_Y = 36; // room for HEAD chip (left) and labels (top)

  const uniqueDepths = [...new Set(branches.flatMap(b => b.commits.map(c => c.x)))].sort((a,b)=>a-b);
  const uniqueLanes  = [...new Set(branches.map(b => b.y))].sort((a,b)=>a-b);
  const depthRow = Object.fromEntries(uniqueDepths.map((d,i)=>[d,i]));
  const laneCol  = Object.fromEntries(uniqueLanes.map((l,i) =>[l,i]));

  const numRows = Math.max(uniqueDepths.length, 1);
  const numCols = Math.max(uniqueLanes.length,  1);

  // Natural content size — capped to panel, never stretched beyond it
  const contentH = Math.min((numRows - 1) * ROW_H, CH - PAD_Y * 2);
  const contentW = Math.min((numCols - 1) * COL_W, CW - PAD_X * 2);

  // Center content in the panel
  const offsetY = (CH - contentH) / 2;
  const offsetX = (CW - contentW) / 2;

  function nx(lane) {
    const col = laneCol[lane] ?? 0;
    return offsetX + (numCols === 1 ? 0 : col / (numCols - 1) * contentW);
  }
  function ny(depth) {
    const row = depthRow[depth] ?? 0;
    return offsetY + (numRows === 1 ? 0 : row / (numRows - 1) * contentH);
  }

  // ── Defs ──────────────────────────────────────────────────────────────
  const defs = svgEl('defs', {});

  const mk = svgEl('marker', { id: 'arr', markerWidth: '5', markerHeight: '7', refX: '2.5', refY: '6', orient: 'auto' });
  mk.appendChild(svgEl('polygon', { points: '0 0,5 0,2.5 6', fill: '#3d4943' }));
  defs.appendChild(mk);

  const flt = svgEl('filter', { id: 'head-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' });
  const blr = svgEl('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '2.8', result: 'blur' });
  const mrg = svgEl('feMerge', {});
  mrg.appendChild(svgEl('feMergeNode', { in: 'blur' }));
  mrg.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  flt.appendChild(blr);
  flt.appendChild(mrg);
  defs.appendChild(flt);
  svg.appendChild(defs);

  // ── Resolve HEAD ──────────────────────────────────────────────────────
  let headBranch = null, headCommit = null, headCI = -1;
  if (h && h.type === 'branch') {
    headBranch = branches.find(b =>
      b.name === h.ref || (h.branchY !== undefined && b.y === h.branchY)
    );
    if (headBranch && h.ci !== undefined) {
      headCI     = h.ci;
      headCommit = headBranch.commits[h.ci];
    }
  }

  // ── Horizontal connectors (branch forks / merges) ─────────────────────
  branches.forEach((branch, bi) => {
    if (!branch.commits.length) return;
    const forkDepth = branch.commits[0].x;
    const thisBx    = nx(branch.y);
    for (let oi = 0; oi < bi; oi++) {
      const other = branches[oi];
      if (other.commits.some(c => c.x === forkDepth)) {
        const otherBx = nx(other.y);
        svg.appendChild(svgEl('line', {
          x1: Math.min(thisBx, otherBx), y1: ny(forkDepth),
          x2: Math.max(thisBx, otherBx), y2: ny(forkDepth),
          stroke: branch.color, 'stroke-width': '1',
          'stroke-dasharray': branch.dashed ? '3,2' : 'none',
          opacity: branch.dashed ? '0.2' : '0.4'
        }));
        break;
      }
    }
  });

  // ── Vertical spines + commits ─────────────────────────────────────────
  branches.forEach(branch => {
    const branchX  = nx(branch.y);
    const cs       = branch.commits;
    const isActive = branch === headBranch;
    const color    = branch.color;

    // Vertical spine
    if (cs.length >= 2) {
      const ys = cs.map(c => ny(c.x));
      svg.appendChild(svgEl('line', {
        x1: branchX, y1: Math.min(...ys),
        x2: branchX, y2: Math.max(...ys),
        stroke: color,
        'stroke-width':     branch.dashed ? '1'   : '1.5',
        'stroke-dasharray': branch.dashed ? '5,4' : 'none',
        opacity: branch.dashed ? '0.3' : '0.8'
      }));
    }

    // Commits
    cs.forEach((c, ci) => {
      const isHead  = isActive && ci === headCI;
      const commitY = ny(c.x);
      const tip     = `${branch.name} | commit ${ci + 1} / ${cs.length}`;
      const g       = svgEl('g', { 'data-tip': tip });

      g.appendChild(svgEl('circle', { cx: branchX, cy: commitY, r: '11', fill: 'transparent', stroke: 'none' }));

      if (isHead) {
        g.appendChild(svgEl('circle', {
          cx: branchX, cy: commitY, r: '13',
          fill: 'none', stroke: color, 'stroke-width': '1', opacity: '0',
          class: 'head-pulse-ring'
        }));
      }

      g.appendChild(svgEl('circle', {
        cx: branchX, cy: commitY,
        r: isHead ? '7' : '5.5',
        fill: '#0a0c0b', stroke: color,
        'stroke-width': isHead ? '2' : (branch.dashed ? '1' : '1.5'),
        opacity: branch.dashed ? '0.45' : '1',
        ...(isHead ? { filter: 'url(#head-glow)' } : {})
      }));

      if (isHead) {
        g.appendChild(svgEl('circle', { cx: branchX, cy: commitY, r: '2.5', fill: color, opacity: '0.9' }));
      }

      svg.appendChild(g);
    });

    // Branch label — centered ABOVE the topmost commit, no overlap
    if (!cs.length) return;
    const topY    = Math.min(...cs.map(c => ny(c.x)));
    const labelEl = svgEl('text', {
      x: branchX, y: topY - 10,
      fill: color,
      'font-size':    isActive ? '8' : '7',
      'font-family':  'JetBrains Mono, Courier New',
      'font-weight':  isActive ? '700' : '400',
      'text-anchor':  'middle',
      opacity: branch.dashed ? '0.4' : (isActive ? '1' : '0.65')
    });
    labelEl.textContent = branch.name;
    svg.appendChild(labelEl);
  });

  // ── HEAD indicator ────────────────────────────────────────────────────
  if (h) {
    if (h.type === 'detached') {
      // h.cx = commit depth → ny, h.cy = branch lane → nx
      const dcx = nx(h.cy);
      const dcy = ny(h.cx);
      svg.appendChild(svgEl('circle', {
        cx: dcx, cy: dcy, r: '13',
        fill: 'none', stroke: '#ffb4ab', 'stroke-width': '1', opacity: '0',
        class: 'head-pulse-ring'
      }));
      svg.appendChild(svgEl('polygon', {
        points: `${dcx},${dcy-8} ${dcx+6},${dcy} ${dcx},${dcy+8} ${dcx-6},${dcy}`,
        fill: 'rgba(255,180,171,0.12)', stroke: '#ffb4ab', 'stroke-width': '1.5'
      }));
      const dt = svgEl('text', {
        x: dcx + 12, y: dcy + 4,
        fill: '#ffb4ab', 'font-size': '8',
        'font-family': 'JetBrains Mono, Courier New', 'font-weight': '700'
      });
      dt.textContent = '◈ HEAD (detached)';
      svg.appendChild(dt);

    } else if (headBranch && headCommit) {
      const hcx   = nx(headBranch.y);
      const hcy   = ny(headCommit.x);
      const color = headBranch.color;

      // Chip goes left normally; flip right if too close to left edge
      const chipW = 36, chipH = 14, stemLen = 20, gap = 9;
      const goRight = hcx < PAD_X + 10;
      const dir     = goRight ? 1 : -1;

      svg.appendChild(svgEl('line', {
        x1: hcx + dir * gap, y1: hcy, x2: hcx + dir * (gap + stemLen), y2: hcy,
        stroke: color, 'stroke-width': '1',
        'stroke-dasharray': '2,2', opacity: '0.5'
      }));

      const chipX = goRight ? hcx + gap + stemLen : hcx - gap - stemLen - chipW;
      const chipY = hcy - 7;
      svg.appendChild(svgEl('rect', {
        x: chipX, y: chipY, width: chipW, height: chipH, rx: '3',
        fill: color, opacity: '0.18',
        stroke: color, 'stroke-width': '0.5', 'stroke-opacity': '0.5'
      }));
      const ht = svgEl('text', {
        x: chipX + chipW / 2, y: chipY + 9.5,
        fill: color, 'font-size': '8.5',
        'font-family': 'JetBrains Mono, Courier New',
        'text-anchor': 'middle', 'font-weight': '700'
      });
      ht.textContent = 'HEAD';
      svg.appendChild(ht);
    }
  }

  // ── Extras ────────────────────────────────────────────────────────────
  (state.extras || []).forEach(ex => {

    if (ex.type === 'remote-box') {
      // Transpose + normalize: ex.x was depth → y, ex.y was lane → x
      const rx = nx(ex.y);
      const ry = ny(ex.x);
      const g  = svgEl('g', { 'data-tip': ex.label });
      g.appendChild(svgEl('rect', {
        x: rx, y: ry, width: '80', height: '18', rx: '2',
        fill: ex.color, opacity: '0.07',
        stroke: ex.color, 'stroke-width': '1', 'stroke-opacity': '0.45'
      }));
      const t = svgEl('text', {
        x: rx + 6, y: ry + 12,
        fill: ex.color, 'font-size': '7',
        'font-family': 'JetBrains Mono, Courier New', opacity: '0.8'
      });
      t.textContent = ex.label;
      g.appendChild(t);
      svg.appendChild(g);
      return;
    }

    if (ex.type === 'arrow') {
      svg.appendChild(svgEl('line', {
        x1: nx(ex.y1), y1: ny(ex.x1),
        x2: nx(ex.y2), y2: ny(ex.x2),
        stroke: '#3d4943', 'stroke-width': '1',
        'stroke-dasharray': '3,3', 'marker-end': 'url(#arr)'
      }));
      return;
    }

    if (ex.type === 'revert-label') {
      const t = svgEl('text', {
        x: nx(ex.y) + 12, y: ny(ex.x),
        fill: '#68dbae', 'font-size': '8',
        'font-family': 'JetBrains Mono, Courier New', 'font-weight': '700'
      });
      t.textContent = '↩ revert';
      svg.appendChild(t);
      return;
    }

    // Status pills — anchored bottom-right of tree area
    const PILLS = {
      'staged-indicator':   { icon: '●', text: 'staged',      color: '#68dbae' },
      'dirty-indicator':    { icon: '⚠', text: 'dirty',       color: '#ffb4ab' },
      'stash-indicator':    { icon: '◎', text: 'stashed',     color: '#c8a87a' },
      'conflict-indicator': { icon: '✕', text: 'conflict',    color: '#ffb4ab' },
    };
    const pill = PILLS[ex.type];
    if (!pill) return;

    const pillX = 6;
    const pillY = CH - 18;
    const pillW = pill.text.length * 5.8 + 28;
    const g = svgEl('g', { 'data-tip': pill.text });
    g.appendChild(svgEl('rect', {
      x: pillX, y: pillY - 3, width: pillW, height: 16, rx: '2',
      fill: pill.color, opacity: '0.09',
      stroke: pill.color, 'stroke-width': '0.5', 'stroke-opacity': '0.5'
    }));
    const t = svgEl('text', {
      x: pillX + 6, y: pillY + 9,
      fill: pill.color, 'font-size': '8',
      'font-family': 'JetBrains Mono, Courier New', opacity: '0.9'
    });
    t.textContent = `${pill.icon}  ${pill.text}`;
    g.appendChild(t);
    svg.appendChild(g);
  });
}
