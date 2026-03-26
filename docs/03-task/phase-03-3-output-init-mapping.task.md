# Task: phase-03-3-output-init-mapping

**Date:** 2026-03-27
**Design Ref:** `docs/02-design/phase-03-3-output-init-mapping.design.md`

---

## Tasks

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `src/check/resultModel.js` — normalizeResult | done | |
| 2 | `src/shared/remediationMap.js` — 9개 매핑 | done | |
| 3 | `src/check/formatters/defaultFormatter.js` — 카테고리+상세+총계 | done | |
| 4 | `src/core/checker.js` — missing/found/expected pass-through | done | |
| 5 | `src/checkers/structure.js` — missing/expected 추가 | done | |
| 6 | `src/checkers/config.js` — fileChecker 헬퍼 + missing/expected | done | |
| 7 | `src/checkers/docs.js` — missing/expected 추가 | done | |
| 8 | `src/checkers/agents.js` — findMissingFiles + missing/expected | done | |
| 9 | `src/checkers/skills.js` — missing/expected 명시 | done | |
| 10 | `src/checkers/policies.js` — missing/expected 명시 | done | |
| 11 | `src/checkers/misc.js` — missing/expected 전체 | done | |
| 12 | `src/cli/commands/check.js` — formatter 위임 | done | console.log 직접 제거 |
| 13 | 시나리오 3개 검증 | done | |

## Verification Points
- [x] 카테고리 요약 섹션 출력
- [x] warn/fail → missing + fixHint 표시
- [x] check.js 내 console.log 없음
- [x] PASS 14 / HEALTHY (자기 자신)
- [x] FAIL 2 / WARN 12 / FAILED (빈 디렉터리)
