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
const { buildSkillContent }          = require('../../skill/skillTemplate');
const { buildClaudeContent }         = require('../../skill/claudeTemplate');

/**
 * setup command — interactive wizard for full project onboarding.
 *
 * Steps:
 *   1. Check & Init — diagnose, then fix structural issues
 *   2. CLAUDE.md — generate default CLAUDE.md (backup existing)
 *   3. Skill Integration — inject SKILL.md + link from CLAUDE.md
 *   4. Scripts Injection — add helper scripts to package.json
 *   5. Final Summary — completion message
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

  // detect project name
  let projectName = path.basename(projectRoot);
  const pkgJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkg.name) projectName = pkg.name;
    } catch { /* use dir name */ }
  }

  // ── Step 1: Check & Init ─────────────────────────────────────
  console.log('── Step 1/5: Check & Init ──────────────────────────');
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

  // ── Step 2: CLAUDE.md ──────────────────────────────────────────
  console.log('── Step 2/5: CLAUDE.md ─────────────────────────────');
  console.log('');

  const claudePath = path.join(projectRoot, 'CLAUDE.md');
  const claudeExists = fs.existsSync(claudePath);

  if (claudeExists) {
    const answer = await ask('  CLAUDE.md already exists. Generate a new one? Existing file will be backed up. (y/N) ');
    // isExplicitYes: requires 'y'/'yes' — non-TTY always skips this branch
    if (isExplicitYes(answer)) {
      // backup existing CLAUDE.md with date stamp (TTY-only path)
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const backupName = `CLAUDE_${date}_backup.md`;
      const backupPath = path.join(projectRoot, backupName);
      fs.copyFileSync(claudePath, backupPath);
      console.log(`  backed up to ${backupName}`);

      const content = buildClaudeContent(projectName);
      fs.writeFileSync(claudePath, content, 'utf8');
      console.log('  generated new CLAUDE.md');
    } else {
      console.log('  kept existing CLAUDE.md');
    }
  } else {
    const answer = await ask('  Generate CLAUDE.md for this project? (Y/n) ');
    if (isYes(answer)) {
      const content = buildClaudeContent(projectName);
      fs.writeFileSync(claudePath, content, 'utf8');
      console.log('  created CLAUDE.md');
    } else {
      console.log('  skipped');
    }
  }

  console.log('');

  // ── Step 3: Skill Integration ────────────────────────────────
  console.log('── Step 3/5: Skill Integration ─────────────────────');
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
      const content = buildSkillContent(projectName);
      fs.writeFileSync(skillPath, content, 'utf8');
      console.log('  created SKILL.md');

      // auto-link SKILL.md from CLAUDE.md
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

  // ── Step 4: Scripts Injection ────────────────────────────────
  console.log('── Step 4/5: Scripts Injection ──────────────────────');
  console.log('');

  if (!fs.existsSync(pkgJsonPath)) {
    console.log('  no package.json found — skipped');
  } else {
    const answer = await ask('  Add bkit-doctor helper scripts to package.json? (Y/n) ');
    if (isYes(answer)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (!pkg.scripts) pkg.scripts = {};

        const addedKeys = [];
        const scripts = {
          'bkit:check': 'bkit-doctor check',
          'bkit:fix': 'bkit-doctor fix --yes',
          'bkit:setup': 'bkit-doctor setup',
        };

        for (const [key, val] of Object.entries(scripts)) {
          if (!pkg.scripts[key]) {
            pkg.scripts[key] = val;
            addedKeys.push(key);
          }
        }
        const added = addedKeys.length;

        if (added > 0) {
          fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
          console.log(`  added ${added} script(s): ${addedKeys.join(', ')}`);
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

  // ── Step 5: Final Summary ────────────────────────────────────
  console.log('── Step 5/5: Summary ───────────────────────────────');
  console.log('');
  console.log('  Setup complete! bkit-doctor is now integrated.');
  console.log('');
  console.log('  Next steps:');
  console.log('    1. Review CLAUDE.md and customize for your project');
  console.log('    2. Run `claude` and start building — Claude knows bkit-doctor');
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
