# Phase 05-10: Release Alignment Before Main Merge — Task

## Status
done

## Tasks

- [x] Plan 문서 작성
- [x] Design 문서 작성
- [x] scaffoldManifest.js: docs/01-plan~04-report DIRECTORIES 추가
- [x] scaffoldManifest.js: docs/plan.md~report.md FILES 제거
- [x] scaffoldManifest.js: docs/changelog.md → CHANGELOG.md (루트) 변경
- [x] buildInitPlan.js: dir.targets 기반 필터 로직 추가
- [x] targetRegistry.js: docs-* 설명 갱신
- [x] remediationMap.js: fixHint 갱신
- [x] package.json: version 0.1.0 → 0.5.6

## 검증 결과

| 시나리오 | 결과 |
|---------|------|
| `check` | HEALTHY (PASS 14) |
| `init --dry-run` | files created: 0, files skipped: 21 (no CREATE) |
| `init --recommended --dry-run` | "no recommended targets — project looks healthy" |
| `version` | `bkit-doctor v0.5.6 [windows]` |
| `init --target docs-plan --dry-run` | `[DIR-OK] docs/01-plan` (파일 CREATE 없음) |
| `init --targets docs-core --dry-run` | 4 dirs all `[DIR-OK]`, CHANGELOG.md `[SKIP]` |
