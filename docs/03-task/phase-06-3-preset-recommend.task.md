# Phase 06-3 Task — preset recommend

## 작업 목록

### T1. presetRegistry — workflow-core 추가
- [x] PRESETS에 workflow-core 정의
- [x] targets 검증 (VALID_TARGETS 일치)
- [x] 기존 테스트 영향 없음 확인

### T2. presetRecommend.js 구현
- [x] `src/preset/` 디렉터리 생성
- [x] `CATEGORY_CONFIG / CATEGORY_WORKFLOW / CATEGORY_DOCS` 정의
- [x] `classifyTargets(targets)` 구현
- [x] `recommendPresets(finalTargets)` 구현 (규칙 7종)
- [x] secondary 추천 로직 (docs 부족 시 2차 추가)
- [x] 최대 3개 제한

### T3. presetRecommendCommand 구현
- [x] `src/cli/commands/preset.js` 에 추가
- [x] resolveFixTargets 재사용
- [x] recommendPresets 호출
- [x] 번호 + reason + targets + apply 출력
- [x] snapshot 상태 메시지 (invalid 시)
- [x] guidance 2줄 출력
- [x] --path, --fresh 옵션

### T4. CLI 등록
- [x] `src/cli/index.js` — preset recommend 서브커맨드
- [x] `-p, --path` 옵션
- [x] `--fresh` 옵션

### T5. 테스트 (28 케이스)
- [x] `tests/preset-recommend.test.js` 생성
- [x] classifyTargets 단위 (5 케이스)
- [x] recommendPresets 구조 (3 케이스)
- [x] recommendPresets 규칙별 (10 케이스)
- [x] preset registry 존재 검증 (1 케이스)
- [x] CLI 통합 (6 케이스)
- [x] regression (3 케이스)
- [x] 전체 통과 (28/28)

### T6. verify-release.js
- [x] verifyPresetRecommendBasic — exit 0, preset name 포함
- [x] verifyPresetRecommendReason — "reason" 포함
- [x] verifyPresetRecommendGuidance — "fix" + "init --preset" 포함
- [x] CHECKS 배열에 3종 추가
- [x] 전체 PASS (20/20)

### T7. 패키지 및 문서
- [x] package.json v0.6.2 + test:preset-recommend script
- [x] phase-06-3 plan.md / design.md / task.md / report.md
- [x] CHANGELOG 업데이트

## 결과 파일 목록

```
신규
  src/preset/presetRecommend.js
  tests/preset-recommend.test.js
  docs/01-plan/phase-06-3-preset-recommend.plan.md
  docs/02-design/phase-06-3-preset-recommend.design.md
  docs/03-task/phase-06-3-preset-recommend.task.md
  docs/04-report/phase-06-3-preset-recommend.report.md

변경
  src/init/presetRegistry.js      workflow-core 추가
  src/cli/commands/preset.js      presetRecommendCommand 추가
  src/cli/index.js                preset recommend 등록
  scripts/verify-release.js       Phase 6-3 체크 3종
  package.json                    v0.6.2
  CHANGELOG.md
```
