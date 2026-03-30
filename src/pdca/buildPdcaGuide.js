'use strict';

/**
 * buildPdcaGuide.js
 * 입력값을 받아 PDCA guide markdown 문자열을 생성한다.
 * 파일 시스템 접근 금지 — pure function.
 *
 * 역할: template selection + value injection.
 * type별 hints는 templates/ 디렉터리에서 관리.
 */

const { VALID_TYPES, getTemplate } = require('./templates');

function buildPdcaGuide({ topic, type = 'guideline', owner = 'TBD', priority = 'P1', createdAt }) {
  const h = getTemplate(type);

  const criteriaLines = h.criteria.map(c => `- [ ] ${c}`).join('\n');
  const riskRows = h.risks.map(r => `| ${r.risk} | ${r.impact} | ${r.mitigation} |`).join('\n');
  const followupLines = h.followup.map(f => `- [ ] ${f}`).join('\n');

  // normalizeType: if type is not valid, getTemplate returns guideline
  const safeType = VALID_TYPES.includes(type) ? type : 'guideline';

  return `# PDCA Guide — ${topic}

> ${h.subtitle}

## Meta

- **Topic**: ${topic}
- **Type**: ${safeType}
- **Owner**: ${owner}
- **Priority**: ${priority}
- **Created**: ${createdAt}
- **Status**: Draft

---

## 1. Plan

### Background

- ${h.background}

### Problem Statement

- ${h.problem}

### Goal

- ${h.goal}

### Scope

| In Scope | Out of Scope |
|----------|-------------|
| (what this work covers) | (what is explicitly excluded) |

### Success Criteria

${criteriaLines}

### Risks / Assumptions

| Risk / Assumption | Impact | Mitigation |
|-------------------|--------|------------|
${riskRows}

---

## 2. Do

### Execution Strategy

- ${h.strategy}

### Work Breakdown

1. First concrete step to execute
2. Second concrete step to execute
3. Third concrete step to execute

### Deliverables

- [ ] Artifact or output that proves work is done
- [ ] Artifact or output that proves work is done

### Checklist

- [ ] Plan reviewed and approved
- [ ] Implementation complete
- [ ] Documentation updated
- [ ] Stakeholders notified

---

## 3. Check

### Validation Criteria

| Criterion | Method | Result | Pass/Fail |
|-----------|--------|--------|-----------|
| ${h.check} | (how to verify) | (fill after check) | (fill after check) |

### Review Questions

- Does the result meet the stated goal?
- Were all success criteria satisfied?
- Are there unexpected side effects?

### Metrics / Evidence

- Link to evidence, metrics dashboard, or test results that support the assessment.

---

## 4. Act

### Improvement Actions

- ${h.act}

### Follow-up

${followupLines}

### Next Revision Trigger

- Specify the condition under which this guide should be revisited (e.g., next sprint, after incident, quarterly review).
`;
}

module.exports = { buildPdcaGuide, VALID_TYPES };
