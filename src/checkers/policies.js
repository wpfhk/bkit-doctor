'use strict';

const path = require('path');
const { findMissingFiles } = require('./shared/fileRules');

const EXPECTED = [
  path.join('.claude', 'policies', 'global-policy.md'),
  path.join('.claude', 'policies', 'output-policy.md'),
  path.join('.claude', 'policies', 'security-policy.md'),
  path.join('.claude', 'policies', 'documentation-policy.md'),
];

module.exports = [
  {
    id: 'policies.required',
    title: '필수 policy 파일 존재',
    severity: 'warning',
    async run(context) {
      const missing = findMissingFiles(context.projectRoot, EXPECTED);
      if (missing.length === 0) {
        return { status: 'pass', message: `필수 policy ${EXPECTED.length}개 모두 존재`, found: EXPECTED, expected: EXPECTED };
      }
      return {
        status:   'warn',
        message:  `policy ${missing.length}개 없음`,
        missing,
        expected: EXPECTED,
        found:    EXPECTED.filter(e => !missing.includes(e)),
      };
    },
  },
];
