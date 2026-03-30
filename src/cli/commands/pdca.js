'use strict';

const fs   = require('fs');
const path = require('path');
const { slugify }                  = require('../../pdca/slugify');
const { buildPdcaGuide, VALID_TYPES } = require('../../pdca/buildPdcaGuide');
const { updateTopic }              = require('../../pdca/state');

/**
 * pdca command handler
 * bkit-doctor pdca <topic> [options]
 *
 * 파일 I/O는 이 command layer에서만 수행한다.
 */
async function pdcaCommand(topic, options) {
  const projectRoot = path.resolve(options.path || process.cwd());
  const slug        = slugify(topic);
  const type        = options.type;
  const owner       = options.owner;
  const priority    = options.priority;
  const overwrite   = Boolean(options.overwrite);
  const dryRun      = Boolean(options.dryRun);

  // --type 유효성 검증
  if (!VALID_TYPES.includes(type)) {
    console.error(`[bkit-doctor] error: invalid --type "${type}". allowed: ${VALID_TYPES.join(' | ')}`);
    process.exitCode = 1;
    return;
  }
  const useStdout   = Boolean(options.stdout);
  const createdAt   = new Date().toISOString().slice(0, 10);

  const content = buildPdcaGuide({ topic, type, owner, priority, createdAt });

  // stdout mode — print content and exit
  if (useStdout) {
    process.stdout.write(content);
    return;
  }

  // resolve output path
  const outputPath = options.output
    ? path.resolve(projectRoot, options.output)
    : path.join(projectRoot, 'output', 'pdca', `${slug}-pdca-guide.md`);

  // dry-run mode — show plan with details and preview
  if (dryRun) {
    const exists = fs.existsSync(outputPath);
    const needsOverwrite = exists && !overwrite;

    console.log('[bkit-doctor] dry-run: pdca guide generation plan');
    console.log('');
    console.log(`  output : ${outputPath}`);
    console.log(`  exists : ${exists ? 'yes' : 'no'}`);
    if (exists) {
      console.log(`  action : ${overwrite ? 'overwrite (--overwrite set)' : 'BLOCKED (use --overwrite)'}`);
    } else {
      console.log('  action : create');
    }
    console.log(`  type   : ${type}`);
    console.log(`  owner  : ${owner}`);
    console.log(`  priority: ${priority}`);
    console.log('');
    console.log('--- preview ---');
    process.stdout.write(content);

    if (needsOverwrite) {
      process.exitCode = 1;
    }
    return;
  }

  // overwrite protection
  if (!overwrite && fs.existsSync(outputPath)) {
    console.error(`[bkit-doctor] error: file already exists: ${outputPath}`);
    console.error('Use --overwrite to replace it.');
    process.exitCode = 1;
    return;
  }

  // write file
  try {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
    updateTopic(projectRoot, { slug, topic, type, owner, priority, stage: 'create', filePath: outputPath });
    console.log(`[bkit-doctor] PDCA guide created: ${outputPath}`);
  } catch (err) {
    console.error(`[bkit-doctor] error: failed to write file: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { pdcaCommand };
