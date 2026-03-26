# Plan: phase-03-2-checker-expansion

**Date:** 2026-03-27
**Status:** approved
**PRD Ref:** N/A

---

## 1. Phase Goal
기존 13개 checker를 개선하고 `policies.required`를 추가하여, agents/skills/templates/policies/changelog 영역 전반을 실질적으로 점검할 수 있는 checker 세트를 완성한다.

## 2. Work Scope
- `src/checkers/shared/fileRules.js` 생성 — 공통 파일 검사 유틸 (findMissingFiles, hasAnyFile, hasAllFiles)
- `src/core/checker.js` 업데이트 — 결과에 `category` 필드 추가 (id prefix 자동 추출)
- `src/checkers/skills.js` 강화 — 디렉터리 존재 → SKILL.md 파일 존재 검사로 전환
- `src/checkers/misc.js` 강화 — templates: 특정 파일 검사 / changelog: 다중 경로 지원
- `src/checkers/policies.js` 신규 — 정책 파일 4종 존재 검사

## 3. Preconditions
- Phase 3-1 완료 (run(context) API 적용)

## 4. Completion Criteria
- [ ] `policies.required` checker 동작
- [ ] `skills.required` — SKILL.md 파일 검사
- [ ] `templates.required` — 4개 템플릿 파일 검사
- [ ] `changelog.exists` — 다중 후보 경로 지원
- [ ] 모든 checker 결과에 `category` 필드 포함
- [ ] `node src/cli/index.js check` 기존과 동일하게 동작

## 5. Expected Risks
| Risk | Mitigation |
|------|-----------|
| skills/ 하위 SKILL.md 없는 경우 | warn 처리 (fail 아님) |
| changelog 다중 경로 모두 없음 | warn 처리 |

## 6. Next Document
Design: `docs/02-design/phase-03-2-checker-expansion.design.md`
