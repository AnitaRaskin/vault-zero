import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── jsdom setup ──────────────────────────────────────────────────────
// Minimal DOM — nightshade data/config tests need no real DOM elements.

let ROOMS, GAME_CONFIG;

before(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    runScripts: 'dangerously',
    url:        'http://localhost/',
  });

  const win = dom.window;

  const inject = (file, bridge) => {
    const s = win.document.createElement('script');
    s.textContent = readFileSync(resolve(__dir, '..', file), 'utf8') + '\n' + bridge;
    win.document.head.appendChild(s);
  };

  inject('missions/nightshade/config.js', `
    window._GAME_CONFIG = GAME_CONFIG;
  `);

  inject('missions/nightshade/data.js', `
    window._ROOMS = ROOMS;
  `);

  ROOMS       = win._ROOMS;
  GAME_CONFIG = win._GAME_CONFIG;
});


// ─── ROOMS data integrity ─────────────────────────────────────────────

describe('Nightshade ROOMS data integrity', () => {
  test('exactly 6 rooms', () => {
    assert.equal(ROOMS.length, 6);
  });
  test('ids are sequential from 0', () => {
    ROOMS.forEach((r, i) => assert.equal(r.id, i, `Room at index ${i} has id ${r.id}`));
  });
  test('room count matches last room id + 1', () => {
    assert.equal(ROOMS.length, ROOMS[ROOMS.length - 1].id + 1);
  });
  test('every room has a non-empty name', () => {
    ROOMS.forEach(r => assert.ok(r.name?.length > 0, `Room ${r.id} missing name`));
  });
  test('every room has a non-empty stages array', () => {
    ROOMS.forEach(r => assert.ok(Array.isArray(r.stages) && r.stages.length > 0, `Room ${r.id}`));
  });
  test('every room has a non-empty hints array', () => {
    ROOMS.forEach(r => assert.ok(Array.isArray(r.hints) && r.hints.length > 0, `Room ${r.id}`));
  });
  test('hints.length matches stages.length in every room', () => {
    ROOMS.forEach(r => assert.equal(r.hints.length, r.stages.length,
      `Room ${r.id} "${r.name}": ${r.hints.length} hint sets vs ${r.stages.length} stages`));
  });
  test('every hint set has exactly 3 levels', () => {
    ROOMS.forEach(r => r.hints.forEach((h, si) =>
      assert.equal(h.length, 3, `Room ${r.id} stage ${si}: ${h.length} hint levels`)));
  });
  test('every stage has a path to advance (accepted, flex flag, or auto fileEdit)', () => {
    ROOMS.forEach(r => r.stages.forEach((s, si) => {
      const hasAccepted  = Array.isArray(s.accepted) && s.accepted.length > 0;
      const isFlex       = s.flexCommit || s.flexStashPop;
      // fileEdit stages with no accepted array auto-advance via saveFile() on success
      const isAutoEditor = s.fileEdit && (!s.accepted || s.accepted.length === 0);
      assert.ok(hasAccepted || isFlex || isAutoEditor,
        `Room ${r.id} stage ${si}: no accepted, no flex flag, and not an auto-advancing fileEdit stage`);
    }));
  });
  test('every stage has foxMsg or foxMessage', () => {
    ROOMS.forEach(r => r.stages.forEach((s, si) =>
      assert.ok(s.foxMsg || s.foxMessage, `Room ${r.id} stage ${si} missing fox message`)));
  });
  test('every room has a clue with label and value', () => {
    ROOMS.forEach(r => {
      assert.ok(r.clue?.label?.length > 0, `Room ${r.id} missing clue.label`);
      assert.ok(r.clue?.value?.length > 0, `Room ${r.id} missing clue.value`);
    });
  });
  test('all clue labels are unique', () => {
    const labels = ROOMS.map(r => r.clue.label);
    assert.equal(new Set(labels).size, labels.length, `duplicate clue labels: ${labels}`);
  });
  test('every room has an intro string', () => {
    ROOMS.forEach(r => assert.ok(typeof r.intro === 'string' && r.intro.length > 0, `Room ${r.id} missing intro`));
  });
  test('every room with a fileEdit stage has a fileName', () => {
    ROOMS.forEach(r => r.stages.forEach((s, si) => {
      if (s.fileEdit) assert.ok(s.fileName?.length > 0, `Room ${r.id} stage ${si}: fileEdit with no fileName`);
    }));
  });
});


// ─── Quiz pool integrity ──────────────────────────────────────────────

