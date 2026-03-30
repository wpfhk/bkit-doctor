'use strict';

const fs   = require('fs');
const path = require('path');
const { listTopics } = require('../../pdca/state');

/**
 * pdca list command handler
 * bkit-doctor pdca-list [options]
 *
 * output/pdca/*.md 스캔 + 상태 파일 보조 조회.
 */
async function pdcaListCommand(options) {
  const projectRoot = path.resolve(options.path || process.cwd());
  const pdcaDir = path.join(projectRoot, 'output', 'pdca');

  if (!fs.existsSync(pdcaDir)) {
    console.log('[bkit-doctor] no PDCA guides found (output/pdca/ does not exist)');
    return;
  }

  const files = fs.readdirSync(pdcaDir)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();

  if (files.length === 0) {
    console.log('[bkit-doctor] no PDCA guides found in output/pdca/');
    console.log('  → Run: bkit-doctor pdca "<topic>" to create one.');
    return;
  }

  // load state for supplementary metadata
  const stateTopics = listTopics(projectRoot);
  const stateByFile = new Map();
  for (const t of stateTopics) {
    for (const filePath of Object.values(t.files || {})) {
      const basename = path.basename(filePath);
      stateByFile.set(basename, t);
    }
  }

  console.log(`[bkit-doctor] PDCA guides in output/pdca/ (${files.length} files)`);
  console.log('');

  // header
  const hFile  = 'File'.padEnd(45);
  const hType  = 'Type'.padEnd(12);
  const hStage = 'Stage'.padEnd(10);
  const hDate  = 'Updated';
  console.log(`  ${hFile} ${hType} ${hStage} ${hDate}`);
  console.log(`  ${'─'.repeat(45)} ${'─'.repeat(12)} ${'─'.repeat(10)} ${'─'.repeat(10)}`);

  for (const file of files) {
    const meta = stateByFile.get(file);
    const filePad  = file.padEnd(45);
    const typePad  = (meta?.type || '-').padEnd(12);
    const stagePad = (meta?.currentStage || '-').padEnd(10);
    const date     = meta?.updatedAt || getFileMtime(path.join(pdcaDir, file));

    console.log(`  ${filePad} ${typePad} ${stagePad} ${date}`);
  }
}

function getFileMtime(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return '-';
  }
}

module.exports = { pdcaListCommand };
