'use strict';

/**
 * check.test.js
 * check command 단위 + CLI 통합 테스트
 *
 * 실행: node --test tests/check.test.js
 */

const { test, after } = require('node:test');
const assert          = require('node:assert/strict');
const { spawnSync }   = require('child_process');
const os              = require('os');
const path            = require('path');
const fs              = require('fs');

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli', 'index.js');

// ── 헬퍼 ────────────────────────────────────────────────────────────────────

const tmpDirs = [];

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-check-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

function runCheck(args = [], { cwd } = {}) {
  const r = spawnSync(process.execPath, [CLI_PATH, 'check', ...args], {
    encoding: 'utf8',
    cwd: cwd || process.cwd(),
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

// ── 단위: CheckerRunner ─────────────────────────────────────────────────────

const { CheckerRunner } = require('../src/core/checker');

test('CheckerRunner: empty runner returns empty results', async () => {
  const runner = new CheckerRunner();
  const results = await runner.run('/nonexistent');
  assert.deepEqual(results, []);
});

test('CheckerRunner: registered check runs and returns result', async () => {
  const runner = new CheckerRunner();
  runner.register({
    id: 'test.example',
    title: 'test check',
    severity: 'warning',
    async run() { return { status: 'pass', message: 'ok' }; },
  });
  const results = await runner.run('/tmp');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].id, 'test.example');
  assert.strictEqual(results[0].status, 'pass');
  assert.strictEqual(results[0].category, 'test');
});

test('CheckerRunner: severity is included in results', async () => {
  const runner = new CheckerRunner();
  runner.register({
    id: 'sev.hard',
    title: 'hard check',
    severity: 'error',
    async run() { return { status: 'fail', message: 'missing' }; },
  });
  const results = await runner.run('/tmp');
  assert.strictEqual(results[0].severity, 'error');
});

test('CheckerRunner: exception in checker produces fail result', async () => {
  const runner = new CheckerRunner();
  runner.register({
    id: 'err.crash',
    title: 'crash check',
    severity: 'error',
    async run() { throw new Error('boom'); },
  });
  const results = await runner.run('/tmp');
  assert.strictEqual(results[0].status, 'fail');
  assert.strictEqual(results[0].message, 'boom');
  assert.strictEqual(results[0].severity, 'error');
});

// ── 단위: DEFAULT_CHECKERS ──────────────────────────────────────────────────

const { DEFAULT_CHECKERS } = require('../src/checkers/index');

test('DEFAULT_CHECKERS: has 16 checkers', () => {
  assert.strictEqual(DEFAULT_CHECKERS.length, 16);
});

test('DEFAULT_CHECKERS: each checker has id, title, severity, run', () => {
  for (const c of DEFAULT_CHECKERS) {
    assert.ok(typeof c.id === 'string' && c.id.length > 0, `missing id`);
    assert.ok(typeof c.title === 'string', `missing title for ${c.id}`);
    assert.ok(['error', 'warning'].includes(c.severity), `bad severity for ${c.id}: ${c.severity}`);
    assert.ok(typeof c.run === 'function', `missing run for ${c.id}`);
  }
});

test('DEFAULT_CHECKERS: exactly 2 hard checks (severity error)', () => {
  const hard = DEFAULT_CHECKERS.filter(c => c.severity === 'error');
  assert.strictEqual(hard.length, 2);
  const ids = hard.map(c => c.id).sort();
  assert.deepEqual(ids, ['config.claude-md', 'structure.claude-root']);
});

// ── CLI 통합: 정상 프로젝트 ─────────────────────────────────────────────────

test('check: healthy project → exit 0', () => {
  const r = runCheck(['--path', '.']);
  assert.strictEqual(r.code, 0, `expected exit 0, got ${r.code}\n${r.stderr}`);
});

test('check: healthy project → output contains HEALTHY', () => {
  const r = runCheck(['--path', '.']);
  assert.ok(r.stdout.includes('HEALTHY'), r.stdout);
});

test('check: healthy project → 16 PASS', () => {
  const r = runCheck(['--path', '.']);
  assert.ok(r.stdout.includes('PASS 16'), r.stdout);
});

// ── CLI 통합: 빈 디렉터리 (hard fail) ───────────────────────────────────────

test('check: empty dir → exit 1 (hard fail)', () => {
  const dir = makeTempDir();
  const r = runCheck(['--path', dir]);
  assert.strictEqual(r.code, 1, `expected exit 1, got ${r.code}`);
});

test('check: empty dir → output contains FAILED', () => {
  const dir = makeTempDir();
  const r = runCheck(['--path', dir]);
  assert.ok(r.stdout.includes('FAILED'), r.stdout);
});

test('check: empty dir → FAIL count >= 2', () => {
  const dir = makeTempDir();
  const r = runCheck(['--path', dir]);
  // "FAIL 2" in the summary line
  const match = r.stdout.match(/FAIL\s+(\d+)/);
  assert.ok(match, 'expected FAIL count in output');
  assert.ok(parseInt(match[1], 10) >= 2, `expected >= 2 FAIL, got ${match[1]}`);
});

// ── CLI 통합: soft-only fail (WARN만 있고 hard fail 없음) → exit 0 ─────────

test('check: dir with .claude/ and CLAUDE.md only → exit 0 (soft warns only)', () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Project\n');
  const r = runCheck(['--path', dir]);
  assert.strictEqual(r.code, 0, `soft warns should not trigger exit 1\n${r.stdout}`);
});

// ── CLI 통합: 추천 출력 ─────────────────────────────────────────────────────

test('check: empty dir → shows recommendations', () => {
  const dir = makeTempDir();
  const r = runCheck(['--path', dir]);
  assert.ok(r.stdout.includes('추천'), r.stdout);
});
