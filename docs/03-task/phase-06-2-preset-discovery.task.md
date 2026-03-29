# Phase 06-2 Task — preset 탐색 기능

## 작업 목록

### T1. presetRegistry 개선
- [x] `getPreset(name)` 추가 — name 포함 전체 메타데이터 반환
- [x] `resolvePreset` backward compat 유지
- [x] exports에 `getPreset` 추가

### T2. preset.js 핸들러 구현
- [x] `src/cli/commands/preset.js` 생성
- [x] `presetListCommand` — available presets 출력 + usage hint
- [x] `presetShowCommand(name)` — 상세 출력 + apply hint
- [x] unknown preset 에러 처리 (exitCode=1, 목록 안내)

### T3. CLI 등록
- [x] `src/cli/index.js` — preset 커맨드 그룹 등록
- [x] `preset list` 서브커맨드
- [x] `preset show <name>` 서브커맨드

### T4. 테스트 (23 케이스)
- [x] `tests/preset-command.test.js` 생성
- [x] getPreset 단위 테스트 (3 케이스)
- [x] preset list CLI 테스트 (6 케이스)
- [x] preset show default/lean (6 케이스)
- [x] preset show unknown (3 케이스)
- [x] regression: init --preset (3 케이스)
- [x] regression: init --recommended (1 케이스)
- [x] 전체 통과 확인 (23/23)

### T5. verify-release.js 업데이트
- [x] `verifyPresetList` — exit 0, default 포함
- [x] `verifyPresetShowDefault` — exit 0, name+targets 포함
- [x] `verifyPresetShowUnknown` — non-zero exit, error message
- [x] `verifyPresetCompatibility` — init --preset default --dry-run
- [x] CHECKS 배열에 4종 추가
- [x] verify-release 전체 PASS (17/17)

### T6. 패키지 및 문서
- [x] package.json v0.6.1
- [x] test:preset-command script 추가
- [x] phase-06-2 plan.md
- [x] phase-06-2 design.md
- [x] phase-06-2 task.md
- [x] phase-06-2 report.md
- [x] CHANGELOG 업데이트

## 결과 파일 목록

```
신규
  src/cli/commands/preset.js
  tests/preset-command.test.js
  docs/01-plan/phase-06-2-preset-discovery.plan.md
  docs/02-design/phase-06-2-preset-discovery.design.md
  docs/03-task/phase-06-2-preset-discovery.task.md
  docs/04-report/phase-06-2-preset-discovery.report.md

변경
  src/init/presetRegistry.js     getPreset() 추가
  src/cli/index.js               preset 커맨드 그룹
  scripts/verify-release.js      Phase 6-2 체크 4종
  package.json                   v0.6.1
  CHANGELOG.md
```
