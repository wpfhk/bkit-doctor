# Task: phase-03-1-context-refactor

**Date:** 2026-03-27
**Design Ref:** `docs/02-design/phase-03-1-context-refactor.design.md`

---

## Tasks

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `src/core/checker.js` — context 객체 생성 및 전달 | done | `{ projectRoot, platform }` |
| 2 | `src/checkers/structure.js` — run(context) 교체 | done | |
| 3 | `src/checkers/config.js` — run(context) 교체 | done | |
| 4 | `src/checkers/docs.js` — run(context) 교체 | done | |
| 5 | `src/checkers/agents.js` — run(context) 교체 | done | |
| 6 | `src/checkers/skills.js` — run(context) 교체 | done | |
| 7 | `src/checkers/misc.js` — run(context) 교체 | done | |
| 8 | 검증 (bkit-doctor 자신 / 빈 디렉터리) | done | 결과 동일 확인 |

## Verification Points
- [x] `check` → 13개 결과 기존과 동일
- [x] 빈 디렉터리 → FAIL/WARN 기존과 동일
