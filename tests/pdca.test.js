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

  test('type-specific hints differ between types', () => {
    const guideline = buildPdcaGuide({ topic: 'x', type: 'guideline', createdAt: '2025-01-01' });
    const bugfix    = buildPdcaGuide({ topic: 'x', type: 'bugfix', createdAt: '2025-01-01' });
    const feature   = buildPdcaGuide({ topic: 'x', type: 'feature', createdAt: '2025-01-01' });
    const refactor  = buildPdcaGuide({ topic: 'x', type: 'refactor', createdAt: '2025-01-01' });

    // each type has unique placeholder text
    assert.match(bugfix, /root cause/i);
    assert.match(feature, /user need|user pain/i);
    assert.match(refactor, /technical debt/i);
    assert.match(guideline, /policy|operational/i);

    // they differ from each other
    assert.notEqual(guideline, bugfix);
    assert.notEqual(feature, refactor);
  });

  test('type-specific subtitle in title area', () => {
    const guideline = buildPdcaGuide({ topic: 'x', type: 'guideline', createdAt: '2025-01-01' });
    const feature   = buildPdcaGuide({ topic: 'x', type: 'feature', createdAt: '2025-01-01' });
    const bugfix    = buildPdcaGuide({ topic: 'x', type: 'bugfix', createdAt: '2025-01-01' });
    const refactor  = buildPdcaGuide({ topic: 'x', type: 'refactor', createdAt: '2025-01-01' });

    assert.match(guideline, /Policy.*Standard/i);
    assert.match(feature, /New Feature/i);
    assert.match(bugfix, /Bug Fix|Incident/i);
    assert.match(refactor, /Architecture Improvement/i);
  });

  test('type-specific success criteria examples', () => {
    const bugfix  = buildPdcaGuide({ topic: 'x', type: 'bugfix', createdAt: '2025-01-01' });
    const feature = buildPdcaGuide({ topic: 'x', type: 'feature', createdAt: '2025-01-01' });

    assert.match(bugfix, /regression test/i);
    assert.match(feature, /acceptance test/i);
  });

  test('type-specific risk examples', () => {
    const bugfix   = buildPdcaGuide({ topic: 'x', type: 'bugfix', createdAt: '2025-01-01' });
    const refactor = buildPdcaGuide({ topic: 'x', type: 'refactor', createdAt: '2025-01-01' });

    assert.match(bugfix, /new regression/i);
    assert.match(refactor, /test coverage/i);
  });

  test('type-specific follow-up items', () => {
    const bugfix    = buildPdcaGuide({ topic: 'x', type: 'bugfix', createdAt: '2025-01-01' });
    const guideline = buildPdcaGuide({ topic: 'x', type: 'guideline', createdAt: '2025-01-01' });

    assert.match(bugfix, /monitoring|alerting/i);
    assert.match(guideline, /periodic review/i);
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

    const expected = path.join(dir, 'output', 'pdca', 'my-first-topic-pdca-guide.md');
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

    const pdcaDir = path.join(dir, 'output', 'pdca');
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
    const filePath = path.join(dir, 'output', 'pdca', 'overwrite-me-pdca-guide.md');
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
      path.join(dir, 'output', 'pdca', 'metadata-test-pdca-guide.md'), 'utf8');
    assert.match(content, /\*\*Type\*\*: bugfix/);
    assert.match(content, /\*\*Owner\*\*: alice/);
    assert.match(content, /\*\*Priority\*\*: P0/);
  });

  test('slug preserves Korean characters', () => {
    const dir = makeTempDir();
    const { code } = runPdca(['배포 승인 기준'], { projectDir: dir });

    assert.equal(code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'output', 'pdca', '배포-승인-기준-pdca-guide.md')));
  });

  test('slug strips symbols but keeps alphanumeric', () => {
    const dir = makeTempDir();
    const { code } = runPdca(['Hello World! @#$'], { projectDir: dir });

    assert.equal(code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'output', 'pdca', 'hello-world-pdca-guide.md')));
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
    assert.ok(fs.existsSync(path.join(dir, 'output', 'pdca', 'untitled-pdca-guide.md')));
  });

  test('invalid --type shows error and exits 1', () => {
    const dir = makeTempDir();
    const { code, stderr } = runPdca(['some topic', '--type', 'garbage'], { projectDir: dir });
    assert.equal(code, 1);
    assert.match(stderr, /\[bkit-doctor\] error: invalid --type "garbage"/);
  });

  test('--dry-run: shows plan, path, exists=no, preview without creating file', () => {
    const dir = makeTempDir();
    const { code, stdout } = runPdca(['dry run test', '--dry-run'], { projectDir: dir });

    assert.equal(code, 0);
    assert.match(stdout, /dry-run: pdca guide generation plan/);
    assert.match(stdout, /output\s*:.*dry-run-test-pdca-guide\.md/);
    assert.match(stdout, /exists\s*: no/);
    assert.match(stdout, /action\s*: create/);
    assert.match(stdout, /--- preview ---/);
    assert.match(stdout, /# PDCA Guide/);

    const pdcaDir = path.join(dir, 'output', 'pdca');
    assert.ok(!fs.existsSync(pdcaDir), 'No file should be created in dry-run mode');
  });

  test('--dry-run with existing file: shows exists=yes and BLOCKED', () => {
    const dir = makeTempDir();
    // create file first
    runPdca(['conflict topic'], { projectDir: dir });

    const { code, stdout } = runPdca(['conflict topic', '--dry-run'], { projectDir: dir });
    assert.equal(code, 1);
    assert.match(stdout, /exists\s*: yes/);
    assert.match(stdout, /action\s*: BLOCKED/);
  });

  test('--dry-run --overwrite with existing file: shows overwrite action', () => {
    const dir = makeTempDir();
    runPdca(['ow topic'], { projectDir: dir });

    const { code, stdout } = runPdca(['ow topic', '--dry-run', '--overwrite'], { projectDir: dir });
    assert.equal(code, 0);
    assert.match(stdout, /exists\s*: yes/);
    assert.match(stdout, /action\s*: overwrite/);

    // file should not be modified in dry-run
    const filePath = path.join(dir, 'output', 'pdca', 'ow-topic-pdca-guide.md');
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 0, 'Original file should remain unchanged');
  });

  test('-o with absolute path writes to that path', () => {
    const dir = makeTempDir();
    const absOut = path.join(dir, 'abs', 'out.md');
    const { code } = runPdca(['abs topic', '-o', absOut], { projectDir: dir });
    assert.equal(code, 0);
    assert.ok(fs.existsSync(absOut));
  });
});

