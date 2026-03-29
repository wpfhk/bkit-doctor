'use strict';

const { getPlatform }    = require('../utils/platform');
const { normalizeResult } = require('../check/resultModel');

/**
 * CheckerRunner — 진단 모듈 인터페이스
 *
 * Checker 등록 형식:
 *   { id, title, severity, run: async (context) => { status, message, details? } }
 *
 * context 형식:
 *   { projectRoot: string, platform: string }
 *
 * run() 반환 형식:
 *   [{ id, title, status, message, details }]
 */
class CheckerRunner {
  constructor() {
    this.checks = [];
  }

  /** @param {{ id: string, title: string, severity: string, run: Function }} check */
  register(check) {
    this.checks.push(check);
  }

  /**
   * @param {string} projectRoot 진단 대상 절대 경로
   * @returns {Promise<Array<{id, title, status, message, details}>>}
   */
  async run(projectRoot) {
    if (this.checks.length === 0) return [];

    const context = {
      projectRoot,
      platform: getPlatform(),
    };

    const results = [];
    for (const check of this.checks) {
      const category = check.id.split('.')[0];
      try {
        const raw = await check.run(context);
        const n   = normalizeResult(raw);
        results.push({ id: check.id, category, title: check.title, severity: check.severity, ...n });
      } catch (err) {
        results.push({
          id: check.id, category, title: check.title,
          severity: check.severity,
          ...normalizeResult({ status: 'fail', message: err.message }),
        });
      }
    }
    return results;
  }
}

module.exports = { CheckerRunner };
