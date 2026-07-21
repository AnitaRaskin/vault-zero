// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — SESSION HASHES
// H[1]–H[8] replace {{H1}}–{{H8}} placeholders in data.js at runtime,
// giving every session unique "commit IDs".
// ═══════════════════════════════════════════════════════════════════════

function genHash() {
  const chars = '0123456789abcdef';
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const H = [''].concat(Array.from({ length: 8 }, genHash));

function interp(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\{\{H1\}\}/g, H[1]).replace(/\{\{H2\}\}/g, H[2])
    .replace(/\{\{H3\}\}/g, H[3]).replace(/\{\{H4\}\}/g, H[4])
    .replace(/\{\{H5\}\}/g, H[5]).replace(/\{\{H6\}\}/g, H[6])
    .replace(/\{\{H7\}\}/g, H[7]).replace(/\{\{H8\}\}/g, H[8]);
}
