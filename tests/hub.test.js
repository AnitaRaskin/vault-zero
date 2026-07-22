import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dir = dirname(fileURLToPath(import.meta.url));
const html  = readFileSync(resolve(__dir, '../index.html'), 'utf8');
const { document } = new JSDOM(html).window;

// ─── helpers ──────────────────────────────────────────────────────────

function text(selector) {
  return document.querySelector(selector)?.textContent?.trim() ?? null;
}
function attr(selector, attribute) {
  return document.querySelector(selector)?.getAttribute(attribute) ?? null;
}
function count(selector) {
  return document.querySelectorAll(selector).length;
}


// ─── page shell ───────────────────────────────────────────────────────

describe('Page shell', () => {
  test('title contains VAULT_ZERO', () => {
    assert.match(document.title, /VAULT_ZERO/);
  });
  test('has a top-bar brand element containing VAULT_ZERO', () => {
    assert.match(text('.hub-topbar-brand') ?? '', /VAULT_ZERO/);
  });
  test('hero heading contains "Command Hub"', () => {
    assert.match(text('.hub-hero-title') ?? '', /Command Hub/i);
  });
  test('hero tag element exists for typing animation', () => {
    assert.ok(document.getElementById('heroTag'), '#heroTag missing');
  });
  test('telemetry clock element exists', () => {
    assert.ok(document.getElementById('teleClock'), '#teleClock missing');
  });
  test('footer exists and has copyright text', () => {
    assert.ok(document.querySelector('footer'), 'footer element missing');
    assert.match(text('footer') ?? '', /GLOBAL INTELLIGENCE COMMAND|VAULT_ZERO|©/i);
  });
});


// ─── hero stats ───────────────────────────────────────────────────────

describe('Hero stats', () => {
  test('shows exactly 2 stat numbers', () => {
    assert.equal(count('.hub-stat-num'), 2);
  });
  test('shows 2 missions', () => {
    const nums = [...document.querySelectorAll('.hub-stat-num')].map(el => el.textContent.trim());
    assert.ok(nums.includes('2'), `expected "2" in stat numbers, got: ${nums}`);
  });
  test('stat labels include "Missions" and "Active"', () => {
    const labels = [...document.querySelectorAll('.hub-stat-label')].map(el => el.textContent.trim());
    assert.ok(labels.some(l => /missions/i.test(l)), `"Missions" not in labels: ${labels}`);
    assert.ok(labels.some(l => /active/i.test(l)),   `"Active" not in labels: ${labels}`);
  });
});


// ─── mission cards (gic-card layout) ─────────────────────────────────

describe('Mission cards', () => {
  test('exactly 2 mission cards', () => {
    assert.equal(count('.gic-card'), 2);
  });
  test('both cards are anchor links', () => {
    const cards = [...document.querySelectorAll('.gic-card')];
    cards.forEach((c, i) => assert.equal(c.tagName, 'A', `card ${i} is not an <a> tag`));
  });
});


// ─── Mission 001: Git Heist ───────────────────────────────────────────

describe('Mission 001 — Git Heist card', () => {
  const card = () => document.querySelectorAll('.gic-card')[0];

  test('card 1 links to git-heist.html', () => {
    assert.match(card()?.getAttribute('href') ?? '', /git-heist/);
  });
  test('shows MISSION_001 chip', () => {
    assert.match(card()?.querySelector('.gic-chip')?.textContent ?? '', /MISSION_001/);
  });
  test('card name includes "Git Heist"', () => {
    assert.match(card()?.querySelector('.gic-card-name')?.textContent ?? '', /Git Heist/i);
  });
  test('badge shows ACTIVE', () => {
    assert.match(card()?.querySelector('.gic-card-badge')?.textContent ?? '', /ACTIVE/i);
  });
  test('footer meta mentions rooms', () => {
    assert.match(card()?.querySelector('.gic-meta')?.textContent ?? '', /rooms/i);
  });
  test('CTA says "DEPLOY MISSION"', () => {
    assert.match(card()?.querySelector('.gic-deploy')?.textContent ?? '', /DEPLOY MISSION/i);
  });
  test('preview terminal shows a git log command', () => {
    assert.match(card()?.querySelector('.gic-vis-cmd')?.textContent ?? '', /git log/i);
  });
});


// ─── Mission 002: Operation Nightshade ───────────────────────────────

describe('Mission 002 — Nightshade card', () => {
  const card = () => document.querySelectorAll('.gic-card')[1];

  test('card 2 links to nightshade.html', () => {
    assert.match(card()?.getAttribute('href') ?? '', /nightshade/);
  });
  test('shows MISSION_002 chip', () => {
    assert.match(card()?.querySelector('.gic-chip')?.textContent ?? '', /MISSION_002/);
  });
  test('card name includes "Nightshade"', () => {
    assert.match(card()?.querySelector('.gic-card-name')?.textContent ?? '', /Nightshade/i);
  });
  test('footer meta mentions 6 rooms', () => {
    assert.match(card()?.querySelector('.gic-meta')?.textContent ?? '', /6 rooms/i);
  });
  test('preview terminal shows a git reflog command', () => {
    assert.match(card()?.querySelector('.gic-vis-cmd')?.textContent ?? '', /git reflog/i);
  });
  test('CTA says "DEPLOY MISSION"', () => {
    assert.match(card()?.querySelector('.gic-deploy')?.textContent ?? '', /DEPLOY MISSION/i);
  });
});


// ─── inline JS hooks ──────────────────────────────────────────────────

describe('Inline script elements', () => {
  test('clock targets #teleClock', () => {
    const scripts = [...document.querySelectorAll('script')]
      .map(s => s.textContent).join('');
    assert.match(scripts, /teleClock/);
  });
  test('heroTag is referenced in scripts', () => {
    const scripts = [...document.querySelectorAll('script')]
      .map(s => s.textContent).join('');
    assert.match(scripts, /heroTag/);
  });
});
