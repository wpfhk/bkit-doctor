# Plan: phase-03-3-output-init-mapping

**Date:** 2026-03-27
**Status:** approved
**PRD Ref:** N/A

---

## 1. Phase Goal
checker 출력 책임을 formatter로 분리하고, 카테고리 요약·missing 표준화·init 매핑을 완성하여 check 결과만으로 프로젝트 준비 상태를 즉시 판단할 수 있게 한다.

## 2. Work Scope
- `src/check/resultModel.js` — 결과 구조 정규화 헬퍼
- `src/shared/remediationMap.js` — checker id → initTarget + fixHint 매핑
- `src/check/formatters/defaultFormatter.js` — 카테고리 요약 + 상세 + 총계 출력
- `src/core/checker.js` — missing/found/expected 필드 pass-through
- checker 파일 7종 — missing/expected 필드 표준화 (agents/skills/policies/misc/structure/config/docs)
- `src/cli/commands/check.js` — formatter 위임, 직접 출력 제거

## 3. Preconditions
- Phase 3-2 완료 (14개 checker, fileRules.js, category 필드)

## 4. Completion Criteria
- [ ] check 출력에 카테고리 요약 섹션 표시
- [ ] warn/fail 항목에 missing 경로 표시
- [ ] warn/fail 항목에 fixHint 표시
- [ ] check.js에서 console.log 직접 호출 없음
- [ ] `src/shared/remediationMap.js` 존재 및 14개 checker 중 9개 매핑 완료
- [ ] 기존 시나리오 3개 동일 결과

## 5. Expected Risks
| Risk | Mitigation |
|------|-----------|
| details → missing 전환 시 일부 checker 누락 | checker 7종 일괄 업데이트 |
| formatter 라인 길이 제어 | 카테고리명 패딩 고정 |

## 6. Next Document
Design: `docs/02-design/phase-03-3-output-init-mapping.design.md`
