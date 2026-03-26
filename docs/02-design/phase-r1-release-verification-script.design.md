# Phase R-1: Release Verification Script — Design

## 아키텍처

```
scripts/verify-release.js
  └── runCLI(args)          child_process.spawnSync으로 CLI 실행, stdout/stderr 반환
  └── verifyVersion()       CLI 출력 & package.json version 일치 확인
  └── verifyCheckHealthy()  check HEALTHY, FAIL 없음
  └── verifyInitDryRun()    init --dry-run CREATE 0
  └── verifyRecommendedDryRun()  init --recommended --dry-run 추천 없음
  └── verifyChangelog()     package version == CHANGELOG 최신 버전
  └── verifyDocsConsistency() check 통과 docs & init CREATE 교집합 없음
  └── verifySnapshotFlow()  check 후 snapshot 재사용 or fallback (soft)
  └── verifyProjectFiles()  README/LICENSE/CHANGELOG 존재 확인
  └── main()               순서대로 실행, 결과 집계, exit code 설정
```

## runCLI 설계

```js
function runCLI(args) {
  const result = spawnSync(process.execPath, ['src/cli/index.js', ...args], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
  });
  return { stdout: result.stdout || '', stderr: result.stderr || '', code: result.status ?? 1 };
}
```

- `process.execPath`: 현재 Node.js 바이너리 (cross-platform)
- `cwd: PROJECT_ROOT`: 항상 프로젝트 루트 기준 실행

## 검증 로직 상세

### verifyVersion()
```
out = runCLI(['version'])
- code === 0
- /bkit-doctor/.test(out)
- /v?\d+\.\d+\.\d+/.test(out) → semver 추출
- pkg.version === extracted version
```

### verifyCheckHealthy()
```
out = runCLI(['check'])
- code === 0
- /HEALTHY/.test(out)
- !/\[FAIL\]/.test(out)
- 최소 1개 [PASS] 또는 [WARN] 존재
```

### verifyInitDryRun()
```
out = runCLI(['init', '--dry-run'])
- code === 0
- /dry-run/.test(out) or /no files will be changed/.test(out)
- /files created\s*:\s*0/.test(out)   ← CREATE 0 확인
```

### verifyRecommendedDryRun()
```
out = runCLI(['init', '--recommended', '--dry-run'])
- code === 0
- /no recommended targets|project looks healthy/.test(out)
```

### verifyChangelog()
```
changelog = fs.readFileSync('CHANGELOG.md')
- 첫 번째 ## [X.Y.Z] (non-Unreleased) 추출: /^## \[(\d+\.\d+\.\d+)\]/m
- pkg.version === extracted changelog version
```

### verifyDocsConsistency()
```
checkOut = runCLI(['check'])
initOut  = runCLI(['init', '--dry-run'])
- checkOut에서 [PASS] docs.* 항목 추출
- initOut에서 [CREATE] 라인 추출
- CREATE 라인 중 docs/ 포함이 있으면 실패
```

### verifySnapshotFlow() — soft
```
runCLI(['check'])    # snapshot 저장
out = runCLI(['init', '--recommended', '--dry-run'])
- code === 0 (반드시)
- /snapshot|healthy|no recommended/.test(out) → soft pass
```

### verifyProjectFiles()
```
fs.existsSync('README.md')
fs.existsSync('LICENSE')
fs.existsSync('CHANGELOG.md')
```

## 출력 형식

```
[verify-release] project root: /path/to/bkit-doctor
[verify-release] starting 8 checks...

  [PASS] version command — v0.5.7 matches package.json
  [PASS] check healthy — PASS 14, FAIL 0
  [PASS] init dry-run — 0 files created
  [PASS] recommended dry-run — no recommended targets
  [PASS] changelog alignment — 0.5.7
  [PASS] docs path consistency — no create conflicts
  [SOFT] snapshot flow — using recent recommendation snapshot
  [PASS] project files — README.md / LICENSE / CHANGELOG.md

──────────────────────────────────────
  total : 8   passed : 8   failed : 0

all release verification checks passed.
```

## exit code 정책

- Hard fail ≥ 1 → `process.exit(1)`
- Soft fail만 → `process.exit(0)` (soft는 결과 집계에 포함하되 exit code에 영향 없음)
- All pass → `process.exit(0)`

## --verbose 옵션

`--verbose` 또는 `-v` 플래그 시:
- 각 검증에서 관련 CLI 출력 일부를 함께 출력

## package.json scripts

```json
"verify-release": "node scripts/verify-release.js"
```
