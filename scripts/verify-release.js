#!/usr/bin/env node

/**
 * verify-release.js (improved)
 *
 * goals:
 * - 안정적인 CLI 실행 검증 (timeout / signal / stderr 포함)
 * - 실행 / 판정 / 출력 분리
 * - 확장 가능한 체크 구조
 * - Phase 6-1 (fix / preset) 대응
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const CLI_PATH = path.join(PROJECT_ROOT, 'src', 'cli', 'index.js');

let results = [];
let pass = 0;
let fail = 0;

/* --------------------------------------------------
 * utils
 * -------------------------------------------------- */

function log(msg = '') {
  console.log(msg);
}

function excerpt(str, max = 500) {
  if (!str) return '';
  if (str.length <= max) return str.trim();
  return str.slice(0, max).trim() + ' ...';
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function extractNumber(text, regex) {
  const m = text.match(regex);
  return m ? Number(m[1]) : null;
}

function hasAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

/* --------------------------------------------------
 * CLI execution
 * -------------------------------------------------- */

function execCLI(args, options = {}) {
  const result = spawnSync(
    process.execPath,
    [CLI_PATH, ...args],
    {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      timeout: options.timeout ?? 15000,
    }
  );

  return {
    args,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    code: result.status ?? 1,
    signal: result.signal || null,
    error: result.error || null,
  };
}

function assertExitOk(result, label) {
  if (result.error) {
    return { ok: false, message: `${label} spawn error: ${result.error.message}` };
  }
  if (result.signal) {
    return { ok: false, message: `${label} terminated by signal: ${result.signal}` };
  }
  if (result.code !== 0) {
    return { ok: false, message: `${label} exited with code ${result.code}` };
  }
  return { ok: true };
}

function formatDetail(result) {
  const chunks = [];
  if (result.stdout.trim()) {
    chunks.push('[stdout]\n' + excerpt(result.stdout));
  }
  if (result.stderr.trim()) {
    chunks.push('[stderr]\n' + excerpt(result.stderr));
  }
  return chunks.join('\n');
}

/* --------------------------------------------------
 * recorder
 * -------------------------------------------------- */

function record(name, ok, detail = '', options = {}) {
  results.push({ name, ok, detail, soft: options.soft });

  if (ok) {
    pass++;
    log(`  [PASS]  ${name}`);
  } else {
    fail++;
    log(`  [FAIL]  ${name}`);
    if (detail) log(`          ${excerpt(detail)}`);
  }
}

/* --------------------------------------------------
 * checks
 * -------------------------------------------------- */

function verifyVersion() {
  const pkg = require(path.join(PROJECT_ROOT, 'package.json'));
  const result = execCLI(['version']);
  const exit = assertExitOk(result, 'version');

  if (!exit.ok) {
    record('version command', false, exit.message);
    return;
  }

  const expected = `v${pkg.version}`;
  const ok = result.stdout.includes(expected);

  record(
    'version command',
    ok,
    ok ? expected : `expected ${expected} but got:\n${result.stdout}`
  );
}

function verifyCheckHealthy() {
  const result = execCLI(['check']);
  const exit = assertExitOk(result, 'check');

  if (!exit.ok) {
    record('check healthy', false, exit.message);
    return;
  }

  const ok =
    result.stdout.includes('HEALTHY') &&
    !result.stdout.includes('[FAIL]');

  record(
    'check healthy',
    ok,
    ok ? 'HEALTHY' : formatDetail(result)
  );
}

function verifyInitDryRun() {
  const result = execCLI(['init', '--dry-run']);
  const exit = assertExitOk(result, 'init dry-run');

  if (!exit.ok) {
    record('init dry-run', false, exit.message);
    return;
  }

  const created = extractNumber(result.stdout, /files created:\s*(\d+)/i) || 0;
  const ok = created === 0;

  record(
    'init dry-run no-create',
    ok,
    `created=${created}`
  );
}

function verifyRecommendedDryRun() {
  const result = execCLI(['init', '--recommended', '--dry-run']);
  const exit = assertExitOk(result, 'recommended dry-run');

  if (!exit.ok) {
    record('recommended dry-run', false, exit.message);
    return;
  }

  const ok = hasAny(result.stdout, [
    /no recommended targets/i,
    /project looks healthy/i,
  ]);

  record(
    'recommended dry-run healthy',
    ok,
    formatDetail(result)
  );
}

function verifyChangelog() {
  const pkg = require(path.join(PROJECT_ROOT, 'package.json'));
  const changelog = fs.readFileSync(
    path.join(PROJECT_ROOT, 'CHANGELOG.md'),
    'utf8'
  );

  const ok = changelog.includes(`[${pkg.version}]`) || changelog.includes(`v${pkg.version}`);

  record(
    'changelog alignment',
    ok,
    ok ? `v${pkg.version}` : 'version not found in CHANGELOG'
  );
}

function verifyDocsConsistency() {
  const check = execCLI(['check']);
  const init = execCLI(['init', '--dry-run']);

  const exitCheck = assertExitOk(check, 'check');
  const exitInit = assertExitOk(init, 'init dry-run');

  if (!exitCheck.ok || !exitInit.ok) {
    record('docs consistency', false, 'cli failed');
    return;
  }

  const docCreate = /\[CREATE\].*docs\//i.test(init.stdout);

  record(
    'docs no-create on healthy',
    !docCreate,
    docCreate ? 'docs CREATE detected' : 'ok'
  );
}

function verifySnapshotFlow() {
  execCLI(['check']); // warm-up

  const result = execCLI(['init', '--recommended', '--dry-run']);
  const exit = assertExitOk(result, 'snapshot flow');

  if (!exit.ok) {
    record('snapshot flow', false, exit.message, { soft: true });
    return;
  }

  const ok = /snapshot/i.test(result.stdout);

  record(
    'snapshot flow',
    ok,
    ok ? 'snapshot reused' : 'snapshot not reused',
    { soft: true }
  );
}

function verifyProjectFiles() {
  const files = ['README.md', 'LICENSE', 'CHANGELOG.md'];

  const missing = files.filter(
    (f) => !fs.existsSync(path.join(PROJECT_ROOT, f))
  );

  const ok = missing.length === 0;

  record(
    'project files',
    ok,
    ok ? 'all present' : `missing: ${missing.join(', ')}`
  );
}

/* --------------------------------------------------
 * Phase 6-1 checks
 * -------------------------------------------------- */

function verifyFixDryRun() {
  const result = execCLI(['fix', '--dry-run']);
  const exit = assertExitOk(result, 'fix dry-run');

  if (!exit.ok) {
    record('fix dry-run', false, exit.message);
    return;
  }

  const created = extractNumber(result.stdout, /files created:\s*(\d+)/i) || 0;

  record(
    'fix dry-run no-create',
    created === 0,
    `created=${created}`
  );
}

function verifyFixFresh() {
  const result = execCLI(['fix', '--fresh', '--dry-run']);
  const exit = assertExitOk(result, 'fix fresh');

  record(
    'fix fresh path',
    exit.ok,
    formatDetail(result)
  );
}

function verifyPresetDryRun() {
  const result = execCLI(['init', '--preset', 'default', '--dry-run']);
  const exit = assertExitOk(result, 'preset dry-run');

  record(
    'preset dry-run',
    exit.ok,
    formatDetail(result)
  );
}

function verifyUnknownPreset() {
  const result = execCLI(['init', '--preset', 'unknown']);
  const ok = result.code !== 0;

  record(
    'unknown preset guard',
    ok,
    ok ? 'rejected' : 'should fail'
  );
}

function verifyConflictingModes() {
  const result = execCLI(['init', '--preset', 'default', '--recommended']);
  const ok = result.code !== 0;

  record(
    'conflicting init modes',
    ok,
    ok ? 'rejected' : 'should fail'
  );
}

/* --------------------------------------------------
 * Phase 6-2 checks
 * -------------------------------------------------- */

function verifyPresetList() {
  const result = execCLI(['preset', 'list']);
  const exit = assertExitOk(result, 'preset list');

  if (!exit.ok) {
    record('preset list', false, exit.message);
    return;
  }

  const hasPreset = result.stdout.includes('default');
  record(
    'preset list',
    hasPreset,
    hasPreset ? 'default found' : formatDetail(result)
  );
}

function verifyPresetShowDefault() {
  const result = execCLI(['preset', 'show', 'default']);
  const exit = assertExitOk(result, 'preset show default');

  if (!exit.ok) {
    record('preset show default', false, exit.message);
    return;
  }

  const hasName    = result.stdout.includes('default');
  const hasTargets = result.stdout.includes('targets');
  const ok = hasName && hasTargets;

  record(
    'preset show default',
    ok,
    ok ? 'name + targets present' : formatDetail(result)
  );
}

function verifyPresetShowUnknown() {
  const result = execCLI(['preset', 'show', 'unknown']);
  const nonZero = result.code !== 0;
  const hasError = /unknown preset/i.test(result.stdout + result.stderr);
  const ok = nonZero && hasError;

  record(
    'preset show unknown',
    ok,
    ok ? 'rejected with error' : `code=${result.code} hasError=${hasError}`
  );
}

function verifyPresetCompatibility() {
  const result = execCLI(['init', '--preset', 'default', '--dry-run']);
  const exit = assertExitOk(result, 'preset compatibility');

  record(
    'preset compatibility',
    exit.ok,
    exit.ok ? 'init --preset default works' : formatDetail(result)
  );
}

/* --------------------------------------------------
 * Phase 6-3 checks
 * -------------------------------------------------- */

function verifyPresetRecommendBasic() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset recommend');

  if (!exit.ok) {
    record('preset recommend basic', false, exit.message);
    return;
  }

  const presetNames  = ['default', 'lean', 'docs', 'workflow-core'];
  const hasAnyPreset = presetNames.some(n => result.stdout.includes(n));

  record(
    'preset recommend basic',
    hasAnyPreset,
    hasAnyPreset ? 'preset name found' : formatDetail(result)
  );
}

