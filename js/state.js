// ═══════════════════════════════════════════════════════════════════════
// VAULT ZERO — GLOBAL GAME STATE
// G is the single source of truth for all mutable game state.
// room() and stage() are the primary accessors used throughout the engine.
// ═══════════════════════════════════════════════════════════════════════

const G = {
  roomIdx:        0,
  stageIdx:       0,
  hintsUsed:      0,
  totalHints:     0,
  hintLevel:      0,
  roomStart:      0,
  missionStart:   0,
  fileEditDone:   false,
  score:          0,
  stageWrongs:    0,
  stageHintLevel: -1,
  clues:          [],
  savedProgress:  JSON.parse(localStorage.getItem('vz_progress') || '{}'),
  userId:         null,
  isAuthenticated: false,
  isAdmin:        false
};

function room()  { return ROOMS[G.roomIdx]; }
function stage() { return room().stages[G.stageIdx]; }
