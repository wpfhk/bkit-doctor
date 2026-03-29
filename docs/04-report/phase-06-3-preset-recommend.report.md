# Phase 06-3 Report — preset recommend

## 결과 요약

| 항목 | 결과 |
|------|------|
| 버전 | v0.6.2 |
| 테스트 | 78/78 통과 (기존 50 + 신규 28) |
| verify-release | 20/20 PASS |
| 신규 파일 | 2개 |
| 변경 파일 | 6개 |

## 구현 내용

### preset recommend

```
bkit-doctor preset recommend [--fresh]
```

- 현재 프로젝트 상태 분석 (snapshot 재사용 or recompute)
- rule-based 추천 최대 3개
- 각 추천: 번호 / reason / targets / apply hint
- guidance: fix vs init --preset
- 절대 자동 적용하지 않음

### workflow-core preset

```
bkit-doctor init --preset workflow-core
bkit-doctor preset show workflow-core
```

- targets: claude-root, agents-core, skills-core, templates-core, policies-core
- workflow 계열 구조만 빠르게 적용할 때 사용

### recommendPresets 규칙

| finalTargets 상황 | 1차 추천 |
|-------------------|---------|
| 없음 (healthy) | lean |
| docs만 | docs |
| config만 | lean |
| workflow (docs 없음) | workflow-core |
| workflow + docs | default |
| 전부 혼합 | default |

## 테스트 결과

### preset-recommend.test.js (28 케이스)

- classifyTargets 단위: 5 케이스
- recommendPresets 구조/규칙: 13 케이스
- preset registry 존재 검증: 1 케이스
- CLI 통합: 6 케이스
- regression: 3 케이스

### verify-release.js (신규 3종)

| 체크 | 결과 |
|------|------|
| preset recommend basic | PASS |
| preset recommend reason | PASS |
| preset recommend guidance | PASS |

## 설계 결정 기록

### rule-based를 선택한 이유

현재 target 분류(config / workflow / docs)가 명확하고
rule 수가 적어 완전한 커버리지가 가능하다.
ML/scoring 기반으로 언제든 확장 가능한 구조로 설계했다.

### resolveFixTargets 재사용

fix와 preset recommend 모두 "현재 프로젝트 상태"가 필요하다.
resolveFixTargets가 snapshot/recompute를 이미 처리하므로 그대로 재사용했다.
중복 분석 로직 없음.

### workflow-core를 preset에 추가한 이유

recommendation에서 workflow 계열(agents/skills/templates/policies)이
가장 자주 등장하는 부족 요소임에도 전용 preset이 없었다.
workflow-core를 추가해 추천 → 적용 흐름을 완성했다.

## 다음 Phase 제안

### Phase 6-4: scoring 기반 추천

각 preset에 target 커버리지 점수를 부여하여
더 정밀한 우선순위 산정.

### Phase 6-5: 사용자 정의 preset

`.bkit-doctor/presets.json`으로 프로젝트별 커스텀 preset.
preset recommend가 custom preset도 후보로 고려.

### Phase 7-1: fix 완료 후 snapshot 자동 갱신

fix apply 성공 시 새 상태로 snapshot 자동 저장.
