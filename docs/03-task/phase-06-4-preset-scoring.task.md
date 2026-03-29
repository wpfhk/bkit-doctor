# Phase 06-4 Task — preset scoring

## 작업 목록

### T1. presetScoring.js 구현
- [x] `src/preset/` 디렉터리에 `presetScoring.js` 생성
- [x] `clampScore(n)` — 0~100 범위 제한
- [x] `getMatchLabel(score)` — high/medium/low match 반환
- [x] `computePresetScores(finalTargets)` — 4개 preset별 score 계산
- [x] 순환 참조 없음 (classifyTargets를 presetRecommend에서 import)

### T2. presetRecommend.js 업데이트
- [x] `buildReasonMap(config, workflow, docs, total)` 추가
- [x] `recommendPresets()` — scoring + sorting 통합
- [x] 반환형 `{ preset, score, label, reason }[]` 으로 변경
- [x] 지연 로드(`require('./presetScoring')`)로 순환 참조 해결
- [x] 기존 exports 하위 호환 유지

### T3. preset.js 출력 업데이트
- [x] `presetRecommendCommand`: `(score: N, label)` 추가
- [x] reason / targets / apply 기존 포맷 유지

### T4. 테스트 (18 케이스 추가)
- [x] `computePresetScores`: 반환 구조 검증 (2 케이스)
- [x] `getMatchLabel`: 범위별 라벨 (3 케이스)
- [x] `clampScore`: 경계값 (2 케이스)
- [x] `recommendPresets`: score/label 필드 (4 케이스)
- [x] `recommendPresets`: 정렬 검증 (1 케이스)
- [x] scoring 케이스별 (healthy/workflow-heavy/docs-heavy/no crash): 4 케이스
- [x] CLI 통합 (score 출력 / match label 출력): 2 케이스
- [x] 전체 통과 (46/46)

### T5. verify-release.js
- [x] `verifyPresetScoringOutput` — "score" 포함 확인
- [x] `verifyPresetScoringOrder` — 첫 번째 score >= 두 번째
- [x] `verifyPresetScoringLabel` — high/medium/low match 확인
- [x] `verifyPresetScoringRegression` — reason + guidance 유지
- [x] CHECKS 배열에 4종 추가
- [x] 전체 PASS (24/24)

### T6. 패키지 및 문서
- [x] package.json v0.6.3
- [x] phase-06-4 plan/design/task/report 문서
- [x] CHANGELOG 업데이트

## 결과 파일 목록

```
신규
  src/preset/presetScoring.js
  docs/01-plan/phase-06-4-preset-scoring.plan.md
  docs/02-design/phase-06-4-preset-scoring.design.md
  docs/03-task/phase-06-4-preset-scoring.task.md
  docs/04-report/phase-06-4-preset-scoring.report.md

변경
  src/preset/presetRecommend.js   scoring 통합 + 반환형 확장
  src/cli/commands/preset.js      score + label 출력 추가
  tests/preset-recommend.test.js  Phase 6-4 테스트 18 케이스 추가
  scripts/verify-release.js       Phase 6-4 체크 4종
  package.json                    v0.6.3
  CHANGELOG.md
```
