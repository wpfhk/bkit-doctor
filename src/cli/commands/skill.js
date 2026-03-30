'use strict';

const fs = require('fs');
const path = require('path');
const { buildSkillContent } = require('../../skill/skillTemplate');

/**
 * skill command — generate SKILL.md for Claude Code automation integration.
 *
 * Writes a SKILL.md file in the project root with automation rules
 * that make Claude Code proactively use bkit-doctor for documentation.
 *
 * Options:
 *   --append-claude  Append rules to CLAUDE.md instead of creating SKILL.md
 *   --overwrite      Overwrite existing SKILL.md
 *   --stdout         Print to terminal instead of writing
 *   --dry-run        Preview without writing
 */
async function skillCommand(options) {
  const projectRoot  = path.resolve(options.path || process.cwd());
  const appendClaude = Boolean(options.appendClaude);
  const overwrite    = Boolean(options.overwrite);
  const stdout       = Boolean(options.stdout);
  const dryRun       = Boolean(options.dryRun);

  // detect project name from package.json
  let projectName = path.basename(projectRoot);
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) projectName = pkg.name;
    } catch { /* use directory name */ }
  }

  const content = buildSkillContent(projectName);

  // stdout mode
  if (stdout) {
    process.stdout.write(content);
    return;
  }

  const targetFile = appendClaude
    ? path.join(projectRoot, 'CLAUDE.md')
    : path.join(projectRoot, 'SKILL.md');

  const relPath = path.relative(projectRoot, targetFile);

  // dry-run mode
  if (dryRun) {
    console.log(`[bkit-doctor] skill (dry-run)`);
    if (appendClaude) {
      console.log(`  action : append to ${relPath}`);
    } else {
      const exists = fs.existsSync(targetFile);
      console.log(`  action : ${exists ? (overwrite ? 'overwrite' : 'skip (already exists)') : 'create'} ${relPath}`);
    }
    console.log('');
    console.log(content.slice(0, 300) + '\n  ...(truncated)');
    return;
  }

  // append to CLAUDE.md
  if (appendClaude) {
    const separator = '\n\n---\n\n';
    const existing = fs.existsSync(targetFile)
      ? fs.readFileSync(targetFile, 'utf8')
      : '';

    if (existing.includes('RULE 1: PROACTIVE DOCUMENTATION')) {
      console.log(`[bkit-doctor] skill rules already present in ${relPath} — skipped`);
      return;
    }

    fs.writeFileSync(targetFile, existing + separator + content, 'utf8');
    console.log(`[bkit-doctor] skill rules appended to ${relPath}`);
    return;
  }

  // create SKILL.md
  if (fs.existsSync(targetFile) && !overwrite) {
    console.log(`[bkit-doctor] ${relPath} already exists — use --overwrite to replace`);
    return;
  }

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`[bkit-doctor] created ${relPath}`);

  // auto-link SKILL.md from CLAUDE.md so Claude Code loads it
  linkSkillFromClaude(projectRoot);
}

/**
 * Ensure CLAUDE.md contains a reference to SKILL.md.
 * If CLAUDE.md exists but has no reference, append one line.
 * If CLAUDE.md does not exist, skip (user may create it via init).
 */
function linkSkillFromClaude(projectRoot) {
  const claudePath = path.join(projectRoot, 'CLAUDE.md');
  if (!fs.existsSync(claudePath)) return;

  const claudeContent = fs.readFileSync(claudePath, 'utf8');
  if (claudeContent.includes('SKILL.md')) return; // already linked

  const ref = '\n\n<!-- bkit-doctor automation rules -->\nSee also: [SKILL.md](SKILL.md)\n';
  fs.writeFileSync(claudePath, claudeContent.trimEnd() + ref, 'utf8');
  console.log(`[bkit-doctor] linked SKILL.md from CLAUDE.md`);
}

module.exports = { skillCommand };
