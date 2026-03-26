'use strict';

const path = require('path');
const { buildInitPlan }              = require('../../init/buildInitPlan');
const { applyInitPlan }              = require('../../init/applyInitPlan');
const { validateTargets, suggestTarget, TARGETS } = require('../../init/targetRegistry');
const { computeRecommendations }             = require('../../check/recommendations/computeRecommendations');
const { confirmApply }                       = require('../../init/confirmApply');
const { buildRecommendationFingerprint }     = require('../../check/recommendations/buildRecommendationFingerprint');
const { loadRecommendationSnapshot }         = require('../../check/recommendations/loadRecommendationSnapshot');
const { validateRecommendationSnapshot }     = require('../../check/recommendations/validateRecommendationSnapshot');

/**
 * init 명령 핸들러 — Phase 5-4: confirm-before-apply
 *
 * 실행 순서:
 *   build plan → render detail → dry-run? → no-op? → --yes? → confirm → apply
 *
 * 우선순위:
 *   dry-run    → confirm 없이 preview만 출력
 *   --yes / -y → confirm 없이 apply
 *   no-op      → confirm 없이 종료
 *   그 외       → confirm prompt
 */
async function initCommand(options) {
  const projectRoot    = path.resolve(options.path || process.cwd());
  const dryRun         = Boolean(options.dryRun);
  const overwrite      = Boolean(options.overwrite);
  const backup         = Boolean(options.backup);
  const backupDir      = options.backupDir || undefined;
  const useRecommended = Boolean(options.recommended);
  const autoYes        = Boolean(options.yes);
  const fresh          = Boolean(options.fresh);

  // ── target 수집 ──────────────────────────────────────────
  let rawTargets      = collectTargets(options);
  let fromRecommended = false;

  if (useRecommended) {
    if (rawTargets.length > 0) {
      console.log('[recommended] explicit targets provided — --recommended ignored');
      console.log(`[targets] ${rawTargets.join(', ')}`);
    } else {
      console.log(`[bkit-doctor] init: ${projectRoot}`);

      // ── snapshot 재사용 시도 ────────────────────────────
      let usedSnapshot = false;
      if (!fresh) {
        const fingerprint = buildRecommendationFingerprint(projectRoot);
        const snapshot    = loadRecommendationSnapshot(projectRoot);
        const { valid, reason } = validateRecommendationSnapshot(snapshot, projectRoot, fingerprint);

        if (valid) {
          console.log('[recommended] using recent recommendation snapshot');
          if (snapshot.finalTargets.length === 0) {
            console.log('');
            console.log('no recommended targets — project looks healthy');
            return;
          }
          rawTargets      = snapshot.finalTargets;
          fromRecommended = true;
          usedSnapshot    = true;
          console.log(`[recommended] ${rawTargets.length} targets: ${rawTargets.join(', ')}`);
        } else if (snapshot) {
          // snapshot 있지만 유효하지 않음
          console.log(`[recommended] snapshot invalid (${reason}), recomputing...`);
        }
      } else {
        console.log('[recommended] --fresh: ignoring snapshot, recomputing...');
      }

      // ── fresh computation (snapshot 없거나 invalid) ─────
      if (!usedSnapshot) {
        const { recommendations, issueCount, invalidCount } =
          await computeRecommendations(projectRoot);

        if (recommendations.length === 0) {
          console.log('');
          if (issueCount === 0) {
            console.log('no recommended targets — project looks healthy');
          } else {
            console.log('nothing to apply from recommendations');
            if (invalidCount > 0)
              console.log(`(${invalidCount} target(s) were invalid and excluded)`);
          }
          return;
        }

        rawTargets      = recommendations.map(r => r.target);
        fromRecommended = true;
        console.log(`[recommended] ${rawTargets.length} targets: ${rawTargets.join(', ')}`);
      }
    }
  }

  // explicit target validation
  if (rawTargets.length > 0 && !fromRecommended) {
    const { valid, unknown } = validateTargets(rawTargets);
    if (unknown.length > 0) {
      console.error('[bkit-doctor] unknown targets:');
      for (const u of unknown) {
        const hint = suggestTarget(u);
        const hintStr = hint ? `  (did you mean: ${hint}?)` : '';
        console.error(`  - ${u}${hintStr}`);
      }
      console.error('');
      console.error('available targets:');
      for (const [k, v] of Object.entries(TARGETS))
        console.error(`  ${k.padEnd(20)} ${v}`);
      if (valid.length === 0) {
        process.exitCode = 1;
        return;
      }
      console.error('');
      console.error(`continuing with valid targets: ${valid.join(', ')}`);
      console.error('');
    }
    rawTargets = valid;
  }

  // ── 헤더 출력 ────────────────────────────────────────────
  if (!useRecommended) {
    console.log(`[bkit-doctor] init: ${projectRoot}`);
    if (dryRun) console.log('[dry-run] no files will be changed');
    if (rawTargets.length > 0) console.log(`[targets] ${rawTargets.join(', ')}`);
  } else {
    if (dryRun) console.log('[dry-run] no files will be changed');
  }
  console.log('');

  // ── 1. 계획 계산 ─────────────────────────────────────────
  const plan = buildInitPlan(projectRoot, { overwrite, targets: rawTargets });

  // ── 2. 상세 출력 ─────────────────────────────────────────
  for (const item of plan)
    console.log(`  ${formatLabel(item)} ${item.path}`);

  // plan 통계 (apply 이전 계산)
  const planMkdir     = plan.filter(i => i.action === 'mkdir').length;
  const planCreate    = plan.filter(i => i.action === 'create').length;
  const planOverwrite = plan.filter(i => i.action === 'overwrite').length;
  const planSkip      = plan.filter(i => i.kind === 'file' && i.action === 'skip').length;
  const noOp          = planMkdir === 0 && planCreate === 0 && planOverwrite === 0;

  const suffix = fromRecommended ? ' from recommendations' : '';

  // ── 3. dry-run 종료 ──────────────────────────────────────
  if (dryRun) {
    console.log('');
    printSummary(rawTargets, fromRecommended, planMkdir, planCreate, planOverwrite, planSkip, null);
    console.log('');
    console.log(`init completed${suffix} (dry-run)`);
    console.log('no files changed');
    return;
  }

  // ── 4. no-op 종료 ────────────────────────────────────────
  if (noOp) {
    console.log('');
    if (rawTargets.length > 0)
      console.log('all selected targets are already satisfied');
    else
      console.log('nothing to apply — project is already up to date');
    return;
  }

  // ── 5. confirm (--yes 없는 경우) ─────────────────────────
  if (!autoYes) {
    const confirmed = await confirmApply({
      targets: rawTargets,
      fromRecommended,
      mkdirCount:    planMkdir,
      createCount:   planCreate,
      overwriteCount: planOverwrite,
      skipCount:     planSkip,
    });
    if (!confirmed) {
      console.log('');
      console.log('cancelled');
      return;
    }
  }

  // ── 6. apply ─────────────────────────────────────────────
  const { applied, skipped, backupSession } =
    applyInitPlan(projectRoot, plan, { backup, backupDir });

  // ── 7. 요약 출력 ─────────────────────────────────────────
  const mkdirCount     = applied.filter(i => i.kind === 'dir').length;
  const createCount    = applied.filter(i => i.kind === 'file' && i.action === 'create').length;
  const overwriteCount = applied.filter(i => i.action === 'overwrite').length;
  const skipCount      = skipped.filter(i => i.kind === 'file').length;

  console.log('');
  printSummary(rawTargets, fromRecommended, mkdirCount, createCount, overwriteCount, skipCount, backupSession);

  // ── 8. 최종 상태 ─────────────────────────────────────────
  console.log('');
  if (skipCount > 0 && createCount === 0 && mkdirCount === 0)
    console.log(`init completed${suffix} — nothing to do`);
  else if (skipCount > 0)
    console.log(`init completed${suffix} with skipped files`);
  else
    console.log(`init completed${suffix}`);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function printSummary(targets, fromRecommended, mkdir, create, overwrite, skip, backupSession) {
  console.log('요약');
  if (targets.length > 0) {
    const label = fromRecommended ? 'recommended targets' : 'selected targets';
    console.log(`  ${label.padEnd(20)}: ${targets.join(', ')}`);
  }
  console.log(`  ${'directories created'.padEnd(20)}: ${mkdir}`);
  console.log(`  ${'files created'.padEnd(20)}: ${create}`);
  if (overwrite > 0)
    console.log(`  ${'files overwritten'.padEnd(20)}: ${overwrite}`);
  console.log(`  ${'files skipped'.padEnd(20)}: ${skip}`);
  if (backupSession)
    console.log(`  ${'backup'.padEnd(20)}: ${backupSession}`);
}

function collectTargets(options) {
  const result = [];
  if (options.target) {
    if (Array.isArray(options.target)) result.push(...options.target);
    else result.push(options.target);
  }
  if (options.targets)
    result.push(...options.targets.split(',').map(t => t.trim()).filter(Boolean));
  return result;
}

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

module.exports = { initCommand };
