'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * 존재하지 않는 경로 목록 반환
 * @param {string}   root          기준 절대 경로
 * @param {string[]} relativePaths root 기준 상대 경로 배열
 * @returns {string[]}
 */
function findMissingFiles(root, relativePaths) {
  return relativePaths.filter(p => !fs.existsSync(path.join(root, p)));
}

module.exports = { findMissingFiles };
