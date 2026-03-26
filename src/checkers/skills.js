'use strict';

const path = require('path');
const { findMissingFiles } = require('./shared/fileRules');

const REQUIRED_SKILLS = [
  'phase-bootstrap',
  'phase-plan',
  'phase-design',
  'phase-do',
  'phase-check',
  'phase-report',
  'work-summary',
];

const EXPECTED = REQUIRED_SKILLS.map(s =>
  path.join('.claude', 'skills', s, 'SKILL.md')
);

module.exports = [
  {
    id: 'skills.required',
    title: '필수 skill SKILL.md 존재',
    severity: 'warning',
    async run(context) {
      const missing = findMissingFiles(context.projectRoot, EXPECTED);
      if (missing.length === 0) {
        return { status: 'pass', message: `필수 skill ${REQUIRED_SKILLS.length}개 모두 존재`, found: EXPECTED, expected: EXPECTED };
      }
      return {
        status:   'warn',
        message:  `skill ${missing.length}개 SKILL.md 없음`,
        missing,
        expected: EXPECTED,
        found:    EXPECTED.filter(e => !missing.includes(e)),
      };
    },
  },
];
