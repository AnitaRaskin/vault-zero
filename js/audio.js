// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — AUDIO
// Web Audio API for the police footstep sounds.
// ═══════════════════════════════════════════════════════════════════════

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playFootstep() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const sr  = ctx.sampleRate;
    const now = ctx.currentTime;
    const tbuf = ctx.createBuffer(1, Math.floor(sr * 0.08), sr);
    const td   = tbuf.getChannelData(0);
    for (let i = 0; i < td.length; i++) td[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.018));
    const tsrc = ctx.createBufferSource();
    tsrc.buffer = tbuf;
    const tlpf = ctx.createBiquadFilter();
    tlpf.type = 'lowpass'; tlpf.frequency.value = 160; tlpf.Q.value = 0.5;
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.6, now);
    tsrc.connect(tlpf); tlpf.connect(tg); tg.connect(ctx.destination);
    tsrc.start(now);
    const cbuf = ctx.createBuffer(1, Math.floor(sr * 0.012), sr);
    const cd   = cbuf.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.002));
    const csrc = ctx.createBufferSource();
    csrc.buffer = cbuf;
    const chpf = ctx.createBiquadFilter();
    chpf.type = 'highpass'; chpf.frequency.value = 1500;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.2, now + 0.008);
    csrc.connect(chpf); chpf.connect(cg); cg.connect(ctx.destination);
    csrc.start(now + 0.008);
  } catch(e) {}
}

function stopPoliceAudio() {
  if (footstepId) { clearInterval(footstepId); footstepId = null; }
  voiceTriggered = false;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(e) {}
}