function verifyPresetRecommendReason() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset recommend reason');

  if (!exit.ok) {
    record('preset recommend reason', false, exit.message);
    return;
  }

  const ok = result.stdout.includes('reason');

  record(
    'preset recommend reason',
    ok,
    ok ? 'reason found' : formatDetail(result)
  );
}

function verifyPresetRecommendGuidance() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset recommend guidance');

  if (!exit.ok) {
    record('preset recommend guidance', false, exit.message);
    return;
  }

  const hasFix    = result.stdout.includes('fix');
  const hasPreset = result.stdout.includes('init --preset');
  const ok = hasFix && hasPreset;

  record(
    'preset recommend guidance',
    ok,
    ok ? 'fix + init --preset guidance found' : formatDetail(result)
  );
}

/* --------------------------------------------------
 * Phase 6-5 checks
 * -------------------------------------------------- */

const os = require('os');

// verify-release에서 사용할 임시 디렉터리 (global 경로 격리)
const VERIFY_GLOBAL_DIR = require('fs').mkdtempSync(
  require('path').join(os.tmpdir(), 'bkit-doctor-verify-')
);

process.on('exit', () => {
  try { require('fs').rmSync(VERIFY_GLOBAL_DIR, { recursive: true, force: true }); } catch {}
});

function execSaveLocal(args) {
  // local 경로는 PROJECT_ROOT 기준
  return execCLI(['save', '--path', PROJECT_ROOT, ...args]);
}

