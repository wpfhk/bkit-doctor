'use strict';

const path = require('path');
const { findMissingFiles } = require('./shared/fileRules');

const REQUIRED_AGENTS = [
  'planner-orchestrator.md',
  'implementer.md',
  'phase-reviewer.md',
  'report-summarizer.md',
];

const EXPECTED = REQUIRED_AGENTS.map(a => path.join('.claude', 'agents', a));

module.exports = [
  {
    id: 'agents.required',
    title: '필수 agent 파일 존재',
    severity: 'warning',
    async run(context) {
      const missing = findMissingFiles(context.projectRoot, EXPECTED);
      if (missing.length === 0) {
        return { status: 'pass', message: `필수 agent ${EXPECTED.length}개 모두 존재`, found: EXPECTED, expected: EXPECTED };
      }
      return {
        status:   'warn',
        message:  `agent ${missing.length}개 없음`,
        missing,
        expected: EXPECTED,
        found:    EXPECTED.filter(e => !missing.includes(e)),
      };
    },
  },
];
