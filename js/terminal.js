// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — TERMINAL I/O
// DOM references for the terminal panel, print helpers, foxMsg typewriter,
// and the flash animation. Loaded after state.js and hashes.js.
// ═══════════════════════════════════════════════════════════════════════

const out = document.getElementById('termOut');
const inp = document.getElementById('termInput');

function tprint(lines) {
  if (typeof lines === 'string') lines = [[lines, '']];
  lines.forEach(([text, cls]) => {
    const d = document.createElement('div');
    d.className  = 't ' + (cls || '');
    d.textContent = interp(text);
    out.appendChild(d);
  });
  out.scrollTop = out.scrollHeight;
}

function tcmd(cmd) {
  const d = document.createElement('div');
  d.className  = 't cmd';
  d.textContent = '$ ' + cmd;
  out.appendChild(d);
  out.scrollTop = out.scrollHeight;
}

function getMissionTime() {
  const elapsed = Math.floor((Date.now() - (G.missionStart || Date.now())) / 1000);
  const base = 2 * 3600 + elapsed;
  const h = Math.floor(base / 3600) % 24;
  const m = Math.floor((base % 3600) / 60);
  const s = base % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function foxMsg(text, type) {
  const wrap = document.getElementById('foxMessages');
  const row  = document.createElement('div');
  row.className = 'fox-msg-row';
  const ts  = document.createElement('span');
  ts.className  = 'fox-ts';
  ts.textContent = getMissionTime();
  const msg = document.createElement('div');
  msg.className  = 'fox-msg' + (type === 'sys' ? ' sys' : '');
  row.appendChild(ts);
  row.appendChild(msg);
  wrap.appendChild(row);
  const fullText = `[${window.HANDLER_NAME || 'fox'}] > ${interp(text)}`;
  let i = 0;
  function next() {
    if (i < fullText.length) { msg.textContent += fullText[i++]; wrap.scrollTop = wrap.scrollHeight; setTimeout(next, 16); }
  }
  next();
}

function flashTerminal() {
  const el = document.getElementById('termOut');
  el.classList.remove('err-flash');
  void el.offsetWidth;
  el.classList.add('err-flash');
  setTimeout(() => el.classList.remove('err-flash'), 500);
}
