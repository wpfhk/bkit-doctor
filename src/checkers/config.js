'use strict';

const fs   = require('fs');
const path = require('path');

function fileChecker(id, title, severity, rel, passMsg, failMsg, failStatus = 'fail') {
  return {
    id, title, severity,
    async run(context) {
      const expected = [rel];
      const exists   = fs.existsSync(path.join(context.projectRoot, rel));
      return exists
        ? { status: 'pass',       message: passMsg, found: expected, expected }
        : { status: failStatus,   message: failMsg,  missing: expected, expected };
    },
  };
}

module.exports = [
  fileChecker(
    'config.claude-md', 'CLAUDE.md 존재', 'error',
    'CLAUDE.md',
    'CLAUDE.md 존재',
    'CLAUDE.md 없음 — 프로젝트 규칙 미정의',
  ),
  fileChecker(
    'config.hooks-json', '.claude/hooks.json 존재', 'warning',
    path.join('.claude', 'hooks.json'),
    '.claude/hooks.json 존재',
    '.claude/hooks.json 없음 — hook 자동화 미설정',
    'warn',
  ),
  fileChecker(
    'config.settings-local', '.claude/settings.local.json 존재', 'warning',
    path.join('.claude', 'settings.local.json'),
    '.claude/settings.local.json 존재',
    '.claude/settings.local.json 없음 — 로컬 설정 미적용',
    'warn',
  ),
];
