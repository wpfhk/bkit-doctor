'use strict';

/**
 * configPaths.js
 * bkit-doctor 설정 파일 경로 상수.
 *
 * global 경로는 BKIT_DOCTOR_GLOBAL_CONFIG_DIR 환경 변수로 재지정 가능하다.
 * (테스트에서 임시 디렉터리를 사용할 때 활용)
 */

const path = require('path');
const os   = require('os');

/** local 설정 디렉터리 이름 */
const LOCAL_CONFIG_DIR = '.bkit-doctor';

/** local 설정 파일 이름 */
const LOCAL_CONFIG_FILE = 'settings.local.json';

/** global 설정 파일 이름 */
const GLOBAL_CONFIG_FILE = 'settings.global.json';

/**
 * local 설정 파일 경로.
 *
 * @param {string} projectRoot
 * @returns {string}
 */
function localConfigPath(projectRoot) {
  return path.join(projectRoot, LOCAL_CONFIG_DIR, LOCAL_CONFIG_FILE);
}

/**
 * global 설정 파일 경로.
 * BKIT_DOCTOR_GLOBAL_CONFIG_DIR 환경 변수가 있으면 그 아래에 저장.
 * 없으면 홈 디렉터리 기준.
 *
 * @returns {string}
 */
function globalConfigPath() {
  const base = process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR || os.homedir();
  return path.join(base, LOCAL_CONFIG_DIR, GLOBAL_CONFIG_FILE);
}

module.exports = { localConfigPath, globalConfigPath };
