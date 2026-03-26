'use strict';

const { REMEDIATION_MAP }    = require('../../shared/remediationMap');
const { makeRecommendation } = require('./recommendationModel');

/**
 * buildRecommendations.js
 * check 결과 배열을 입력받아 recommended targets를 계산한다.
 *
 * 규칙:
 * - status가 warn 또는 fail인 항목만 대상
 * - remediationMap에 initTarget이 있는 항목만 포함
 * - initTarget 기준으로 dedupe
 * - pass 항목 제외
 * - 매핑 없는 checker는 unmapped로 별도 계수
 *
 * @param {Object[]} results  — check 결과 배열 (normalizeResult 적용 완료)
 * @returns {{ recommendations: Recommendation[], unmappedCount: number }}
 */
function buildRecommendations(results) {
  const targetMap = new Map();  // target → Recommendation
  let unmappedCount = 0;

  for (const r of results) {
    if (r.status === 'pass') continue;

    const rem = REMEDIATION_MAP[r.id];

    if (!rem || !rem.initTarget) {
      // remediationMap에 없거나 initTarget이 null인 checker
      unmappedCount++;
      continue;
    }

    const { initTarget, label, description } = rem;

    if (targetMap.has(initTarget)) {
      // 동일 target이 이미 있으면 source만 추가
      targetMap.get(initTarget).sources.push(r.id);
    } else {
      targetMap.set(
        initTarget,
        makeRecommendation(initTarget, label, description, [r.id]),
      );
    }
  }

  return {
    recommendations: Array.from(targetMap.values()),
    unmappedCount,
  };
}

module.exports = { buildRecommendations };
