# Phase 05-1: Check Recommendation Flow — Report

## Status
done

## 구현 내용

### 신규 파일
- `src/check/recommendations/recommendationModel.js` — Recommendation 타입 + makeRecommendation
- `src/check/recommendations/buildRecommendations.js` — warn/fail → dedupe targets 계산

### 변경 파일
- `src/shared/remediationMap.js` — label / description 필드 추가 (13개 항목)
- `src/check/formatters/defaultFormatter.js` — 추천 섹션 출력 추가

## 출력 예시
```
──── 추천 ──────────────────────────────
  12개 추천 target (14개 문제 기반)

  • claude-root — create the .claude/ root directory for bkit environment
  • hooks-json — create the default hooks.json file
  ...

  Recommended next step:
  bkit-doctor init --targets claude-root,hooks-json,...
```

## 검증
- 전부 pass: 추천 섹션 없음 ✓
- 빈 프로젝트: 12개 추천, 2개 unmapped ✓
- dedupe: initTarget Map 기반 정상 동작 ✓
- unmapped: config.claude-md(null), context.required(미등록) 안전 처리 ✓

## 설계 결정
- dedupe A안: initTarget 기준 Map → 단순하고 확장 용이
- unmappedCount: 내부 계수, 추천 0개일 때만 노출
- description을 formatter에서 직접 출력 → 추후 UI/다국어 확장 용이

## 다음 단계
Phase 5-2: recommended targets → init 흐름 연결
- init --recommended 옵션 검토
- 추천 target 우선순위 / grouping 정책 (B안)
- suggested command 자동 실행 여부 검토