function execSaveTmp(args) {
  // local + global 모두 임시 디렉터리 사용
  const dir = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-tmp-'));
  const result = spawnSync(
    process.execPath,
    [CLI_PATH, 'save', '--path', dir, ...args],
    {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      timeout: 15000,
      env: { ...process.env, BKIT_DOCTOR_GLOBAL_CONFIG_DIR: VERIFY_GLOBAL_DIR },
    }
  );
  try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}
  return {
    args,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    code: result.status ?? 1,
    signal: result.signal || null,
    error: result.error || null,
  };
}

/** save 전용 실행 헬퍼 (custom env/path 지원, execCLI 포맷과 동일하게 반환) */
function execSaveWith(args, { projectDir, globalDir } = {}) {
  const env = { ...process.env };
  if (globalDir) env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;

  const cliArgs = projectDir
    ? [CLI_PATH, 'save', '--path', projectDir, ...args]
    : [CLI_PATH, 'save', ...args];

  const result = spawnSync(process.execPath, cliArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    timeout: 15000,
    env,
  });

  return {
    args,
    stdout:  result.stdout  || '',
    stderr:  result.stderr  || '',
    code:    result.status  ?? 1,    // execCLI 포맷 맞춤
    signal:  result.signal  || null,
    error:   result.error   || null,
  };
}

