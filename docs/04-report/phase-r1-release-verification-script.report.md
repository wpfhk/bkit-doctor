# Phase R-1: Release Verification Script — Report

## Status
done

## 구현 내용

### 신규 파일

**`scripts/verify-release.js`**
- 8개 검증 함수 + `runCLI()` + `main()`
- Hard check 7개, Soft check 1개 (snapshot flow)
- `--verbose` / `-v` 지원
- exit code 0 (all hard pass) / 1 (any hard fail)

### 변경 파일

**`package.json`**
- `version`: `0.5.6` → `0.5.7` (CHANGELOG 최신 항목과 정렬)
- `scripts.verify-release` 추가

**README.md / README.ko.md / README.ja.md / README.zh.md / README.es.md**
- version 배지 `0.5.6` → `0.5.7`

## 설계 결정

| 결정 | 이유 |
|------|------|
| `child_process.spawnSync` 사용 | 동기 실행으로 순서 보장; 비동기 불필요 |
| `process.execPath` 사용 | Windows/macOS 모두 현재 Node 바이너리 참조 |
| `verifyDocsConsistency` 분리 | check/init 간 구조 모순을 독립 검증으로 명확히 |
| soft check (snapshot) | snapshot 미존재가 기능 실패를 의미하지 않음 |
| CHANGELOG 파싱: 첫 `## [X.Y.Z]` | Unreleased 이후 첫 버전 항목만 추출, 오파스 최소화 |

## 검증

```
npm run verify-release  → exit code 0, all 8 PASS
```

## 다음 단계
- GitHub Actions에 `npm run verify-release` 추가 가능
- main 머지 전 필수 실행 규칙으로 CONTRIBUTING.md 또는 PR 체크리스트에 기록 권장
