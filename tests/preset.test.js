'use strict';

/**
 * preset.test.js
 * presetRegistry 단위 테스트
 *
 * 실행: node --test tests/preset.test.js
 */

const { test } = require('node:test');
const assert   = require('node:assert/strict');

const {
  PRESETS,
  resolvePreset,
  listPresets,
  validatePresetTargets,
} = require('../src/init/presetRegistry');

const { VALID_TARGETS } = require('../src/init/targetRegistry');

// ── resolvePreset ────────────────────────────────────────────────────────────

test('resolvePreset: known preset "default" returns object with targets', () => {
  const p = resolvePreset('default');
  assert.ok(p !== null, 'should not be null');
  assert.ok(Array.isArray(p.targets), 'targets should be array');
  assert.ok(p.targets.length > 0, 'targets should not be empty');
  assert.ok(typeof p.description === 'string', 'description should be string');
});

test('resolvePreset: known preset "lean" returns object', () => {
  const p = resolvePreset('lean');
  assert.ok(p !== null);
  assert.ok(p.targets.length > 0);
});

test('resolvePreset: known preset "docs" returns object', () => {
  const p = resolvePreset('docs');
  assert.ok(p !== null);
  assert.ok(p.targets.includes('docs-core'));
});

test('resolvePreset: unknown name returns null', () => {
  assert.strictEqual(resolvePreset('unknown'), null);
  assert.strictEqual(resolvePreset('nonexistent-preset'), null);
});

test('resolvePreset: empty string returns null', () => {
  assert.strictEqual(resolvePreset(''), null);
});

test('resolvePreset: null/undefined returns null', () => {
  assert.strictEqual(resolvePreset(null), null);
  assert.strictEqual(resolvePreset(undefined), null);
});

// ── listPresets ──────────────────────────────────────────────────────────────

test('listPresets: returns at least 3 presets', () => {
  const presets = listPresets();
  assert.ok(presets.length >= 3, `expected >= 3 presets, got ${presets.length}`);
});

test('listPresets: each entry has name, description, targets', () => {
  for (const p of listPresets()) {
    assert.ok(typeof p.name === 'string' && p.name.length > 0, 'name required');
    assert.ok(typeof p.description === 'string' && p.description.length > 0, 'description required');
    assert.ok(Array.isArray(p.targets) && p.targets.length > 0, 'targets required');
  }
});

test('listPresets: includes default, lean, docs', () => {
  const names = listPresets().map(p => p.name);
  assert.ok(names.includes('default'));
  assert.ok(names.includes('lean'));
  assert.ok(names.includes('docs'));
});

// ── target 유효성 ──────────────────────────────────────────────────────────────

test('all preset targets are valid registry targets', () => {
  for (const p of listPresets()) {
    for (const t of p.targets) {
      assert.ok(
        VALID_TARGETS.has(t),
        `preset "${p.name}" has invalid target "${t}"`
      );
    }
  }
});

test('lean has fewer targets than default', () => {
  const def  = resolvePreset('default');
  const lean = resolvePreset('lean');
  assert.ok(
    lean.targets.length < def.targets.length,
    `lean (${lean.targets.length}) should have fewer targets than default (${def.targets.length})`
  );
});

// ── validatePresetTargets ────────────────────────────────────────────────────

test('validatePresetTargets: all valid targets → valid:true, invalid:[]', () => {
  const { valid, invalid } = validatePresetTargets(['claude-root', 'hooks-json', 'docs-core']);
  assert.ok(valid);
  assert.deepEqual(invalid, []);
});

test('validatePresetTargets: one invalid target → valid:false', () => {
  const { valid, invalid } = validatePresetTargets(['claude-root', 'nonexistent-target']);
  assert.ok(!valid);
  assert.deepEqual(invalid, ['nonexistent-target']);
});

test('validatePresetTargets: all invalid → valid:false, all listed', () => {
  const { valid, invalid } = validatePresetTargets(['bad-one', 'bad-two']);
  assert.ok(!valid);
  assert.deepEqual(invalid, ['bad-one', 'bad-two']);
});

test('validatePresetTargets: empty list → valid:true', () => {
  const { valid, invalid } = validatePresetTargets([]);
  assert.ok(valid);
  assert.deepEqual(invalid, []);
});

// ── PRESETS registry 구조 검증 ────────────────────────────────────────────────

test('PRESETS object is not empty', () => {
  assert.ok(Object.keys(PRESETS).length > 0);
});

test('PRESETS keys match listPresets names', () => {
  const registryKeys = Object.keys(PRESETS).sort();
  const listNames    = listPresets().map(p => p.name).sort();
  assert.deepEqual(registryKeys, listNames);
});
