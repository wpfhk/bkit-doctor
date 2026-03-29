'use strict';

const path = require('path');
const { resolveFixTargets } = require('../../fix/resolveFixTargets');
const { buildInitPlan }     = require('../../init/buildInitPlan');
const { applyInitPlan }     = require('../../init/applyInitPlan');
const { confirmApply }      = require('../../init/confirmApply');

/**
 * fix 명령 핸들러
 *
 * fix = recommendation-based 적용 전용 진입점.
 * 새로운 수정 로직을 만들지 않고, 기존 recommendation + init 시스템을
 * 더 쉽게 실행하는 shortcut 역할만 한다.
 *
 * 흐름:
 *   1. snapshot 재사용 or recompute → finalTargets 결정
 *   2. targets 없으면 healthy/no-op 종료
 *   3. buildInitPlan → preview 출력
 *   4. dry-run이면 종료
 *   5. no-op이면 종료
 *   6. --yes 없으면 confirmApply
 *   7. applyInitPlan
 *
 * 옵션:
 *   --dry-run   파일 변경 없이 예정 내용만 출력
 *   -y / --yes  confirm 생략
 *   --fresh     snapshot 무시하고 재계산
 */
async function fixCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());
  const dryRun      = Boolean(options.dryRun);
  const autoYes     = Boolean(options.yes);
  const fresh       = Boolean(options.fresh);

  console.log(`[bkit-doctor] fix: ${projectRoot}`);
  if (dryRun) console.log('[dry-run] no files will be changed');

  // ── 1. target 해석 ────────────────────────────────────────────
  const {
    targets,
    fromSnapshot,
    issueCount,
    snapshotStatus,
    invalidReason,
  } = await resolveFixTargets(projectRoot, { fresh });

  // snapshot 상태 출력
  if (snapshotStatus === 'used') {
    console.log('[fix] using recent recommendation snapshot');
  } else if (snapshotStatus === 'invalid') {
    console.log(`[fix] snapshot invalid (${invalidReason}), recomputed from current state`);
  } else if (snapshotStatus === 'skipped') {
    console.log('[fix] --fresh: recomputed from current state');
  }
  // 'missing' → silent (snapshot이 없는 것은 정상)

  console.log('');

  // ── 2. targets 없음 ───────────────────────────────────────────
  if (targets.length === 0) {
    if (issueCount === 0) {
      console.log('no issues found — project looks healthy');
    } else {
      console.log('no fixable targets — issues found but no init targets mapped');
    }
    return;
  }

  console.log(`[fix] ${targets.length} target(s): ${targets.join(', ')}`);
  console.log('');

  // ── 3. 계획 계산 ──────────────────────────────────────────────
  // overwrite 기본 금지 — fix는 안전 적용만 허용
  const plan = buildInitPlan(projectRoot, { overwrite: false, targets });

  // ── 4. preview 출력 ───────────────────────────────────────────
  for (const item of plan)
    console.log(`  ${formatLabel(item)} ${item.path}`);

  const planMkdir     = plan.filter(i => i.action === 'mkdir').length;
  const planCreate    = plan.filter(i => i.action === 'create').length;
  const planOverwrite = plan.filter(i => i.action === 'overwrite').length;
  const planSkip      = plan.filter(i => i.kind === 'file' && i.action === 'skip').length;
  const noOp          = planMkdir === 0 && planCreate === 0 && planOverwrite === 0;

  // ── 5. dry-run 종료 ───────────────────────────────────────────
  if (dryRun) {
    console.log('');
    printSummary(targets, planMkdir, planCreate, planOverwrite, planSkip, null);
    console.log('');
    console.log('fix completed (dry-run)');
    console.log('no files changed');
    return;
  }

  // ── 6. no-op 종료 ─────────────────────────────────────────────
  if (noOp) {
    console.log('');
    console.log('all targets already satisfied — nothing to apply');
    return;
  }

  // ── 7. confirm (--yes 없는 경우) ──────────────────────────────
  if (!autoYes) {
    const confirmed = await confirmApply({
      targets,
      fromRecommended: true,
      mkdirCount:      planMkdir,
      createCount:     planCreate,
      overwriteCount:  planOverwrite,
      skipCount:       planSkip,
    });
    if (!confirmed) {
      console.log('');
      console.log('cancelled');
      return;
    }
  }

  // ── 8. apply ──────────────────────────────────────────────────
  const { applied, skipped } = applyInitPlan(projectRoot, plan, {});

  const mkdirCount     = applied.filter(i => i.kind === 'dir').length;
  const createCount    = applied.filter(i => i.kind === 'file' && i.action === 'create').length;
  const overwriteCount = applied.filter(i => i.action === 'overwrite').length;
  const skipCount      = skipped.filter(i => i.kind === 'file').length;

  console.log('');
  printSummary(targets, mkdirCount, createCount, overwriteCount, skipCount, null);

  console.log('');
  if (skipCount > 0 && createCount === 0 && mkdirCount === 0)
    console.log('fix completed — nothing to do');
  else if (skipCount > 0)
    console.log('fix completed with skipped files');
  else
    console.log('fix completed');
}

// ── helpers ────────────────────────────────────────────────────────────────

function formatLabel(item) {
  switch (item.action) {
    case 'mkdir':     return '[MKDIR]   ';
    case 'mkdir-skip':return '[DIR-OK]  ';
    case 'create':    return '[CREATE]  ';
    case 'skip':      return '[SKIP]    ';
    case 'overwrite': return '[OVERWRITE]';
    default:          return '[?]       ';
  }
}

function printSummary(targets, mkdir, create, overwrite, skip, backupSession) {
  console.log('요약');
  if (targets.length > 0)
    console.log(`  ${'fix targets'.padEnd(20)}: ${targets.join(', ')}`);
  console.log(`  ${'directories created'.padEnd(20)}: ${mkdir}`);
  console.log(`  ${'files created'.padEnd(20)}: ${create}`);
  if (overwrite > 0)
    console.log(`  ${'files overwritten'.padEnd(20)}: ${overwrite}`);
  console.log(`  ${'files skipped'.padEnd(20)}: ${skip}`);
  if (backupSession)
    console.log(`  ${'backup'.padEnd(20)}: ${backupSession}`);
}

module.exports = { fixCommand };
