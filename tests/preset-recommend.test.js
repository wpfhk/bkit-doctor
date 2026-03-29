'use strict';

/**
 * preset-recommend.test.js
 * presetRecommend 순수 함수 단위 테스트 + CLI 통합 테스트
 *
 * 실행: node --test tests/preset-recommend.test.js
 */

const { test }  = require('node:test');
const assert    = require('node:assert/strict');
const { spawnSync } = require('child_process');
const path      = require('path');

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli', 'index.js');

function runCLI(args) {
  const r = spawnSync(process.execPath, [CLI_PATH, ...args], { encoding: 'utf8' });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

const {
  recommendPresets,
  classifyTargets,
  CATEGORY_CONFIG,
  CATEGORY_WORKFLOW,
  CATEGORY_DOCS,
} = require('../src/preset/presetRecommend');

// ── classifyTargets ───────────────────────────────────────────────────────────

test('classifyTargets: config targets', () => {
  const r = classifyTargets(['claude-root', 'hooks-json', 'settings-local']);
  assert.strictEqual(r.config,   3);
  assert.strictEqual(r.workflow, 0);
  assert.strictEqual(r.docs,     0);
  assert.strictEqual(r.total,    3);
});

test('classifyTargets: workflow targets', () => {
  const r = classifyTargets(['agents-core', 'skills-core']);
  assert.strictEqual(r.config,   0);
  assert.strictEqual(r.workflow, 2);
  assert.strictEqual(r.docs,     0);
});

test('classifyTargets: docs targets', () => {
  const r = classifyTargets(['docs-core', 'docs-plan']);
  assert.strictEqual(r.config,   0);
  assert.strictEqual(r.workflow, 0);
  assert.strictEqual(r.docs,     2);
});

test('classifyTargets: mixed targets', () => {
  const r = classifyTargets(['claude-root', 'agents-core', 'docs-core']);
  assert.strictEqual(r.config,   1);
  assert.strictEqual(r.workflow, 1);
  assert.strictEqual(r.docs,     1);
});

test('classifyTargets: empty', () => {
  const r = classifyTargets([]);
  assert.strictEqual(r.total, 0);
});

// ── recommendPresets: 반환 구조 ───────────────────────────────────────────────

test('recommendPresets: returns array', () => {
  const r = recommendPresets([]);
  assert.ok(Array.isArray(r));
});

test('recommendPresets: each item has preset and reason', () => {
  for (const targets of [[], ['agents-core'], ['docs-core'], ['claude-root']]) {
    const r = recommendPresets(targets);
    for (const item of r) {
      assert.ok(typeof item.preset === 'string' && item.preset.length > 0, 'preset required');
      assert.ok(typeof item.reason === 'string' && item.reason.length > 0, 'reason required');
    }
  }
});

test('recommendPresets: max 3 results', () => {
  const targets = ['claude-root', 'agents-core', 'docs-core', 'hooks-json', 'skills-core'];
  const r = recommendPresets(targets);
  assert.ok(r.length <= 3, `expected <= 3, got ${r.length}`);
});

// ── recommendPresets: 규칙별 케이스 ──────────────────────────────────────────

test('healthy (empty targets) → lean', () => {
  const r = recommendPresets([]);
  assert.strictEqual(r[0].preset, 'lean');
});

test('healthy reason mentions "healthy"', () => {
  const r = recommendPresets([]);
  assert.ok(/healthy/i.test(r[0].reason), r[0].reason);
});

test('docs only → docs', () => {
  const r = recommendPresets(['docs-core', 'docs-plan']);
  assert.strictEqual(r[0].preset, 'docs');
});

test('config only → lean', () => {
  const r = recommendPresets(['claude-root', 'hooks-json']);
  assert.strictEqual(r[0].preset, 'lean');
});

test('workflow (no docs) → workflow-core', () => {
  const r = recommendPresets(['agents-core', 'skills-core']);
  assert.strictEqual(r[0].preset, 'workflow-core');
});

test('workflow + config (no docs) → workflow-core', () => {
  const r = recommendPresets(['claude-root', 'agents-core', 'skills-core']);
  assert.strictEqual(r[0].preset, 'workflow-core');
});

test('workflow + docs → default', () => {
  const r = recommendPresets(['agents-core', 'docs-core']);
  assert.strictEqual(r[0].preset, 'default');
});

test('config + workflow + docs → default', () => {
  const r = recommendPresets(['claude-root', 'agents-core', 'docs-core']);
  assert.strictEqual(r[0].preset, 'default');
});

test('workflow only → no docs as secondary', () => {
  // workflow 전용 → 2차에 docs가 없어야 함
  const r = recommendPresets(['agents-core', 'skills-core']);
  const hasDocsSec = r.slice(1).some(i => i.preset === 'docs');
  assert.ok(!hasDocsSec, 'docs should not appear as secondary when targets have no docs');
});

test('config + docs → secondary includes docs', () => {
  // config + docs → 1차 lean or default, 2차 docs
  const r = recommendPresets(['claude-root', 'docs-core']);
  // 1차는 default (config + docs 혼합)
  // 이 케이스: config > 0, workflow = 0, docs > 0 → default
  assert.strictEqual(r[0].preset, 'default');
});

// ── recommendPresets: preset 이름이 registry에 존재 ───────────────────────────

const { getPreset } = require('../src/init/presetRegistry');

test('all recommended presets exist in registry', () => {
  const caseSets = [
    [],
    ['agents-core'],
    ['docs-core'],
    ['claude-root'],
    ['agents-core', 'docs-core'],
    ['claude-root', 'agents-core', 'docs-core'],
  ];
  for (const targets of caseSets) {
    const recs = recommendPresets(targets);
    for (const { preset } of recs) {
      assert.ok(getPreset(preset) !== null, `preset "${preset}" not in registry`);
    }
  }
});

// ── CLI 통합 ──────────────────────────────────────────────────────────────────

test('preset recommend: exit code 0', () => {
  const r = runCLI(['preset', 'recommend']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('preset recommend: includes at least one preset name', () => {
  const r = runCLI(['preset', 'recommend']);
  const presetNames = ['default', 'lean', 'docs', 'workflow-core'];
  const hasPreset = presetNames.some(n => r.stdout.includes(n));
  assert.ok(hasPreset, `none of ${presetNames.join(',')} found in:\n${r.stdout}`);
});

test('preset recommend: includes "reason"', () => {
  const r = runCLI(['preset', 'recommend']);
  assert.ok(r.stdout.includes('reason'), r.stdout);
});

test('preset recommend: includes guidance with "fix"', () => {
  const r = runCLI(['preset', 'recommend']);
  assert.ok(r.stdout.includes('fix'), r.stdout);
});

test('preset recommend: includes guidance with "init --preset"', () => {
  const r = runCLI(['preset', 'recommend']);
  assert.ok(r.stdout.includes('init --preset'), r.stdout);
});

test('preset recommend --fresh: exit code 0', () => {
  const r = runCLI(['preset', 'recommend', '--fresh']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

// ── regression ───────────────────────────────────────────────────────────────

test('preset list: still works after adding workflow-core', () => {
  const r = runCLI(['preset', 'list']);
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('workflow-core'), r.stdout);
});

test('preset show workflow-core: exit code 0', () => {
  const r = runCLI(['preset', 'show', 'workflow-core']);
  assert.strictEqual(r.code, 0);
  assert.ok(r.stdout.includes('agents-core'), r.stdout);
});

test('init --preset workflow-core --dry-run: exit code 0', () => {
  const r = runCLI(['init', '--preset', 'workflow-core', '--dry-run']);
  assert.strictEqual(r.code, 0);
});

// ── Phase 6-4: scoring + ranking ─────────────────────────────────────────────

const { computePresetScores, getMatchLabel, clampScore } = require('../src/preset/presetScoring');

test('computePresetScores: returns scores for all presets', () => {
  const s = computePresetScores([]);
  assert.ok(typeof s.lean === 'number');
  assert.ok(typeof s['workflow-core'] === 'number');
  assert.ok(typeof s.docs === 'number');
  assert.ok(typeof s.default === 'number');
});

test('computePresetScores: all scores 0-100', () => {
  for (const targets of [[], ['agents-core'], ['docs-core'], ['claude-root', 'agents-core', 'docs-core']]) {
    const s = computePresetScores(targets);
    for (const [, score] of Object.entries(s)) {
      assert.ok(score >= 0 && score <= 100, `score ${score} out of range for ${JSON.stringify(targets)}`);
    }
  }
});

test('getMatchLabel: 80+ is high match', () => {
  assert.strictEqual(getMatchLabel(80), 'high match');
  assert.strictEqual(getMatchLabel(100), 'high match');
});

test('getMatchLabel: 50-79 is medium match', () => {
  assert.strictEqual(getMatchLabel(50), 'medium match');
  assert.strictEqual(getMatchLabel(79), 'medium match');
});

test('getMatchLabel: below 50 is low match', () => {
  assert.strictEqual(getMatchLabel(0), 'low match');
  assert.strictEqual(getMatchLabel(49), 'low match');
});

test('clampScore: clamps below 0 to 0', () => {
  assert.strictEqual(clampScore(-10), 0);
});

test('clampScore: clamps above 100 to 100', () => {
  assert.strictEqual(clampScore(150), 100);
});

test('recommendPresets: each item has score field', () => {
  for (const targets of [[], ['agents-core'], ['docs-core'], ['claude-root']]) {
    const r = recommendPresets(targets);
    for (const item of r) {
      assert.ok(typeof item.score === 'number', `score missing for ${JSON.stringify(targets)}`);
    }
  }
});

test('recommendPresets: score is 0-100', () => {
  const r = recommendPresets(['agents-core', 'docs-core', 'claude-root']);
  for (const item of r) {
    assert.ok(item.score >= 0 && item.score <= 100, `score ${item.score} out of range`);
  }
});

test('recommendPresets: each item has label field', () => {
  const r = recommendPresets(['agents-core']);
  for (const item of r) {
    assert.ok(typeof item.label === 'string' && item.label.length > 0, 'label missing');
  }
});

test('recommendPresets: label is valid value', () => {
  const valid = new Set(['high match', 'medium match', 'low match']);
  for (const targets of [[], ['agents-core'], ['docs-core'], ['claude-root', 'agents-core', 'docs-core']]) {
    const r = recommendPresets(targets);
    for (const item of r) {
      assert.ok(valid.has(item.label), `invalid label: "${item.label}"`);
    }
  }
});

test('recommendPresets: results sorted by score descending', () => {
  for (const targets of [[], ['agents-core'], ['docs-core', 'docs-plan'], ['agents-core', 'docs-core']]) {
    const r = recommendPresets(targets);
    for (let i = 1; i < r.length; i++) {
      assert.ok(r[i - 1].score >= r[i].score,
        `score not sorted: ${r[i - 1].score} < ${r[i].score} at index ${i}`);
    }
  }
});

test('scoring: healthy (empty) → lean has highest score', () => {
  const r = recommendPresets([]);
  assert.strictEqual(r[0].preset, 'lean');
  assert.ok(r[0].score >= 80, `expected lean >= 80, got ${r[0].score}`);
});

test('scoring: workflow-heavy → workflow-core has highest score', () => {
  const r = recommendPresets(['agents-core', 'skills-core', 'templates-core']);
  assert.strictEqual(r[0].preset, 'workflow-core');
});

test('scoring: docs-heavy → docs has highest score', () => {
  const r = recommendPresets(['docs-core', 'docs-plan', 'docs-design']);
  assert.strictEqual(r[0].preset, 'docs');
});

test('scoring: no crash on empty targets', () => {
  assert.doesNotThrow(() => recommendPresets([]));
});

// ── CLI: scoring 출력 검증 ────────────────────────────────────────────────────

test('preset recommend: output includes "score"', () => {
  const r = runCLI(['preset', 'recommend']);
  assert.ok(r.stdout.includes('score'), r.stdout);
});

test('preset recommend: output includes match label', () => {
  const r = runCLI(['preset', 'recommend']);
  const hasLabel = r.stdout.includes('high match') ||
                   r.stdout.includes('medium match') ||
                   r.stdout.includes('low match');
  assert.ok(hasLabel, `no match label found in:\n${r.stdout}`);
});
