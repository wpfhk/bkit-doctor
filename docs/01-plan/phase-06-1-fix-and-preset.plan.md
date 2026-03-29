# Phase 06-1 — fix command + init --preset support

## 목표

bkit-doctor를 더 쉽게 실행 가능한 워크플로우 도구로 확장한다.

- `fix` 명령: recommendation + init 시스템을 더 쉽게 실행하는 진입점
- `init --preset <name>`: 사전 정의 target 번들로 빠른 구조 적용

## 범위

### 포함

- `fix` 명령 구현 (dry-run, --yes, --fresh 지원)
- `init --preset <name>` 옵션 추가
- preset registry 설계 (default, lean, docs)
- input mode 충돌 검사 (--preset vs --recommended vs --target)
- 단위/통합 테스트 (node:test 기반)
- Phase 문서 및 CHANGELOG

### 제외

- `repair` 명령 (이번 scope 밖, 이유: repair와 fix는 개념 중복)
- `init preset` 서브커맨드 (옵션으로 처리, 이유: 일관성)
- overwrite 지원 (fix에서 안전 원칙 유지)
- 백업 연동 (fix에서 단순화)

## 선행 조건

- Phase 5-6 완료 (recommendation snapshot, --fresh, grouped recommendation)
- computeRecommendations / buildInitPlan / applyInitPlan / confirmApply 구현 완료

## 완료 조건

- [ ] `bkit-doctor fix --dry-run` 동작
- [ ] `bkit-doctor fix --yes` 동작
- [ ] `bkit-doctor fix --fresh` 동작
- [ ] `bkit-doctor init --preset default --dry-run` 동작
- [ ] `bkit-doctor init --preset unknown` 에러 출력
- [ ] `--preset + --recommended` 충돌 에러
- [ ] `--preset + --target` 충돌 에러
- [ ] 테스트 전체 통과

## 리스크

| 항목 | 수준 | 대응 |
|------|------|------|
| init.js 변경으로 기존 흐름 깨짐 | 중 | 충돌 검사를 최상단에 배치, 기존 흐름 불변 |
| preset target 유효성 오류 | 낮 | validatePresetTargets로 방어 |
| 테스트 tempdir 정리 실패 | 낮 | after() hook으로 확실히 정리 |

## 기술 방향

- 기존 모듈 최대 재사용 (new 모듈 최소화)
- thin orchestration layer 추가 (resolveFixTargets)
- 안전 원칙 유지 (no overwrite, confirm required, dry-run available)
