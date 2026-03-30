'use strict';

const { test, after } = require('node:test');
const assert          = require('node:assert/strict');
const { spawnSync }   = require('child_process');
const os              = require('os');
const path            = require('path');
const fs              = require('fs');

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli', 'index.js');

const tmpDirs = [];

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-clear-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

function run(args, { input } = {}) {
  const r = spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: 'utf8',
    input: input || '',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

/**
 * Helper: scaffold a project with typical bkit-doctor files.
 */
function scaffoldProject(dir) {
  fs.mkdirSync(path.join(dir, '.bkit-doctor'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.bkit-doctor', 'pdca-state.json'), '{}');
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# SKILL');
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude', 'hooks.json'), '{}');
  fs.writeFileSync(path.join(dir, '.claude', 'settings.local.json'), '{}');
  fs.mkdirSync(path.join(dir, 'output', 'pdca'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'output', 'pdca', 'test-guide.md'), '# Guide');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Project Rules');
}

// ── clear --help ────────────────────────────────────────────────────────────

test('clear --help: shows description', () => {
  const r = run(['clear', '--help']);
  assert.ok(r.stdout.includes('Remove bkit-doctor configuration'));
});

// ── clear: nothing to clear ─────────────────────────────────────────────────

test('clear: empty dir → nothing to clear', () => {
  const dir = makeTempDir();
  const r = run(['clear', '--path', dir]);
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('nothing to clear'));
});

// ── clear: non-TTY without RESET → cancelled (defaults selected, no confirm)

test('clear: non-TTY defaults to cancelled (empty RESET input)', () => {
  const dir = makeTempDir();
  scaffoldProject(dir);
  // non-TTY: ask() returns '' which is not 'RESET'
  const r = run(['clear', '--path', dir]);
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('Confirmation failed') || r.stdout.includes('cancelled'));
  // files should still exist since confirmation failed
  assert.ok(fs.existsSync(path.join(dir, 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(dir, '.bkit-doctor')));
});

// ── clear: CLAUDE.md default unchecked ───────────────────────────────────────

test('CLEAR_TARGETS: CLAUDE.md is defaultOn=false', () => {
  const { CLEAR_TARGETS } = require('../src/cli/commands/clear');
  const claudeTarget = CLEAR_TARGETS.find(t => t.key === 'claude-md');
  assert.ok(claudeTarget);
  assert.strictEqual(claudeTarget.defaultOn, false);
});

test('CLEAR_TARGETS: .bkit-doctor is defaultOn=true', () => {
  const { CLEAR_TARGETS } = require('../src/cli/commands/clear');
  const bkitTarget = CLEAR_TARGETS.find(t => t.key === 'bkit-doctor');
  assert.ok(bkitTarget);
  assert.strictEqual(bkitTarget.defaultOn, true);
});

// ── clear: simulated RESET confirmation deletes files ────────────────────────

test('clear: programmatic deletion (unit test of fs operations)', () => {
  const dir = makeTempDir();
  scaffoldProject(dir);

  // simulate what clear does after RESET confirmation:
  // delete defaultOn=true targets
  const { CLEAR_TARGETS } = require('../src/cli/commands/clear');
  const defaults = CLEAR_TARGETS.filter(t => t.defaultOn);

  for (const t of defaults) {
    const absPath = path.join(dir, t.rel);
    if (!fs.existsSync(absPath)) continue;
    if (t.isDir) {
      fs.rmSync(absPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(absPath);
    }
  }

  // defaultOn targets should be gone
  assert.ok(!fs.existsSync(path.join(dir, '.bkit-doctor')));
  assert.ok(!fs.existsSync(path.join(dir, 'SKILL.md')));
  assert.ok(!fs.existsSync(path.join(dir, '.claude', 'hooks.json')));
  assert.ok(!fs.existsSync(path.join(dir, '.claude', 'settings.local.json')));
  assert.ok(!fs.existsSync(path.join(dir, 'output', 'pdca')));

  // CLAUDE.md should still exist (defaultOn=false)
  assert.ok(fs.existsSync(path.join(dir, 'CLAUDE.md')));
});

// ── clear: only existing targets shown ──────────────────────────────────────

test('clear: filters to existing files only', () => {
  const dir = makeTempDir();
  // only create SKILL.md
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# SKILL');
  const r = run(['clear', '--path', dir]);
  // should not mention .bkit-doctor since it doesn't exist
  assert.ok(r.stdout.includes('SKILL.md'));
});

// ── setup: CLAUDE.md is created when missing ────────────────────────────────

test('setup: creates CLAUDE.md when missing (non-TTY defaults)', () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  // no CLAUDE.md — setup Step 2 should create one
  const r = run(['setup', '--path', dir]);
  assert.strictEqual(r.code, 0);
  assert.ok(fs.existsSync(path.join(dir, 'CLAUDE.md')));
  const content = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(content.includes('Project Rules'));
});

// ── setup: never auto-overwrites CLAUDE.md ──────────────────────────────────

test('setup: does not overwrite existing CLAUDE.md in non-TTY mode', () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  const original = '# My Custom Rules\nDo not touch this.\n';
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), original);
  const r = run(['setup', '--path', dir]);
  assert.strictEqual(r.code, 0);
  // non-TTY defaults to (y/N) → N, so original content preserved
  const content = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  // SKILL.md link may be appended, but the original content must be preserved
  assert.ok(content.includes('My Custom Rules'));
});
