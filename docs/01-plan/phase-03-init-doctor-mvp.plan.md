# Plan: phase-03-init-doctor-mvp

**Date:** 2026-03-26
**Status:** approved
**PRD Ref:** N/A

---

## 1. Phase Goal
`bkit-doctor check` 실행 시 13개 checker가 자동 등록·실행되어 pass/warn/fail 결과와 종합 상태(HEALTHY/WARNING/FAILED)를 출력하는 MVP를 완성한다.

## 2. Work Scope
- `src/checkers/` 디렉터리 + 카테고리별 checker 파일 6종 (13개 checker 구현)
- `src/checkers/index.js` — 기본 checker 세트 자동 등록
- `src/cli/commands/check.js` 생성 — 포맷 안정화 (doctor.js 교체)
- `src/core/checker.js` 인터페이스 확장 — title, details 추가
- `src/cli/index.js` — doctor 커맨드 제거, check → auto-register 연결
- 검증 시나리오 3개 실행 (빈 디렉터리 / .claude만 / 완전 구조)

## 3. Preconditions
- Phase 2 완료 (CheckerRunner register/run API 존재)
- `node src/cli/index.js check` 실행 가능

## 4. Completion Criteria
- [ ] `check` 실행 시 "no checks loaded" 없이 13개 결과 출력
- [ ] `[PASS]/[WARN]/[FAIL]` 포맷 + 요약 줄 + 종합 상태 출력
- [ ] `doctor` 커맨드 제거 완료
- [ ] macOS/Windows 크로스플랫폼 경로 처리 (path.join 전용)
- [ ] 시나리오 3개 검증 통과

## 5. Expected Risks
| Risk | Mitigation |
|------|-----------|
| docs/ 존재 여부 판단 기준 불명확 | 디렉터리 존재 여부만 체크 (내용 미검증) |
| Windows 경로 슬래시 | path.join/path.resolve 전용, 슬래시 하드코딩 금지 |
| doctor 제거로 인한 기존 사용자 영향 | check가 동일 기능 제공하므로 단순 제거 |

## 6. Next Document
Design: `docs/02-design/phase-03-init-doctor-mvp.design.md`