// ── 4. pdca-stage CLI tests ──────────────────────────────────────────────────

function runStage(stage, args, { projectDir } = {}) {
  const finalArgs = projectDir
    ? [`pdca-${stage}`, ...args, '--path', projectDir]
    : [`pdca-${stage}`, ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

describe('pdca-stage CLI', () => {
  for (const stage of ['plan', 'do', 'check', 'report']) {
    test(`pdca-${stage}: generates ${stage} document`, () => {
      const dir = makeTempDir();
      const { code, stdout } = runStage(stage, ['stage test topic'], { projectDir: dir });

      assert.equal(code, 0);
      assert.match(stdout, /PDCA.*created/);

      const filePath = path.join(dir, 'output', 'pdca', `stage-test-topic-pdca-${stage}.md`);
      assert.ok(fs.existsSync(filePath), `${stage} file should exist`);

      const content = fs.readFileSync(filePath, 'utf8');
      assert.match(content, new RegExp(`# PDCA ${stage.charAt(0).toUpperCase() + stage.slice(1)} —`));
      assert.match(content, /\*\*Stage\*\*/);
    });

    test(`pdca-${stage} --stdout: prints to terminal`, () => {
      const dir = makeTempDir();
      const { code, stdout } = runStage(stage, ['stdout test', '--stdout'], { projectDir: dir });

      assert.equal(code, 0);
      assert.match(stdout, /# PDCA/);
      assert.ok(!fs.existsSync(path.join(dir, 'output', 'pdca')));
    });
  }

  test('pdca-plan: file name uses -pdca-plan.md suffix', () => {
    const dir = makeTempDir();
    runStage('plan', ['naming check'], { projectDir: dir });
    assert.ok(fs.existsSync(path.join(dir, 'output', 'pdca', 'naming-check-pdca-plan.md')));
  });

  test('pdca-report --type bugfix: uses bugfix hints', () => {
    const dir = makeTempDir();
    const { code } = runStage('report', ['bug report', '--type', 'bugfix'], { projectDir: dir });
    assert.equal(code, 0);

    const content = fs.readFileSync(
      path.join(dir, 'output', 'pdca', 'bug-report-pdca-report.md'), 'utf8');
    assert.match(content, /\*\*Type\*\*: bugfix/);
    assert.match(content, /monitoring|alerting/i);
  });

  test('stage overwrite protection works', () => {
    const dir = makeTempDir();
    runStage('plan', ['dup stage'], { projectDir: dir });

    const { code, stderr } = runStage('plan', ['dup stage'], { projectDir: dir });
    assert.equal(code, 1);
    assert.match(stderr, /already exists/);
  });
});

// ── 5. pdca state unit tests ─────────────────────────────────────────────────

describe('pdca state', () => {
  const { loadState, updateTopic, getTopic, listTopics, statePath } = require('../src/pdca/state');

  test('loadState returns empty topics for new directory', () => {
    const dir = makeTempDir();
    const state = loadState(dir);
    assert.deepEqual(state, { topics: {} });
  });

  test('updateTopic creates state file and stores topic', () => {
    const dir = makeTempDir();
    const result = updateTopic(dir, {
      slug: 'my-topic', topic: 'My Topic', type: 'feature',
      owner: 'alice', priority: 'P0', stage: 'create', filePath: '/tmp/test.md',
    });

    assert.equal(result.topic, 'My Topic');
    assert.equal(result.currentStage, 'create');
    assert.equal(result.files.create, '/tmp/test.md');
    assert.ok(fs.existsSync(statePath(dir)));
  });

  test('updateTopic preserves existing data and updates stage', () => {
    const dir = makeTempDir();
    updateTopic(dir, {
      slug: 'dup', topic: 'Dup', type: 'guideline',
      owner: 'bob', priority: 'P1', stage: 'create', filePath: '/a.md',
    });
    const result = updateTopic(dir, {
      slug: 'dup', topic: 'Dup', stage: 'plan', filePath: '/b.md',
    });

    assert.equal(result.currentStage, 'plan');
    assert.equal(result.files.create, '/a.md');
    assert.equal(result.files.plan, '/b.md');
    assert.equal(result.owner, 'bob');
  });

  test('getTopic returns null for unknown slug', () => {
    const dir = makeTempDir();
    assert.equal(getTopic(dir, 'nope'), null);
  });

  test('getTopic returns stored data', () => {
    const dir = makeTempDir();
    updateTopic(dir, { slug: 'x', topic: 'X', stage: 'do', type: 'bugfix' });
    const t = getTopic(dir, 'x');
    assert.equal(t.topic, 'X');
    assert.equal(t.currentStage, 'do');
  });

  test('listTopics returns all topics', () => {
    const dir = makeTempDir();
    updateTopic(dir, { slug: 'a', topic: 'A', stage: 'create' });
    updateTopic(dir, { slug: 'b', topic: 'B', stage: 'plan' });
    const list = listTopics(dir);
    assert.equal(list.length, 2);
  });
});

// ── 6. pdca state CLI integration ────────────────────────────────────────────

describe('pdca state CLI integration', () => {
  test('pdca create updates state file', () => {
    const dir = makeTempDir();
    runPdca(['state test'], { projectDir: dir });

    const stateFile = path.join(dir, '.bkit-doctor', 'pdca-state.json');
    assert.ok(fs.existsSync(stateFile), 'state file should be created');

    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.ok(state.topics['state-test']);
    assert.equal(state.topics['state-test'].currentStage, 'create');
  });

  test('pdca-plan updates state with plan stage', () => {
    const dir = makeTempDir();
    runPdca(['stage topic'], { projectDir: dir });
    runStage('plan', ['stage topic'], { projectDir: dir });

    const state = JSON.parse(fs.readFileSync(
      path.join(dir, '.bkit-doctor', 'pdca-state.json'), 'utf8'));
    const t = state.topics['stage-topic'];
    assert.equal(t.currentStage, 'plan');
    assert.ok(t.files.create);
    assert.ok(t.files.plan);
  });

  test('--stdout and --dry-run do not update state', () => {
    const dir = makeTempDir();
    runPdca(['no state', '--stdout'], { projectDir: dir });
    assert.ok(!fs.existsSync(path.join(dir, '.bkit-doctor', 'pdca-state.json')));

    runPdca(['no state2', '--dry-run'], { projectDir: dir });
    assert.ok(!fs.existsSync(path.join(dir, '.bkit-doctor', 'pdca-state.json')));
  });
});

// ── 7. pdca-list CLI tests ───────────────────────────────────────────────────

function runList(args, { projectDir } = {}) {
  const finalArgs = projectDir
    ? ['pdca-list', '--path', projectDir, ...args]
    : ['pdca-list', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

describe('pdca-list CLI', () => {
  test('empty project: no guides found', () => {
    const dir = makeTempDir();
    const { code, stdout } = runList([], { projectDir: dir });
    assert.equal(code, 0);
    assert.match(stdout, /no PDCA guides found/);
  });

  test('with guides: lists files', () => {
    const dir = makeTempDir();
    runPdca(['list topic one'], { projectDir: dir });
    runPdca(['list topic two'], { projectDir: dir });

    const { code, stdout } = runList([], { projectDir: dir });
    assert.equal(code, 0);
    assert.match(stdout, /2 files/);
    assert.match(stdout, /list-topic-one-pdca-guide\.md/);
    assert.match(stdout, /list-topic-two-pdca-guide\.md/);
  });

  test('with state: shows type and stage', () => {
    const dir = makeTempDir();
    runPdca(['typed topic', '--type', 'bugfix'], { projectDir: dir });

    const { stdout } = runList([], { projectDir: dir });
    assert.match(stdout, /bugfix/);
    assert.match(stdout, /create/);
  });
});
