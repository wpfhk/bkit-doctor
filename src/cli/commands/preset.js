'use strict';

const path = require('path');
const { getPreset, listPresets }  = require('../../init/presetRegistry');
const { resolveFixTargets }       = require('../../fix/resolveFixTargets');
const { recommendPresets }        = require('../../preset/presetRecommend');

/**
 * preset list 핸들러
 *
 * 출력 예:
 *   available presets:
 *
 *     default   기본 bkit 운영 구조 전체 ...
 *     lean      최소 구조 ...
 *     docs      문서 구조만 ...
 *
 *   use: bkit-doctor init --preset <name>
 */
function presetListCommand() {
  const presets = listPresets();

  console.log('available presets:');
  console.log('');

  const maxNameLen = Math.max(...presets.map(p => p.name.length));
  for (const p of presets)
    console.log(`  ${p.name.padEnd(maxNameLen + 2)} ${p.description}`);

  console.log('');
  console.log('use: bkit-doctor init --preset <name>');
}

/**
 * preset show 핸들러
 *
 * 출력 예:
 *   preset: default
 *     description : 기본 bkit 운영 구조 전체 ...
 *     targets     : claude-root, hooks-json, ...
 *
 *   apply: bkit-doctor init --preset default [--dry-run]
 *
 * @param {string} name
 */
function presetShowCommand(name) {
  const preset = getPreset(name);

  if (!preset) {
    console.error(`[bkit-doctor] unknown preset: "${name}"`);
    console.error('');
    console.error('available presets:');
    const presets = listPresets();
    const maxNameLen = Math.max(...presets.map(p => p.name.length));
    for (const p of presets)
      console.error(`  ${p.name.padEnd(maxNameLen + 2)} ${p.description}`);
    process.exitCode = 1;
    return;
  }

  console.log(`preset: ${preset.name}`);
  console.log(`  ${'description'.padEnd(12)}: ${preset.description}`);
  console.log(`  ${'targets'.padEnd(12)}: ${preset.targets.join(', ')}`);
  console.log('');
  console.log(`apply: bkit-doctor init --preset ${preset.name} [--dry-run]`);
}

/**
 * preset recommend 핸들러
 *
 * 흐름:
 *   1. snapshot 재사용 또는 recompute → finalTargets
 *   2. rule-based 추천 → 최대 3개
 *   3. 각 추천에 reason + targets + apply hint 출력
 *   4. guidance (fix vs init --preset) 출력
 *
 * 절대 자동 적용하지 않는다.
 *
 * @param {Object} options
 */
async function presetRecommendCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());
  const fresh       = Boolean(options.fresh);

  console.log(`[bkit-doctor] preset recommend: ${projectRoot}`);
  console.log('');

  // ── 1. target 해석 ────────────────────────────────────────
  const { targets, snapshotStatus } = await resolveFixTargets(projectRoot, { fresh });

  if (snapshotStatus === 'invalid') {
    // 조용히 recompute했음을 알림
    console.log('[recommend] snapshot outdated, recomputed from current state');
    console.log('');
  }

  // ── 2. 추천 계산 ──────────────────────────────────────────
  const recommendations = recommendPresets(targets);

  console.log('recommended presets:');
  console.log('');

  // ── 3. 출력 ───────────────────────────────────────────────
  for (let i = 0; i < recommendations.length; i++) {
    const { preset, score, label, reason } = recommendations[i];
    const meta = getPreset(preset);

    console.log(`  ${i + 1}. ${preset} (score: ${score}, ${label})`);
    console.log(`     reason  : ${reason}`);
    if (meta) console.log(`     targets : ${meta.targets.join(', ')}`);
    console.log(`     apply   : bkit-doctor init --preset ${preset}`);
    console.log('');
  }

  // ── 4. guidance ───────────────────────────────────────────
  console.log("tip: use 'bkit-doctor fix' to apply recommended changes automatically");
  console.log("tip: use 'bkit-doctor init --preset <name> --dry-run' to preview a preset");
}

module.exports = { presetListCommand, presetShowCommand, presetRecommendCommand };
