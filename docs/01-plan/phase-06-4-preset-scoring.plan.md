# Phase 06-4 — preset recommend scoring / ranking / match label

## 목표

preset recommend 기능을 "단순 리스트"에서
"우선순위와 신뢰도가 명확한 ranking 시스템"으로 확장한다.

추천 결과에 score(0~100)와 match label을 부여하여
사용자가 어떤 preset이 더 적합한지 즉시 판단할 수 있게 한다.

## 범위

### 포함

- `src/preset/presetScoring.js` — score 계산 + match label
- `src/preset/presetRecommend.js` — scoring 통합, `{ preset, score, label, reason }[]`
- `src/cli/commands/preset.js` — score + label 출력
- 테스트 18 케이스 추가 (tests/preset-recommend.test.js)
- verify-release.js Phase 6-4 체크 4종
- Phase 문서 + CHANGELOG

### 제외

- ML / AI 기반 scoring
- 사용자 피드백 학습
- 개인화(personalization)
- 새로운 CLI 커맨드 추가

## 선행 조건

- Phase 6-3 완료 (preset recommend 기본 구현)
- `classifyTargets` 구현 완료
- `resolveFixTargets` 구현 완료

## 완료 조건

- [ ] `preset recommend` 출력에 score 포함
- [ ] `preset recommend` 출력에 match label 포함 (high/medium/low match)
- [ ] 결과가 score 내림차순으로 정렬
- [ ] 기존 reason + guidance 유지
- [ ] 테스트 전체 통과
- [ ] verify-release 전체 PASS

## scoring 설계 개요

| preset | 최고 점수 조건 |
|--------|---------------|
| lean | targets 없음 (healthy) |
| workflow-core | workflow 계열 target 다수 부족 |
| docs | docs 계열 target 다수 부족 |
| default | 여러 계열 혼합 부족 |

match label:
- 80+ → high match
- 50~79 → medium match
- 0~49 → low match
