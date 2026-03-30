'use strict';

const readline = require('readline');

/**
 * confirmApply.js
 * apply 실행 전 사용자 확인 prompt
 *
 * @param {{
 *   targets:        string[],
 *   fromRecommended: boolean,
 *   mkdirCount:    number,
 *   createCount:   number,
 *   overwriteCount: number,
 *   skipCount:     number,
 * }} summary
 * @returns {Promise<boolean>}  true = 승인, false = 취소
 */
async function confirmApply(summary) {
  const { targets, fromRecommended, mkdirCount, createCount, overwriteCount, skipCount } = summary;

  // non-TTY 환경 (CI, 파이프) — apply 불가, --yes 요구
  if (!process.stdin.isTTY) {
    console.error('');
    console.error('stdin is not a TTY — use --yes (-y) to skip confirmation');
    return false;
  }

  // 확인 요약 출력
  console.log('');
  console.log('Apply?');
  if (targets.length > 0) {
    const label = fromRecommended ? 'recommended' : 'targets';
    console.log(`  ${label.padEnd(12)}: ${targets.join(', ')}`);
  }
  console.log(`  ${'mkdir'.padEnd(12)}: ${mkdirCount}`);
  console.log(`  ${'create'.padEnd(12)}: ${createCount}`);
  if (overwriteCount > 0)
    console.log(`  ${'overwrite'.padEnd(12)}: ${overwriteCount}`);
  console.log(`  ${'skip'.padEnd(12)}: ${skipCount}`);
  console.log('');

  return new Promise(resolve => {
    const rl = readline.createInterface({
      input:  process.stdin,
      output: process.stdout,
    });

    rl.question('Continue? (y/N) ', answer => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === 'y' || a === 'yes');
    });

    // Ctrl+C 처리 — SIGINT 관례에 따라 exitCode 130 설정
    rl.on('SIGINT', () => {
      rl.close();
      console.log('');
      process.exitCode = 130;
      resolve(false);
    });
  });
}

module.exports = { confirmApply };
