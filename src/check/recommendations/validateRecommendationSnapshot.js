'use strict';

const { SNAPSHOT_VERSION } = require('./recommendationSnapshotModel');

/**
 * validateRecommendationSnapshot.js
 * snapshot 객체가 현재 환경에서 재사용 가능한지 검증한다.
 *
 * @param {object|null} snapshot
 * @param {string}      projectRoot      — 현재 실행 경로
 * @param {string}      currentFingerprint
 * @returns {{ valid: boolean, reason: string }}
 */
function validateRecommendationSnapshot(snapshot, projectRoot, currentFingerprint) {
  if (!snapshot)
    return { valid: false, reason: 'missing' };

  if (snapshot.version !== SNAPSHOT_VERSION)
    return { valid: false, reason: `version mismatch (got ${snapshot.version}, want ${SNAPSHOT_VERSION})` };

  // normalize separators for cross-platform comparison
  const norm = p => p.replace(/\\/g, '/');
  if (norm(snapshot.projectRoot) !== norm(projectRoot))
    return { valid: false, reason: 'projectRoot mismatch' };

  if (!Array.isArray(snapshot.finalTargets) || snapshot.finalTargets.length === 0) {
    // 빈 targets snapshot은 healthy 상태 — 재사용하되 targets는 빈 배열로 처리
    if (snapshot.fingerprint !== currentFingerprint)
      return { valid: false, reason: 'fingerprint mismatch' };
    return { valid: true, reason: 'healthy' };
  }

  if (snapshot.fingerprint !== currentFingerprint)
    return { valid: false, reason: 'fingerprint mismatch' };

  return { valid: true, reason: 'ok' };
}

module.exports = { validateRecommendationSnapshot };
