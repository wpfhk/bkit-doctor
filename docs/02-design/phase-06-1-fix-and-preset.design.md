# Phase 06-1 Design — fix command + init --preset support

## 아키텍처 결정

### 1. repair 제외 이유

repair와 fix는 개념적으로 동일 목적이다.
하나의 명령(fix)으로 통합하여 사용자 혼란을 방지한다.
"fix = recommendation-based apply"로 명확히 정의한다.

### 2. preset을 init option으로 설계한 이유

init은 이미 3가지 input mode를 지원한다:
- 직접 target 지정 (`--target`, `--targets`)
- 현재 상태 기반 (`--recommended`)
- 사전 정의 번들 (`--preset`) ← 이번 추가

모두 `init flow (plan → preview → confirm → apply)` 로 수렴하므로,
별도 command보다 option이 일관성 있다.

### 3. fix vs init --preset 역할 차이

| 구분 | fix | init --preset |
|------|-----|---------------|
| input source | 현재 프로젝트 상태 (동적) | 사전 정의 번들 (정적) |
| target 결정 | check + recommendation | preset registry |
| snapshot 활용 | 예 | 아니오 |
| 주 사용 시나리오 | "뭐가 문제인지 모를 때" | "알고 있는 구조를 빠르게" |

## 모듈 설계

### 신규 모듈

```
src/init/presetRegistry.js        preset 정의 + resolve/list/validate
src/fix/resolveFixTargets.js      snapshot/recompute 통합 해석
src/cli/commands/fix.js           fix 명령 핸들러
tests/preset.test.js              preset 단위 테스트 (17 케이스)
tests/fix.test.js                 resolveFixTargets 통합 테스트 (10 케이스)
```

### 변경 모듈

```
src/cli/index.js                  fix 명령 등록 + init --preset 옵션
src/cli/commands/init.js          --preset 처리 블록 추가, 충돌 검사
package.json                      v0.6.0, test scripts
```

### 재사용 (변경 없음)

```
computeRecommendations            체크 실행
buildRecommendationFingerprint    지문 계산
loadRecommendationSnapshot        snapshot 로드
validateRecommendationSnapshot    snapshot 검증
buildInitPlan                     계획 계산
applyInitPlan                     계획 실행
confirmApply                      confirm prompt
```

## resolveFixTargets 흐름

```
--fresh?
  yes → computeRecommendations → snapshotStatus: 'skipped'
  no  → loadSnapshot
        valid? → reuse → snapshotStatus: 'used'
        invalid? → computeRecommendations → snapshotStatus: 'invalid'
        missing? → computeRecommendations → snapshotStatus: 'missing'
```

## init --preset 흐름

```
options 파싱
충돌 검사 (--preset + --recommended → error)
           (--preset + --target     → error)
resolvePreset(name)
  null → 에러 + 사용 가능 목록
  ok   → validatePresetTargets (방어)
         rawTargets = preset.targets
fromPreset = true
→ 기존 init flow (buildInitPlan → preview → confirm → apply)
```

## preset registry

```
default: 전체 구조 (claude-root + config + agents + skills + templates + policies + docs)
lean:    최소 구조 (claude-root + config + agents)
docs:    문서만 (docs-core)
```

## 안전 원칙 유지

- overwrite 기본 금지 (fix에서 --overwrite 옵션 없음)
- confirm 필수 (--yes 없으면)
- dry-run 항상 가능
- invalid snapshot → crash 없이 fallback
- nothing to apply → 에러 없이 종료

## 충돌 규칙

| 조합 | 동작 |
|------|------|
| `--preset + --recommended` | exitCode=1, 에러 메시지 |
| `--preset + --target` | exitCode=1, 에러 메시지 |
| `--preset + --targets` | exitCode=1, 에러 메시지 |
| `--preset + --dry-run` | 정상 (preview만) |
| `--preset + --yes` | 정상 (confirm 생략) |
| `fix + 이외 옵션` | fix는 --dry-run, --yes, --fresh만 지원 |

## 후속 확장 가능성

- `bkit-doctor preset list` 서브커맨드 (현재 scope 밖)
- custom preset 파일 지원 (`.bkit-doctor/presets.json`)
- preset + overwrite 옵션 조합 지원
- preset 이름 자동완성 (shell completion)