function verifySaveLocalRecommended() {
  const dir    = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-local-'));
  const result = execSaveWith(['--local', '--recommended'], { projectDir: dir });
  const exit   = assertExitOk(result, 'save local recommended');

  if (!exit.ok) {
    try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}
    record('save local recommended', false, exit.message);
    return;
  }

  const localPath  = require('path').join(dir, '.bkit-doctor', 'settings.local.json');
  const fileExists = require('fs').existsSync(localPath);
  try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}

  record(
    'save local recommended',
    fileExists,
    fileExists ? 'local settings written' : 'local settings file not found'
  );
}

function verifySaveGlobalPreset() {
  const dir    = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-gbl-'));
  const result = execSaveWith(['--global', '--preset', 'default'], { globalDir: dir });
  const exit   = assertExitOk(result, 'save global preset');

  if (!exit.ok) {
    try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}
    record('save global preset', false, exit.message);
    return;
  }

  const globalPath = require('path').join(dir, '.bkit-doctor', 'settings.global.json');
  const fileExists = require('fs').existsSync(globalPath);
  try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}

  record(
    'save global preset',
    fileExists,
    fileExists ? 'global settings written' : 'global settings file not found'
  );
}

function verifySaveBothPreset() {
  const localDir  = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-both-'));
  const globalDir = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-both-g-'));
  const result    = execSaveWith(['--both', '--preset', 'lean'], { projectDir: localDir, globalDir });
  const exit      = assertExitOk(result, 'save both preset');

  const localPath  = require('path').join(localDir,  '.bkit-doctor', 'settings.local.json');
  const globalPath = require('path').join(globalDir, '.bkit-doctor', 'settings.global.json');
  const localOk    = require('fs').existsSync(localPath);
  const globalOk   = require('fs').existsSync(globalPath);

  try {
    require('fs').rmSync(localDir,  { recursive: true, force: true });
    require('fs').rmSync(globalDir, { recursive: true, force: true });
  } catch {}

  const ok = exit.ok && localOk && globalOk;
  record(
    'save both preset',
    ok,
    ok ? 'both settings written' : `exit=${result.code} local=${localOk} global=${globalOk}`
  );
}

function verifySaveUsageGuard() {
  const result = execCLI(['save', '--local']);
  const ok = result.code !== 0;

  record(
    'save usage guard (no target)',
    ok,
    ok ? 'rejected without target' : 'should fail'
  );
}

function verifySaveConflictGuard() {
  const result = execCLI(['save', '--local', '--recommended', '--preset', 'default']);
  const ok = result.code !== 0;

  record(
    'save conflict guard (recommended+preset)',
    ok,
    ok ? 'rejected conflicting targets' : 'should fail'
  );
}

function verifySavePresetValidation() {
  const result = execCLI(['save', '--local', '--preset', 'totally-unknown']);
  const ok = result.code !== 0;

  record(
    'save unknown preset guard',
    ok,
    ok ? 'rejected unknown preset' : 'should fail'
  );
}

/* --------------------------------------------------
 * Phase 6-4 checks
 * -------------------------------------------------- */

function verifyPresetScoringOutput() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset scoring output');

  if (!exit.ok) {
    record('preset recommend scoring output', false, exit.message);
    return;
  }

  const hasScore = result.stdout.includes('score');
  record(
    'preset recommend scoring output',
    hasScore,
    hasScore ? 'score found' : formatDetail(result)
  );
}

function verifyPresetScoringOrder() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset scoring order');

  if (!exit.ok) {
    record('preset recommend scoring order', false, exit.message);
    return;
  }

  const matches = [...result.stdout.matchAll(/score:\s*(\d+)/g)];
  if (matches.length < 2) {
    // 결과가 1개이면 순서 검증 불필요
    record('preset recommend scoring order', true, `only ${matches.length} result(s)`);
    return;
  }

  const scores = matches.map(m => Number(m[1]));
  const sorted = scores[0] >= scores[1];

  record(
    'preset recommend scoring order',
    sorted,
    sorted ? `${scores[0]} >= ${scores[1]}` : `order wrong: ${scores.join(', ')}`
  );
}

