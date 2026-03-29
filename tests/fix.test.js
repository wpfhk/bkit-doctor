'use strict';

/**
 * fix.test.js
 * resolveFixTargets 단위/통합 테스트
 *
 * 실행: node --test tests/fix.test.js
 *
 * 각 테스트는 임시 디렉터리를 생성하고 완료 후 정리한다.
 */

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const os     = require('os');
const path   = require('path');
const fs     = require('fs');

const { resolveFixTargets } = require('../src/fix/resolveFixTargets');

const {
  buildRecommendationFingerprint,
} = require('../src/check/recommendations/buildRecommendationFingerprint');

const {
  makeSnapshot,
  SNAPSHOT_REL_PATH,
} = require('../src/check/recommendations/recommendationSnapshotModel');

// ── 헬퍼 ───────────────────────────────────────────────────────────────────

const tmpDirs = [];

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-test-'));
  tmpDirs.push(dir);
  return dir;
}

function writeSnapshot(projectRoot, snapshotData) {
  const snapshotPath = path.join(projectRoot, SNAPSHOT_REL_PATH);
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2));
}

after(() => {
  for (const d of tmpDirs)
    fs.rmSync(d, { recursive: true, force: true });
});

// ── 반환 구조 검증 ────────────────────────────────────────────────────────────

test('resolveFixTargets: returns required fields', async () => {
  const dir    = makeTempDir();
  const result = await resolveFixTargets(dir, { fresh: true });

  assert.ok('targets'        in result, 'targets field required');
  assert.ok('fromSnapshot'   in result, 'fromSnapshot field required');
  assert.ok('issueCount'     in result, 'issueCount field required');
  assert.ok('snapshotStatus' in result, 'snapshotStatus field required');
  assert.ok(Array.isArray(result.targets), 'targets must be array');
});

// ── --fresh 경로 ─────────────────────────────────────────────────────────────

test('resolveFixTargets: --fresh returns snapshotStatus "skipped"', async () => {
  const dir    = makeTempDir();
  const result = await resolveFixTargets(dir, { fresh: true });

  assert.strictEqual(result.fromSnapshot,   false);
  assert.strictEqual(result.snapshotStatus, 'skipped');
});

test('resolveFixTargets: --fresh ignores valid snapshot', async () => {
  const dir         = makeTempDir();
  const fingerprint = buildRecommendationFingerprint(dir);
  const snapshot    = makeSnapshot({
    projectRoot:           dir,
    finalTargets:          ['hooks-json'],
    suggestedCommand:      'bkit-doctor init --recommended',
    suggestedDryRunCommand:'bkit-doctor init --recommended --dry-run',
    issueCount:            1,
    fingerprint,
  });
  writeSnapshot(dir, snapshot);

  const result = await resolveFixTargets(dir, { fresh: true });
  assert.strictEqual(result.fromSnapshot,   false);
  assert.strictEqual(result.snapshotStatus, 'skipped');
});

// ── snapshot missing ─────────────────────────────────────────────────────────

test('resolveFixTargets: missing snapshot falls back to compute', async () => {
  const dir    = makeTempDir();
  const result = await resolveFixTargets(dir, { fresh: false });

  assert.strictEqual(result.fromSnapshot,   false);
  assert.strictEqual(result.snapshotStatus, 'missing');
  assert.ok(typeof result.issueCount === 'number');
});

// ── valid snapshot 재사용 ────────────────────────────────────────────────────

test('resolveFixTargets: valid snapshot is reused', async () => {
  const dir         = makeTempDir();
  const fingerprint = buildRecommendationFingerprint(dir);
  const snapshot    = makeSnapshot({
    projectRoot:           dir,
    finalTargets:          ['hooks-json', 'agents-core'],
    suggestedCommand:      'bkit-doctor init --recommended',
    suggestedDryRunCommand:'bkit-doctor init --recommended --dry-run',
    issueCount:            2,
    fingerprint,
  });
  writeSnapshot(dir, snapshot);

  const result = await resolveFixTargets(dir, { fresh: false });
  assert.strictEqual(result.fromSnapshot,   true);
  assert.strictEqual(result.snapshotStatus, 'used');
  assert.deepEqual(result.targets,          ['hooks-json', 'agents-core']);
  assert.strictEqual(result.issueCount,     2);
});

// ── invalid snapshot fallback ────────────────────────────────────────────────

test('resolveFixTargets: snapshot with wrong version → invalid, recompute', async () => {
  const dir = makeTempDir();
  writeSnapshot(dir, {
    version:      'WRONG_VERSION',
    projectRoot:  dir,
    finalTargets: ['hooks-json'],
    fingerprint:  'wrong',
    issueCount:   1,
  });

  const result = await resolveFixTargets(dir, { fresh: false });
  assert.strictEqual(result.fromSnapshot,   false);
  assert.strictEqual(result.snapshotStatus, 'invalid');
  assert.ok(typeof result.invalidReason === 'string');
  assert.ok(result.invalidReason.length > 0);
});

test('resolveFixTargets: snapshot with wrong projectRoot → invalid, recompute', async () => {
  const dir         = makeTempDir();
  const fingerprint = buildRecommendationFingerprint(dir);
  const snapshot    = makeSnapshot({
    projectRoot:           '/wrong/path/does/not/exist',
    finalTargets:          ['hooks-json'],
    suggestedCommand:      'x',
    suggestedDryRunCommand:'y',
    issueCount:            1,
    fingerprint,
  });
  writeSnapshot(dir, snapshot);

  const result = await resolveFixTargets(dir, { fresh: false });
  assert.strictEqual(result.fromSnapshot,   false);
  assert.strictEqual(result.snapshotStatus, 'invalid');
});

test('resolveFixTargets: snapshot with wrong fingerprint → invalid, recompute', async () => {
  const dir      = makeTempDir();
  const snapshot = makeSnapshot({
    projectRoot:           dir,
    finalTargets:          ['hooks-json'],
    suggestedCommand:      'x',
    suggestedDryRunCommand:'y',
    issueCount:            1,
    fingerprint:           'COMPLETELY_WRONG_FINGERPRINT',
  });
  writeSnapshot(dir, snapshot);

  const result = await resolveFixTargets(dir, { fresh: false });
  assert.strictEqual(result.fromSnapshot,   false);
  assert.strictEqual(result.snapshotStatus, 'invalid');
});

// ── healthy project ──────────────────────────────────────────────────────────

test('resolveFixTargets: healthy snapshot (empty finalTargets) is valid', async () => {
  const dir         = makeTempDir();
  const fingerprint = buildRecommendationFingerprint(dir);
  const snapshot    = makeSnapshot({
    projectRoot:           dir,
    finalTargets:          [],
    suggestedCommand:      '',
    suggestedDryRunCommand:'',
    issueCount:            0,
    fingerprint,
  });
  writeSnapshot(dir, snapshot);

  const result = await resolveFixTargets(dir, { fresh: false });
  assert.strictEqual(result.fromSnapshot,   true);
  assert.strictEqual(result.snapshotStatus, 'used');
  assert.deepEqual(result.targets,          []);
});

// ── snapshotStatus 열거값 ────────────────────────────────────────────────────

test('resolveFixTargets: snapshotStatus is one of known values', async () => {
  const validStatuses = ['used', 'invalid', 'missing', 'skipped'];
  const dir    = makeTempDir();
  const result = await resolveFixTargets(dir, { fresh: false });
  assert.ok(
    validStatuses.includes(result.snapshotStatus),
    `unexpected snapshotStatus: ${result.snapshotStatus}`
  );
});
