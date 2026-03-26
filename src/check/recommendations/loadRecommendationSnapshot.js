'use strict';

const fs   = require('fs');
const path = require('path');
const { SNAPSHOT_REL_PATH } = require('./recommendationSnapshotModel');

/**
 * loadRecommendationSnapshot.js
 * 로컬 snapshot 파일을 읽어 파싱된 객체를 반환한다.
 * 파일 없음 / 파싱 실패 시 null 반환 (에러 throw 없음).
 *
 * @param {string} projectRoot
 * @returns {import('./recommendationSnapshotModel').RecommendationSnapshot|null}
 */
function loadRecommendationSnapshot(projectRoot) {
  const snapshotPath = path.join(projectRoot, SNAPSHOT_REL_PATH);
  try {
    const raw = fs.readFileSync(snapshotPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

module.exports = { loadRecommendationSnapshot };
