# Phase 06-5 Task — save command

## 작업 목록

### T1. 설정 인프라 구현
- [x] `src/config/` 디렉터리 생성
- [x] `configPaths.js` — localConfigPath / globalConfigPath
  - `BKIT_DOCTOR_GLOBAL_CONFIG_DIR` 환경 변수 지원
- [x] `saveConfig.js` — saveConfig / readConfig

### T2. save command 구현
- [x] `src/cli/commands/save.js` 생성
- [x] scope 유효성: `--local` / `--global` / `--both` (conflict 처리)
- [x] target 유효성: `--recommended` / `--preset <name>` (conflict 처리)
- [x] preset 존재 확인 (resolvePreset)
- [x] config 객체 구성 및 saveConfig 호출
- [x] 성공 메시지 출력 (scope + mode 표시)

### T3. CLI 등록
- [x] `src/cli/index.js` — save top-level 커맨드 추가
- [x] `--local` / `--global` / `--both` / `--recommended` / `--preset <name>` / `-p, --path` 옵션

### T4. 테스트 (26 케이스)
- [x] `tests/save.test.js` 생성
- [x] configPaths 단위 (2 케이스)
- [x] saveConfig/readConfig 단위 (4 케이스)
- [x] CLI 성공 케이스 (9 케이스: exit 0 + 파일 존재 + 메시지)
- [x] CLI 오류 케이스 (7 케이스: no scope / no target / conflict / unknown preset)
- [x] config 구조 검증 (3 케이스)
- [x] regression (2 케이스: fix / init --preset)
- [x] 전체 통과 (26/26)

### T5. verify-release.js
- [x] `verifySaveLocalRecommended` — local 파일 생성 확인
- [x] `verifySaveGlobalPreset` — global 파일 생성 확인
- [x] `verifySaveBothPreset` — 양쪽 파일 생성 확인
- [x] `verifySaveUsageGuard` — target 없음 → non-zero
- [x] `verifySaveConflictGuard` — recommended+preset → non-zero
- [x] `verifySavePresetValidation` — unknown preset → non-zero
- [x] `execSaveWith` 헬퍼 (execCLI 포맷 통일)
- [x] CHECKS 배열에 6종 추가
- [x] 전체 PASS (30/30)

### T6. 패키지 및 문서
- [x] package.json v0.6.4 + test:save script
- [x] phase-06-5 plan/design/task/report
- [x] CHANGELOG 업데이트

## 결과 파일 목록

```
신규
  src/config/configPaths.js
  src/config/saveConfig.js
  src/cli/commands/save.js
  tests/save.test.js
  docs/01-plan/phase-06-5-save-command.plan.md
  docs/02-design/phase-06-5-save-command.design.md
  docs/03-task/phase-06-5-save-command.task.md
  docs/04-report/phase-06-5-save-command.report.md

변경
  src/cli/index.js             save 커맨드 등록
  scripts/verify-release.js   Phase 6-5 체크 6종
  package.json                 v0.6.4
  CHANGELOG.md
```
