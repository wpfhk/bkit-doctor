'use strict';

/**
 * scaffoldManifest.js
 * init 명령에서 생성할 디렉터리/파일 대상 정의
 * initTarget은 targetRegistry.js의 TARGETS 키와 일치해야 한다
 */

/**
 * 디렉터리 항목.
 * targets: 이 디렉터리가 필요한 target 목록 (selective apply 시 필터링에 사용)
 */
const DIRECTORIES = [
  { path: '.claude',                        targets: ['claude-root', 'hooks-json', 'settings-local', 'agents-core', 'skills-core', 'templates-core', 'policies-core'] },
  { path: '.claude/agents',                 targets: ['agents-core'] },
  { path: '.claude/skills',                 targets: ['skills-core'] },
  { path: '.claude/skills/phase-bootstrap', targets: ['skills-core'] },
  { path: '.claude/skills/phase-plan',      targets: ['skills-core'] },
  { path: '.claude/skills/phase-design',    targets: ['skills-core'] },
  { path: '.claude/skills/phase-do',        targets: ['skills-core'] },
  { path: '.claude/skills/phase-check',     targets: ['skills-core'] },
  { path: '.claude/skills/phase-report',    targets: ['skills-core'] },
  { path: '.claude/skills/work-summary',    targets: ['skills-core'] },
  { path: '.claude/templates',              targets: ['templates-core'] },
  { path: '.claude/context',                targets: ['claude-root'] },
  { path: '.claude/policies',               targets: ['policies-core'] },
  { path: 'docs',           targets: ['docs-core', 'docs-plan', 'docs-design', 'docs-task', 'docs-report', 'docs-changelog'] },
  { path: 'output',         targets: ['docs-pdca'] },
  { path: 'output/pdca',    targets: ['docs-pdca'] },
  { path: 'docs/01-plan',   targets: ['docs-plan'] },
  { path: 'docs/02-design', targets: ['docs-design'] },
  { path: 'docs/03-task',   targets: ['docs-task'] },
  { path: 'docs/04-report', targets: ['docs-report'] },
];

const FILES = [
  // config
  { path: '.claude/hooks.json',          initTarget: 'hooks-json',     type: 'json-hooks' },
  { path: '.claude/settings.local.json', initTarget: 'settings-local', type: 'json-settings' },

  // agents
  { path: '.claude/agents/planner-orchestrator.md', initTarget: 'agents-core', type: 'agent', name: 'planner-orchestrator' },
  { path: '.claude/agents/phase-reviewer.md',        initTarget: 'agents-core', type: 'agent', name: 'phase-reviewer' },
  { path: '.claude/agents/implementer.md',           initTarget: 'agents-core', type: 'agent', name: 'implementer' },
  { path: '.claude/agents/report-summarizer.md',     initTarget: 'agents-core', type: 'agent', name: 'report-summarizer' },

  // skills
  { path: '.claude/skills/phase-bootstrap/SKILL.md', initTarget: 'skills-core', type: 'skill', name: 'phase-bootstrap' },
  { path: '.claude/skills/phase-plan/SKILL.md',      initTarget: 'skills-core', type: 'skill', name: 'phase-plan' },
  { path: '.claude/skills/phase-design/SKILL.md',    initTarget: 'skills-core', type: 'skill', name: 'phase-design' },
  { path: '.claude/skills/phase-do/SKILL.md',        initTarget: 'skills-core', type: 'skill', name: 'phase-do' },
  { path: '.claude/skills/phase-check/SKILL.md',     initTarget: 'skills-core', type: 'skill', name: 'phase-check' },
  { path: '.claude/skills/phase-report/SKILL.md',    initTarget: 'skills-core', type: 'skill', name: 'phase-report' },
  { path: '.claude/skills/work-summary/SKILL.md',    initTarget: 'skills-core', type: 'skill', name: 'work-summary' },

  // templates
  { path: '.claude/templates/plan-template.md',   initTarget: 'templates-core', type: 'template', name: 'plan' },
  { path: '.claude/templates/design-template.md', initTarget: 'templates-core', type: 'template', name: 'design' },
  { path: '.claude/templates/task-template.md',   initTarget: 'templates-core', type: 'template', name: 'task' },
  { path: '.claude/templates/report-template.md', initTarget: 'templates-core', type: 'template', name: 'report' },

  // policies
  { path: '.claude/policies/global-policy.md',        initTarget: 'policies-core', type: 'policy', name: 'global' },
  { path: '.claude/policies/output-policy.md',        initTarget: 'policies-core', type: 'policy', name: 'output' },
  { path: '.claude/policies/security-policy.md',      initTarget: 'policies-core', type: 'policy', name: 'security' },
  { path: '.claude/policies/documentation-policy.md', initTarget: 'policies-core', type: 'policy', name: 'documentation' },

  // pdca
  { path: 'output/pdca/README.md', initTarget: 'docs-pdca', type: 'pdca-readme' },

  // docs-changelog: 루트 CHANGELOG.md (changelog.exists checker의 최우선 후보)
  { path: 'CHANGELOG.md', initTarget: 'docs-changelog', type: 'changelog' },
];

/**
 * docs-core는 docs-* 개별 target의 묶음이다.
 * buildInitPlan에서 docs-core를 확장한다.
 */
const TARGET_ALIASES = {
  'docs-core': ['docs-pdca', 'docs-plan', 'docs-design', 'docs-task', 'docs-report', 'docs-changelog'],
};

module.exports = { DIRECTORIES, FILES, TARGET_ALIASES };
