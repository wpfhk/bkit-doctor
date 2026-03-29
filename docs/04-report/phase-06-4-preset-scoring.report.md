# Phase 06-4 Report — preset scoring

## 결과 요약

| 항목 | 결과 |
|------|------|
| 버전 | v0.6.3 |
| 테스트 | 96/96 통과 (기존 78 + 신규 18) |
| verify-release | 24/24 PASS |
| 신규 파일 | 1개 |
| 변경 파일 | 6개 |

## 구현 내용

### scoring 모델

```
lean:
  base 10
  +80 targets 없음 (healthy)         → 90
  +50 config만 부족                  → 60
  +20 total ≤ 2                      → 30

workflow-core:
  base 10
  +20 per workflow target
  +20 workflow majority
  -15 docs도 부족 (패널티)

docs:
  base 10
  +15 per docs target
  +20 docs majority

default:
  base 10
  +40 혼합 (2+ 계열)
  +5  per total target
  -20 total === 0 (패널티)
```

### match label

| score | label |
|-------|-------|
| 80+ | high match |
| 50~79 | medium match |
| 0~49 | low match |

### 출력 포맷

```
  1. lean (score: 90, high match)
     reason  : project looks healthy — ...
     targets : claude-root, ...
     apply   : bkit-doctor init --preset lean
```

## 테스트 결과

### preset-recommend.test.js (총 46 케이스)

- 기존 28 케이스: 전체 통과 (하위 호환 유지)
- Phase 6-4 신규 18 케이스:
  - computePresetScores 구조: 2 케이스
  - getMatchLabel 범위: 3 케이스
  - clampScore 경계값: 2 케이스
  - recommendPresets score/label: 4 케이스
  - 정렬 검증: 1 케이스
  - scoring 시나리오: 4 케이스
  - CLI 통합: 2 케이스

### verify-release.js (Phase 6-4 신규 4종)

| 체크 | 결과 |
|------|------|
| preset recommend scoring output | PASS |
| preset recommend scoring order | PASS |
| preset recommend label | PASS |
| preset recommend regression | PASS |

## 설계 결정 기록

### rule-based 선택 이유

target 분류 체계(config / workflow / docs)가 명확하고,
각 preset이 어떤 상황에서 적합한지 직관적으로 규칙화할 수 있다.
ML/AI 기반과 달리 결과가 예측 가능하고 테스트하기 쉬우며,
"explainable AI" 관점에서 사용자가 score 이유를 이해할 수 있다.

### 순환 참조 해결

presetScoring.js → classifyTargets(presetRecommend.js)
presetRecommend.js → computePresetScores(presetScoring.js)

Node.js CJS 지연 로드(require at call site)로 해결했다.
모듈 초기화 시점이 아닌 함수 실행 시점에 require하므로 안전하다.

### reason 재설계

Phase 6-3: 1차 추천 preset 기준으로 동적 reason 선택
Phase 6-4: `buildReasonMap()`으로 preset별 고정 reason 제공
이유: 모든 preset이 순위를 가지므로 각각 고유한 reason이 필요하다.

## 다음 Phase 제안

### Phase 6-5: 사용자 정의 preset

`.bkit-doctor/presets.json`으로 프로젝트별 커스텀 preset 정의.
현재 scoring 시스템이 커스텀 preset에도 자연스럽게 적용 가능.

### Phase 7-1: fix 완료 후 snapshot 자동 갱신

fix apply 성공 시 새 상태로 snapshot 자동 저장.
이후 preset recommend가 최신 상태를 반영.

### 미래: ML/personalization

현재 `computePresetScores` 인터페이스를 유지하면서
ML 모델이나 사용자 피드백 기반 가중치로 교체 가능한 구조다.
