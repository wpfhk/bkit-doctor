# Task: phase-03-2-checker-expansion

**Date:** 2026-03-27
**Design Ref:** `docs/02-design/phase-03-2-checker-expansion.design.md`

---

## Tasks

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `src/checkers/shared/fileRules.js` 생성 | done | findMissingFiles, hasAnyFile, hasAllFiles |
| 2 | `src/core/checker.js` — category 필드 추가 | done | id prefix 자동 추출 |
| 3 | `src/checkers/skills.js` 강화 — SKILL.md 검사 | done | phase-bootstrap 포함 7종 |
| 4 | `src/checkers/misc.js` 강화 — templates/changelog | done | templates 4파일 / changelog 3경로 |
| 5 | `src/checkers/policies.js` 신규 | done | 정책 파일 4종 |
| 6 | `src/checkers/index.js` — policies 추가 | done | |
| 7 | 시나리오 3개 검증 | done | pass |

## Verification Points
- [x] 총 14개 checker 동작
- [x] PASS 14 / WARN 0 / FAIL 0 (자기 자신)
- [x] 빈 디렉터리 → FAIL 2 / WARN 12
- [x] .claude만 → FAIL 1 / WARN 12
- [x] category 필드 결과에 포함
