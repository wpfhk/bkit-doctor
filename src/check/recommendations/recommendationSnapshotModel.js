'use strict';

/** snapshot 파일 버전 — 구조 변경 시 bump */
const SNAPSHOT_VERSION = '1';

/** snapshot 저장 경로 (projectRoot 기준 상대 경로) */
const SNAPSHOT_REL_PATH = '.bkit-doctor/cache/recommendation-snapshot.json';

/**
 * @typedef {Object} RecommendationSnapshot
 * @property {string}   version
 * @property {string}   createdAt        — ISO 8601
 * @property {string}   projectRoot
 * @property {string}   sourceCommand
 * @property {string[]} finalTargets     — grouped 추천 target 목록
 * @property {string}   suggestedCommand
 * @property {string}   suggestedDryRunCommand
 * @property {number}   issueCount
 * @property {string}   fingerprint      — 프로젝트 상태 해시
 */

/**
 * RecommendationSnapshot 생성 헬퍼
 * @param {{
 *   projectRoot:           string,
 *   finalTargets:          string[],
 *   suggestedCommand:      string,
 *   suggestedDryRunCommand: string,
 *   issueCount:            number,
 *   fingerprint:           string,
 * }} params
 * @returns {RecommendationSnapshot}
 */
function makeSnapshot(params) {
  const { projectRoot, finalTargets, suggestedCommand, suggestedDryRunCommand, issueCount, fingerprint } = params;
  return {
    version:              SNAPSHOT_VERSION,
    createdAt:            new Date().toISOString(),
    projectRoot,
    sourceCommand:        'bkit-doctor check',
    finalTargets,
    suggestedCommand,
    suggestedDryRunCommand,
    issueCount,
    fingerprint,
  };
}

module.exports = { SNAPSHOT_VERSION, SNAPSHOT_REL_PATH, makeSnapshot };
