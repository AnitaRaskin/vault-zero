// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — COMMAND LOG & CHEAT SHEET
// cmdLog accumulates every accepted command for the cheat sheet download.
// ═══════════════════════════════════════════════════════════════════════

let cmdLog = [];

function logCmd(raw) {
  const desc = GAME_CONFIG.cmdDescriptions || {};
  const key  = Object.keys(desc).find(k => raw === k || raw.startsWith(k + ' '));
  if (!key) return;
  if (!cmdLog.find(e => e.cmd === key)) cmdLog.push({ cmd: key, desc: desc[key] });
}

function openCheatSheet() {
  const list = document.getElementById('cheatList');
  list.innerHTML = '';
  if (cmdLog.length === 0) {
    list.innerHTML = '<div class="cheat-empty">no commands logged yet. complete a stage to start building your record.</div>';
  } else {
    cmdLog.forEach(({ cmd, desc }) => {
      const row = document.createElement('div');
      row.className = 'cheat-row';
      row.innerHTML = `<span class="cheat-cmd">${cmd}</span><span class="cheat-desc">${desc}</span>`;
      list.appendChild(row);
    });
  }
  document.getElementById('cheatSheet').classList.add('open');
}

function closeCheatSheet() {
  document.getElementById('cheatSheet').classList.remove('open');
  inp.focus();
}

function downloadCheatSheet() {
  const title    = GAME_CONFIG.cheatSheetTitle    || 'COMMAND RECORD';
  const footer   = GAME_CONFIG.cheatSheetFooter   || '';
  const filename = GAME_CONFIG.cheatSheetFilename  || 'commands.txt';
  const lines    = [title, '═'.repeat(40), ''];
  cmdLog.forEach(({ cmd, desc }) => lines.push(`  ${cmd.padEnd(28)}${desc}`));
  lines.push('', '═'.repeat(40), footer);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
