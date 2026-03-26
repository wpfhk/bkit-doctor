# Phase 05-3: init --recommended MVP — Plan

## Objective

`init --recommended` 옵션을 도입하여 check → recommend → init 흐름을 연결한다.
사용자가 check에서 본 추천을 손으로 입력하지 않고 바로 적용할 수 있게 한다.

## Scope

- `--recommended` 옵션 등록 (CLI)
- `computeRecommendations.js` — checks 실행 + recommendation 계산 (재사용 브릿지)
- `init.js` — `--recommended` 처리 로직 및 우선순위 정책
- 기존 selective apply 흐름에 recommended targets 전달

## Out of Scope

- recommendation snapshot 저장/읽기 (Phase 5-4)
- grouped recommendations / docs-core 묶음 제안 (Phase 5-4)
- interactive 선택 UI

## Key Decisions

- **A안 채택**: 즉시 checks 재실행 → snapshot 없음, 상태 일관성 최우선
- **우선순위**: explicit target > recommended (명시적이 항상 우선)
- **no recommendation**: 에러 아닌 정상 종료 ("project looks healthy" or "nothing to apply")
- **invalid target**: recommendation builder가 이미 걸러냄 (VALID_TARGETS 검증)
- **formatter 재사용 없음**: init은 recommendation 데이터 모델만 소비
