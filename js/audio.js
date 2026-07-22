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

function playAlert() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [0, 0.12].forEach(offset => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now + offset);
      osc.frequency.setValueAtTime(900,  now + offset + 0.04);
      env.gain.setValueAtTime(0,    now + offset);
      env.gain.linearRampToValueAtTime(0.12, now + offset + 0.01);
      env.gain.setValueAtTime(0.12, now + offset + 0.07);
      env.gain.linearRampToValueAtTime(0,    now + offset + 0.1);
      osc.connect(env); env.connect(ctx.destination);
      osc.start(now + offset); osc.stop(now + offset + 0.11);
    });
  } catch(e) {}
}

function playPulse() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.35);
    env.gain.setValueAtTime(0,    now);
    env.gain.linearRampToValueAtTime(0.18, now + 0.05);
    env.gain.setValueAtTime(0.18, now + 0.22);
    env.gain.linearRampToValueAtTime(0,    now + 0.45);
    osc.connect(env); env.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.46);
  } catch(e) {}
}

function stopPoliceAudio() {
  if (footstepId) { clearInterval(footstepId); footstepId = null; }
  voiceTriggered = false;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(e) {}
}
