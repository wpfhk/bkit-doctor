'use strict';

/**
 * presetScoring.js
 * preset 별 score 계산 및 match label 생성.
 *
 * 설계 원칙:
 *   - Rule-based / deterministic (ML / AI 없음)
 *   - 동일 입력 → 동일 출력
 *   - score 범위: 0~100
 *   - 설명 가능한 규칙 (explainable)
 *
 * scoring 기준 요약:
 *   lean          — targets 없음(healthy) 또는 config만 부족할 때 높은 점수
 *   workflow-core — workflow 계열 target 부족 시 높은 점수
 *   docs          — docs 계열 target 부족 시 높은 점수
 *   default       — 여러 계열 혼합 부족 시 높은 점수
 */

const { classifyTargets } = require('./presetRecommend');

/**
 * score를 0~100 범위로 제한한다.
 * @param {number} n
 * @returns {number}
 */
function clampScore(n) {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/**
 * score 기반 match label 반환.
 *
 * @param {number} score  0~100
 * @returns {'high match' | 'medium match' | 'low match'}
 */
function getMatchLabel(score) {
  if (score >= 80) return 'high match';
  if (score >= 50) return 'medium match';
  return 'low match';
}

/**
 * finalTargets 기반으로 각 preset의 score를 계산한다.
 *
 * scoring 규칙:
 *
 *   lean:
 *     base 10
 *     +80  targets 없음 (healthy)            → 90
 *     +50  config만 부족 (workflow/docs 없음) → 60
 *     +20  total ≤ 2 (매우 적은 이슈)        → 30
 *
 *   workflow-core:
 *     base 10
 *     +20 per workflow target
 *     +20 workflow 계열이 다수 (workflow ≥ config, workflow ≥ docs)
 *     -15 docs도 부족 (docs > 0, workflow+docs 혼합)
 *
 *   docs:
 *     base 10
 *     +15 per docs target
 *     +20 docs 계열이 다수 (docs ≥ config, docs ≥ workflow)
 *
 *   default:
 *     base 10
 *     +40 혼합 (2개 이상 계열 부족)
 *     +5  per total target
 *     -20 targets 없음 (healthy에는 부적합)
 *
 * @param {string[]} finalTargets
 * @returns {{ lean: number, 'workflow-core': number, docs: number, default: number }}
 */
function computePresetScores(finalTargets) {
  const { config, workflow, docs, total } = classifyTargets(finalTargets);

  // lean
  let leanScore = 10;
  if (total === 0)                                        leanScore += 80;
  else if (config > 0 && workflow === 0 && docs === 0)    leanScore += 50;
  else if (total <= 2)                                    leanScore += 20;

  // workflow-core
  let workflowScore = 10;
  workflowScore += workflow * 20;
  if (workflow > 0 && workflow >= config && workflow >= docs) workflowScore += 20;
  if (docs > 0 && docs > workflow) workflowScore -= 15;

  // docs
  let docsScore = 10;
  docsScore += docs * 15;
  if (docs > 0 && docs >= config && docs >= workflow) docsScore += 20;

  // default
  let defaultScore = 10;
  const mixedTypes = (config > 0 ? 1 : 0) + (workflow > 0 ? 1 : 0) + (docs > 0 ? 1 : 0);
  if (mixedTypes >= 2)  defaultScore += 40;
  defaultScore += total * 5;
  if (total === 0)      defaultScore -= 20;

  return {
    lean:            clampScore(leanScore),
    'workflow-core': clampScore(workflowScore),
    docs:            clampScore(docsScore),
    default:         clampScore(defaultScore),
  };
}

module.exports = { computePresetScores, getMatchLabel, clampScore };
