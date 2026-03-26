# Phase 05-10: Release Alignment Before Main Merge — Report

## Status
done

## 구현 내용

### 수정 파일

**`src/init/scaffoldManifest.js`**
- DIRECTORIES에 `docs/01-plan`, `docs/02-design`, `docs/03-task`, `docs/04-report` 추가 (각각 단일 target 지정)
- FILES에서 `docs/plan.md`, `docs/design.md`, `docs/task.md`, `docs/report.md` 제거
- FILES의 changelog 경로 `docs/changelog.md` → `CHANGELOG.md` (루트) 변경

**`src/init/buildInitPlan.js`**
- 디렉터리 필터 로직 확장: file parent dir 외에 `dir.targets[]` 교집합 조건 추가
- 이로써 파일 없이 디렉터리만 생성하는 target 지원

**`src/init/targetRegistry.js`**
- `docs-plan`: `docs/01-plan/ 디렉터리`
- `docs-design`: `docs/02-design/ 디렉터리`
- `docs-task`: `docs/03-task/ 디렉터리`
- `docs-report`: `docs/04-report/ 디렉터리`
- `docs-changelog`: `CHANGELOG.md (프로젝트 루트)`
- `docs-core`: 설명 갱신

**`src/shared/remediationMap.js`**
- `docs.*` fixHint → 디렉터리 경로로 갱신
- `changelog.exists` fixHint → `CHANGELOG.md 생성 필요`

**`package.json`**
- `version`: `0.1.0` → `0.5.6`

## 설계 결정

| 결정 | 이유 |
|------|------|
| check 기준(디렉터리)을 진실의 원천으로 채택 | 이미 동작 중이고 프로젝트 구조와 일치 |
| `docs-changelog` → `CHANGELOG.md` | check 최우선 후보가 루트 CHANGELOG.md; 일관성 |
| `buildInitPlan` 필터 확장 | file 없이 dir-only target 지원을 일반화 |

## 검증

```
check        : HEALTHY (14 PASS)
init --dry-run  : files created 0, skipped 21
init --recommended --dry-run : "no recommended targets"
version         : bkit-doctor v0.5.6 [windows]
```

## 다음 단계
main 브랜치 머지 준비 완료.
