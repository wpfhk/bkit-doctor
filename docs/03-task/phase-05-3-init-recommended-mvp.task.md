# Phase 05-3: init --recommended MVP — Task

## Status
done

## Tasks

- [x] computeRecommendations.js 작성 (checks → recommendation 브릿지)
- [x] CLI에 --recommended 옵션 등록 (src/cli/index.js)
- [x] init.js 갱신 (--recommended 처리, 우선순위 정책, async 전환)
- [x] 시나리오 A: --recommended 추천 target 적용 ✓
- [x] 시나리오 B: --recommended --dry-run → 계획 출력, 파일 변경 없음 ✓
- [x] 시나리오 C: 추천 없음 → 정상 종료 ("project looks healthy") ✓
- [x] 시나리오 D: --recommended + explicit targets → explicit 우선 + 안내 ✓
- [x] 시나리오 E: invalid target → buildRecommendations에서 이미 제외 ✓

## 검증 결과

| 시나리오 | 입력 | 결과 |
|----------|------|------|
| A (추천 적용) | empty dir + --recommended | 12 targets 적용 |
| B (dry-run) | empty dir + --recommended --dry-run | 계획 출력, no files changed |
| C (추천 없음) | bkit-doctor 자체 + --recommended | "no recommended targets — project looks healthy" |
| D (explicit 우선) | --recommended --targets hooks-json | "[recommended] ignored", hooks-json만 적용 |
| E (invalid target) | buildRecommendations VALID_TARGETS 검증으로 사전 제외 | 흐름 유지 |
