'use strict';

const { CheckerRunner }    = require('../../core/checker');
const { DEFAULT_CHECKERS } = require('../../checkers/index');
const { format }           = require('../../check/formatters/defaultFormatter');

async function checkCommand(options) {
  const targetPath = options.path || process.cwd();
  const runner = new CheckerRunner();
  DEFAULT_CHECKERS.forEach(c => runner.register(c));

  const results = await runner.run(targetPath);

  if (results.length === 0) {
    console.log(`[bkit-doctor] 진단 대상: ${targetPath}`);
    console.log('진단 항목 없음 (no checks loaded)');
    return;
  }

  format(targetPath, results);
}

module.exports = { checkCommand };