function verifyPresetScoringLabel() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset scoring label');

  if (!exit.ok) {
    record('preset recommend label', false, exit.message);
    return;
  }

  const hasLabel = /high match|medium match|low match/.test(result.stdout);
  record(
    'preset recommend label',
    hasLabel,
    hasLabel ? 'match label found' : formatDetail(result)
  );
}

function verifyPresetScoringRegression() {
  const result = execCLI(['preset', 'recommend']);
  const exit   = assertExitOk(result, 'preset recommend regression');

  if (!exit.ok) {
    record('preset recommend regression', false, exit.message);
    return;
  }

  const hasReason   = result.stdout.includes('reason');
  const hasFix      = result.stdout.includes('fix');
  const hasInitHint = result.stdout.includes('init --preset');
  const ok = hasReason && hasFix && hasInitHint;

  record(
    'preset recommend regression',
    ok,
    ok ? 'reason + guidance intact' : formatDetail(result)
  );
}

/* --------------------------------------------------
 * Phase 7-3 checks (load command)
 * -------------------------------------------------- */

/** load 전용 실행 헬퍼 */
function execLoadWith(args, { projectDir, globalDir } = {}) {
  const env = { ...process.env };
  if (globalDir) env.BKIT_DOCTOR_GLOBAL_CONFIG_DIR = globalDir;

  const cliArgs = projectDir
    ? [CLI_PATH, 'load', '--path', projectDir, ...args]
    : [CLI_PATH, 'load', ...args];

  const result = spawnSync(process.execPath, cliArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    timeout: 15000,
    env,
  });

  return {
    args,
    stdout: result.stdout  || '',
    stderr: result.stderr  || '',
    code:   result.status  ?? 1,
    signal: result.signal  || null,
    error:  result.error   || null,
  };
}

function verifyLoadLocalSuccess() {
  const dir = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-load-local-'));

  // 먼저 save로 설정 생성
  spawnSync(process.execPath, [CLI_PATH, 'save', '--path', dir, '--local', '--recommended'], {
    cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 15000,
  });

  const result = execLoadWith(['--local'], { projectDir: dir });
  const exit   = assertExitOk(result, 'load local');

  try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}

  record(
    'load local config',
    exit.ok && result.stdout.includes('applied from local'),
    exit.ok ? 'local settings applied' : formatDetail(result)
  );
}

function verifyLoadGlobalSuccess() {
  const projectDir = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-load-proj-'));
  const globalDir  = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-load-gbl-'));

  // global에 설정 저장
  spawnSync(process.execPath, [CLI_PATH, 'save', '--global', '--recommended'], {
    cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 15000,
    env: { ...process.env, BKIT_DOCTOR_GLOBAL_CONFIG_DIR: globalDir },
  });

  const result = execLoadWith(['--global'], { projectDir, globalDir });
  const exit   = assertExitOk(result, 'load global');

  const localPath = require('path').join(projectDir, '.bkit-doctor', 'settings.local.json');
  const applied   = require('fs').existsSync(localPath);

  try {
    require('fs').rmSync(projectDir, { recursive: true, force: true });
    require('fs').rmSync(globalDir,  { recursive: true, force: true });
  } catch {}

  const ok = exit.ok && applied;
  record(
    'load global config',
    ok,
    ok ? 'global settings applied to local' : formatDetail(result)
  );
}

function verifyLoadFileSuccess() {
  const projectDir = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-load-fproj-'));
  const srcDir     = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-load-fsrc-'));

  // 소스 파일 생성
  spawnSync(process.execPath, [CLI_PATH, 'save', '--path', srcDir, '--local', '--preset', 'lean'], {
    cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 15000,
  });

  const srcFile = require('path').join(srcDir, '.bkit-doctor', 'settings.local.json');
  const result  = execLoadWith(['--file', srcFile], { projectDir });
  const exit    = assertExitOk(result, 'load file');

  const localPath = require('path').join(projectDir, '.bkit-doctor', 'settings.local.json');
  const applied   = require('fs').existsSync(localPath);

  try {
    require('fs').rmSync(projectDir, { recursive: true, force: true });
    require('fs').rmSync(srcDir,     { recursive: true, force: true });
  } catch {}

  const ok = exit.ok && applied;
  record(
    'load file config',
    ok,
    ok ? 'file settings applied' : formatDetail(result)
  );
}

