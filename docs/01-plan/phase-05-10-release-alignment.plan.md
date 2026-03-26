# Phase 05-10: Release Alignment Before Main Merge — Plan

## 목표

main 머지 전 check / init / version / changelog 사이의 정합성을 맞춰 release-ready 상태를 만든다.

## 현황 분석

### 문제 1: docs 경로 불일치 (주요 버그)

| 구분 | 기대/생성 경로 |
|------|--------------|
| check (docs.js) | `docs/01-plan/`, `docs/02-design/`, `docs/03-task/`, `docs/04-report/` (디렉터리) |
| init (scaffoldManifest) | `docs/plan.md`, `docs/design.md`, `docs/task.md`, `docs/report.md` (파일) |

결과: check HEALTHY인 프로젝트에서 `init --dry-run` 이 4개 파일을 CREATE로 표시 → 모순

### 문제 2: version 불일치

| 소스 | 현재 값 |
|------|---------|
| `package.json` | `0.1.0` |
| README/CHANGELOG | `0.5.6` |
| `version` 명령 | `v0.1.0` |

### 문제 3: buildInitPlan 디렉터리 필터 미지원

현재 `buildInitPlan.js`는 target 필터 시 file parent dir만 기준으로 디렉터리를 포함.
디렉터리만 생성하는 target(file 없음)은 처리 불가.

## 작업 범위

| # | 항목 | 파일 |
|---|------|------|
| A | scaffoldManifest: docs 파일 → 디렉터리로 교체 | `src/init/scaffoldManifest.js` |
| B | buildInitPlan: dir.targets 기반 필터 지원 추가 | `src/init/buildInitPlan.js` |
| C | targetRegistry: docs 설명 갱신 | `src/init/targetRegistry.js` |
| D | remediationMap: docs fixHint 갱신 | `src/shared/remediationMap.js` |
| E | package.json: 버전 0.5.6으로 갱신 | `package.json` |

## 범위 외 (변경 없음)

- `docs-changelog` (init → `docs/changelog.md` 생성): check의 CHANGELOG_CANDIDATES 중 하나이므로 유효함. 유지.
- `changelog.exists` checker 로직: 변경 없음.
- check 측 docs.js: 변경 없음.

## 완료 조건

1. `check` = HEALTHY → `init --dry-run` = no CREATE for docs dirs (all `[DIR-OK]` or `[SKIP]`)
2. `version` = `v0.5.6`
3. `init --target docs-plan --dry-run` = `[MKDIR] docs/01-plan` (not `[CREATE] docs/plan.md`)
4. `init --recommended --dry-run` = "no recommended targets" (healthy project)
