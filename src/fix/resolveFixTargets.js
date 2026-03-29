'use strict';

const { buildRecommendationFingerprint } = require('../check/recommendations/buildRecommendationFingerprint');
const { loadRecommendationSnapshot }     = require('../check/recommendations/loadRecommendationSnapshot');
const { validateRecommendationSnapshot } = require('../check/recommendations/validateRecommendationSnapshot');
const { computeRecommendations }         = require('../check/recommendations/computeRecommendations');

/**
 * resolveFixTargets.js
 * fix 명령을 위한 recommendation target 목록 해석.
 *
 * 우선순위:
 *   1. --fresh 없으면 snapshot 재사용 시도
 *   2. snapshot 유효하지 않으면 recompute
 *   3. snapshot 없으면 recompute (silent)
 *   4. --fresh면 snapshot 무시하고 recompute
 *
 * @param {string} projectRoot
 * @param {{ fresh?: boolean }} opts
 * @returns {Promise<{
 *   targets:        string[],
 *   fromSnapshot:   boolean,
 *   issueCount:     number,
 *   snapshotStatus: 'used' | 'invalid' | 'missing' | 'skipped',
 *   invalidReason?: string,
 * }>}
 */
async function resolveFixTargets(projectRoot, opts = {}) {
  const { fresh = false } = opts;

  if (!fresh) {
    const fingerprint         = buildRecommendationFingerprint(projectRoot);
    const snapshot            = loadRecommendationSnapshot(projectRoot);
    const { valid, reason }   = validateRecommendationSnapshot(snapshot, projectRoot, fingerprint);

    if (valid) {
      return {
        targets:        snapshot.finalTargets,
        fromSnapshot:   true,
        issueCount:     snapshot.issueCount || 0,
        snapshotStatus: 'used',
      };
    }

    if (snapshot) {
      // snapshot 있지만 유효하지 않음 → recompute
      const result = await computeRecommendations(projectRoot);
      return {
        targets:        result.recommendations.map(r => r.target),
        fromSnapshot:   false,
        issueCount:     result.issueCount,
        snapshotStatus: 'invalid',
        invalidReason:  reason,
      };
    }

    // snapshot 없음 → recompute
    const result = await computeRecommendations(projectRoot);
    return {
      targets:        result.recommendations.map(r => r.target),
      fromSnapshot:   false,
      issueCount:     result.issueCount,
      snapshotStatus: 'missing',
    };
  }

  // --fresh: snapshot 무시하고 recompute
  const result = await computeRecommendations(projectRoot);
  return {
    targets:        result.recommendations.map(r => r.target),
    fromSnapshot:   false,
    issueCount:     result.issueCount,
    snapshotStatus: 'skipped',
  };
}

module.exports = { resolveFixTargets };
