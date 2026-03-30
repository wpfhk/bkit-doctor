'use strict';

/**
 * pdca.test.js
 * slugify / buildPdcaGuide unit tests + pdca CLI integration tests
 *
 * Run: node --test tests/pdca.test.js
 */

const { test, describe, after } = require('node:test');
const assert          = require('node:assert/strict');
const { spawnSync }   = require('child_process');
const os              = require('os');
const path            = require('path');
const fs              = require('fs');

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli', 'index.js');

// ── helpers ──────────────────────────────────────────────────────────────────

const tmpDirs = [];

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-pdca-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

function runPdca(args, { projectDir } = {}) {
  const finalArgs = projectDir
    ? ['pdca', ...args, '--path', projectDir]
    : ['pdca', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

// ── 1. slugify unit tests ────────────────────────────────────────────────────

describe('slugify', () => {
  const { slugify } = require('../src/pdca/slugify');

  test('english with spaces', () => {
    assert.equal(slugify('Deploy Approval Criteria'), 'deploy-approval-criteria');
  });

  test('korean preserved', () => {
    assert.equal(slugify('배포 승인 기준'), '배포-승인-기준');
  });

  test('mixed korean and english', () => {
    assert.equal(slugify('배포 Deploy 기준'), '배포-deploy-기준');
  });

  test('special characters stripped', () => {
    assert.equal(slugify('Hello! @#$ World'), 'hello-world');
  });

  test('consecutive hyphens collapsed', () => {
    assert.equal(slugify('a - - b'), 'a-b');
  });

  test('leading/trailing hyphens removed', () => {
    assert.equal(slugify(' -hello- '), 'hello');
  });

  test('empty result falls back to untitled', () => {
    assert.equal(slugify('  ###  '), 'untitled');
  });

  test('already clean slug unchanged', () => {
    assert.equal(slugify('my-topic'), 'my-topic');
  });
});

// ── 2. buildPdcaGuide unit tests ─────────────────────────────────────────────

describe('buildPdcaGuide', () => {
  const { buildPdcaGuide, VALID_TYPES } = require('../src/pdca/buildPdcaGuide');

  test('includes topic in title', () => {
    const md = buildPdcaGuide({ topic: 'test topic', createdAt: '2025-01-01' });
    assert.match(md, /# PDCA Guide — test topic/);
  });

  test('includes all four PDCA sections', () => {
    const md = buildPdcaGuide({ topic: 'x', createdAt: '2025-01-01' });
    assert.match(md, /## 1\. Plan/);
    assert.match(md, /## 2\. Do/);
    assert.match(md, /## 3\. Check/);
    assert.match(md, /## 4\. Act/);
  });

  test('includes meta with defaults', () => {
    const md = buildPdcaGuide({ topic: 'x', createdAt: '2025-01-01' });
    assert.match(md, /\*\*Owner\*\*: TBD/);
    assert.match(md, /\*\*Priority\*\*: P1/);
    assert.match(md, /\*\*Type\*\*: guideline/);
    assert.match(md, /\*\*Status\*\*: Draft/);
  });

  test('custom owner and priority reflected', () => {
    const md = buildPdcaGuide({ topic: 'x', owner: 'alice', priority: 'P0', createdAt: '2025-01-01' });
    assert.match(md, /\*\*Owner\*\*: alice/);
    assert.match(md, /\*\*Priority\*\*: P0/);
  });

  test('invalid type falls back to guideline', () => {
    const md = buildPdcaGuide({ topic: 'x', type: 'invalid', createdAt: '2025-01-01' });
    assert.match(md, /\*\*Type\*\*: guideline/);
  });

  test('valid types accepted', () => {
    for (const t of VALID_TYPES) {
      const md = buildPdcaGuide({ topic: 'x', type: t, createdAt: '2025-01-01' });
      assert.match(md, new RegExp(`\\*\\*Type\\*\\*: ${t}`));
    }
  });

  test('deterministic output for same input', () => {
    const args = { topic: 'det', type: 'feature', owner: 'bob', priority: 'P2', createdAt: '2025-06-01' };
    assert.equal(buildPdcaGuide(args), buildPdcaGuide(args));
  });

  test('includes detailed sub-sections', () => {
    const md = buildPdcaGuide({ topic: 'x', createdAt: '2025-01-01' });
    assert.match(md, /### Background/);
    assert.match(md, /### Problem Statement/);
    assert.match(md, /### Goal/);
    assert.match(md, /### Scope/);
    assert.match(md, /### Success Criteria/);
    assert.match(md, /### Risks \/ Assumptions/);
    assert.match(md, /### Execution Strategy/);
    assert.match(md, /### Work Breakdown/);
    assert.match(md, /### Deliverables/);
    assert.match(md, /### Checklist/);
    assert.match(md, /### Validation Criteria/);
    assert.match(md, /### Review Questions/);
    assert.match(md, /### Improvement Actions/);
    assert.match(md, /### Follow-up/);
    assert.match(md, /### Next Revision Trigger/);
  });
});

// ── 3. pdca CLI integration tests ────────────────────────────────────────────

describe('pdca CLI', () => {
  test('basic file generation with full template', () => {
    const dir = makeTempDir();
    const { code, stdout } = runPdca(['my first topic'], { projectDir: dir });

    assert.equal(code, 0);
    assert.match(stdout, /\[bkit-doctor\] PDCA guide created/);

    const expected = path.join(dir, 'docs', '00-pdca', 'my-first-topic-pdca-guide.md');
    assert.ok(fs.existsSync(expected));

    const content = fs.readFileSync(expected, 'utf8');
    assert.match(content, /# PDCA Guide — my first topic/);
    assert.match(content, /## 1\. Plan/);
    assert.match(content, /## 4\. Act/);
    assert.match(content, /\*\*Owner\*\*: TBD/);
    assert.match(content, /\*\*Priority\*\*: P1/);
  });

  test('--stdout: prints to stdout, no file created', () => {
    const dir = makeTempDir();
    const { code, stdout } = runPdca(['test topic', '--stdout'], { projectDir: dir });

    assert.equal(code, 0);
    assert.match(stdout, /# PDCA Guide — test topic/);

    const pdcaDir = path.join(dir, 'docs', '00-pdca');
    assert.ok(!fs.existsSync(pdcaDir), 'No docs directory should be created');
  });

  test('error when file exists without --overwrite', () => {
    const dir = makeTempDir();
    runPdca(['duplicate topic'], { projectDir: dir });

    const { code, stderr } = runPdca(['duplicate topic'], { projectDir: dir });
    assert.equal(code, 1);
    assert.match(stderr, /\[bkit-doctor\] error: file already exists/);
  });

  test('--overwrite: replaces existing file', () => {
    const dir = makeTempDir();
    runPdca(['overwrite me'], { projectDir: dir });
    const { code } = runPdca(['overwrite me', '--overwrite'], { projectDir: dir });

    assert.equal(code, 0);
    const filePath = path.join(dir, 'docs', '00-pdca', 'overwrite-me-pdca-guide.md');
    assert.ok(fs.existsSync(filePath));
  });

  test('-o: custom output path', () => {
    const dir = makeTempDir();
    const { code } = runPdca(['my topic', '-o', 'custom/output.md'], { projectDir: dir });

    assert.equal(code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'custom/output.md')));
  });

  test('metadata options reflected in output', () => {
    const dir = makeTempDir();
    const { code } = runPdca([
      'metadata test', '--type', 'bugfix', '--owner', 'alice', '--priority', 'P0',
    ], { projectDir: dir });

    assert.equal(code, 0);
    const content = fs.readFileSync(
      path.join(dir, 'docs', '00-pdca', 'metadata-test-pdca-guide.md'), 'utf8');
    assert.match(content, /\*\*Type\*\*: bugfix/);
    assert.match(content, /\*\*Owner\*\*: alice/);
    assert.match(content, /\*\*Priority\*\*: P0/);
  });

  test('slug preserves Korean characters', () => {
    const dir = makeTempDir();
    const { code } = runPdca(['배포 승인 기준'], { projectDir: dir });

    assert.equal(code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'docs', '00-pdca', '배포-승인-기준-pdca-guide.md')));
  });

  test('slug strips symbols but keeps alphanumeric', () => {
    const dir = makeTempDir();
    const { code } = runPdca(['Hello World! @#$'], { projectDir: dir });

    assert.equal(code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'docs', '00-pdca', 'hello-world-pdca-guide.md')));
  });

  test('missing topic shows error', () => {
    const { code, stderr } = runPdca([]);
    assert.notEqual(code, 0);
    assert.match(stderr, /missing required argument|error/i);
  });

  test('empty/symbol-only topic creates untitled slug', () => {
    const dir = makeTempDir();
    const { code } = runPdca(['###'], { projectDir: dir });
    assert.equal(code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'docs', '00-pdca', 'untitled-pdca-guide.md')));
  });

  test('invalid --type shows error and exits 1', () => {
    const dir = makeTempDir();
    const { code, stderr } = runPdca(['some topic', '--type', 'garbage'], { projectDir: dir });
    assert.equal(code, 1);
    assert.match(stderr, /\[bkit-doctor\] error: invalid --type "garbage"/);
  });

  test('-o with absolute path writes to that path', () => {
    const dir = makeTempDir();
    const absOut = path.join(dir, 'abs', 'out.md');
    const { code } = runPdca(['abs topic', '-o', absOut], { projectDir: dir });
    assert.equal(code, 0);
    assert.ok(fs.existsSync(absOut));
  });
});
