'use strict';

const fs   = require('fs');
const path = require('path');
const { buildRecommendations }           = require('./buildRecommendations');
const { groupRecommendations }           = require('./groupRecommendations');
const { buildSuggestedFlow }             = require('./buildSuggestedFlow');
const { buildRecommendationFingerprint } = require('./buildRecommendationFingerprint');
const { makeSnapshot, SNAPSHOT_REL_PATH } = require('./recommendationSnapshotModel');

/**
 * saveRecommendationSnapshot.js
 * check 결과에서 snapshot을 계산하고 디스크에 저장한다.
 *
 * 저장 실패는 silent — check 흐름을 깨지 않는다.
 *
 * @param {string}   projectRoot
 * @param {Object[]} results      — CheckerRunner.run() 결과
 */
function saveRecommendationSnapshot(projectRoot, results) {
  try {
    const warn = results.filter(r => r.status === 'warn').length;
    const fail = results.filter(r => r.status === 'fail').length;
    const issueCount = warn + fail;

    const { recommendations }              = buildRecommendations(results);
    const { finalRecommendations }         = groupRecommendations(recommendations);
    const flow                             = buildSuggestedFlow(finalRecommendations, issueCount);
    const fingerprint                      = buildRecommendationFingerprint(projectRoot);

    const finalTargets = finalRecommendations.map(r => r.target);

    // normalize separators so projectRoot is platform-independent in the snapshot
    const projectRootNorm = projectRoot.replace(/\\/g, '/');

    const snapshot = makeSnapshot({
      projectRoot: projectRootNorm,
      finalTargets,
      suggestedCommand:       flow ? flow.applyCommand       : '',
      suggestedDryRunCommand: flow ? flow.previewCommand     : '',
      issueCount,
      fingerprint,
    });

    const snapshotPath = path.join(projectRoot, SNAPSHOT_REL_PATH);
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
  } catch {
    // silent — snapshot 저장 실패는 check 흐름에 영향 없음
  }
}

module.exports = { saveRecommendationSnapshot };
