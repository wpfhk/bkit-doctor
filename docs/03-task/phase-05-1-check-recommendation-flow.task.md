# Phase 05-1: Check Recommendation Flow — Task

## Status
done

## Tasks

- [x] remediationMap.js 갱신 (label / description 필드 추가)
- [x] recommendationModel.js 작성 (Recommendation 타입 + makeRecommendation)
- [x] buildRecommendations.js 작성 (warn/fail → dedupe targets)
- [x] defaultFormatter.js 갱신 (추천 섹션 출력)
- [x] 시나리오 A: 전부 pass → 추천 섹션 없음 ✓
- [x] 시나리오 B~D: 빈 프로젝트 → 12개 추천, 2개 unmapped ✓
- [x] dedupe: 동일 target 복수 source → sources[] 누적 ✓
- [x] suggested command: bkit-doctor init --targets ... 출력 ✓

## 검증 결과

| 시나리오 | 결과 |
|----------|------|
| A: 전부 pass | 추천 섹션 없음 |
| B~D: 빈 프로젝트 (14개 문제) | 12개 추천 target, 2개 unmapped (claude-md, context) |
| dedupe | Map 기반 initTarget 단위 dedupe 정상 |
| unmapped | config.claude-md(null), context.required(미등록) |
