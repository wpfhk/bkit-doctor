# Phase 05-1: Check Recommendation Flow — Plan

## Status
done

## 목표
check 결과에서 recommended init targets를 계산하고 출력한다.
"문제 발견 → 추천 target → 실행 명령" 흐름을 완성한다.

## 범위
- `remediationMap.js`: label / description 필드 추가
- `recommendationModel.js`: Recommendation 타입 정의
- `buildRecommendations.js`: warn/fail 결과 → dedupe targets 계산
- `defaultFormatter.js`: 추천 섹션 출력 추가

## 선행조건
- Phase 4-3 완료 (targetRegistry, initTarget 명칭 통일)

## 완료조건
- check 결과 하단에 추천 target 목록 출력
- initTarget 기준 dedupe
- pass 항목 제외
- unmapped checker 안전 처리
- `Recommended next step: bkit-doctor init --targets ...` 제안 문자열 출력

## 리스크
- 낮음 — 기존 check/init 동작 변경 없음, formatter 출력만 추가
