'use strict';

/**
 * init.test.js
 * init command CLI 통합 테스트
 *
 * 실행: node --test tests/init.test.js
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-init-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

function runInit(args, { projectDir } = {}) {
  const finalArgs = projectDir
    ? ['init', '--path', projectDir, ...args]
    : ['init', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

// ── dry-run ─────────────────────────────────────────────────────────────────

test('init --target claude-root --dry-run: exit 0, no files created', () => {
  const dir = makeTempDir();
  const r = runInit(['--target', 'claude-root', '--dry-run'], { projectDir: dir });
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  assert.ok(!fs.existsSync(path.join(dir, '.claude')), '.claude/ should not be created in dry-run');
});

test('init --preset default --dry-run: exit 0, preview output', () => {
  const dir = makeTempDir();
  const r = runInit(['--preset', 'default', '--dry-run'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('dry-run'), r.stdout);
});

// ── 실제 생성 ───────────────────────────────────────────────────────────────

test('init --target claude-root --yes: creates .claude/ directory', () => {
  const dir = makeTempDir();
  const r = runInit(['--target', 'claude-root', '--yes'], { projectDir: dir });
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  assert.ok(fs.existsSync(path.join(dir, '.claude')), '.claude/ should exist');
});

test('init --target hooks-json --yes: creates .claude/hooks.json', () => {
  const dir = makeTempDir();
  const r = runInit(['--target', 'hooks-json', '--yes'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'hooks.json')), 'hooks.json should exist');
});

test('init --targets claude-root,hooks-json --yes: creates both', () => {
  const dir = makeTempDir();
  const r = runInit(['--targets', 'claude-root,hooks-json', '--yes'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.ok(fs.existsSync(path.join(dir, '.claude')));
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'hooks.json')));
});

// ── 안전성: 기존 파일 덮어쓰지 않음 ────────────────────────────────────────

test('init: does not overwrite existing file without --overwrite', () => {
  const dir = makeTempDir();
  // 먼저 생성
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  const hooksPath = path.join(dir, '.claude', 'hooks.json');
  const original = '{"custom": true}';
  fs.writeFileSync(hooksPath, original);

  // init 실행 (--overwrite 없음)
  runInit(['--target', 'hooks-json', '--yes'], { projectDir: dir });

  // 원본 유지 확인
  const content = fs.readFileSync(hooksPath, 'utf8');
  assert.strictEqual(content, original, 'existing file should not be overwritten');
});

test('init: --overwrite replaces existing file', () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  const hooksPath = path.join(dir, '.claude', 'hooks.json');
  fs.writeFileSync(hooksPath, '{"custom": true}');

  runInit(['--target', 'hooks-json', '--yes', '--overwrite'], { projectDir: dir });

  const content = fs.readFileSync(hooksPath, 'utf8');
  assert.notStrictEqual(content, '{"custom": true}', 'file should be overwritten');
});

// ── preset ──────────────────────────────────────────────────────────────────

test('init --preset lean --yes: creates expected structure', () => {
  const dir = makeTempDir();
  const r = runInit(['--preset', 'lean', '--yes'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  // lean preset should at minimum create .claude/
  assert.ok(fs.existsSync(path.join(dir, '.claude')), '.claude/ should exist');
});

// ── unknown preset ──────────────────────────────────────────────────────────

test('init --preset nonexistent: exit 1 with error', () => {
  const dir = makeTempDir();
  const r = runInit(['--preset', 'nonexistent'], { projectDir: dir });
  assert.strictEqual(r.code, 1);
  const combined = r.stdout + r.stderr;
  assert.ok(combined.includes('nonexistent'), combined);
});

// ── unknown target → hint ───────────────────────────────────────────────────

test('init --target docs-cor --yes: suggests "docs-core"', () => {
  const dir = makeTempDir();
  const r = runInit(['--target', 'docs-cor', '--yes'], { projectDir: dir });
  const combined = r.stdout + r.stderr;
  assert.ok(combined.includes('did you mean'), `expected typo hint: ${combined}`);
});

// ── conflict: --preset + --recommended ──────────────────────────────────────

test('init --preset default --recommended: exit 1 (conflict)', () => {
  const dir = makeTempDir();
  const r = runInit(['--preset', 'default', '--recommended'], { projectDir: dir });
  assert.strictEqual(r.code, 1);
});

// ── --recommended ───────────────────────────────────────────────────────────

test('init --recommended --yes: applies recommendations on empty dir', () => {
  const dir = makeTempDir();
  const r = runInit(['--recommended', '--yes'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  // At minimum, .claude/ should be created
  assert.ok(fs.existsSync(path.join(dir, '.claude')), '.claude/ should be created from recommendations');
});
