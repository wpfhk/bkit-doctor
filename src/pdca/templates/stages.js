'use strict';

/**
 * stages.js
 * 단계별 PDCA 문서 템플릿.
 * 각 stage는 전체 guide 중 해당 단계만 상세하게 생성한다.
 */

const VALID_STAGES = ['plan', 'do', 'check', 'report'];

const STAGE_TEMPLATES = {
  plan: {
    title: 'PDCA Plan',
    sections: (h) => `## Background

- ${h.background}

## Problem Statement

- ${h.problem}

## Goal

- ${h.goal}

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| (what this work covers) | (what is explicitly excluded) |

## Success Criteria

${h.criteria.map(c => `- [ ] ${c}`).join('\n')}

## Risks / Assumptions

| Risk / Assumption | Impact | Mitigation |
|-------------------|--------|------------|
${h.risks.map(r => `| ${r.risk} | ${r.impact} | ${r.mitigation} |`).join('\n')}

## Dependencies

- List any external dependencies, approvals, or prerequisites.

## Timeline

| Milestone | Target Date | Owner |
|-----------|------------|-------|
| Plan approval | (date) | (name) |
| Implementation start | (date) | (name) |
| Completion | (date) | (name) |
`,
  },

  do: {
    title: 'PDCA Do',
    sections: (h) => `## Execution Strategy

- ${h.strategy}

## Work Breakdown

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | (first task) | (name) | Not started |
| 2 | (second task) | (name) | Not started |
| 3 | (third task) | (name) | Not started |

## Deliverables

- [ ] Artifact or output that proves work is done
- [ ] Artifact or output that proves work is done

## Decisions Log

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| (date) | (what was decided) | (why) | (who) |

## Blockers

| Blocker | Impact | Resolution | Status |
|---------|--------|------------|--------|
| (description) | (impact) | (action) | Open |

## Checklist

- [ ] Plan reviewed and approved
- [ ] Implementation complete
- [ ] Documentation updated
- [ ] Stakeholders notified
`,
  },

  check: {
    title: 'PDCA Check',
    sections: (h) => `## Validation Criteria

| # | Criterion | Method | Result | Pass/Fail |
|----|-----------|--------|--------|-----------|
| 1 | ${h.check} | (how to verify) | | |
| 2 | (criterion) | (method) | | |

## Review Questions

- Does the result meet the stated goal?
- Were all success criteria satisfied?
- Are there unexpected side effects?
- Were deliverables completed on time?
- Did any risks materialize?

## Metrics / Evidence

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| (metric name) | (target) | (result) | (pass/fail) |

## Gap Analysis

| Gap | Severity | Recommended Action |
|-----|----------|-------------------|
| (what is missing or wrong) | High / Medium / Low | (fix action) |

## Reviewer Sign-off

- [ ] Reviewed by: (name) on (date)
- [ ] Approved for Act phase: yes / no
`,
  },

  report: {
    title: 'PDCA Report',
    sections: (h) => `## Summary

- Brief 1–2 sentence summary of what was accomplished in this cycle.

## Results vs. Plan

| Planned | Actual | Delta |
|---------|--------|-------|
| (what was planned) | (what happened) | (difference) |

## Improvement Actions

- ${h.act}

## Follow-up

${h.followup.map(f => `- [ ] ${f}`).join('\n')}

## Lessons Learned

| Category | Lesson | Action |
|----------|--------|--------|
| Process | (what we learned) | (what to change) |
| Technical | (what we learned) | (what to change) |

## Next Revision Trigger

- Specify the condition under which this topic should be revisited.

## Cycle History

| Cycle | Date | Outcome |
|-------|------|---------|
| v1 | (date) | (summary) |
`,
  },
};

function buildStageDoc({ topic, stage, type = 'guideline', owner = 'TBD', priority = 'P1', createdAt }, getTemplate) {
  const h = getTemplate(type);
  const tmpl = STAGE_TEMPLATES[stage];

  return `# ${tmpl.title} — ${topic}

## Meta

- **Topic**: ${topic}
- **Stage**: ${stage}
- **Type**: ${type}
- **Owner**: ${owner}
- **Priority**: ${priority}
- **Created**: ${createdAt}
- **Status**: Draft

---

${tmpl.sections(h)}`;
}

module.exports = { VALID_STAGES, STAGE_TEMPLATES, buildStageDoc };
