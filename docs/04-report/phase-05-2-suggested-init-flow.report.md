# Phase 05-2: Suggested Init Flow — Report

## Status
done

## 구현 내용

### 신규 파일
- `src/check/recommendations/suggestedFlowModel.js` — SuggestedFlow 타입 + makeSuggestedFlow()
- `src/check/recommendations/buildSuggestedFlow.js` — buildSuggestedFlow(recommendations, issueCount)

### 변경 파일
- `src/check/recommendations/buildRecommendations.js` — TARGET_PRIORITY 정렬, invalidCount, TARGET_PRIORITY export
- `src/check/formatters/defaultFormatter.js` — buildSuggestedFlow 통합, applyCommand + previewCommand 출력

## 출력 예시
```
──── 추천 ──────────────────────────────
  12개 추천 target (14개 문제 기반)

  • claude-root — create the .claude/ root directory for bkit environment
  • hooks-json — create the default hooks.json file
  ...

  Recommended next step:
  bkit-doctor init --targets claude-root,hooks-json,...

  Preview first:
  bkit-doctor init --targets claude-root,hooks-json,... --dry-run
```

## 검증
- flow null (0 recommendations): 대체 메시지 출력 ✓
- flow 생성 (N recommendations): applyCommand + previewCommand 출력 ✓
- invalidCount > 0: 제외 항목 수 출력 ✓
- TARGET_PRIORITY: infrastructure → config → agents/skills → docs 순 ✓

## 설계 결정
- 커맨드 문자열 생성은 SuggestedFlow 모델 책임 — formatter는 렌더링만
- `buildSuggestedFlow`는 null 반환 가능 — 호출자가 렌더링 결정
- `previewCommand` 별도 라인 출력 — 사용자가 dry-run 먼저 실행하도록 유도

## 다음 단계
Phase 5-3: init --recommended MVP
- check 결과에서 SuggestedFlow 생성 → init에 직접 전달
- --recommended 옵션으로 check → recommend → init 자동 연결
