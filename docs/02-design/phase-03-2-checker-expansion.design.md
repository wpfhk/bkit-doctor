# Design: phase-03-2-checker-expansion

**Date:** 2026-03-27
**Status:** approved
**Plan Ref:** `docs/01-plan/phase-03-2-checker-expansion.plan.md`

---

## 1. Background
Phase 3에서 13개 checker가 구현됐지만 일부는 디렉터리 존재 여부만 확인한다. Phase 3-2에서는 실제 파일 단위로 검사 기준을 강화하고, 미구현이던 policies 카테고리를 추가한다.

## 2. Changed Structure

```
src/
├── checkers/
│   ├── shared/
│   │   └── fileRules.js   (new: findMissingFiles, hasAnyFile, hasAllFiles)
│   ├── policies.js        (new: policies.required)
│   ├── skills.js          (update: dir → SKILL.md 검사)
│   └── misc.js            (update: templates 파일 검사 / changelog 다중 경로)
└── core/
    └── checker.js         (update: category 필드 추가)
```

### fileRules.js API

```javascript
findMissingFiles(root, relativePaths) → string[]   // 없는 경로 목록
hasAnyFile(root, candidates)          → boolean    // 하나라도 있으면 true
hasAllFiles(root, paths)              → boolean    // 모두 있으면 true
```

### category 필드 (CheckerRunner)

```javascript
const category = check.id.split('.')[0];  // 'agents', 'skills', 'policies' 등
results.push({ id, category, title, status, message, details });
```

### skills.required 변경

```
변경 전: .claude/skills/{name}/ 디렉터리 존재
변경 후: .claude/skills/{name}/SKILL.md 파일 존재
```

필수 skill 목록: phase-bootstrap, phase-plan, phase-design, phase-do, phase-check, phase-report, work-summary (7개)

### templates.required 변경

```
변경 전: .claude/templates/ 디렉터리 존재
변경 후: 4개 파일 존재
  - .claude/templates/plan-template.md
  - .claude/templates/design-template.md
  - .claude/templates/task-template.md
  - .claude/templates/report-template.md
```

### changelog.exists 변경

```
변경 전: CHANGELOG.md 단일 경로
변경 후: 후보 중 하나라도 존재하면 pass
  - CHANGELOG.md
  - docs/changelog.md
  - .claude/context/changelog.md
```

### policies.required (신규)

필수 파일 4종:
- `.claude/policies/global-policy.md`
- `.claude/policies/output-policy.md`
- `.claude/policies/security-policy.md`
- `.claude/policies/documentation-policy.md`

없는 파일은 details에 나열, message는 요약.

## 3. Impact Scope
- `src/checkers/skills.js` 로직 변경 (기준 강화)
- `src/checkers/misc.js` — templates/changelog 로직 강화
- `src/checkers/policies.js` 신규 생성 → `index.js` import 추가
- `src/core/checker.js` — category 필드 추가

## 4. Alternatives Compared
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A. 공통 유틸 + category 자동 추출 (선택) | 중복 fs 코드 제거, 결과 구조 통일 | fileRules.js 추가 | ✓ |
| B. 각 checker 내부에서 직접 처리 | 파일 적음 | 중복 코드 누적 | ✗ |

## 5. Decision
**선택: Option A — 공통 유틸 + category 자동 추출**
**Why:** checker가 늘어날수록 fs 중복 코드가 쌓인다. `findMissingFiles`로 배열 기반 검사를 통일하면 각 checker는 "어떤 파일이 필요한가"만 선언하면 된다.

## 6. Verification
- `check` 실행 → 14개 결과 + category 포함 (JSON 구조 확인)
- `policies.required` → bkit-doctor 자신 대상 pass
- 빈 디렉터리 → policies warn + 기존 결과 동일
- `skills.required` → SKILL.md 기준 pass/warn 확인
