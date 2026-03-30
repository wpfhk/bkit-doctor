'use strict';

const { GROUPS }             = require('./groupingRegistry');
const { VALID_TARGETS }      = require('../../init/targetRegistry');
const { makeRecommendation } = require('./recommendationModel');
const { getPriority } = require('./buildRecommendations');

/**
 * groupRecommendations.js
 * priority 정렬된 Recommendation[] → grouped Recommendation[]
 *
 * 정책:
 * - group의 children 중 minChildren 개 이상이 있으면 parent로 대체
 * - parent가 VALID_TARGETS에 없으면 grouping 건너뜀 (children 유지)
 * - grouping 후 TARGET_PRIORITY 기준 재정렬
 *
 * @param {import('./recommendationModel').Recommendation[]} recommendations
 * @returns {{
 *   finalRecommendations: import('./recommendationModel').Recommendation[],
 *   groupedFrom: Map<string, string[]>,
 * }}
 */
function groupRecommendations(recommendations) {
  // target → Recommendation (mutation 가능한 Map)
  const resultMap   = new Map(recommendations.map(r => [r.target, r]));
  const groupedFrom = new Map();

  for (const group of GROUPS) {
    const { parent, children, minChildren, label, description } = group;

    // parent가 VALID_TARGETS에 없으면 이 group 건너뜀
    if (!VALID_TARGETS.has(parent)) continue;

    // 현재 result에 있는 children 수집
    const presentChildren = children.filter(c => resultMap.has(c));
    if (presentChildren.length < minChildren) continue;

    // children에서 sources 수집 후 제거
    const combinedSources = [];
    for (const c of presentChildren) {
      const rec = resultMap.get(c);
      combinedSources.push(...(rec.sources || []));
      resultMap.delete(c);
    }

    // parent Recommendation 생성
    resultMap.set(parent, makeRecommendation(parent, label, description, combinedSources));
    groupedFrom.set(parent, presentChildren);
  }

  // TARGET_PRIORITY 기준 재정렬
  const finalRecommendations = Array.from(resultMap.values()).sort(
    (a, b) => getPriority(a.target) - getPriority(b.target),
  );

  return { finalRecommendations, groupedFrom };
}

module.exports = { groupRecommendations };
