# Phase R-1: Release Verification Script — Plan

## 목표

main 머지 전 release readiness를 자동 검증하는 Node.js 스크립트 구현.
check / init / recommended / version / changelog / docs path consistency를 한 번에 확인.

## 사전 작업

Phase 05-10 이후 version 불일치 잔존:
- `package.json`: `0.5.6`
- `CHANGELOG.md` 최신 항목: `0.5.7`

→ 스크립트 구현 전에 `package.json` + README 배지를 `0.5.7`로 갱신.

## 구현 대상

| 파일 | 역할 |
|------|------|
| `scripts/verify-release.js` | 메인 검증 스크립트 |
| `package.json` | `verify-release` 스크립트 등록 + version 0.5.7 |
| README 배지 5개 | version 0.5.7 반영 |

## 검증 항목 (8개)

| # | 항목 | Hard/Soft |
|---|------|-----------|
| 1 | version 명령 — CLI 출력 & package.json 일치 | Hard |
| 2 | check 명령 — HEALTHY, FAIL 없음 | Hard |
| 3 | init --dry-run — CREATE 0 (healthy 기준) | Hard |
| 4 | init --recommended --dry-run — 추천 target 없음 | Hard |
| 5 | changelog — package.json version == CHANGELOG 최신 | Hard |
| 6 | docs path consistency — check PASS docs에서 init CREATE 없음 | Hard |
| 7 | snapshot flow — check 후 snapshot 재사용 or fallback 정상 | Soft |
| 8 | 필수 파일 존재 — README.md / LICENSE / CHANGELOG.md | Hard |

## 완료 조건

- `npm run verify-release` 한 번 실행으로 release readiness 판단
- 실패 시 어떤 항목이 깨졌는지 명확히 출력
- exit code 0 = all pass, exit code 1 = any fail
- macOS / Windows 모두 동작 (Node.js 기반)
