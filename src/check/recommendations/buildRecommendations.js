'use strict';

const { REMEDIATION_MAP }  = require('../../shared/remediationMap');
const { VALID_TARGETS }    = require('../../init/targetRegistry');
const { makeRecommendation } = require('./recommendationModel');

/**
 * target 우선순위 정의
 * 기반 구조 > config > 에이전트/스킬 > 문서 순
 * 미등록 target은 낮은 우선순위(999)로 정렬됨
 */
const TARGET_PRIORITY = [
  'claude-root',
  'hooks-json',
  'settings-local',
  'policies-core',
  'agents-core',
  'skills-core',
  'templates-core',
  'docs-core',
  'docs-pdca',
  'docs-plan',
  'docs-design',
  'docs-task',
  'docs-report',
  'docs-changelog',
];

const PRIORITY_MAP = Object.fromEntries(
  TARGET_PRIORITY.map((t, i) => [t, i]),
);

function getPriority(target) {
  return PRIORITY_MAP[target] !== undefined ? PRIORITY_MAP[target] : 999;
}

/**
 * buildRecommendations.js
 * check 결과 배열 → priority 정렬된 Recommendation[]
 *
 * 규칙:
 * - status warn / fail만 대상
 * - remediationMap에 initTarget이 있는 항목만 포함
 * - VALID_TARGETS에 없는 target은 invalid로 제외
 * - initTarget 기준 dedupe
 * - TARGET_PRIORITY 기준 오름차순 정렬
 *
 * @param {Object[]} results
 * @returns {{ recommendations: Recommendation[], unmappedCount: number, invalidCount: number }}
 */
function buildRecommendations(results) {
  const targetMap    = new Map();
  let unmappedCount  = 0;
  let invalidCount   = 0;

  for (const r of results) {
    if (r.status === 'pass') continue;

    const rem = REMEDIATION_MAP[r.id];

    if (!rem || !rem.initTarget) {
      unmappedCount++;
      continue;
    }

    const { initTarget, label, description } = rem;

    // targetRegistry에 없는 target은 제외
    if (!VALID_TARGETS.has(initTarget)) {
      invalidCount++;
      continue;
    }

    if (targetMap.has(initTarget)) {
      targetMap.get(initTarget).sources.push(r.id);
    } else {
      targetMap.set(
        initTarget,
        makeRecommendation(initTarget, label, description, [r.id]),
      );
    }
  }

  // priority 정렬
  const recommendations = Array.from(targetMap.values()).sort(
    (a, b) => getPriority(a.target) - getPriority(b.target),
  );

  return { recommendations, unmappedCount, invalidCount };
}

module.exports = { buildRecommendations, TARGET_PRIORITY, getPriority };
