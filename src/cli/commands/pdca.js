'use strict';

const fs   = require('fs');
const path = require('path');
const { slugify }                  = require('../../pdca/slugify');
const { buildPdcaGuide, VALID_TYPES } = require('../../pdca/buildPdcaGuide');

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

  // --type 유효성 검증
  if (!VALID_TYPES.includes(type)) {
    console.error(`[bkit-doctor] error: invalid --type "${type}". allowed: ${VALID_TYPES.join(' | ')}`);
    process.exitCode = 1;
    return;
  }
  const useStdout   = Boolean(options.stdout);
  const createdAt   = new Date().toISOString().slice(0, 10);

  const content = buildPdcaGuide({ topic, type, owner, priority, createdAt });

  // stdout mode — print and exit
  if (useStdout) {
    process.stdout.write(content);
    return;
  }

  // resolve output path
  const outputPath = options.output
    ? path.resolve(projectRoot, options.output)
    : path.join(projectRoot, 'docs', '00-pdca', `${slug}-pdca-guide.md`);

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
    console.log(`[bkit-doctor] PDCA guide created: ${outputPath}`);
  } catch (err) {
    console.error(`[bkit-doctor] error: failed to write file: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { pdcaCommand };
