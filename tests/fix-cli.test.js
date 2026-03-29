'use strict';

/**
 * fix-cli.test.js
 * fix command CLI 통합 테스트
 *
 * 실행: node --test tests/fix-cli.test.js
 *
 * 기존 fix.test.js는 resolveFixTargets 단위 테스트.
 * 이 파일은 fix CLI 명령의 end-to-end 동작을 검증한다.
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-fixcli-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

function runFix(args, { projectDir } = {}) {
  const finalArgs = projectDir
    ? ['fix', '--path', projectDir, ...args]
    : ['fix', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

function runCheck(args, { projectDir } = {}) {
  const finalArgs = projectDir
    ? ['check', '--path', projectDir, ...args]
    : ['check', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

// ── dry-run ─────────────────────────────────────────────────────────────────

test('fix --dry-run: exit 0, no files changed', () => {
  const dir = makeTempDir();
  const r = runFix(['--dry-run'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('dry-run'), r.stdout);
  assert.ok(!fs.existsSync(path.join(dir, '.claude')), '.claude/ should not be created in dry-run');
});

// ── fix --yes: 실제 보정 ────────────────────────────────────────────────────

test('fix --yes: remediates missing structure on empty dir', () => {
  const dir = makeTempDir();
  const r = runFix(['--yes'], { projectDir: dir });
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  // fix should create at least .claude/ and CLAUDE.md (hard fail items)
  assert.ok(fs.existsSync(path.join(dir, '.claude')), '.claude/ should be created by fix');
});

test('fix --yes: output includes "fix completed"', () => {
  const dir = makeTempDir();
  const r = runFix(['--yes'], { projectDir: dir });
  assert.ok(r.stdout.includes('fix completed'), r.stdout);
});

// ── fix → check 연동: fix 후 hard fail 해소 ────────────────────────────────

test('fix --yes → check: FAIL count reduced', () => {
  const dir = makeTempDir();

  // 1. check → count FAILs before
  const before = runCheck([], { projectDir: dir });
  const beforeMatch = before.stdout.match(/FAIL\s+(\d+)/);
  const beforeFail = beforeMatch ? parseInt(beforeMatch[1], 10) : 0;

  // 2. fix → remediate
  const fixResult = runFix(['--yes'], { projectDir: dir });
  assert.strictEqual(fixResult.code, 0, `fix failed: ${fixResult.stderr}`);

  // 3. check → FAIL count should decrease (fix creates .claude/ but CLAUDE.md
  //    is project-specific and not scaffolded, so 1 hard fail may remain)
  const after = runCheck([], { projectDir: dir });
  const afterMatch = after.stdout.match(/FAIL\s+(\d+)/);
  const afterFail = afterMatch ? parseInt(afterMatch[1], 10) : 0;

  assert.ok(afterFail < beforeFail, `FAILs should decrease: before=${beforeFail}, after=${afterFail}`);
});

test('fix --yes + CLAUDE.md → check passes (exit 0)', () => {
  const dir = makeTempDir();

  // 1. fix → remediate scaffoldable items
  runFix(['--yes'], { projectDir: dir });

  // 2. manually create CLAUDE.md (not scaffolded by fix — project-specific)
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Project\n');

  // 3. check → should pass (exit 0)
  const after = runCheck([], { projectDir: dir });
  assert.strictEqual(after.code, 0, `check should pass after fix + CLAUDE.md\n${after.stdout}`);
});

// ── fix --fresh ─────────────────────────────────────────────────────────────

test('fix --fresh --dry-run: recomputes without snapshot', () => {
  const dir = makeTempDir();
  const r = runFix(['--fresh', '--dry-run'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('--fresh') || r.stdout.includes('recompute'), r.stdout);
});

// ── healthy project → no-op ─────────────────────────────────────────────────

test('fix --yes on healthy project: nothing to apply', () => {
  const r = runFix(['--yes', '--fresh'], { projectDir: '.' });
  assert.strictEqual(r.code, 0);
  assert.ok(
    r.stdout.includes('healthy') || r.stdout.includes('already satisfied'),
    r.stdout
  );
});
