# Phase 05-2: Suggested Init Flow — Task

## Status
done

## Tasks

- [x] suggestedFlowModel.js 작성 (SuggestedFlow 타입 + makeSuggestedFlow)
- [x] buildSuggestedFlow.js 작성 (Recommendation[] → SuggestedFlow|null)
- [x] buildRecommendations.js 갱신 (TARGET_PRIORITY 정렬 + invalidCount + export)
- [x] defaultFormatter.js 갱신 (buildSuggestedFlow 통합, applyCommand + previewCommand 출력)
- [x] CHANGELOG.md 갱신 (v0.5.1, v0.5.2 항목 추가)

## 검증 결과

| 시나리오 | 결과 |
|----------|------|
| 전부 pass | 추천 섹션 없음 |
| 빈 프로젝트 (문제 다수) | flow 생성, applyCommand + previewCommand 출력 |
| recommendations 없음 | buildSuggestedFlow → null, formatter 대체 메시지 |
| invalidCount > 0 | "(N개 항목은 유효하지 않은 target으로 제외)" 출력 |
