'use strict';

/**
 * @typedef {Object} CheckResult
 * @property {string}   id
 * @property {string}   category
 * @property {string}   title
 * @property {'pass'|'warn'|'fail'} status
 * @property {string}   message
 * @property {string[]} missing    - 누락된 파일/경로 (init 연결용)
 * @property {string[]} found      - 실제 발견된 항목
 * @property {string[]} expected   - checker 기준 전체 기대 목록
 * @property {string}   [fixHint]  - 수정 힌트 (remediationMap 주입)
 * @property {string}   [initTarget] - init 생성 대상 키
 */

/**
 * checker raw result → 정규화된 구조
 * @param {Object} raw
 * @returns {{ status, message, missing, found, expected }}
 */
function normalizeResult(raw) {
  return {
    status:   raw.status,
    message:  raw.message,
    missing:  Array.isArray(raw.missing)  ? raw.missing  : [],
    found:    Array.isArray(raw.found)    ? raw.found    : [],
    expected: Array.isArray(raw.expected) ? raw.expected : [],
  };
}

module.exports = { normalizeResult };
