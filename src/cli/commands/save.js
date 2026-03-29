'use strict';

/**
 * save.js
 * bkit-doctor 기본 동작 설정 저장 명령.
 *
 * 역할:
 *   사용자의 기본 동작 선호(recommended 또는 preset)를
 *   local / global / both 범위로 저장한다.
 *
 * 이 명령은 파일을 "저장"하는 것만 한다.
 * scaffold 생성이나 init 실행은 하지 않는다.
 *
 * 저장 위치:
 *   local  → .bkit-doctor/settings.local.json
 *   global → ~/.bkit-doctor/settings.global.json
 *   both   → 두 위치 모두
 */

const path = require('path');
const { localConfigPath, globalConfigPath } = require('../../config/configPaths');
const { saveConfig }                        = require('../../config/saveConfig');
const { resolvePreset, listPresets }        = require('../../init/presetRegistry');

/**
 * save command 핸들러.
 *
 * @param {Object} options
 * @param {boolean} [options.local]
 * @param {boolean} [options.global]
 * @param {boolean} [options.both]
 * @param {boolean} [options.recommended]
 * @param {string}  [options.preset]
 * @param {string}  [options.path]
 */
function saveCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());

  // ── 범위(scope) 유효성 검사 ──────────────────────────────────
  const useLocal  = Boolean(options.local);
  const useGlobal = Boolean(options.global);
  const useBoth   = Boolean(options.both);

  if (useLocal && useGlobal) {
    console.error('[bkit-doctor] error: use --both instead of combining --local and --global');
    process.exitCode = 1;
    return;
  }

  if (useBoth && (useLocal || useGlobal)) {
    console.error('[bkit-doctor] error: --both cannot be combined with --local or --global');
    process.exitCode = 1;
    return;
  }

  if (!useLocal && !useGlobal && !useBoth) {
    console.error('[bkit-doctor] error: specify a scope: --local, --global, or --both');
    process.exitCode = 1;
    return;
  }

  const scopes = useBoth ? ['local', 'global']
    : useLocal            ? ['local']
    : /* useGlobal */       ['global'];

  // ── 대상(target) 유효성 검사 ─────────────────────────────────
  const useRecommended = Boolean(options.recommended);
  const presetName     = options.preset || null;

  if (useRecommended && presetName) {
    console.error('[bkit-doctor] error: --recommended and --preset are mutually exclusive — choose one');
    process.exitCode = 1;
    return;
  }

  if (!useRecommended && !presetName) {
    console.error('[bkit-doctor] error: specify a target: --recommended or --preset <name>');
    process.exitCode = 1;
    return;
  }

  if (presetName && !resolvePreset(presetName)) {
    console.error(`[bkit-doctor] error: unknown preset "${presetName}"`);
    console.error('available presets: ' + listPresets().map(p => p.name).join(', '));
    process.exitCode = 1;
    return;
  }

  // ── config 객체 구성 ─────────────────────────────────────────
  const config = useRecommended
    ? { defaultMode: 'recommended' }
    : { defaultMode: 'preset', presetName };

  // ── 저장 ─────────────────────────────────────────────────────
  const written = [];

  for (const scope of scopes) {
    const filePath = scope === 'local'
      ? localConfigPath(projectRoot)
      : globalConfigPath();

    saveConfig(filePath, config);
    written.push({ scope, filePath });
  }

  // ── 성공 메시지 ──────────────────────────────────────────────
  const modeDesc = useRecommended
    ? 'recommended mode'
    : `preset mode (${presetName})`;

  const scopeLabel = useBoth ? 'local + global'
    : useLocal              ? 'local'
    : /* useGlobal */         'global';

  for (const { scope, filePath } of written) {
    console.log(`[bkit-doctor] save: ${scope} → ${filePath}`);
  }

  console.log('');
  console.log(`Saved ${scopeLabel} bkit-doctor settings (${modeDesc})`);
}

module.exports = { saveCommand };
