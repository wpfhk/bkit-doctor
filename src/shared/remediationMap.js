'use strict';

/**
 * remediationMap.js
 * checker id → init target + fixHint + label + description 매핑
 * initTarget 값은 targetRegistry.js의 TARGETS 키와 일치해야 한다
 *
 * label       : 사람이 읽는 짧은 이름 (recommendation 출력에 사용)
 * description : 추천 이유 / 생성 내용 설명 (optional 상세)
 */
const REMEDIATION_MAP = {
  'structure.claude-root': {
    initTarget:  'claude-root',
    fixHint:     '.claude/ 디렉터리 생성 필요',
    label:       'claude root directory',
    description: 'create the .claude/ root directory for bkit environment',
  },
  'config.claude-md': {
    initTarget:  null,           // CLAUDE.md는 scaffold 대상 아님 — 수동 작성
    fixHint:     'CLAUDE.md 직접 작성 필요',
    label:       null,
    description: null,
  },
  'config.hooks-json': {
    initTarget:  'hooks-json',
    fixHint:     '.claude/hooks.json 생성 필요',
    label:       'hooks configuration',
    description: 'create the default hooks.json file',
  },
  'config.settings-local': {
    initTarget:  'settings-local',
    fixHint:     '.claude/settings.local.json 생성 필요',
    label:       'local settings',
    description: 'create the default settings.local.json file',
  },
  'agents.required': {
    initTarget:  'agents-core',
    fixHint:     'agent 파일 스캐폴드 생성 필요',
    label:       'core agents',
    description: 'generate required agent definition files under .claude/agents/',
  },
  'skills.required': {
    initTarget:  'skills-core',
    fixHint:     'skill 디렉터리 + SKILL.md 생성 필요',
    label:       'core skills',
    description: 'generate default skill directories and SKILL.md files',
  },
  'templates.required': {
    initTarget:  'templates-core',
    fixHint:     'template 파일 생성 필요',
    label:       'document templates',
    description: 'generate plan, design, task, and report templates',
  },
  'policies.required': {
    initTarget:  'policies-core',
    fixHint:     'policy 파일 생성 필요',
    label:       'core policies',
    description: 'generate global, output, security, and documentation policy files',
  },
  'docs.plan': {
    initTarget:  'docs-plan',
    fixHint:     'docs/plan.md 생성 필요',
    label:       'plan document',
    description: 'create the plan document scaffold',
  },
  'docs.design': {
    initTarget:  'docs-design',
    fixHint:     'docs/design.md 생성 필요',
    label:       'design document',
    description: 'create the design document scaffold',
  },
  'docs.task': {
    initTarget:  'docs-task',
    fixHint:     'docs/task.md 생성 필요',
    label:       'task document',
    description: 'create the task document scaffold',
  },
  'docs.report': {
    initTarget:  'docs-report',
    fixHint:     'docs/report.md 생성 필요',
    label:       'report document',
    description: 'create the report document scaffold',
  },
  'changelog.exists': {
    initTarget:  'docs-changelog',
    fixHint:     'docs/changelog.md 생성 필요',
    label:       'changelog',
    description: 'create the changelog document scaffold',
  },
};

module.exports = { REMEDIATION_MAP };
