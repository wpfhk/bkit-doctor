'use strict';

/**
 * scripts/verify-release.js
 *
 * Release readiness verification script for bkit-doctor.
 * Run: npm run verify-release
 *
 * Checks:
 *   1. version   — CLI output & package.json version match
 *   2. check     — project HEALTHY, no FAILs
 *   3. init      — dry-run produces 0 CREATEs
 *   4. recommended — dry-run shows no recommended targets
 *   5. changelog — package.json version == latest CHANGELOG entry
 *   6. docs      — no CREATE conflicts between check PASS docs and init dry-run
 *   7. snapshot  — check → init --recommended flow works (soft)
 *   8. files     — README.md / LICENSE / CHANGELOG.md exist
 *
 * Exit code: 0 = all hard checks pass, 1 = any hard check failed
 */

const { spawnSync } = require('child_process');
const fs            = require('fs');
const path          = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VERBOSE      = process.argv.includes('--verbose') || process.argv.includes('-v');
const pkg          = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));

// ─── Result tracking ─────────────────────────────────────────────────────────

const results = [];   // { label, passed, soft, message, detail? }

function record(label, passed, message, { soft = false, detail = '' } = {}) {
  results.push({ label, passed, soft, message, detail });
}

// ─── CLI runner ──────────────────────────────────────────────────────────────

function runCLI(args) {
  const result = spawnSync(
    process.execPath,
    [path.join(PROJECT_ROOT, 'src', 'cli', 'index.js'), ...args],
    { cwd: PROJECT_ROOT, encoding: 'utf8' },
  );
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    code:   result.status ?? 1,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract first version matching /\d+\.\d+\.\d+/ from a string. */
function extractSemver(str) {
  const m = str.match(/(\d+\.\d+\.\d+)/);
  return m ? m[1] : null;
}

/** Read CHANGELOG.md and return the first non-Unreleased version string. */
function changelogLatestVersion() {
  const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return null;
  const text  = fs.readFileSync(changelogPath, 'utf8');
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^## \[(\d+\.\d+\.\d+)\]/);
    if (m) return m[1];
  }
  return null;
}

/** Truncate a string for display (verbose hint). */
function excerpt(str, maxLines = 6) {
  const lines = str.trimEnd().split('\n');
  return lines.slice(0, maxLines).join('\n') + (lines.length > maxLines ? '\n  ...' : '');
}

// ─── Checks ──────────────────────────────────────────────────────────────────

function verifyVersion() {
  const { stdout, code } = runCLI(['version']);

  if (code !== 0) {
    return record('version command', false, 'CLI exited with non-zero code', { detail: stdout });
  }
  if (!/bkit-doctor/.test(stdout)) {
    return record('version command', false, 'output does not contain "bkit-doctor"', { detail: stdout });
  }
  const cliVersion = extractSemver(stdout);
  if (!cliVersion) {
    return record('version command', false, 'no semver found in output', { detail: stdout });
  }
  if (cliVersion !== pkg.version) {
    return record('version command', false,
      `CLI v${cliVersion} != package.json v${pkg.version}`, { detail: stdout });
  }
  record('version command', true, `v${cliVersion} matches package.json`);
}

function verifyCheckHealthy() {
  const { stdout, code } = runCLI(['check']);

  if (code !== 0) {
    return record('check healthy', false, 'check command exited with non-zero code', { detail: stdout });
  }

  const hasHealthy = /HEALTHY/.test(stdout);
  const hasFail    = /\[FAIL\]/.test(stdout);
  const passCount  = (stdout.match(/\[PASS\]/g) || []).length;

  if (hasFail) {
    return record('check healthy', false, '[FAIL] items detected', { detail: stdout });
  }
  if (!hasHealthy) {
    return record('check healthy', false, 'HEALTHY not found in output', { detail: stdout });
  }
  if (passCount === 0) {
    return record('check healthy', false, 'no [PASS] items found', { detail: stdout });
  }

  record('check healthy', true, `HEALTHY — PASS ${passCount}, FAIL 0`);
}

function verifyInitDryRun() {
  const { stdout, code } = runCLI(['init', '--dry-run']);

  if (code !== 0) {
    return record('init dry-run consistent', false, 'init exited with non-zero code', { detail: stdout });
  }

  const isDryRun      = /dry-run|no files will be changed/.test(stdout);
  const createdMatch  = stdout.match(/files created\s*:\s*(\d+)/);
  const filesCreated  = createdMatch ? parseInt(createdMatch[1], 10) : null;
  const hasCreateLine = /\[CREATE\]/.test(stdout);

  if (!isDryRun) {
    return record('init dry-run consistent', false, 'dry-run mode not confirmed in output', { detail: stdout });
  }
  if (hasCreateLine || (filesCreated !== null && filesCreated > 0)) {
    const count = filesCreated !== null ? filesCreated : '?';
    return record('init dry-run consistent', false,
      `${count} file(s) would be created on a healthy project`, { detail: stdout });
  }

  const skipped = (stdout.match(/files skipped\s*:\s*(\d+)/)?.[1]) ?? '?';
  record('init dry-run consistent', true, `0 files created, ${skipped} skipped`);
}

