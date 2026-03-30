'use strict';

const fs   = require('fs');
const path = require('path');
const { slugify }            = require('../../pdca/slugify');
const { getTemplate, VALID_TYPES } = require('../../pdca/templates');
const { buildStageDoc }      = require('../../pdca/templates/stages');
const { updateTopic }        = require('../../pdca/state');

/**
 * pdca stage subcommand handler
 * bkit-doctor pdca <stage> <topic> [options]
 *
 * stage: plan | do | check | report
 */
function pdcaStageCommandFactory(stage) {
  return async function pdcaStageCommand(topic, options) {
    const projectRoot = path.resolve(options.path || process.cwd());
    const slug        = slugify(topic);
    const type        = options.type || 'guideline';
    const owner       = options.owner || 'TBD';
    const priority    = options.priority || 'P1';
    const overwrite   = Boolean(options.overwrite);
    const dryRun      = Boolean(options.dryRun);
    const useStdout   = Boolean(options.stdout);
    const createdAt   = new Date().toISOString().slice(0, 10);

    if (!VALID_TYPES.includes(type)) {
      console.error(`[bkit-doctor] error: invalid --type "${type}". allowed: ${VALID_TYPES.join(' | ')}`);
      process.exitCode = 1;
      return;
    }

    const content = buildStageDoc({ topic, stage, type, owner, priority, createdAt }, getTemplate);

    if (useStdout) {
      process.stdout.write(content);
      return;
    }

    const outputPath = options.output
      ? path.resolve(projectRoot, options.output)
      : path.join(projectRoot, 'output', 'pdca', `${slug}-pdca-${stage}.md`);

    if (dryRun) {
      const exists = fs.existsSync(outputPath);
      const needsOverwrite = exists && !overwrite;

      console.log(`[bkit-doctor] dry-run: pdca ${stage} generation plan`);
      console.log('');
      console.log(`  output : ${outputPath}`);
      console.log(`  exists : ${exists ? 'yes' : 'no'}`);
      if (exists) {
        console.log(`  action : ${overwrite ? 'overwrite (--overwrite set)' : 'BLOCKED (use --overwrite)'}`);
      } else {
        console.log('  action : create');
      }
      console.log('');
      console.log('--- preview ---');
      process.stdout.write(content);

      if (needsOverwrite) {
        process.exitCode = 1;
      }
      return;
    }

    if (!overwrite && fs.existsSync(outputPath)) {
      console.error(`[bkit-doctor] error: file already exists: ${outputPath}`);
      console.error('Use --overwrite to replace it.');
      process.exitCode = 1;
      return;
    }

    try {
      const dir = path.dirname(outputPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outputPath, content, 'utf8');
      updateTopic(projectRoot, { slug, topic, type, owner, priority, stage, filePath: outputPath });
      console.log(`[bkit-doctor] PDCA ${stage} created: ${outputPath}`);
    } catch (err) {
      console.error(`[bkit-doctor] error: failed to write file: ${err.message}`);
      process.exitCode = 1;
    }
  };
}

module.exports = { pdcaStageCommandFactory };
