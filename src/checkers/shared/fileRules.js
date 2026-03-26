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

/**
 * 후보 경로 중 하나라도 존재하면 true
 * @param {string}   root
 * @param {string[]} candidates
 * @returns {boolean}
 */
function hasAnyFile(root, candidates) {
  return candidates.some(p => fs.existsSync(path.join(root, p)));
}

/**
 * 모든 경로가 존재하면 true
 * @param {string}   root
 * @param {string[]} paths
 * @returns {boolean}
 */
function hasAllFiles(root, paths) {
  return paths.every(p => fs.existsSync(path.join(root, p)));
}

module.exports = { findMissingFiles, hasAnyFile, hasAllFiles };
