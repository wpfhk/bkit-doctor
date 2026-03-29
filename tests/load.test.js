'use strict';

/**
 * load.test.js
 * load command 단위 + CLI 통합 테스트
 *
 * 실행: node --test tests/load.test.js
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bkit-doctor-load-'));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

function runLoad(args, { projectDir, globalDir } = {}) {
  const env = { ...process.env };
  if (globalDir) env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;

  const finalArgs = projectDir
    ? ['load', '--path', projectDir, ...args]
    : ['load', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    env,
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

function runSave(args, { projectDir, globalDir } = {}) {
  const env = { ...process.env };
  if (globalDir) env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;

  const finalArgs = projectDir
    ? ['save', '--path', projectDir, ...args]
    : ['save', ...args];

  const r = spawnSync(process.execPath, [CLI_PATH, ...finalArgs], {
    encoding: 'utf8',
    env,
    timeout: 15000,
  });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status ?? 1 };
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ── 테스트 ───────────────────────────────────────────────────────────────────

test('load: no source flag → exit 1', () => {
  const r = runLoad([]);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /specify a source/i);
});

test('load: multiple source flags → exit 1', () => {
  const r = runLoad(['--local', '--global']);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /specify only one source/i);
});

test('load --local: no config → exit 1 with hint', () => {
  const dir = makeTempDir();
  const r   = runLoad(['--local'], { projectDir: dir });
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /config file not found/i);
  assert.match(r.stderr, /bkit-doctor save/i);
});

test('load --global: no config → exit 1 with hint', () => {
  const globalDir = makeTempDir();
  const projectDir = makeTempDir();
  const r = runLoad(['--global'], { projectDir, globalDir });
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /config file not found/i);
});

test('load --file: missing file → exit 1', () => {
  const r = runLoad(['--file', '/nonexistent/path/settings.json']);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /config file not found/i);
});

test('load --local: success after save', () => {
  const dir = makeTempDir();
  runSave(['--local', '--recommended'], { projectDir: dir });

  const r = runLoad(['--local'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /applied from local/i);
  assert.match(r.stdout, /recommended mode/i);
});

test('load --global: applies global config to project local', () => {
  const projectDir = makeTempDir();
  const globalDir  = makeTempDir();

  runSave(['--global', '--preset', 'lean'], { globalDir });

  const r = runLoad(['--global'], { projectDir, globalDir });
  assert.strictEqual(r.code, 0);

  const localPath = path.join(projectDir, '.bkit-doctor', 'settings.local.json');
  assert.ok(fs.existsSync(localPath), 'local settings file should be created');

  const cfg = readJSON(localPath);
  assert.strictEqual(cfg.defaultMode, 'preset');
  assert.strictEqual(cfg.presetName, 'lean');
});

test('load --file: applies file config to project local', () => {
  const projectDir = makeTempDir();
  const srcDir     = makeTempDir();

  runSave(['--local', '--preset', 'default'], { projectDir: srcDir });
  const srcFile = path.join(srcDir, '.bkit-doctor', 'settings.local.json');

  const r = runLoad(['--file', srcFile], { projectDir });
  assert.strictEqual(r.code, 0);

  const localPath = path.join(projectDir, '.bkit-doctor', 'settings.local.json');
  const cfg = readJSON(localPath);
  assert.strictEqual(cfg.defaultMode, 'preset');
  assert.strictEqual(cfg.presetName, 'default');
});

test('save + load roundtrip: recommended', () => {
  const dir = makeTempDir();

  const saveResult = runSave(['--local', '--recommended'], { projectDir: dir });
  assert.strictEqual(saveResult.code, 0);

  const loadResult = runLoad(['--local'], { projectDir: dir });
  assert.strictEqual(loadResult.code, 0);

  const cfg = readJSON(path.join(dir, '.bkit-doctor', 'settings.local.json'));
  assert.strictEqual(cfg.defaultMode, 'recommended');
  assert.ok(!cfg.presetName, 'presetName should not exist for recommended');
});

test('save + load roundtrip: preset', () => {
  const dir = makeTempDir();

  runSave(['--local', '--preset', 'docs'], { projectDir: dir });
  runLoad(['--local'], { projectDir: dir });

  const cfg = readJSON(path.join(dir, '.bkit-doctor', 'settings.local.json'));
  assert.strictEqual(cfg.defaultMode, 'preset');
  assert.strictEqual(cfg.presetName, 'docs');
});

test('load: success output includes source and target paths', () => {
  const dir = makeTempDir();
  runSave(['--local', '--recommended'], { projectDir: dir });

  const r = runLoad(['--local'], { projectDir: dir });
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /source\s+→/);
  assert.match(r.stdout, /applied\s+→/);
});
