# Phase Index — bkit-doctor

| # | Phase | Purpose | Status | Depends On |
|---|-------|---------|--------|------------|
| 00 | environment-setup | bkit 운영 환경 세팅 (.claude/ 구조 완성) | **done** | — |
| 01 | cli-foundation | CLI skeleton 설계 및 초기 구현 | **done** | phase-00 |
| 02 | cli-skeleton | 커맨드 라우팅, 진단 모듈 인터페이스, 기본 출력 | **done** | phase-01 |
| 03 | init-doctor-mvp | 핵심 진단 항목 구현, MVP 동작 확인 | **done** | phase-02 |

## Status Legend
- `done` — 완료
- `in-progress` — 진행 중
- `blocked` — 차단됨 (사유 기록 필요)
- `pending` — 대기

## Phase 상세 요약

**phase-01 foundation**
- 목표: `npm init`, 디렉터리 구조, `src/`, `docs/` 생성
- 완료 조건: `node src/cli/index.js` 실행 가능

**phase-02 cli-skeleton**
- 목표: `bkit-doctor check` 커맨드 라우팅, 빈 진단 루프 동작
- 완료 조건: 커맨드 실행 시 "no checks loaded" 메시지 출력

**phase-03 init-doctor-mvp**
- 목표: 진단 항목 10개 이상 구현 (structure/config/docs)
- 완료 조건: pass/warn/fail 결과 출력, macOS + Windows 검증