describe('Nightshade quiz pool data integrity', () => {
  test('CMD_QUIZ_POOL: every entry has required fields', () => {
    Object.entries(GAME_CONFIG.cmdQuizPool).forEach(([cmd, q]) => {
      assert.ok(typeof q.q       === 'string', `${cmd}: missing q`);
      assert.ok(Array.isArray(q.options),      `${cmd}: missing options`);
      assert.ok(typeof q.correct === 'number', `${cmd}: correct not a number`);
      assert.ok(typeof q.explain === 'string', `${cmd}: missing explain`);
    });
  });
  test('CMD_QUIZ_POOL: correct index is in bounds for every entry', () => {
    Object.entries(GAME_CONFIG.cmdQuizPool).forEach(([cmd, q]) =>
      assert.ok(q.correct >= 0 && q.correct < q.options.length,
        `${cmd}: correct=${q.correct} but ${q.options.length} options`));
  });
  test('CMD_QUIZ_POOL: all keys appear in cmdDescriptions', () => {
    Object.keys(GAME_CONFIG.cmdQuizPool).forEach(key =>
      assert.ok(key in GAME_CONFIG.cmdDescriptions,
        `quiz pool key "${key}" not in cmdDescriptions`));
  });
  test('STATIC_QUIZ: all entries have required fields', () => {
    GAME_CONFIG.staticQuiz.forEach((q, i) => {
      assert.ok(typeof q.q       === 'string', `static[${i}]: missing q`);
      assert.ok(Array.isArray(q.options),      `static[${i}]: missing options`);
      assert.ok(typeof q.correct === 'number', `static[${i}]: correct not a number`);
      assert.ok(typeof q.explain === 'string', `static[${i}]: missing explain`);
    });
  });
  test('STATIC_QUIZ: every correct index is in bounds', () => {
    GAME_CONFIG.staticQuiz.forEach((q, i) =>
      assert.ok(q.correct >= 0 && q.correct < q.options.length,
        `static[${i}]: correct=${q.correct} out of ${q.options.length}`));
  });
  test('at least 5 static quiz questions', () => {
    assert.ok(GAME_CONFIG.staticQuiz.length >= 5,
      `expected >= 5 static questions, got ${GAME_CONFIG.staticQuiz.length}`);
  });
});


// ─── validateFile() ───────────────────────────────────────────────────

describe('Nightshade validateFile() — conflict resolution', () => {
  const validate = (val) => GAME_CONFIG.validateFile(val, true);

  test('conflict markers present → pass:false', () => {
    const r = validate('<<<<<<< HEAD\nFORMAT: aes-256-enc\n=======\nFORMAT: plaintext\n>>>>>>> nightshade/inject');
    assert.equal(r.pass, false);
    const text = r.output.map(([t]) => t).join(' ');
    assert.match(text, /marker/i);
  });
  test('only ======= marker present → pass:false', () => {
    const r = validate('some text\n=======\nsome text');
    assert.equal(r.pass, false);
  });
  test('nightshade block still present (EXPORT_ENABLED: true) → pass:false', () => {
    const r = validate('FORMAT: aes-256-enc\nEXPORT_ENABLED: true\nEXFIL_TARGET: none');
    assert.equal(r.pass, false);
    const text = r.output.map(([t]) => t).join(' ');
    assert.match(text, /NIGHTSHADE/i);
  });
  test('darknet exfil target present → pass:false', () => {
    const r = validate('FORMAT: aes-256-enc\nEXPORT_ENABLED: false\nEXFIL_TARGET: darknet://mirror-01.onion:9001');
    assert.equal(r.pass, false);
  });
  test('clean HEAD version preserved → pass:true', () => {
    const clean = 'ATLAS_ASSET_REGISTRY v4.7\nCLASSIFICATION: TOP_SECRET/SCI\nFORMAT: aes-256-enc\nEXPORT_ENABLED: false\nEXFIL_TARGET: none\nARCHIVE_DATE: 2024-03-15';
    const r = validate(clean);
    assert.equal(r.pass, true);
  });
  test('clean resolve output mentions assets.enc saved', () => {
    const clean = 'FORMAT: aes-256-enc\nEXPORT_ENABLED: false\nEXFIL_TARGET: none';
    const r = validate(clean);
    const text = r.output.map(([t]) => t).join(' ');
    assert.match(text, /saved|resolved/i);
  });
  test('wrong content without markers or nightshade block → pass:false', () => {
    const r = validate('totally wrong content here');
    assert.equal(r.pass, false);
  });
  test('non-conflict mode → pass:false with unexpected error', () => {
    const r = GAME_CONFIG.validateFile('anything', false);
    assert.equal(r.pass, false);
  });
});


// ─── activeBranchLabel() ─────────────────────────────────────────────

describe('Nightshade activeBranchLabel()', () => {
  const label = (key) => GAME_CONFIG.activeBranchLabel(key);

  test('n1_evidence key → forensics/cardinal-evidence branch', () => {
    assert.equal(label('n1_evidence'), 'forensics/cardinal-evidence');
  });
  test('n1_detached key → forensics/cardinal-evidence branch', () => {
    assert.equal(label('n1_detached'), 'forensics/cardinal-evidence');
  });
  test('main/other keys → local/main', () => {
    assert.equal(label('n0_initial'),   'local/main');
    assert.equal(label('n2_conflict'),  'local/main');
    assert.equal(label(null),           'local/main');
  });
});


// ─── securityLayerLabel() ────────────────────────────────────────────

describe('Nightshade securityLayerLabel()', () => {
  const label = (b, p) => GAME_CONFIG.securityLayerLabel(b, p);

  test('bypassed=0: no cleared rooms, active is CONTAINMENT', () => {
    assert.match(label(0, 1), /CONTAINMENT/);
    assert.match(label(0, 1), /none/i);
  });
  test('bypassed=1: cleared shows CONTAINMENT, active is DEAD RECKONING', () => {
    const s = label(1, 2);
    assert.match(s, /CONTAINMENT/);
    assert.match(s, /DEAD RECKONING/);
  });
  test('bypassed=5: last room cleared, active is DEAD DROP', () => {
    assert.match(label(5, 6), /DEAD DROP/);
  });
  test('bypassed=6: all rooms done → COMPLETE', () => {
    assert.match(label(6, 7), /COMPLETE/);
  });
});
