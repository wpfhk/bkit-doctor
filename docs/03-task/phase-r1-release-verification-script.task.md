# Phase R-1: Release Verification Script — Task

## Status
done

## Tasks

- [x] Plan 문서 작성
- [x] Design 문서 작성
- [x] package.json version 0.5.6 → 0.5.7 (CHANGELOG 최신 항목과 정렬)
- [x] README 5개 배지 0.5.6 → 0.5.7
- [x] scripts/ 디렉터리 생성
- [x] scripts/verify-release.js 구현
  - [x] runCLI() — cross-platform Node.js CLI executor
  - [x] verifyVersion() — CLI & package.json version match
  - [x] verifyCheckHealthy() — HEALTHY, no FAIL
  - [x] verifyInitDryRun() — 0 files created
  - [x] verifyRecommendedDryRun() — no recommended targets
  - [x] verifyChangelog() — package version == CHANGELOG latest
  - [x] verifyDocsConsistency() — no docs CREATE in init dry-run
  - [x] verifySnapshotFlow() — soft check: snapshot reuse or fallback
  - [x] verifyProjectFiles() — README/LICENSE/CHANGELOG exist
  - [x] --verbose / -v 옵션
  - [x] exit code 0/1 정책
- [x] package.json에 "verify-release" 스크립트 등록

## 검증 결과

```
npm run verify-release

  [PASS]  version command — v0.5.7 matches package.json
  [PASS]  check healthy — HEALTHY — PASS 14, FAIL 0
  [PASS]  init dry-run consistent — 0 files created, 21 skipped
  [PASS]  recommended dry-run healthy — no recommended targets
  [PASS]  changelog alignment — v0.5.7
  [PASS]  docs path consistency — no docs CREATE conflicts
  [PASS]  snapshot flow — snapshot reused
  [PASS]  project files — README.md / LICENSE / CHANGELOG.md — all present

  total : 8   passed : 7   failed : 0
  all release verification checks passed.
```
