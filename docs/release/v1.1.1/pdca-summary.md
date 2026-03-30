# bkit-doctor v1.1.1 — PDCA Summary

**Released:** 2026-03-30
**Scope:** phase-08-1, phase-09, phase-10, phase-11
**Archive:** `docs/archive/v1.1.1/`

---

## Overview

| 항목 | 내용 |
|------|------|
| 프로젝트 | bkit-doctor — Claude Code 환경 진단 CLI |
| 버전 | v1.1.1 |
| 총 Phase | phase-08-1 ~ phase-11 (v1.0.0 이후 4개) |
| 신규 명령어 | `skill`, `setup`, `clear`, `pdca`, `pdca-plan/do/check/report`, `pdca-list` |
| npm 단축 스크립트 | `bkit:check`, `bkit:fix`, `bkit:setup` |

---

## Phase 요약

### Phase 08-1 — pdca command
- `bkit-doctor pdca <topic>` — PDCA 가이드 마크다운 문서 생성
- type별 템플릿 분기: `guideline`, `feature`, `bugfix`, `refactor`
- `--stdout`, `--dry-run`, `--overwrite` 옵션
- 단계별 서브커맨드: `pdca-plan`, `pdca-do`, `pdca-check`, `pdca-report`
- `pdca-list` — 생성된 PDCA 문서 목록 표시
- PDCA 상태 추적: `.bkit-doctor/pdca-state.json`
- `docs.pdca` / `docs.pdca-content` 검사 항목 추가 (총 16개)
- verify-release 45개 체크, 테스트 63개 추가

### Phase 09 — pdca 후속 작업 (백로그 정의)
- P1/P2/P3 우선순위별 후속 작업 목록 문서화
- type별 템플릿, 다단계 서브커맨드, 상태 관리 등 백로그 정의

### Phase 10 — P3 백로그 (설계 대기)
- i18n, status, 상태 전이, 히스토리, interactive mode 백로그 문서화

### Phase 11 — skill & setup 명령어
- `bkit-doctor skill` — SKILL.md 자동화 규칙 생성
  - RULE 1 (PROACTIVE DOCUMENTATION): 코딩 전 pdca-plan 자동 실행
  - RULE 2 (STATE SYNC): 구현 전 pdca-list 상태 확인
  - RULE 3 (PIPELINE): 코딩 후 pdca-do/check/report 자동 실행
  - `--append-claude`: 기존 CLAUDE.md에 규칙 추가
- `bkit-doctor setup` — 인터랙티브 프로젝트 설정 위저드
  - CLAUDE.md 생성 / 백업 (`CLAUDE_{날짜}_backup.md`)
  - SKILL.md 생성
  - package.json npm 단축 스크립트 추가
- `bkit-doctor clear` — 설정 파일 인터랙티브 삭제
- 버그 수정: 스크립트 추적 로직, CLAUDE.md 미존재 안전 처리
- 테스트: 비-TTY CLAUDE.md 보존 동작 통합 검증

---

## 변경 통계

| 항목 | 수치 |
|------|------|
| 신규 명령어 | 3개 (skill, setup, clear) |
| 신규 소스 파일 | 6개 |
| 수정 파일 | 5개 |
| 커밋 수 | 13개 |
| 다국어 README | EN/KO/JA/ZH/ES 5개 동기화 |
