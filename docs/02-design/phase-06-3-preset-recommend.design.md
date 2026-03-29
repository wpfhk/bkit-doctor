# Phase 06-3 Design — preset recommend

## 핵심 설계 결정

### 1. fix vs preset recommend 역할 구분

| 명령 | 역할 | 자동 적용 |
|------|------|---------|
| `fix` | recommendation 기반 자동 적용 | YES |
| `preset recommend` | preset 선택 가이드 | NO (절대) |

사용자가 "어떤 preset을 써야 하는지"를 결정하는 보조 역할.
결정과 실행은 사용자가 한다.

### 2. rule-based 접근 이유

초기 구현에 rule-based를 선택한 이유:
- 현재 target 분류 체계가 명확하다 (config / workflow / docs)
- 작은 rule 수로 모든 경우를 커버 가능
- 예측 가능하고 테스트하기 쉽다
- scoring / ML 확장은 미래에 언제든 추가 가능

### 3. resolveFixTargets 재사용

preset recommend는 현재 프로젝트 상태를 알아야 한다.
이미 fix에서 사용하는 `resolveFixTargets`가 snapshot/recompute를 처리하므로 그대로 재사용한다.
중복 로직 없음.

### 4. workflow-core preset 추가 이유

recommendation에서 workflow 계열 target이 자주 등장하지만
기존 preset에 workflow 전용 번들이 없었다.
`workflow-core`를 추가해 "에이전트 + 스킬 + 템플릿 + 정책" 구조를 한 번에 적용 가능하게 한다.

## 모듈 설계

### 신규

```
src/preset/presetRecommend.js    classifyTargets + recommendPresets
tests/preset-recommend.test.js  단위 + CLI 통합 테스트 (28 케이스)
```

### 변경

```
src/init/presetRegistry.js       workflow-core preset 추가
src/cli/commands/preset.js       presetRecommendCommand 추가
src/cli/index.js                 preset recommend 서브커맨드
scripts/verify-release.js        Phase 6-3 체크 3종
package.json                     v0.6.2
CHANGELOG.md
```

## classifyTargets 카테고리

```
config:   claude-root, hooks-json, settings-local
workflow: agents-core, skills-core, templates-core, policies-core
docs:     docs-core, docs-plan, docs-design, docs-task, docs-report, docs-changelog
```

## recommendPresets 규칙 흐름

```
finalTargets 없음 → lean (healthy)
docs only         → docs
config only       → lean
workflow (no docs) → workflow-core
그 외 혼합        → default

secondary (1차가 default 아님 + docs도 부족):
  → docs 추가 (최대 3개)
```

## 출력 포맷

```
[bkit-doctor] preset recommend: /path

recommended presets:

  1. workflow-core
     reason  : workflow structure (agents/skills/templates/policies) is incomplete
     targets : claude-root, agents-core, skills-core, templates-core, policies-core
     apply   : bkit-doctor init --preset workflow-core

tip: use 'bkit-doctor fix' to apply recommended changes automatically
tip: use 'bkit-doctor init --preset <name> --dry-run' to preview a preset
```

## 후속 확장 방향

### Phase 6-4: scoring 기반 추천

각 preset에 점수(score)를 부여하여 더 정밀한 순위 산정.
예: target 커버리지 비율, 우선순위 가중치.

### Phase 6-5: 사용자 정의 preset (custom preset)

`.bkit-doctor/presets.json`으로 프로젝트별 커스텀 preset 정의.
recommend가 custom preset도 후보로 고려.

### 미래: AI-assisted 추천

check 결과 + 프로젝트 메타데이터를 바탕으로
더 세밀한 추천 이유 생성.
