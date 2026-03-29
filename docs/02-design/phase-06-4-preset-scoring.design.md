# Phase 06-4 Design — preset scoring

## 핵심 설계 결정

### 1. rule-based scoring을 선택한 이유

| 방식 | 장점 | 단점 |
|------|------|------|
| rule-based | 예측 가능, 테스트 용이, 설명 가능 | 정밀도 한계 |
| ML/scoring | 정밀, 학습 가능 | 블랙박스, 구현 복잡 |
| 가중치 합산 | 직관적 | 튜닝 필요 |

rule-based를 선택한 이유:
- 현재 target 분류가 명확 (config / workflow / docs)
- deterministic behavior 보장 → 테스트 용이
- "설명 가능한 AI" 관점: 사용자가 score 이유를 이해할 수 있음
- 미래에 ML/personalization으로 언제든 교체 가능한 구조

### 2. 순환 참조(circular dependency) 해결

presetScoring.js는 classifyTargets(presetRecommend.js)를 필요로 하고,
presetRecommend.js는 computePresetScores(presetScoring.js)를 필요로 한다.

해결책: presetRecommend.js 내에서 require('./presetScoring')를 **지연 로드**한다.
Node.js CJS는 지연 로드로 순환 참조를 안전하게 처리한다.

### 3. 기존 reason 로직 재설계

Phase 6-3의 reason은 1차 추천 기준으로 결정했다.
Phase 6-4에서는 preset마다 고유한 reason을 갖는 `buildReasonMap()`으로 재설계한다.
- 이유: 모든 preset이 순위를 가지므로, 각각의 reason이 필요
- lean의 healthy reason은 total === 0 조건으로 분기

### 4. 상위 3개 반환 유지

score 기반 정렬 후 상위 3개 반환. 기존 max 3개 제한 동일.

## 모듈 설계

### 신규

```
src/preset/presetScoring.js
  - clampScore(n)            — 0~100 범위 제한
  - getMatchLabel(score)     — high/medium/low match 반환
  - computePresetScores(targets) — preset별 score 계산
```

### 변경

```
src/preset/presetRecommend.js
  - buildReasonMap(config, workflow, docs, total) — 신규 내부 함수
  - recommendPresets(finalTargets)
    반환형 변경: { preset, score, label, reason }[]

src/cli/commands/preset.js
  - presetRecommendCommand: score + label 출력 추가

tests/preset-recommend.test.js
  - Phase 6-4 테스트 18 케이스 추가

scripts/verify-release.js
  - Phase 6-4 체크 4종 추가

package.json — v0.6.3
CHANGELOG.md
```

## scoring 규칙 상세

### lean score

| 조건 | 점수 |
|------|------|
| base | 10 |
| total === 0 (healthy) | +80 → 90 |
| config만 부족 | +50 → 60 |
| total <= 2 | +20 → 30 |

### workflow-core score

| 조건 | 점수 |
|------|------|
| base | 10 |
| workflow target 1개당 | +20 |
| workflow majority | +20 |
| docs도 부족 (패널티) | -15 |

### docs score

| 조건 | 점수 |
|------|------|
| base | 10 |
| docs target 1개당 | +15 |
| docs majority | +20 |

### default score

| 조건 | 점수 |
|------|------|
| base | 10 |
| 2개 이상 계열 혼합 | +40 |
| total target당 | +5 |
| total === 0 (패널티) | -20 → 0 |

## 출력 포맷

```
[bkit-doctor] preset recommend: /path

recommended presets:

  1. lean (score: 90, high match)
     reason  : project looks healthy — lean provides the minimum recommended structure
     targets : claude-root, hooks-json, settings-local, agents-core
     apply   : bkit-doctor init --preset lean

  2. workflow-core (score: 10, low match)
     reason  : workflow structure (agents / skills / templates / policies) is incomplete
     targets : claude-root, agents-core, skills-core, templates-core, policies-core
     apply   : bkit-doctor init --preset workflow-core

tip: use 'bkit-doctor fix' to apply recommended changes automatically
tip: use 'bkit-doctor init --preset <name> --dry-run' to preview a preset
```

## 향후 확장 방향

### Phase 6-5: 사용자 정의 preset

`.bkit-doctor/presets.json`으로 커스텀 preset 정의.
scoring 규칙도 custom preset에 적용 가능.

### ML/personalization 확장

현재 `computePresetScores`의 반환형 `{ preset: score }` 구조를
ML 모델로 교체하거나 사용자 피드백으로 가중치를 조정하는 방식으로 확장 가능.
현재 인터페이스는 그대로 유지됨.

### explainable AI 관점

score는 단순 숫자가 아니라 "왜 이 점수인가"를 설명할 수 있는 구조다.
각 가산/감산 규칙이 명시적이므로, 향후 UI에서 score 근거를 상세 표시 가능.
