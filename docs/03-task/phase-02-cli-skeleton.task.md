# Task: phase-02-cli-skeleton

**Date:** 2026-03-26
**Design Ref:** `docs/02-design/phase-02-cli-skeleton.design.md`

---

## Tasks

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `src/core/checker.js` 생성 — CheckerRunner class | done | register/run API |
| 2 | `src/checks/.gitkeep` 생성 | done | Phase 3 진단 모듈 위치 확보 |
| 3 | `src/cli/commands/doctor.js` 교체 | done | stub → CheckerRunner 사용 |
| 4 | `src/cli/index.js` — `check` 커맨드 추가 | done | doctor와 동일 동작 |
| 5 | 실행 검증 (doctor / check 명령) | done | "no checks loaded" 출력 확인 |

**Status values:** `pending` / `in-progress` / `done` / `blocked`

## Verification Points
- [ ] `node src/cli/index.js doctor` → 진단 항목 없음 메시지
- [ ] `node src/cli/index.js check` → 동일 메시지
- [ ] `node src/cli/index.js check --path .` → 경로 출력 포함
