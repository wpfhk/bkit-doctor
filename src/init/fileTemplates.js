'use strict';

/**
 * fileTemplates.js
 * 각 파일 타입별 내용 생성
 *
 * context.preset에 따라 생성 내용이 달라진다:
 *   - lean:     최소 구조, 간결한 placeholder
 *   - default:  전체 구조, 상세한 섹션
 *   - 그 외:    default와 동일
 */

// ── agent 상세 설명 (default preset) ────────────────────────────────────────

const AGENT_DETAILS = {
  'planner-orchestrator': {
    purpose: 'All tasks enter through this agent. Defines phases, dispatches to sub-agents, and selects fallback strategies when blocked.',
    triggers: 'Every new task or question from the user',
    responsibilities: '- Define phase scope and goals\n- Dispatch to implementer after Design approval\n- Select workaround strategies when blocked',
  },
  'implementer': {
    purpose: 'Implements code within the approved Plan/Design scope. Cannot expand scope independently.',
    triggers: 'After Design document is approved by planner-orchestrator',
    responsibilities: '- Write code strictly within Plan/Design boundaries\n- Maintain code-documentation consistency\n- Produce results reviewable by phase-reviewer',
  },
  'phase-reviewer': {
    purpose: 'Reviews Plan/Design/Do results. Detects omissions, conflicts, and scope drift, reporting as soft-warnings.',
    triggers: 'After implementer completes a phase',
    responsibilities: '- Check for missing items and conflicts\n- Detect scope drift from Plan/Design\n- Report issues as warnings (not blockers)',
  },
  'report-summarizer': {
    purpose: 'Generates real-time progress summaries and phase completion reports. Always outputs concise, context-efficient format.',
    triggers: 'After phase-reviewer approves results',
    responsibilities: '- Write phase completion reports\n- Update changelog\n- Link to next phase',
  },
};

// ── skill 상세 설명 (default preset) ────────────────────────────────────────

const SKILL_DETAILS = {
  'phase-bootstrap': 'Generate document scaffolds for a new phase and update state files.',
  'phase-plan':      'Write a Plan document defining goals, scope, prerequisites, completion criteria, and risks.',
  'phase-design':    'Write a Design document covering change structure, impact scope, alternatives, and rationale.',
  'phase-do':        'Execute implementation by dispatching the implementer agent within approved Design.',
  'phase-check':     'Verify implementation results against Plan/Design completion criteria (pass/warn/fail).',
  'phase-report':    'Write a phase completion report, update changelog, and link to the next phase.',
};

// ── 생성 함수 ───────────────────────────────────────────────────────────────

/**
 * @param {Object} file     scaffoldManifest entry ({ type, name, path })
 * @param {Object} [context]
 * @param {string} [context.preset]  preset name (lean, default, etc.)
 * @returns {string} file content
 */
function getContent(file, context = {}) {
  const preset = context.preset || 'default';
  const isLean = preset === 'lean';

  switch (file.type) {
    case 'json-hooks':
      return JSON.stringify({ hooks: [] }, null, 2) + '\n';

    case 'json-settings':
      return JSON.stringify({ env: {}, permissions: [] }, null, 2) + '\n';

    case 'agent': {
      const detail = !isLean && AGENT_DETAILS[file.name];
      if (detail) {
        return [
          `# ${file.name}`,
          '',
          '## Purpose',
          detail.purpose,
          '',
          '## Triggers',
          detail.triggers,
          '',
          '## Responsibilities',
          detail.responsibilities,
          '',
          '## Output',
          '<!-- Expected output format -->',
        ].join('\n') + '\n';
      }
      return [
        `# ${file.name}`,
        '',
        '## Purpose',
        `${file.name} agent.`,
        '',
        '## Triggers',
        '<!-- When to invoke this agent -->',
      ].join('\n') + '\n';
    }

    case 'skill': {
      const desc = !isLean && SKILL_DETAILS[file.name];
      if (desc) {
        return [
          `# ${file.name}`,
          '',
          '## Purpose',
          desc,
          '',
          '## Usage',
          `\`/${file.name}\``,
          '',
          '## Steps',
          '<!-- Step-by-step instructions -->',
        ].join('\n') + '\n';
      }
      return [
        `# ${file.name}`,
        '',
        '## Purpose',
        `${file.name} skill.`,
        '',
        '## Usage',
        `\`/${file.name}\``,
      ].join('\n') + '\n';
    }

    case 'template':
      if (isLean) {
        return [
          `# ${file.name} Template`,
          '',
          '## Summary',
          '<!-- Brief summary -->',
          '',
          '## Details',
          '<!-- Fill in here -->',
        ].join('\n') + '\n';
      }
      return [
        `# ${file.name} Template`,
        '',
        '## Status',
        '<!-- draft | in-progress | done -->',
        '',
        '## Summary',
        '<!-- Brief summary -->',
        '',
        '## Details',
        '<!-- Fill in here -->',
      ].join('\n') + '\n';

    case 'policy':
      if (isLean) {
        return [
          `# ${file.name} Policy`,
          '',
          '## Rules',
          '<!-- Define rules here -->',
        ].join('\n') + '\n';
      }
      return [
        `# ${file.name} Policy`,
        '',
        '## Purpose',
        `Defines ${file.name} rules for this project.`,
        '',
        '## Rules',
        '<!-- Define rules here -->',
      ].join('\n') + '\n';

    case 'doc':
      return [
        `# ${file.name}`,
        '',
        '## Status',
        '<!-- draft | in-progress | done -->',
        '',
        '## Summary',
        '<!-- Brief summary -->',
      ].join('\n') + '\n';

    case 'changelog':
      return [
        '# Changelog',
        '',
        '## Unreleased',
        '<!-- List changes here -->',
      ].join('\n') + '\n';

    default:
      return `# ${file.path}\n\n<!-- placeholder -->\n`;
  }
}

module.exports = { getContent };
