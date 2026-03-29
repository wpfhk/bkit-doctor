'use strict';

/**
 * loadConfig.js
 * bkit-doctor 설정 로드 헬퍼.
 *
 * load 명령이 사용하는 설정 로드 로직을 담당한다.
 * readConfig (saveConfig.js)와의 차이:
 *   - readConfig: 파싱만 수행 (null on failure)
 *   - loadConfig: 파일 존재 확인 + 스키마 검증 + 에러 컨텍스트 반환
 */

const fs              = require('fs');
const { readConfig }  = require('./saveConfig');

/**
 * 설정 파일을 로드하고 유효성을 검증한다.
 *
 * @param {string} filePath
 * @returns {{ config: object|null, error: string|null }}
 */
function loadConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    return { config: null, error: `config file not found: ${filePath}` };
  }

  const config = readConfig(filePath);
  if (!config) {
    return { config: null, error: `failed to parse config file: ${filePath}` };
  }

  if (!config.defaultMode) {
    return { config: null, error: `invalid config: missing defaultMode in ${filePath}` };
  }

  if (config.defaultMode !== 'recommended' && config.defaultMode !== 'preset') {
    return { config: null, error: `invalid config: unknown defaultMode "${config.defaultMode}" in ${filePath}` };
  }

  if (config.defaultMode === 'preset' && !config.presetName) {
    return { config: null, error: `invalid config: preset mode requires presetName in ${filePath}` };
  }

  return { config, error: null };
}

module.exports = { loadConfig };
