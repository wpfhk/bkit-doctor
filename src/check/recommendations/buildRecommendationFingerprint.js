'use strict';

const fs   = require('fs');
const path = require('path');
const { FILES }      = require('../../init/scaffoldManifest');
const { DIRECTORIES } = require('../../init/scaffoldManifest');

/**
 * scaffoldManifest의 파일 경로 + 핵심 추가 경로를 포함한 지문 대상 목록
 * 각 경로의 존재 여부(0/1)를 기록해 비교한다.
 */
const EXTRA_PATHS = [
  'CLAUDE.md',
  '.claude',
];

const FINGERPRINT_PATHS = [
  ...EXTRA_PATHS,
  ...DIRECTORIES.map(d => d.path),
  ...FILES.map(f => f.path),
];

/**
 * buildRecommendationFingerprint.js
 * 프로젝트 상태를 나타내는 결정적 fingerprint 문자열을 반환한다.
 *
 * 방식: 각 경로의 존재 여부(0/1)를 정렬 후 연결
 * - 파일/디렉터리 생성/삭제 시 fingerprint가 달라진다.
 * - 내용 변경(크기 동일)은 감지하지 않음 (MVP 범위)
 *
 * @param {string} projectRoot
 * @returns {string}
 */
function buildRecommendationFingerprint(projectRoot) {
  const entries = FINGERPRINT_PATHS.map(rel => {
    const full   = path.join(projectRoot, rel);
    const exists = fs.existsSync(full) ? '1' : '0';
    return `${rel}:${exists}`;
  });

  // 경로명 기준 정렬 (플랫폼 독립적)
  entries.sort();
  return entries.join('|');
}

module.exports = { buildRecommendationFingerprint };
