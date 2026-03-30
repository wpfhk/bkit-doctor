'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { CheckerRunner }              = require('../../core/checker');
const { DEFAULT_CHECKERS }           = require('../../checkers/index');
const { format }                     = require('../../check/formatters/defaultFormatter');
const { saveRecommendationSnapshot } = require('../../check/recommendations/saveRecommendationSnapshot');
const { resolveFixTargets }          = require('../../fix/resolveFixTargets');
const { buildInitPlan }              = require('../../init/buildInitPlan');
const { applyInitPlan }              = require('../../init/applyInitPlan');
const { formatLabel }                = require('../formatLabel');
const { buildSkillContent }          = require('../../skill/skillTemplate');

/**
 * setup command — interactive wizard for full project onboarding.
 *
 * Steps:
 *   1. Check & Init — diagnose, then fix structural issues
 *   2. Skill Integration — inject SKILL.md for Claude Code automation
 *   3. Scripts Injection — add helper scripts to package.json
 *   4. Final Summary — completion message
 */
async function setupCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         bkit-doctor setup wizard                 ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  project: ${projectRoot}`);
  console.log('');

  // ── Step 1: Check & Init ─────────────────────────────────────
  console.log('── Step 1/4: Check & Init ──────────────────────────');
  console.log('');

  const runner = new CheckerRunner();
  DEFAULT_CHECKERS.forEach(c => runner.register(c));
  const results = await runner.run(projectRoot);

  if (results.length > 0) {
    format(projectRoot, results);
    saveRecommendationSnapshot(projectRoot, results);
  }

  const failCount = results.filter(r => r.status === 'fail').length;
  const warnCount = results.filter(r => r.status === 'warn').length;

  if (failCount === 0 && warnCount === 0) {
    console.log('');
    console.log('  project structure is healthy — nothing to fix');
  } else {
    console.log('');
    const answer = await ask(`  ${failCount} fail(s), ${warnCount} warning(s) found. Auto-fix? (Y/n) `);
    if (isYes(answer)) {
      const { targets } = await resolveFixTargets(projectRoot, { fresh: true });
      if (targets.length > 0) {
        const plan = buildInitPlan(projectRoot, { overwrite: false, targets });
        const actionable = plan.filter(i => i.action === 'mkdir' || i.action === 'create');
        if (actionable.length > 0) {
          const { applied } = applyInitPlan(projectRoot, plan, {});
          const created = applied.filter(i => i.action === 'create' || i.action === 'mkdir').length;
          console.log(`  applied ${created} fix(es)`);
        } else {
          console.log('  all targets already satisfied');
        }
      } else {
        console.log('  no fixable targets found');
      }
    } else {
      console.log('  skipped');
    }
  }

  console.log('');

  // ── Step 2: Skill Integration ────────────────────────────────
  console.log('── Step 2/4: Skill Integration ─────────────────────');
  console.log('');

  const skillPath = path.join(projectRoot, 'SKILL.md');
  const skillExists = fs.existsSync(skillPath);

  if (skillExists && fs.readFileSync(skillPath, 'utf8').includes('RULE 1: PROACTIVE DOCUMENTATION')) {
    console.log('  SKILL.md already contains bkit-doctor automation rules — skipped');
  } else {
    const label = skillExists
      ? '  SKILL.md exists. Overwrite with bkit-doctor rules? (y/N) '
      : '  Inject bkit-doctor automation rules into SKILL.md? (Y/n) ';
    const defaultYes = !skillExists;
    const answer = await ask(label);
    const proceed = defaultYes ? isYes(answer) : isExplicitYes(answer);

    if (proceed) {
      let projectName = path.basename(projectRoot);
      const pkgPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.name) projectName = pkg.name;
        } catch { /* use dir name */ }
      }

      const content = buildSkillContent(projectName);
      fs.writeFileSync(skillPath, content, 'utf8');
      console.log('  created SKILL.md');

      // auto-link SKILL.md from CLAUDE.md
      const claudePath = path.join(projectRoot, 'CLAUDE.md');
      if (fs.existsSync(claudePath)) {
        const claudeContent = fs.readFileSync(claudePath, 'utf8');
        if (!claudeContent.includes('SKILL.md')) {
          const ref = '\n\n<!-- bkit-doctor automation rules -->\nSee also: [SKILL.md](SKILL.md)\n';
          fs.writeFileSync(claudePath, claudeContent.trimEnd() + ref, 'utf8');
          console.log('  linked SKILL.md from CLAUDE.md');
        }
      }
    } else {
      console.log('  skipped');
    }
  }

  console.log('');

  // ── Step 3: Scripts Injection ────────────────────────────────
  console.log('── Step 3/4: Scripts Injection ──────────────────────');
  console.log('');

  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('  no package.json found — skipped');
  } else {
    const answer = await ask('  Add bkit-doctor helper scripts to package.json? (Y/n) ');
    if (isYes(answer)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (!pkg.scripts) pkg.scripts = {};

        let added = 0;
        const scripts = {
          'bkit:check': 'bkit-doctor check',
          'bkit:fix': 'bkit-doctor fix --yes',
          'bkit:setup': 'bkit-doctor setup',
        };

        for (const [key, val] of Object.entries(scripts)) {
          if (!pkg.scripts[key]) {
            pkg.scripts[key] = val;
            added++;
          }
        }

        if (added > 0) {
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
          console.log(`  added ${added} script(s): ${Object.keys(scripts).filter(k => !pkg.scripts[k] || pkg.scripts[k] === scripts[k]).join(', ')}`);
        } else {
          console.log('  scripts already present — skipped');
        }
      } catch (err) {
        console.log(`  error reading package.json: ${err.message}`);
      }
    } else {
      console.log('  skipped');
    }
  }

  console.log('');

  // ── Step 4: Final Summary ────────────────────────────────────
  console.log('── Step 4/4: Summary ───────────────────────────────');
  console.log('');
  console.log('  Setup complete! bkit-doctor is now integrated.');
  console.log('');
  console.log('  Next steps:');
  console.log('    1. Run `claude` and start building — Claude knows bkit-doctor');
  console.log('    2. Run `bkit-doctor check` anytime to diagnose');
  console.log('    3. Run `bkit-doctor pdca "<topic>"` to create PDCA guides');
  console.log('');
}

// ── prompt helpers (Node.js built-in readline) ──────────────────

function ask(question) {
  // non-interactive mode: auto-accept defaults
  if (!process.stdin.isTTY) return Promise.resolve('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function isYes(answer) {
  return answer === '' || /^y(es)?$/i.test(answer);
}

function isExplicitYes(answer) {
  return /^y(es)?$/i.test(answer);
}

module.exports = { setupCommand };
