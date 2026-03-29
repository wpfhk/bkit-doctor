'use strict';

/**
 * saveConfig.js
 * bkit-doctor 설정 파일 읽기/쓰기.
 *
 * 설정 스키마:
 *   { "defaultMode": "recommended" }
 *   { "defaultMode": "preset", "presetName": "<name>" }
 *
 * 두 경로(local / global) 모두 동일 스키마를 사용한다.
 * 파일은 사람이 열어도 이해할 수 있는 수준으로 유지한다.
 */

const fs   = require('fs');
const path = require('path');

/**
 * 설정 객체를 파일에 저장한다.
 * 디렉터리가 없으면 자동 생성.
 *
 * @param {string} filePath
 * @param {object} config
 */
function saveConfig(filePath, config) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

/**
 * 설정 파일을 읽어 반환한다.
 * 파일이 없거나 파싱에 실패하면 null 반환.
 *
 * @param {string} filePath
 * @returns {object|null}
 */
function readConfig(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

module.exports = { saveConfig, readConfig };
