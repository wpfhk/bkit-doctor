'use strict';

/**
 * remediationMap.js
 * checker id → init target + fixHint 매핑
 * initTarget 값은 targetRegistry.js의 TARGETS 키와 일치해야 한다
 */
const REMEDIATION_MAP = {
  'structure.claude-root': {
    initTarget: 'claude-root',
    fixHint:    '.claude/ 디렉터리 생성 필요',
  },
  'config.claude-md': {
    initTarget: null,           // CLAUDE.md는 scaffold 대상 아님 — 수동 작성
    fixHint:    'CLAUDE.md 직접 작성 필요',
  },
  'config.hooks-json': {
    initTarget: 'hooks-json',
    fixHint:    '.claude/hooks.json 생성 필요',
  },
  'config.settings-local': {
    initTarget: 'settings-local',
    fixHint:    '.claude/settings.local.json 생성 필요',
  },
  'agents.required': {
    initTarget: 'agents-core',
    fixHint:    'agent 파일 스캐폴드 생성 필요',
  },
  'skills.required': {
    initTarget: 'skills-core',
    fixHint:    'skill 디렉터리 + SKILL.md 생성 필요',
  },
  'templates.required': {
    initTarget: 'templates-core',
    fixHint:    'template 파일 생성 필요',
  },
  'policies.required': {
    initTarget: 'policies-core',
    fixHint:    'policy 파일 생성 필요',
  },
  'docs.plan': {
    initTarget: 'docs-plan',
    fixHint:    'docs/plan.md 생성 필요',
  },
  'docs.design': {
    initTarget: 'docs-design',
    fixHint:    'docs/design.md 생성 필요',
  },
  'docs.task': {
    initTarget: 'docs-task',
    fixHint:    'docs/task.md 생성 필요',
  },
  'docs.report': {
    initTarget: 'docs-report',
    fixHint:    'docs/report.md 생성 필요',
  },
  'changelog.exists': {
    initTarget: 'docs-changelog',
    fixHint:    'docs/changelog.md 생성 필요',
  },
};

module.exports = { REMEDIATION_MAP };
