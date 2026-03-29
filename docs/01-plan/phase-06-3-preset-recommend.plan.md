# Phase 06-3 — preset recommend 기능 + 선택 가이드 UX

## 목표

preset을 "탐색 가능한 기능"에서 "선택을 도와주는 기능"으로 확장한다.
현재 프로젝트 상태를 분석하여 적합한 preset을 추천하고
다음 액션을 안내한다.

## 범위

### 포함

- `preset recommend` 서브커맨드
- `workflow-core` preset 추가
- `src/preset/presetRecommend.js` — classifyTargets + recommendPresets
- CLI 통합 + 단위 테스트
- verify-release.js Phase 6-3 체크 3종
- Phase 문서 + CHANGELOG

### 제외

- 자동 적용 (preset recommend는 조회/가이드 전용)
- scoring 기반 추천 (ML/AI)
- 사용자 피드백 학습
- 복수 경로 비교 시각화

## 선행 조건

- Phase 6-2 완료 (preset list/show)
- resolveFixTargets 구현 완료 (fix와 공유)
- computeRecommendations 구현 완료

## 완료 조건

- [ ] `bkit-doctor preset recommend` exit 0
- [ ] 출력에 reason 포함
- [ ] 출력에 guidance (fix / init --preset) 포함
- [ ] workflow-core preset 정상 동작
- [ ] 기존 preset list/show/init 동작 유지
- [ ] 테스트 전체 통과
- [ ] verify-release 전체 PASS

## 추천 규칙 설계

| 상황 | 추천 preset |
|------|------------|
| finalTargets 없음 (healthy) | lean |
| docs만 부족 | docs |
| config만 부족 | lean |
| workflow 부족 (docs 없음) | workflow-core |
| workflow + docs 부족 | default |
| 전부 부족 | default |
