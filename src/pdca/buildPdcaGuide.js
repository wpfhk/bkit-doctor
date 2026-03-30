'use strict';

/**
 * buildPdcaGuide.js
 * 입력값을 받아 PDCA guide markdown 문자열을 생성한다.
 * 파일 시스템 접근 금지 — pure function.
 */

const VALID_TYPES = ['guideline', 'feature', 'bugfix', 'refactor'];

function normalizeType(type) {
  return VALID_TYPES.includes(type) ? type : 'guideline';
}

function buildPdcaGuide({ topic, type = 'guideline', owner = 'TBD', priority = 'P1', createdAt }) {
  const safeType = normalizeType(type);

  return `# PDCA Guide — ${topic}

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

- Describe why this work is needed and what situation triggered it in 1–2 sentences.

### Problem Statement

- State the specific problem to solve. Be concrete — avoid vague descriptions.

### Goal

- Define what success looks like when this work is complete.

### Scope

| In Scope | Out of Scope |
|----------|-------------|
| (what this work covers) | (what is explicitly excluded) |

### Success Criteria

- [ ] Criterion that can be objectively verified
- [ ] Criterion that can be objectively verified
- [ ] Criterion that can be objectively verified

### Risks / Assumptions

| Risk / Assumption | Impact | Mitigation |
|-------------------|--------|------------|
| Describe a risk or assumption that could affect the outcome | High / Medium / Low | Action to reduce the risk |

---

## 2. Do

### Execution Strategy

- Describe the overall approach: what method, tools, or sequence will be used.

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
| What to verify | How to verify it | (fill after check) | (fill after check) |

### Review Questions

- Does the result meet the stated goal?
- Were all success criteria satisfied?
- Are there unexpected side effects?

### Metrics / Evidence

- Link to evidence, metrics dashboard, or test results that support the assessment.

---

## 4. Act

### Improvement Actions

- Describe what to change or improve based on Check results.

### Follow-up

- [ ] Action item that must happen after this cycle
- [ ] Action item that must happen after this cycle

### Next Revision Trigger

- Specify the condition under which this guide should be revisited (e.g., next sprint, after incident, quarterly review).
`;
}

module.exports = { buildPdcaGuide, VALID_TYPES };
