// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — POLICE MECHANIC
// Wrong-answer accumulator, countdown timer, audio cues, vignette.
// Depends on: state.js, audio.js, terminal.js, score.js.
// ═══════════════════════════════════════════════════════════════════════

const POLICE_SECONDS        = 30;
const POLICE_TRIGGER_WRONGS = 3;

let policeActive      = false;
let policeSecondsLeft = 0;
let policeIntervalId  = null;
let footstepId        = null;
let voiceTriggered    = false;

function countWrong() {
  G.stageWrongs++;
  if (G.stageWrongs >= 2) addScore(-1);
  if (G.stageWrongs === POLICE_TRIGGER_WRONGS) triggerPolice();
}

function triggerPolice(skipMsg) {
  if (policeActive) return;
  policeActive      = true;
  policeSecondsLeft = POLICE_SECONDS;
  voiceTriggered    = false;
  if (!skipMsg) {
    const warnings = (GAME_CONFIG.policeWarnings || []);
    const msg      = warnings[G.stageWrongs % warnings.length] || '';
    if (msg) setTimeout(() => foxMsg(msg, 'sys'), 100);
  }
  const alertEl = document.getElementById('policeAlert');
  alertEl.classList.add('active');
  alertEl.classList.remove('urgent-mode');
  document.querySelector('.terminal-panel').classList.add('police-active');
  document.querySelector('.terminal-panel').classList.remove('police-urgent');
  document.getElementById('policeVignette').classList.remove('active');
  updatePoliceUI();
  policeIntervalId = setInterval(() => {
    policeSecondsLeft--;
    updatePoliceUI();
    if (policeSecondsLeft <= 0) policeRaid();
  }, 1000);
}

function clearPolice(silent) {
  if (!policeActive) return;
  policeActive = false;
  clearInterval(policeIntervalId);
  policeIntervalId = null;
  stopPoliceAudio();
  const alertEl = document.getElementById('policeAlert');
  alertEl.classList.remove('active', 'urgent-mode');
  document.getElementById('policeVignette').classList.remove('active');
  document.querySelector('.terminal-panel').classList.remove('police-active', 'police-urgent');
  if (!silent) setTimeout(() => foxMsg('clean. they moved on.', 'sys'), 200);
}

function policeRaid() {
  clearPolice(true);
  addScore(-10);
  setTimeout(() => foxMsg("too slow. they logged the attempt. we took a hit.", 'sys'), 100);
}

function updatePoliceUI() {
  const countdownEl = document.getElementById('policeCountdown');
  const fillEl      = document.getElementById('policeBarFill');
  const alertEl     = document.getElementById('policeAlert');
  const vigEl       = document.getElementById('policeVignette');
  const termEl      = document.querySelector('.terminal-panel');
  if (!countdownEl || !fillEl) return;
  const s      = policeSecondsLeft;
  const urgent = s <= 10;
  countdownEl.textContent = '0:' + String(s).padStart(2, '0');
  fillEl.style.width      = ((s / POLICE_SECONDS) * 100) + '%';
  countdownEl.classList.toggle('urgent', urgent);
  alertEl.classList.toggle('urgent-mode', urgent);
  vigEl.classList.toggle('active', urgent);
  termEl.classList.toggle('police-urgent', urgent);
  if (urgent && !footstepId) {
    footstepId = setInterval(() => { if (policeActive) playFootstep(); }, 550);
  }
  if (s === 6 && !voiceTriggered) {
    voiceTriggered = true;
    try {
      if (window.speechSynthesis) {
        const utt  = new SpeechSynthesisUtterance("who's there?");
        utt.volume = 0.85; utt.rate = 0.75; utt.pitch = 0.6;
        window.speechSynthesis.speak(utt);
      }
    } catch(e) {}
  }
}
