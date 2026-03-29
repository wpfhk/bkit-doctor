'use strict';

/**
 * preset-command.test.js
 * preset list / show CLI 통합 테스트 + presetRegistry getPreset 단위 테스트
 *
 * 실행: node --test tests/preset-command.test.js
 */

const { test }  = require('node:test');
const assert    = require('node:assert/strict');
const { spawnSync } = require('child_process');
const path      = require('path');

const CLI_PATH  = path.join(__dirname, '..', 'src', 'cli', 'index.js');

function runCLI(args) {
  const r = spawnSync(process.execPath, [CLI_PATH, ...args], { encoding: 'utf8' });
  return {
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    code:   r.status ?? 1,
  };
}

// ── getPreset 단위 테스트 ────────────────────────────────────────────────────

const { getPreset } = require('../src/init/presetRegistry');

test('getPreset: returns object with name field', () => {
  const p = getPreset('default');
  assert.ok(p !== null);
  assert.strictEqual(p.name, 'default');
  assert.ok(Array.isArray(p.targets));
  assert.ok(typeof p.description === 'string');
});

test('getPreset: unknown returns null', () => {
  assert.strictEqual(getPreset('nonexistent'), null);
  assert.strictEqual(getPreset(''), null);
  assert.strictEqual(getPreset(null), null);
});

test('getPreset: name field matches lookup key', () => {
  for (const name of ['default', 'lean', 'docs']) {
    const p = getPreset(name);
    assert.strictEqual(p.name, name);
  }
});

// ── preset list ──────────────────────────────────────────────────────────────

test('preset list: exit code 0', () => {
  const r = runCLI(['preset', 'list']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('preset list: shows "available presets"', () => {
  const r = runCLI(['preset', 'list']);
  assert.ok(r.stdout.includes('available presets'), r.stdout);
});

test('preset list: contains default preset', () => {
  const r = runCLI(['preset', 'list']);
  assert.ok(r.stdout.includes('default'), r.stdout);
});

test('preset list: contains lean preset', () => {
  const r = runCLI(['preset', 'list']);
  assert.ok(r.stdout.includes('lean'), r.stdout);
});

test('preset list: contains docs preset', () => {
  const r = runCLI(['preset', 'list']);
  assert.ok(r.stdout.includes('docs'), r.stdout);
});

test('preset list: shows usage hint', () => {
  const r = runCLI(['preset', 'list']);
  assert.ok(r.stdout.includes('init --preset'), r.stdout);
});

// ── preset show ──────────────────────────────────────────────────────────────

test('preset show default: exit code 0', () => {
  const r = runCLI(['preset', 'show', 'default']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('preset show default: includes preset name', () => {
  const r = runCLI(['preset', 'show', 'default']);
  assert.ok(r.stdout.includes('default'), r.stdout);
});

test('preset show default: includes description', () => {
  const r = runCLI(['preset', 'show', 'default']);
  assert.ok(r.stdout.includes('description'), r.stdout);
});

test('preset show default: includes targets label', () => {
  const r = runCLI(['preset', 'show', 'default']);
  assert.ok(r.stdout.includes('targets'), r.stdout);
});

test('preset show default: includes apply hint', () => {
  const r = runCLI(['preset', 'show', 'default']);
  assert.ok(r.stdout.includes('init --preset default'), r.stdout);
});

test('preset show lean: exit code 0', () => {
  const r = runCLI(['preset', 'show', 'lean']);
  assert.strictEqual(r.code, 0);
});

test('preset show lean: targets include agents-core', () => {
  const r = runCLI(['preset', 'show', 'lean']);
  assert.ok(r.stdout.includes('agents-core'), r.stdout);
});

// ── preset show unknown ───────────────────────────────────────────────────────

test('preset show unknown: non-zero exit code', () => {
  const r = runCLI(['preset', 'show', 'unknown']);
  assert.ok(r.code !== 0, `expected non-zero exit, got ${r.code}`);
});

test('preset show unknown: error message in output', () => {
  const r = runCLI(['preset', 'show', 'unknown']);
  const combined = r.stdout + r.stderr;
  assert.ok(/unknown preset/i.test(combined), combined);
});

test('preset show unknown: lists available presets in error', () => {
  const r = runCLI(['preset', 'show', 'unknown']);
  const combined = r.stdout + r.stderr;
  assert.ok(combined.includes('default'), combined);
});

// ── regression: init --preset still works ────────────────────────────────────

test('init --preset default --dry-run: exit code 0', () => {
  const r = runCLI(['init', '--preset', 'default', '--dry-run']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('init --preset lean --dry-run: exit code 0', () => {
  const r = runCLI(['init', '--preset', 'lean', '--dry-run']);
  assert.strictEqual(r.code, 0);
});

test('init --preset unknown: non-zero exit code', () => {
  const r = runCLI(['init', '--preset', 'unknown']);
  assert.ok(r.code !== 0);
});

// ── regression: init --recommended unaffected ────────────────────────────────

test('init --recommended --dry-run: exit code 0 (no regression)', () => {
  const r = runCLI(['init', '--recommended', '--dry-run']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});
