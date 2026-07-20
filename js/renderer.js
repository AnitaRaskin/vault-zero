const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function renderTree(stateKey) {
  const svg = document.getElementById('gitTree');
  svg.innerHTML = '';

  // Defs (arrowhead marker)
  const defs = svgEl('defs', {});
  const marker = svgEl('marker', { id:'arr', markerWidth:'7', markerHeight:'5', refX:'0', refY:'2.5', orient:'auto' });
  const poly = svgEl('polygon', { points:'0 0, 7 2.5, 0 5', fill:'#3d4943' });
  marker.appendChild(poly);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const state = TREE[stateKey];
  if (!state) {
    const t = svgEl('text', { x:'20', y:'30', fill:'#333', 'font-size':'10', 'font-family':'Courier New' });
    t.textContent = stateKey ? `state: ${stateKey}` : 'initial state';
    svg.appendChild(t);
    return;
  }

  // Branch lines + commits
  (state.branches || []).forEach(branch => {
    const cs = branch.commits;
    if (cs.length > 1) {
      for (let i = 0; i < cs.length - 1; i++) {
        svg.appendChild(svgEl('line', {
          x1: cs[i].x, y1: branch.y,
          x2: cs[i+1].x, y2: branch.y,
          stroke: branch.color,
          'stroke-width': branch.dashed ? '1' : '1.5',
          'stroke-dasharray': branch.dashed ? '5,4' : 'none',
          opacity: branch.dashed ? '0.45' : '1'
        }));
      }
    }
    // Commit circles
    cs.forEach(c => {
      svg.appendChild(svgEl('circle', {
        cx: c.x, cy: branch.y, r: '5',
        fill: '#080808',
        stroke: branch.color,
        'stroke-width': branch.dashed ? '1' : '1.5',
        opacity: branch.dashed ? '0.5' : '1'
      }));
    });

    // Branch label (right of last commit)
    const last = cs[cs.length - 1];
    const labelX = last.x + 9;
    const lbl = svgEl('text', {
      x: labelX, y: branch.y + 4,
      fill: branch.dashed ? branch.color : branch.color,
      'font-size': '8.5',
      'font-family': 'JetBrains Mono, Courier New',
      opacity: branch.dashed ? '0.5' : '0.8'
    });
    lbl.textContent = branch.name;
    svg.appendChild(lbl);
  });

  // HEAD indicator
  const h = state.HEAD;
  if (h) {
    if (h.type === 'detached') {
      // Diamond
      const cx = h.cx, cy = h.cy;
      svg.appendChild(svgEl('polygon', {
        points: `${cx},${cy-11} ${cx+9},${cy} ${cx},${cy+11} ${cx-9},${cy}`,
        fill: 'none', stroke: '#ffb4ab', 'stroke-width': '1.5'
      }));
      const t = svgEl('text', { x: cx, y: cy - 17, fill: '#ffb4ab', 'font-size': '9', 'font-family': 'JetBrains Mono, Courier New', 'text-anchor': 'middle' });
      t.textContent = 'HEAD (detached)';
      svg.appendChild(t);
    } else {
      // Find the commit position
      const branch = (state.branches || []).find(b =>
        b.name === h.ref || (h.branchY !== undefined && b.y === h.branchY)
      );
      if (branch && h.ci !== undefined) {
        const c = branch.commits[h.ci];
        if (c) {
          // Small arrow above commit
          svg.appendChild(svgEl('line', {
            x1: c.x, y1: branch.y - 14,
            x2: c.x, y2: branch.y - 7,
            stroke: '#87948c', 'stroke-width': '1',
            'marker-end': 'url(#arr)'
          }));
          const t = svgEl('text', {
            x: c.x, y: branch.y - 18,
            fill: '#87948c', 'font-size': '9', 'font-family': 'JetBrains Mono, Courier New', 'text-anchor': 'middle'
          });
          t.textContent = 'HEAD';
          svg.appendChild(t);
        }
      }
    }
  }

  // Extras
  (state.extras || []).forEach(ex => {
    if (ex.type === 'remote-box') {
      svg.appendChild(svgEl('rect', { x: ex.x, y: ex.y, width: '90', height: '22', rx: '2', fill: 'none', stroke: ex.color, 'stroke-width': '1', opacity: '0.6' }));
      const t = svgEl('text', { x: ex.x + 4, y: ex.y + 14, fill: ex.color, 'font-size': '8', 'font-family': 'JetBrains Mono, Courier New', opacity: '0.8' });
      t.textContent = ex.label;
      svg.appendChild(t);
    } else if (ex.type === 'arrow') {
      svg.appendChild(svgEl('line', { x1: ex.x1, y1: ex.y1, x2: ex.x2, y2: ex.y2, stroke: '#3d4943', 'stroke-width': '1', 'stroke-dasharray': '3,3', 'marker-end': 'url(#arr)' }));
    } else if (ex.type === 'staged-indicator') {
      const t = svgEl('text', { x: ex.x, y: ex.y, fill: '#68dbae', 'font-size': '9', 'font-family': 'JetBrains Mono, Courier New' });
      t.textContent = '● changes staged';
      svg.appendChild(t);
    } else if (ex.type === 'dirty-indicator') {
      const t = svgEl('text', { x: ex.x, y: ex.y, fill: '#ffb4ab', 'font-size': '9', 'font-family': 'JetBrains Mono, Courier New' });
      t.textContent = '⚠ working tree dirty';
      svg.appendChild(t);
    } else if (ex.type === 'revert-label') {
      const t = svgEl('text', { x: ex.x - 3, y: ex.y - 14, fill: '#68dbae', 'font-size': '8', 'font-family': 'JetBrains Mono, Courier New', 'text-anchor': 'middle' });
      t.textContent = 'revert↑';
      svg.appendChild(t);
    } else if (ex.type === 'stash-indicator') {
      const t = svgEl('text', { x: ex.x, y: ex.y, fill: '#c8a87a', 'font-size': '9', 'font-family': 'JetBrains Mono, Courier New' });
      t.textContent = '◎ stash@{0}: WIP saved';
      svg.appendChild(t);
    } else if (ex.type === 'conflict-indicator') {
      const t = svgEl('text', { x: ex.x, y: ex.y, fill: '#ffb4ab', 'font-size': '9', 'font-family': 'JetBrains Mono, Courier New' });
      t.textContent = '✕ CONFLICT: entry-tokens.txt';
      svg.appendChild(t);
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════════════════

