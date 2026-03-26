'use strict';

const fs   = require('fs');
const path = require('path');
const { findMissingFiles, hasAnyFile } = require('./shared/fileRules');

const REQUIRED_TEMPLATES = [
  path.join('.claude', 'templates', 'plan-template.md'),
  path.join('.claude', 'templates', 'design-template.md'),
  path.join('.claude', 'templates', 'task-template.md'),
  path.join('.claude', 'templates', 'report-template.md'),
];

const CHANGELOG_CANDIDATES = [
  'CHANGELOG.md',
  path.join('docs', 'changelog.md'),
  path.join('.claude', 'context', 'changelog.md'),
];

module.exports = [
  {
    id: 'templates.required',
    title: '필수 template 파일 존재',
    severity: 'warning',
    async run(context) {
      const missing = findMissingFiles(context.projectRoot, REQUIRED_TEMPLATES);
      if (missing.length === 0) {
        return { status: 'pass', message: `필수 template ${REQUIRED_TEMPLATES.length}개 모두 존재`, found: REQUIRED_TEMPLATES, expected: REQUIRED_TEMPLATES };
      }
      return {
        status:   'warn',
        message:  `template ${missing.length}개 없음`,
        missing,
        expected: REQUIRED_TEMPLATES,
        found:    REQUIRED_TEMPLATES.filter(e => !missing.includes(e)),
      };
    },
  },
  {
    id: 'context.required',
    title: '.claude/context/ 존재',
    severity: 'warning',
    async run(context) {
      const rel    = path.join('.claude', 'context');
      const exists = fs.existsSync(path.join(context.projectRoot, rel));
      return exists
        ? { status: 'pass', message: '.claude/context/ 존재', found: [rel], expected: [rel] }
        : { status: 'warn', message: '.claude/context/ 없음 — 프로젝트 컨텍스트 미설정', missing: [rel], expected: [rel] };
    },
  },
  {
    id: 'changelog.exists',
    title: 'changelog 문서 존재',
    severity: 'warning',
    async run(context) {
      const found = CHANGELOG_CANDIDATES.filter(p =>
        fs.existsSync(path.join(context.projectRoot, p))
      );
      if (found.length > 0) {
        return { status: 'pass', message: 'changelog 문서 존재', found, expected: CHANGELOG_CANDIDATES };
      }
      return {
        status:   'warn',
        message:  'changelog 문서 없음 — 변경 이력 미관리',
        missing:  CHANGELOG_CANDIDATES,
        expected: CHANGELOG_CANDIDATES,
      };
    },
  },
];
