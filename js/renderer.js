// ═══════════════════════════════════════════════════════════════════════
// SVG TREE RENDERER  v3  — vertical layout
// Data convention (unchanged): branch.y = lane position, commit.x = depth.
// Rendering convention: branch.y → display cx (column), commit.x → display cy (row).
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

  // ── Defs ──────────────────────────────────────────────────────────────
  const defs = svgEl('defs', {});

  // Arrowhead (pointing down)
  const mk = svgEl('marker', { id: 'arr', markerWidth: '5', markerHeight: '7', refX: '2.5', refY: '6', orient: 'auto' });
  mk.appendChild(svgEl('polygon', { points: '0 0,5 0,2.5 6', fill: '#3d4943' }));
  defs.appendChild(mk);

  // HEAD glow
  const flt = svgEl('filter', { id: 'head-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' });
  const blr = svgEl('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '2.8', result: 'blur' });
  const mrg = svgEl('feMerge', {});
  mrg.appendChild(svgEl('feMergeNode', { in: 'blur' }));
  mrg.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  flt.appendChild(blr);
  flt.appendChild(mrg);
  defs.appendChild(flt);

  svg.appendChild(defs);

  const branches = state.branches || [];
  const h        = state.HEAD;

  // ── Resolve HEAD commit ───────────────────────────────────────────────
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

  // ── Coordinate helpers ────────────────────────────────────────────────
  // bx(branch)  = branch.y  → horizontal column
  // cy(commit)  = commit.x  → vertical row (depth)
  const bx = b => b.y;
  const cy = c => c.x;

  // ── Horizontal connectors — branch forks ─────────────────────────────
  branches.forEach((branch, bi) => {
    if (branch.commits.length === 0) return;
    const forkY = cy(branch.commits[0]);   // depth where this branch starts
    const thisBx = bx(branch);
    for (let oi = 0; oi < bi; oi++) {
      const other = branches[oi];
      if (other.commits.some(c => cy(c) === forkY)) {
        const otherBx = bx(other);
        svg.appendChild(svgEl('line', {
          x1: Math.min(thisBx, otherBx), y1: forkY,
          x2: Math.max(thisBx, otherBx), y2: forkY,
          stroke: branch.color,
          'stroke-width': '1',
          'stroke-dasharray': branch.dashed ? '3,2' : 'none',
          opacity: branch.dashed ? '0.2' : '0.4'
        }));
        break;
      }
    }
  });

  // ── Vertical branch lines + commit circles ────────────────────────────
  branches.forEach(branch => {
    const branchX  = bx(branch);
    const cs       = branch.commits;
    const isActive = branch === headBranch;
    const color    = branch.color;

    // Vertical spine
    if (cs.length >= 2) {
      const ys = cs.map(cy);
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
      const isHead = isActive && ci === headCI;
      const commitY = cy(c);
      const tip = `${branch.name} | commit ${ci + 1} / ${cs.length}`;
      const g   = svgEl('g', { 'data-tip': tip });

      // Hit area
      g.appendChild(svgEl('circle', {
        cx: branchX, cy: commitY, r: '11',
        fill: 'transparent', stroke: 'none'
      }));

      // Pulse ring (HEAD)
      if (isHead) {
        g.appendChild(svgEl('circle', {
          cx: branchX, cy: commitY, r: '13',
          fill: 'none', stroke: color,
          'stroke-width': '1', opacity: '0',
          class: 'head-pulse-ring'
        }));
      }

      // Commit circle
      g.appendChild(svgEl('circle', {
        cx: branchX, cy: commitY,
        r: isHead ? '7' : '5.5',
        fill: '#0a0c0b',
        stroke: color,
        'stroke-width': isHead ? '2' : (branch.dashed ? '1' : '1.5'),
        opacity: branch.dashed ? '0.45' : '1',
        ...(isHead ? { filter: 'url(#head-glow)' } : {})
      }));

      // Inner dot (HEAD)
      if (isHead) {
        g.appendChild(svgEl('circle', {
          cx: branchX, cy: commitY, r: '2.5',
          fill: color, opacity: '0.9'
        }));
      }

      svg.appendChild(g);
    });

    // Branch label chip — appears to the right of the topmost commit
    if (cs.length === 0) return;
    const topC   = cs.reduce((a, b) => cy(a) < cy(b) ? a : b);
    const labelX = branchX + 12;
    const labelY = cy(topC);
    const chipW  = Math.max(branch.name.length * 5.3 + 14, 32);

    const chipG = svgEl('g', {
      'data-tip': `${branch.name}${isActive ? ' | current' : ''}`
    });
    chipG.appendChild(svgEl('rect', {
      x: labelX - 2, y: labelY - 7, width: chipW, height: 14, rx: '2',
      fill:           isActive ? color : 'transparent',
      opacity:        isActive ? '0.13' : '0',
      stroke:         isActive ? color : 'none',
      'stroke-width': '0.5',
      'stroke-opacity': isActive ? '0.4' : '0'
    }));
    const lbl = svgEl('text', {
      x: labelX + 3, y: labelY + 4,
      fill: color,
      'font-size':   isActive ? '8' : '7.5',
      'font-family': 'JetBrains Mono, Courier New',
      'font-weight': isActive ? '700' : '400',
      opacity: branch.dashed ? '0.4' : (isActive ? '1' : '0.6')
    });
    lbl.textContent = branch.name;
    chipG.appendChild(lbl);
    svg.appendChild(chipG);
  });

  // ── HEAD indicator ────────────────────────────────────────────────────
  if (h) {
    if (h.type === 'detached') {
      // h.cx was commit-depth (x in horizontal) → display cy
      // h.cy was branch-lane (y in horizontal) → display cx
      const dcx = h.cy;   // branch lane → display x
      const dcy = h.cx;   // commit depth → display y
      svg.appendChild(svgEl('circle', {
        cx: dcx, cy: dcy, r: '13',
        fill: 'none', stroke: '#ffb4ab',
        'stroke-width': '1', opacity: '0',
        class: 'head-pulse-ring'
      }));
      svg.appendChild(svgEl('polygon', {
        points: `${dcx},${dcy-8} ${dcx+6},${dcy} ${dcx},${dcy+8} ${dcx-6},${dcy}`,
        fill: 'rgba(255,180,171,0.12)', stroke: '#ffb4ab', 'stroke-width': '1.5'
      }));
      const dt = svgEl('text', {
        x: dcx + 12, y: dcy + 4,
        fill: '#ffb4ab', 'font-size': '8',
        'font-family': 'JetBrains Mono, Courier New',
        'font-weight': '700'
      });
      dt.textContent = '◈ HEAD (detached)';
      svg.appendChild(dt);

    } else if (headBranch && headCommit) {
      const hcx   = bx(headBranch);
      const hcy   = cy(headCommit);
      const color = headBranch.color;

      // Short dashed stem going left from the commit circle
      svg.appendChild(svgEl('line', {
        x1: hcx - 9,  y1: hcy,
        x2: hcx - 20, y2: hcy,
        stroke: color, 'stroke-width': '1',
        'stroke-dasharray': '2,2', opacity: '0.5'
      }));

      // HEAD chip to the left of the stem
      const chipW = 36, chipH = 14;
      const chipX = hcx - 20 - chipW;
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
      // Transpose: ex.x was horizontal depth → display y, ex.y was lane → display x
      const rx = ex.y;
      const ry = ex.x;
      const g  = svgEl('g', { 'data-tip': ex.label });
      g.appendChild(svgEl('rect', {
        x: rx, y: ry, width: '96', height: '22', rx: '3',
        fill: ex.color, opacity: '0.07',
        stroke: ex.color, 'stroke-width': '1', 'stroke-opacity': '0.45'
      }));
      const t = svgEl('text', {
        x: rx + 7, y: ry + 14,
        fill: ex.color, 'font-size': '7.5',
        'font-family': 'JetBrains Mono, Courier New', opacity: '0.8'
      });
      t.textContent = ex.label;
      g.appendChild(t);
      svg.appendChild(g);
      return;
    }

    if (ex.type === 'arrow') {
      // Transpose arrow endpoints
      svg.appendChild(svgEl('line', {
        x1: ex.y1, y1: ex.x1,
        x2: ex.y2, y2: ex.x2,
        stroke: '#3d4943', 'stroke-width': '1',
        'stroke-dasharray': '3,3', 'marker-end': 'url(#arr)'
      }));
      return;
    }

    if (ex.type === 'revert-label') {
      // Transpose: ex.x (depth) → y, ex.y (lane) → x
      const t = svgEl('text', {
        x: ex.y + 12, y: ex.x,
        fill: '#68dbae', 'font-size': '8',
        'font-family': 'JetBrains Mono, Courier New',
        'font-weight': '700'
      });
      t.textContent = '↩ revert';
      svg.appendChild(t);
      return;
    }

    // Status pills — placed to the right of the rightmost branch
    const PILLS = {
      'staged-indicator':   { icon: '●', text: 'changes staged',        color: '#68dbae' },
      'dirty-indicator':    { icon: '⚠', text: 'working tree dirty',    color: '#ffb4ab' },
      'stash-indicator':    { icon: '◎', text: 'stash@{0}: WIP saved',  color: '#c8a87a' },
      'conflict-indicator': { icon: '✕', text: 'CONFLICT: merge failed',color: '#ffb4ab' },
    };
    const pill = PILLS[ex.type];
    if (!pill) return;

    // Find the rightmost branch x and the lowest commit y to anchor below tree
    const maxBx = branches.length
      ? Math.max(...branches.map(b => bx(b)))
      : 80;
    const maxCy = branches.length
      ? Math.max(...branches.flatMap(b => b.commits.map(cy)))
      : 120;

    const pillX = maxBx + 18;
    const pillY = maxCy - 8;
    const pillW = pill.text.length * 5.4 + 28;

    const g = svgEl('g', { 'data-tip': pill.text });
    g.appendChild(svgEl('rect', {
      x: pillX, y: pillY,
      width: pillW, height: 17, rx: '3',
      fill: pill.color, opacity: '0.09',
      stroke: pill.color, 'stroke-width': '0.5', 'stroke-opacity': '0.5'
    }));
    const t = svgEl('text', {
      x: pillX + 7, y: pillY + 12,
      fill: pill.color, 'font-size': '8.5',
      'font-family': 'JetBrains Mono, Courier New', opacity: '0.9'
    });
    t.textContent = `${pill.icon}  ${pill.text}`;
    g.appendChild(t);
    svg.appendChild(g);
  });

  // ── Auto-fit viewBox ──────────────────────────────────────────────────
  try {
    const box = svg.getBBox();
    if (box.width > 0 && box.height > 0) {
      const px = 16, py = 14;
      svg.setAttribute('viewBox',
        `${box.x - px} ${box.y - py} ${box.width + px * 2} ${box.height + py * 2}`
      );
    }
  } catch (e) {
    // getBBox unavailable (hidden element) — keep default viewBox
  }
}
