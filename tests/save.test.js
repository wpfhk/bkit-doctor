'use strict';

/**
 * save.test.js
 * save command 단위 + CLI 통합 테스트
 *
 * 실행: node --test tests/save.test.js
 *
 * 각 테스트는 임시 디렉터리를 사용하여 실제 파일 시스템을 오염시키지 않는다.
 * global 경로는 BKIT_DOCTOR_GLOBAL_CONFIG_DIR 환경 변수로 재지정한다.
 */

const { test, after } = require('node:test');
const assert          = require('node:assert/strict');
const { spawnSync }   = require('child_process');
const os              = require('os');
const path            = require('path');
const fs              = require('fs');

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli', 'index.js');

// ── 헬퍼 ────────────────────────────────────────────────────────────────────

const tmpDirs = [];

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-save-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

/**
 * CLI 실행 헬퍼.
 * projectDir: --path 로 전달
 * globalDir:  BKIT_DOCTOR_GLOBAL_CONFIG_DIR 로 전달 (global 경로 격리)
 */
function runSave(args, { projectDir, globalDir } = {}) {
  const env = { ...process.env };
  if (globalDir) env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;

  const finalArgs = projectDir
    ? ['save', '--path', projectDir, ...args]
    : ['save', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    env,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ── 단위: configPaths ────────────────────────────────────────────────────────

const { localConfigPath, globalConfigPath } = require('../src/config/configPaths');

test('localConfigPath: returns path under .bkit-doctor', () => {
  const p = localConfigPath('/some/project');
  assert.ok(p.includes('.bkit-doctor'));
  assert.ok(p.endsWith('settings.local.json'));
});

test('globalConfigPath: respects BKIT_DOCTOR_GLOBAL_CONFIG_DIR', () => {
  const original = process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR;
  process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = '/tmp/test-global';
  const p = globalConfigPath();
  if (original === undefined) delete process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR;
  else process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = original;

  // Windows normalizes /tmp/test-global → C:\tmp\test-global, so use includes
  assert.ok(p.includes('test-global'), `expected path to contain "test-global", got: ${p}`);
  assert.ok(p.endsWith('settings.global.json'));
});

// ── 단위: saveConfig / readConfig ────────────────────────────────────────────

const { saveConfig, readConfig } = require('../src/config/saveConfig');

test('saveConfig: creates file and directories', () => {
  const dir = makeTempDir();
  const filePath = path.join(dir, 'nested', 'settings.local.json');
  saveConfig(filePath, { defaultMode: 'recommended' });
  assert.ok(fs.existsSync(filePath), 'file should exist');
});

test('saveConfig: writes valid JSON', () => {
  const dir = makeTempDir();
  const filePath = path.join(dir, '.bkit-doctor', 'settings.local.json');
  saveConfig(filePath, { defaultMode: 'preset', presetName: 'lean' });
  const data = readJSON(filePath);
  assert.strictEqual(data.defaultMode, 'preset');
  assert.strictEqual(data.presetName, 'lean');
});

test('readConfig: returns null for missing file', () => {
  const result = readConfig('/nonexistent/path/settings.json');
  assert.strictEqual(result, null);
});

test('readConfig: returns parsed object for existing file', () => {
  const dir = makeTempDir();
  const filePath = path.join(dir, 'settings.json');
  fs.writeFileSync(filePath, JSON.stringify({ defaultMode: 'recommended' }) + '\n');
  const result = readConfig(filePath);
  assert.strictEqual(result.defaultMode, 'recommended');
});

// ── CLI 통합: 성공 케이스 ────────────────────────────────────────────────────

test('save --local --recommended: exit 0', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local', '--recommended'], { projectDir });
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('save --local --recommended: local file written', () => {
  const projectDir = makeTempDir();
  runSave(['--local', '--recommended'], { projectDir });
  const filePath = localConfigPath(projectDir);
  assert.ok(fs.existsSync(filePath), 'local settings file should exist');
  const data = readJSON(filePath);
  assert.strictEqual(data.defaultMode, 'recommended');
});

test('save --global --preset default: exit 0', () => {
  const globalDir = makeTempDir();
  const projectDir = makeTempDir();
  const r = runSave(['--global', '--preset', 'default'], { projectDir, globalDir });
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('save --global --preset default: global file written', () => {
  const globalDir  = makeTempDir();
  const projectDir = makeTempDir();
  runSave(['--global', '--preset', 'default'], { projectDir, globalDir });

  const env = { ...process.env, BKIT_DOCTOR_GLOBAL_CONFIG_DIR: globalDir };
  const filePath = require('../src/config/configPaths').globalConfigPath.call(
    null, ...([], []) // re-read with env already set above
  );

  // globalConfigPath reads process.env at call time, so set env before calling
  const origEnv = process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR;
  process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;
  const gPath = globalConfigPath();
  if (origEnv === undefined) delete process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR;
  else process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = origEnv;

  assert.ok(fs.existsSync(gPath), 'global settings file should exist');
  const data = readJSON(gPath);
  assert.strictEqual(data.defaultMode, 'preset');
  assert.strictEqual(data.presetName, 'default');
});

test('save --both --preset lean: exit 0', () => {
  const projectDir = makeTempDir();
  const globalDir  = makeTempDir();
  const r = runSave(['--both', '--preset', 'lean'], { projectDir, globalDir });
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('save --both --preset lean: both files written', () => {
  const projectDir = makeTempDir();
  const globalDir  = makeTempDir();
  runSave(['--both', '--preset', 'lean'], { projectDir, globalDir });

  const localPath = localConfigPath(projectDir);
  assert.ok(fs.existsSync(localPath), 'local settings file should exist');

  const origEnv = process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR;
  process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;
  const gPath = globalConfigPath();
  if (origEnv === undefined) delete process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR;
  else process.env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = origEnv;

  assert.ok(fs.existsSync(gPath), 'global settings file should exist');

  const localData  = readJSON(localPath);
  const globalData = readJSON(gPath);
  assert.strictEqual(localData.presetName,  'lean');
  assert.strictEqual(globalData.presetName, 'lean');
});

test('save --local --recommended: success message includes "Saved"', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local', '--recommended'], { projectDir });
  assert.ok(r.stdout.includes('Saved'), r.stdout);
});

test('save --global --preset default: success message includes preset name', () => {
  const globalDir  = makeTempDir();
  const projectDir = makeTempDir();
  const r = runSave(['--global', '--preset', 'default'], { projectDir, globalDir });
  assert.ok(r.stdout.includes('default'), r.stdout);
});

// ── CLI 통합: 오류 케이스 ────────────────────────────────────────────────────

test('save --local (no target): non-zero exit', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local'], { projectDir });
  assert.notStrictEqual(r.code, 0, 'should fail without target');
});

test('save --local (no target): error message mentions --recommended or --preset', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local'], { projectDir });
  const combined = r.stdout + r.stderr;
  assert.ok(
    combined.includes('--recommended') || combined.includes('--preset'),
    combined
  );
});

test('save (no scope): non-zero exit', () => {
  const r = runSave(['--recommended']);
  assert.notStrictEqual(r.code, 0);
});

test('save --recommended --preset default (conflict): non-zero exit', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local', '--recommended', '--preset', 'default'], { projectDir });
  assert.notStrictEqual(r.code, 0);
});

test('save --local --global (conflict): non-zero exit', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local', '--global', '--recommended'], { projectDir });
  assert.notStrictEqual(r.code, 0);
});

test('save --local --preset unknown: non-zero exit', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local', '--preset', 'unknown-preset'], { projectDir });
  assert.notStrictEqual(r.code, 0);
});

test('save --local --preset unknown: error message includes preset name', () => {
  const projectDir = makeTempDir();
  const r = runSave(['--local', '--preset', 'unknown-preset'], { projectDir });
  const combined = r.stdout + r.stderr;
  assert.ok(combined.includes('unknown-preset'), combined);
});

// ── 저장된 config 파일 구조 검증 ─────────────────────────────────────────────

test('saved recommended config: has defaultMode recommended', () => {
  const projectDir = makeTempDir();
  runSave(['--local', '--recommended'], { projectDir });
  const data = readJSON(localConfigPath(projectDir));
  assert.strictEqual(data.defaultMode, 'recommended');
  assert.ok(!('presetName' in data), 'presetName should not be present for recommended');
});

test('saved preset config: has defaultMode preset and presetName', () => {
  const projectDir = makeTempDir();
  runSave(['--local', '--preset', 'lean'], { projectDir });
  const data = readJSON(localConfigPath(projectDir));
  assert.strictEqual(data.defaultMode, 'preset');
  assert.strictEqual(data.presetName, 'lean');
});

test('overwrite: save again updates existing file', () => {
  const projectDir = makeTempDir();
  runSave(['--local', '--preset', 'lean'], { projectDir });
  runSave(['--local', '--recommended'], { projectDir });
  const data = readJSON(localConfigPath(projectDir));
  assert.strictEqual(data.defaultMode, 'recommended');
});

// ── regression ───────────────────────────────────────────────────────────────

const CLI_PATH_RAW = path.join(__dirname, '..', 'src', 'cli', 'index.js');
function runCLI(args) {
  const r = spawnSync(process.execPath, [CLI_PATH_RAW, ...args], { encoding: 'utf8' });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

test('regression: fix --dry-run still works', () => {
  const r = runCLI(['fix', '--dry-run']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});

test('regression: init --preset lean --dry-run still works', () => {
  const r = runCLI(['init', '--preset', 'lean', '--dry-run']);
  assert.strictEqual(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
});
