'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Targets available for clearing.
 * Each entry: { key, label, rel, defaultOn, isDir }
 *   - key:       unique identifier
 *   - label:     display name shown in selection
 *   - rel:       relative path from project root
 *   - defaultOn: whether it is pre-selected
 *   - isDir:     true → rmSync recursive, false → unlinkSync
 */
const CLEAR_TARGETS = [
  { key: 'bkit-doctor',  label: '.bkit-doctor/ (PDCA state, settings)',      rel: '.bkit-doctor',          defaultOn: true,  isDir: true  },
  { key: 'skill-md',     label: 'SKILL.md (automation rules)',               rel: 'SKILL.md',              defaultOn: true,  isDir: false },
  { key: 'hooks-json',   label: '.claude/hooks.json',                        rel: '.claude/hooks.json',    defaultOn: true,  isDir: false },
  { key: 'settings',     label: '.claude/settings.local.json',               rel: '.claude/settings.local.json', defaultOn: true,  isDir: false },
  { key: 'output-pdca',  label: 'output/pdca/ (generated PDCA documents)',   rel: 'output/pdca',           defaultOn: true,  isDir: true  },
  { key: 'claude-md',    label: 'CLAUDE.md (may contain custom rules!)',     rel: 'CLAUDE.md',             defaultOn: false, isDir: false },
];

/**
 * clear command — interactively remove bkit-doctor configuration files.
 *
 * Flow:
 *   1. Show target selection (checkbox-style)
 *   2. Double confirmation with "RESET" keyword
 *   3. Delete selected targets
 */
async function clearCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());

  console.log('');
  console.log('[bkit-doctor] clear — remove configuration files');
  console.log(`  project: ${projectRoot}`);
  console.log('');

  // filter to targets that actually exist
  const existing = CLEAR_TARGETS
    .map(t => ({ ...t, absPath: path.join(projectRoot, t.rel), exists: false }))
    .map(t => ({ ...t, exists: fs.existsSync(t.absPath) }));

  const available = existing.filter(t => t.exists);

  if (available.length === 0) {
    console.log('  nothing to clear — no bkit-doctor files found');
    return;
  }

  // ── Step 1: Target selection ──────────────────────────────────

  // non-interactive mode (piped stdin): use defaults
  let selected;
  if (!process.stdin.isTTY) {
    selected = available.filter(t => t.defaultOn);
  } else {
    selected = await selectTargets(available);
  }

  if (selected.length === 0) {
    console.log('  no targets selected — cancelled');
    return;
  }

  console.log('');
  console.log('  Selected for deletion:');
  for (const t of selected) {
    console.log(`    - ${t.rel}`);
  }
  console.log('');

  // ── Step 2: Double confirmation ───────────────────────────────

  console.log('  WARNING: This action is destructive and will remove the selected files.');
  console.log('');
  const confirm = await ask('  Type RESET to confirm deletion: ');

  if (confirm !== 'RESET') {
    console.log('');
    console.log('  Confirmation failed — operation cancelled. No files were deleted.');
    return;
  }

  // ── Step 3: Execute deletion ──────────────────────────────────

  console.log('');
  let deleted = 0;
  for (const t of selected) {
    try {
      if (t.isDir) {
        fs.rmSync(t.absPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(t.absPath);
      }
      console.log(`  removed ${t.rel}`);
      deleted++;
    } catch (err) {
      console.log(`  failed to remove ${t.rel}: ${err.message}`);
    }
  }

  console.log('');
  console.log(`  Environment cleared. ${deleted} item(s) removed.`);
  console.log('  Run \`bkit-doctor setup\` to re-initialize.');
  console.log('');
}

// ── Interactive target selection (readline-based) ────────────────

async function selectTargets(targets) {
  const selections = targets.map(t => t.defaultOn);

  console.log('  Select targets to delete (toggle with number, press Enter to confirm):');
  console.log('');

  function render() {
    for (let i = 0; i < targets.length; i++) {
      const mark = selections[i] ? 'x' : ' ';
      console.log(`    ${i + 1}) [${mark}] ${targets[i].label}`);
    }
  }

  render();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    function prompt() {
      rl.question('\n  Toggle (1-' + targets.length + ') or Enter to confirm: ', (input) => {
        const trimmed = input.trim();

        // empty → confirm
        if (trimmed === '') {
          rl.close();
          resolve(targets.filter((_, i) => selections[i]));
          return;
        }

        // number → toggle
        const num = parseInt(trimmed, 10);
        if (num >= 1 && num <= targets.length) {
          selections[num - 1] = !selections[num - 1];
          console.log('');
          render();
        } else {
          console.log(`  invalid input — enter a number 1-${targets.length} or press Enter`);
        }

        prompt();
      });
    }

    prompt();
  });
}

function ask(question) {
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

module.exports = { clearCommand, CLEAR_TARGETS };