function verifyLoadMissingFile() {
  const result = execLoadWith(['--file', '/nonexistent/path/settings.json']);
  const ok     = result.code !== 0;

  record(
    'load missing guard',
    ok,
    ok ? 'missing config handled' : 'should fail on missing file'
  );
}

function verifyLoadNoConfig() {
  const dir    = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-load-empty-'));
  const result = execLoadWith(['--local'], { projectDir: dir });
  const ok     = result.code !== 0;

  try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}

  record(
    'load no config guard',
    ok,
    ok ? 'no config handled' : 'should fail when no config exists'
  );
}

function verifySaveLoadRoundtrip() {
  const dir = require('fs').mkdtempSync(require('path').join(os.tmpdir(), 'bkit-dr-roundtrip-'));

  spawnSync(process.execPath, [CLI_PATH, 'save', '--path', dir, '--local', '--preset', 'default'], {
    cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 15000,
  });

  const result = execLoadWith(['--local'], { projectDir: dir });
  const exit   = assertExitOk(result, 'save-load roundtrip');

  let roundtripOk = false;
  if (exit.ok) {
    const loaded = require('path').join(dir, '.bkit-doctor', 'settings.local.json');
    try {
      const cfg = JSON.parse(require('fs').readFileSync(loaded, 'utf8'));
      roundtripOk = cfg.defaultMode === 'preset' && cfg.presetName === 'default';
    } catch {}
  }

  try { require('fs').rmSync(dir, { recursive: true, force: true }); } catch {}

  record(
    'save-load roundtrip',
    roundtripOk,
    roundtripOk ? 'saved config can be loaded' : formatDetail(result)
  );
}

function verifyInitCompatibility() {
  const result = execCLI(['init', '--dry-run']);
  const exit   = assertExitOk(result, 'init compatibility');
  record(
    'init compatibility',
    exit.ok,
    exit.ok ? 'init still works' : formatDetail(result)
  );
}

function verifyFixCompatibility() {
  const result = execCLI(['fix', '--dry-run']);
  const exit   = assertExitOk(result, 'fix compatibility');
  record(
    'fix compatibility',
    exit.ok,
    exit.ok ? 'fix still works' : formatDetail(result)
  );
}

/* --------------------------------------------------
 * runner
 * -------------------------------------------------- */

const CHECKS = [
  verifyVersion,
  verifyCheckHealthy,
  verifyInitDryRun,
  verifyRecommendedDryRun,
  verifyChangelog,
  verifyDocsConsistency,
  verifySnapshotFlow,
  verifyProjectFiles,

  // Phase 6-1
  verifyFixDryRun,
  verifyFixFresh,
  verifyPresetDryRun,
  verifyUnknownPreset,
  verifyConflictingModes,

  // Phase 6-2
  verifyPresetList,
  verifyPresetShowDefault,
  verifyPresetShowUnknown,
  verifyPresetCompatibility,

  // Phase 6-3
  verifyPresetRecommendBasic,
  verifyPresetRecommendReason,
  verifyPresetRecommendGuidance,

  // Phase 6-4
  verifyPresetScoringOutput,
  verifyPresetScoringOrder,
  verifyPresetScoringLabel,
  verifyPresetScoringRegression,

  // Phase 6-5
  verifySaveLocalRecommended,
  verifySaveGlobalPreset,
  verifySaveBothPreset,
  verifySaveUsageGuard,
  verifySaveConflictGuard,
  verifySavePresetValidation,

  // Phase 7-3
  verifyLoadLocalSuccess,
  verifyLoadGlobalSuccess,
  verifyLoadFileSuccess,
  verifyLoadMissingFile,
  verifyLoadNoConfig,
  verifySaveLoadRoundtrip,
  verifyInitCompatibility,
  verifyFixCompatibility,
];

function main() {
  log(`[verify-release] project root: ${PROJECT_ROOT}`);
  const pkg = require(path.join(PROJECT_ROOT, 'package.json'));
  log(`[verify-release] package version: v${pkg.version}`);
  log('[verify-release] starting checks...\n');

  for (const check of CHECKS) {
    check();
  }

  log('\n────────────────────────────────────────────────────');
  log(`  total : ${results.length}   passed : ${pass}   failed : ${fail}`);

  if (fail > 0) {
    log('\nrelease verification failed');
    process.exit(1);
  }

  log('\nall release verification checks passed');
}

main();