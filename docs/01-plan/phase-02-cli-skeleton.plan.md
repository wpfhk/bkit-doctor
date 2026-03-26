# Plan: phase-02-cli-skeleton

**Date:** 2026-03-26
**Status:** approved
**PRD Ref:** N/A

---

## 1. Phase Goal
`bkit-doctor doctor` / `check` 실행 시 빈 진단 루프가 동작하고 "진단 항목 없음" 메시지를 출력하는 checker 인터페이스를 완성한다.

## 2. Work Scope
- `src/core/checker.js` 생성 — `register()` / `run()` API를 갖는 CheckerRunner
- `src/checks/` 디렉터리 생성 — 진단 모듈 자동 로딩 구조 (빈 상태)
- `src/cli/commands/doctor.js` 교체 — stub → CheckerRunner 사용
- `src/cli/index.js` 업데이트 — `check` 커맨드 추가

## 3. Preconditions
- Phase 1 완료 (CLI skeleton, commander 기반 진입점 존재)
- `node src/cli/index.js` 실행 가능

## 4. Completion Criteria
- [ ] `node src/cli/index.js doctor` → "진단 항목 없음 (no checks loaded)" 출력
- [ ] `node src/cli/index.js check` → 동일 결과
- [ ] `src/core/checker.js`에 `register()` / `run()` API 존재
- [ ] `src/checks/` 디렉터리 존재
- [ ] check 결과 구조: `{ id, status, message }` 배열 반환

## 5. Expected Risks
| Risk | Mitigation |
|------|-----------|
| 자동 로딩 시 크로스플랫폼 경로 문제 | `path.join` 사용, platform.js 활용 |
| Phase 3 확장 시 API 변경 | 인터페이스 단순하게 유지 (register/run만) |

## 6. Next Document
Design: `docs/02-design/phase-02-cli-skeleton.design.md`
