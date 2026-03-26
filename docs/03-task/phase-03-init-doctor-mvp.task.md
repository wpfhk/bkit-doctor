# Task: phase-03-init-doctor-mvp

**Date:** 2026-03-26
**Design Ref:** `docs/02-design/phase-03-init-doctor-mvp.design.md`

---

## Tasks

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `src/core/checker.js` 인터페이스 확장 (title·details) | done | |
| 2 | `src/checkers/structure.js` — 1개 checker | done | |
| 3 | `src/checkers/config.js` — 3개 checker | done | |
| 4 | `src/checkers/docs.js` — 4개 checker | done | |
| 5 | `src/checkers/agents.js` — 1개 checker | done | |
| 6 | `src/checkers/skills.js` — 1개 checker | done | |
| 7 | `src/checkers/misc.js` — 3개 checker | done | |
| 8 | `src/checkers/index.js` — DEFAULT_CHECKERS 통합 | done | |
| 9 | `src/cli/commands/check.js` 생성 | done | doctor.js 대체 |
| 10 | `src/cli/index.js` — doctor 제거, check 교체 | done | |
| 11 | 시나리오 3개 검증 실행 | done | |

**Status values:** `pending` / `in-progress` / `done` / `blocked`

## Verification Points
- [ ] `check` → 13개 결과 출력
- [ ] [PASS]/[WARN]/[FAIL] 포맷 확인
- [ ] 종합 상태(HEALTHY/WARNING/FAILED) 출력
- [ ] `doctor` 커맨드 제거 확인
- [ ] 시나리오 3개 pass