function verifyRecommendedDryRun() {
  const { stdout, code } = runCLI(['init', '--recommended', '--dry-run']);

  if (code !== 0) {
    return record('recommended dry-run healthy', false,
      'init --recommended exited with non-zero code', { detail: stdout });
  }

  const noTargets = /no recommended targets|project looks healthy/.test(stdout);
  if (!noTargets) {
    return record('recommended dry-run healthy', false,
      'recommended targets were suggested on a healthy project', { detail: stdout });
  }

  record('recommended dry-run healthy', true, 'no recommended targets');
}

function verifyChangelog() {
  const latestVersion = changelogLatestVersion();

  if (!latestVersion) {
    return record('changelog alignment', false, 'no version entry found in CHANGELOG.md');
  }
  if (latestVersion !== pkg.version) {
    return record('changelog alignment', false,
      `CHANGELOG latest [${latestVersion}] != package.json v${pkg.version}`);
  }

  record('changelog alignment', true, `v${latestVersion}`);
}

function verifyDocsConsistency() {
  const checkOut = runCLI(['check']);
  const initOut  = runCLI(['init', '--dry-run']);

  if (checkOut.code !== 0 || initOut.code !== 0) {
    return record('docs path consistency', false, 'check or init command failed');
  }

  // Collect docs CREATE lines from init --dry-run output
  const createLines = initOut.stdout
    .split('\n')
    .filter(l => /\[CREATE\]/.test(l));

  const docsCreate = createLines.filter(l => /\bdocs[\\/]/.test(l));

  if (docsCreate.length > 0) {
    return record('docs path consistency', false,
      `init would CREATE docs paths on healthy project:\n  ${docsCreate.join('\n  ')}`,
      { detail: initOut.stdout });
  }

  record('docs path consistency', true, 'no docs CREATE conflicts');
}

function verifySnapshotFlow() {
  // Step 1: run check to write snapshot
  const checkResult = runCLI(['check']);
  if (checkResult.code !== 0) {
    return record('snapshot flow', false, 'check failed — cannot test snapshot', { soft: true });
  }

  // Step 2: run recommended --dry-run — should reuse or gracefully fallback
  const { stdout, code } = runCLI(['init', '--recommended', '--dry-run']);

  if (code !== 0) {
    return record('snapshot flow', false, 'init --recommended failed', { soft: true, detail: stdout });
  }

  const usedSnapshot  = /using recent recommendation snapshot/.test(stdout);
  const isHealthy     = /no recommended targets|project looks healthy/.test(stdout);
  const hadRecompute  = /recomputing|snapshot invalid|fingerprint/.test(stdout);

  if (!isHealthy && !usedSnapshot && !hadRecompute) {
    return record('snapshot flow', false, 'unexpected recommended output', { soft: true, detail: stdout });
  }

  const hint = usedSnapshot  ? 'snapshot reused'
             : hadRecompute  ? 'snapshot invalid — fallback recompute OK'
             : 'healthy — no targets';
  record('snapshot flow', true, hint, { soft: true });
}

function verifyProjectFiles() {
  const required = ['README.md', 'LICENSE', 'CHANGELOG.md'];
  const missing  = required.filter(f => !fs.existsSync(path.join(PROJECT_ROOT, f)));

  if (missing.length > 0) {
    return record('project files', false, `missing: ${missing.join(', ')}`);
  }
  record('project files', true, `${required.join(' / ')} — all present`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log(`[verify-release] project root: ${PROJECT_ROOT}`);
  console.log(`[verify-release] package version: v${pkg.version}`);
  console.log('[verify-release] starting checks...\n');

  verifyVersion();
  verifyCheckHealthy();
  verifyInitDryRun();
  verifyRecommendedDryRun();
  verifyChangelog();
  verifyDocsConsistency();
  verifySnapshotFlow();
  verifyProjectFiles();

  // ── Print results ─────────────────────────────────────────────────────────
  const WIDTH = 52;
  for (const r of results) {
    const tag  = r.soft && !r.passed ? '[SOFT]' : r.passed ? '[PASS]' : '[FAIL]';
    const line = `  ${tag.padEnd(7)} ${r.label}`;
    const hint = r.message ? ` — ${r.message}` : '';
    console.log(line + hint);
    if (VERBOSE && r.detail) {
      console.log(
        excerpt(r.detail)
          .split('\n')
          .map(l => `           ${l}`)
          .join('\n'),
      );
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const hardResults = results.filter(r => !r.soft);
  const hardPassed  = hardResults.filter(r => r.passed).length;
  const hardFailed  = hardResults.filter(r => !r.passed).length;
  const softFailed  = results.filter(r => r.soft && !r.passed).length;

  console.log('\n' + '─'.repeat(WIDTH));
  console.log(
    `  total : ${results.length}   ` +
    `passed : ${hardPassed}   ` +
    `failed : ${hardFailed}` +
    (softFailed > 0 ? `   soft-failed : ${softFailed}` : ''),
  );
  console.log('');

  if (hardFailed > 0) {
    console.log('release verification FAILED — fix the issues above before merging to main.');
    process.exit(1);
  } else {
    console.log('all release verification checks passed.');
    process.exit(0);
  }
}

main();
