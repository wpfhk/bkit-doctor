'use strict';

/**
 * load.js
 * bkit-doctor 설정 로드 명령.
 *
 * 저장된 bkit-doctor 설정(local/global/file)을 읽어
 * 현재 프로젝트에 적용한다.
 *
 * 적용 대상: .bkit-doctor/settings.local.json
 * 적용 제외: package.json, OS config, shell config, secrets
 *
 * 지원 형태:
 *   bkit-doctor load --local             로컬 설정 확인 및 재적용
 *   bkit-doctor load --global            글로벌 설정을 현재 프로젝트에 적용
 *   bkit-doctor load --file <path>       파일 설정을 현재 프로젝트에 적용
 */

const path = require('path');
const { localConfigPath, globalConfigPath } = require('../../config/configPaths');
const { loadConfig }  = require('../../config/loadConfig');
const { saveConfig }  = require('../../config/saveConfig');

/**
 * load command 핸들러.
 *
 * @param {Object} options
 * @param {boolean} [options.local]
 * @param {boolean} [options.global]
 * @param {string}  [options.file]
 * @param {string}  [options.path]
 */
function loadCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());

  const useLocal  = Boolean(options.local);
  const useGlobal = Boolean(options.global);
  const useFile   = options.file || null;

  // ── 소스 옵션 검증 ────────────────────────────────────────
  const optCount = [useLocal, useGlobal, Boolean(useFile)].filter(Boolean).length;

  if (optCount === 0) {
    console.error('[bkit-doctor] error: specify a source: --local, --global, or --file <path>');
    process.exitCode = 1;
    return;
  }

  if (optCount > 1) {
    console.error('[bkit-doctor] error: specify only one source: --local, --global, or --file <path>');
    process.exitCode = 1;
    return;
  }

  // ── 소스 경로 결정 ────────────────────────────────────────
  let sourcePath;
  let sourceLabel;

  if (useLocal) {
    sourcePath  = localConfigPath(projectRoot);
    sourceLabel = 'local';
  } else if (useGlobal) {
    sourcePath  = globalConfigPath();
    sourceLabel = 'global';
  } else {
    sourcePath  = path.resolve(useFile);
    sourceLabel = `file`;
  }

  // ── 설정 로드 ──────────────────────────────────────────────
  const { config, error } = loadConfig(sourcePath);

  if (!config) {
    console.error(`[bkit-doctor] load: ${error}`);
    if (useLocal || useGlobal) {
      console.error('  hint: run "bkit-doctor save" to create a config first');
    }
    process.exitCode = 1;
    return;
  }

  // ── 적용 (.bkit-doctor/settings.local.json에 저장) ────────
  const targetPath = localConfigPath(projectRoot);
  saveConfig(targetPath, config);

  // ── 성공 메시지 ────────────────────────────────────────────
  const modeDesc = config.defaultMode === 'recommended'
    ? 'recommended mode'
    : `preset mode (${config.presetName})`;

  console.log(`[bkit-doctor] load: settings applied from ${sourceLabel}`);
  console.log('');
  console.log(`  source  → ${sourcePath}`);
  console.log(`  applied → ${targetPath}`);
  console.log(`  config  : defaultMode = ${config.defaultMode}${config.presetName ? `, presetName = ${config.presetName}` : ''}`);
  console.log('');
  console.log(`Loaded ${sourceLabel} bkit-doctor settings (${modeDesc})`);
}

module.exports = { loadCommand };
