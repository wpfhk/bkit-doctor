# Phase 06-1 Task — fix command + init --preset support

## 작업 목록

### T1. 구조 분석
- [x] 기존 init.js 흐름 분석
- [x] computeRecommendations, snapshot 시스템 분석
- [x] targetRegistry, scaffoldManifest 분석
- [x] 재사용 가능 지점 식별

### T2. presetRegistry 구현
- [x] `src/init/presetRegistry.js` 생성
- [x] PRESETS 정의 (default, lean, docs)
- [x] resolvePreset(), listPresets(), validatePresetTargets() 구현
- [x] 모든 preset target이 VALID_TARGETS에 존재하는지 확인

### T3. resolveFixTargets 구현
- [x] `src/fix/resolveFixTargets.js` 생성
- [x] snapshot 재사용 경로 (snapshotStatus: 'used')
- [x] snapshot invalid 경로 (snapshotStatus: 'invalid')
- [x] snapshot missing 경로 (snapshotStatus: 'missing')
- [x] --fresh 경로 (snapshotStatus: 'skipped')

### T4. fix 명령 구현
- [x] `src/cli/commands/fix.js` 생성
- [x] target 해석 (resolveFixTargets 호출)
- [x] nothing-to-apply 처리
- [x] plan/preview 출력
- [x] dry-run 처리
- [x] no-op 처리
- [x] confirm 처리
- [x] apply 처리

### T5. init.js --preset 추가
- [x] `--preset` 옵션 파싱
- [x] 충돌 검사 (--preset + --recommended, --preset + --target/--targets)
- [x] preset 해석 블록 (resolvePreset + validatePresetTargets)
- [x] unknown preset 에러 출력 + 목록 안내
- [x] suffix/label 수정 (fromPreset 반영)

### T6. CLI 등록
- [x] `src/cli/index.js` — fix 명령 등록
- [x] `src/cli/index.js` — init에 `--preset <name>` 옵션 추가

### T7. 테스트
- [x] `tests/preset.test.js` (17 케이스)
- [x] `tests/fix.test.js` (10 케이스)
- [x] 전체 통과 확인 (27/27)

### T8. 패키지 및 문서
- [x] package.json v0.6.0
- [x] test/test:preset/test:fix scripts 추가
- [x] phase-06-1 plan.md
- [x] phase-06-1 design.md
- [x] phase-06-1 task.md
- [x] phase-06-1 report.md
- [x] CHANGELOG 업데이트

## 결과 파일 목록

```
신규
  src/init/presetRegistry.js
  src/fix/resolveFixTargets.js
  src/cli/commands/fix.js
  tests/preset.test.js
  tests/fix.test.js
  docs/01-plan/phase-06-1-fix-and-preset.plan.md
  docs/02-design/phase-06-1-fix-and-preset.design.md
  docs/03-task/phase-06-1-fix-and-preset.task.md
  docs/04-report/phase-06-1-fix-and-preset.report.md

변경
  src/cli/index.js          fix 명령 + --preset 옵션
  src/cli/commands/init.js  --preset 처리
  package.json              v0.6.0 + test scripts
  CHANGELOG.md
```
