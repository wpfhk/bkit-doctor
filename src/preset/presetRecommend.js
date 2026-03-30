'use strict';

/**
 * presetRecommend.js
 * 현재 프로젝트 상태(finalTargets) 기반 rule-based preset 추천.
 *
 * Phase 6-4: scoring + ranking 추가.
 *   - 각 추천 항목에 score (0~100) 및 match label 포함
 *   - score 기준 내림차순 정렬 (상위 3개)
 *   - 기존 reason 필드 유지 (하위 호환)
 *
 * 재사용:
 *   - resolveFixTargets → snapshot/recompute 통합 (fix와 동일 로직)
 *   - getPreset → preset 메타데이터 조회
 *
 * preset recommend vs fix:
 *   fix             = recommendation 기반 자동 적용
 *   preset recommend = preset 선택 가이드 (절대 자동 적용 안 함)
 */

/** config 계열 target */
const CATEGORY_CONFIG   = new Set(['claude-root', 'hooks-json', 'settings-local']);

/** workflow 계열 target */
const CATEGORY_WORKFLOW = new Set([
  'agents-core', 'skills-core', 'templates-core', 'policies-core',
]);

/** docs 계열 target */
const CATEGORY_DOCS = new Set([
  'docs-core', 'docs-pdca', 'docs-plan', 'docs-design', 'docs-task', 'docs-report', 'docs-changelog',
]);

/**
 * target 목록을 카테고리별로 분류한다.
 *
 * @param {string[]} targets
 * @returns {{ config: number, workflow: number, docs: number, total: number }}
 */
function classifyTargets(targets) {
  let config = 0, workflow = 0, docs = 0;
  for (const t of targets) {
    if (CATEGORY_CONFIG.has(t))        config++;
    else if (CATEGORY_WORKFLOW.has(t)) workflow++;
    else if (CATEGORY_DOCS.has(t))     docs++;
  }
  return { config, workflow, docs, total: targets.length };
}

/**
 * preset 별 상황 맞춤 reason을 반환한다.
 *
 * @param {number} config
 * @param {number} workflow
 * @param {number} docs
 * @param {number} total
 * @returns {Record<string, string>}
 */
function buildReasonMap(config, workflow, docs, total) {
  return {
    lean: total === 0
      ? 'project looks healthy — lean provides the minimum recommended structure'
      : 'basic configuration is the primary gap',
    'workflow-core': 'workflow structure (agents / skills / templates / policies) is incomplete',
    docs: docs > 0 && workflow === 0
      ? 'documentation structure is incomplete'
      : 'documentation structure is also incomplete',
    default: 'multiple structure components are missing across config, workflow, and docs',
  };
}

/**
 * Rule-based + scoring 기반 preset 추천.
 *
 * 각 preset에 score(0~100)와 label을 부여하여 score 내림차순으로 정렬,
 * 상위 3개를 반환한다.
 *
 * @param {string[]} finalTargets
 * @returns {{ preset: string, score: number, label: string, reason: string }[]}
 */
function recommendPresets(finalTargets) {
  // scoring 모듈은 require-time 순환 참조를 피하기 위해 지연 로드
  const { computePresetScores, getMatchLabel } = require('./presetScoring');

  const { config, workflow, docs, total } = classifyTargets(finalTargets);
  const scores  = computePresetScores(finalTargets);
  const reasons = buildReasonMap(config, workflow, docs, total);

  const all = Object.entries(scores)
    .map(([preset, score]) => ({
      preset,
      score,
      label:  getMatchLabel(score),
      reason: reasons[preset] ?? `${preset} preset matches your project structure`,
    }))
    .sort((a, b) => b.score - a.score);

  return all.slice(0, 3);
}

module.exports = {
  recommendPresets,
  classifyTargets,
  CATEGORY_CONFIG,
  CATEGORY_WORKFLOW,
  CATEGORY_DOCS,
};
