'use strict';

const { CheckerRunner } = require('../../core/checker');

const STATUS_ICON = {
  pass: '[✓]',
  warn: '[!]',
  fail: '[✗]',
};

/**
 * doctor / check 명령 핸들러
 * Phase 2: CheckerRunner 인터페이스 + 빈 루프 동작
 * Phase 3: checks/ 모듈 로드 및 실제 진단 실행
 */
async function doctorCommand(options) {
  const targetPath = options.path || process.cwd();
  const runner = new CheckerRunner();

  console.log(`[bkit-doctor] 진단 대상: ${targetPath}`);

  const results = await runner.run(targetPath);

  if (results.length === 0) {
    console.log('진단 항목 없음 (no checks loaded)');
    return;
  }

  for (const r of results) {
    const icon = STATUS_ICON[r.status] || '[?]';
    console.log(`${icon} ${r.id}: ${r.message}`);
  }

  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const r of results) {
    if (counts[r.status] !== undefined) counts[r.status]++;
  }
  console.log(`\n총 ${results.length}개 — pass: ${counts.pass}, warn: ${counts.warn}, fail: ${counts.fail}`);
}

module.exports = { doctorCommand };
