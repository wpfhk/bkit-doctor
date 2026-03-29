# Phase 06-5 Design — save command

## 핵심 설계 결정

### 1. custom preset 대신 save command를 택한 이유

| 옵션 | 복잡도 | 사용자 혼란도 | 배포 시점 적합성 |
|------|--------|-------------|----------------|
| custom preset create/edit | 높음 | 높음 | X |
| save command (이번 단계) | 낮음 | 낮음 | ✓ |

custom preset은 "preset을 만드는 기능"으로,
처음 배포 단계에서 사용자가 preset 개념 자체를 익히기 전에 등장하면 혼란스럽다.
`save`는 "내 기본 설정을 저장"이라는 직관적인 의미로 외우기 쉽다.

### 2. init 내부가 아닌 top-level save인 이유

`init --save-recommended` 같은 형태는:
- init의 역할(scaffold 적용)에 저장 역할이 혼합됨
- 명령 의미가 불명확해짐
- `--save-*` 옵션이 늘어날수록 복잡도 증가

`save`는 독립된 top-level 명령으로서:
- 역할이 명확: "기본 동작 설정을 저장한다"
- 사용자가 언제든 독립적으로 호출 가능
- init이나 fix와 의미적으로 분리됨

### 3. 단순성을 우선한 이유

처음 배포 단계에서는 사용자가 CLI를 처음 접한다.
이 단계에서 "많은 기능"보다 "이해하기 쉬운 3개 명령"이 더 중요하다.
기능 추가는 언제든 가능하지만, 첫인상의 복잡함은 되돌리기 어렵다.

### 4. config 스키마 단순화

```json
{ "defaultMode": "recommended" }
{ "defaultMode": "preset", "presetName": "lean" }
```

- local/global 모두 동일 스키마
- 사람이 파일을 열어도 즉시 이해 가능
- 향후 필드 추가가 용이한 flat 구조

### 5. 환경 변수로 global 경로 재지정

`BKIT_DOCTOR_GLOBAL_CONFIG_DIR` 환경 변수를 지원한다.
이유: 테스트에서 실제 홈 디렉터리를 오염시키지 않기 위함.
verify-release도 이 환경 변수로 격리된 임시 디렉터리를 사용한다.

### 6. conflict rule

| 조합 | 결과 |
|------|------|
| `--local --global` | error → `--both` 사용 권장 |
| `--both --local` | error → 중복 |
| `--both --global` | error → 중복 |
| scope 없음 | error |
| `--recommended --preset` | error → 상호 배타 |
| target 없음 | error |

## 모듈 설계

### 신규

```
src/config/configPaths.js    — 경로 상수 (local / global)
src/config/saveConfig.js     — 읽기/쓰기 (saveConfig / readConfig)
src/cli/commands/save.js     — save command 핸들러
tests/save.test.js           — 단위 + CLI 통합 (26 cases)
```

### 변경

```
src/cli/index.js             — save top-level 커맨드 등록
scripts/verify-release.js   — Phase 6-5 체크 6종
package.json                 — v0.6.4, test:save script
CHANGELOG.md
```

## 저장 경로

```
local:  {projectRoot}/.bkit-doctor/settings.local.json
global: {BKIT_DOCTOR_GLOBAL_CONFIG_DIR || ~}/.bkit-doctor/settings.global.json
```

## Deferred / Backlog

아래 기능은 이번 단계에서 구현하지 않는다.
처음 배포 이후 사용자 피드백을 보고 추가 여부를 결정한다.

- **custom preset create/edit/delete** — 사용자 정의 preset 관리
- **preset import/export** — preset 파일 공유
- **richer global config management** — 설정 계층, 우선순위 관리
- **preset recommendation personalization** — 사용 기록 기반 추천
- **interactive mode** — wizard 형식의 대화형 설정
- **settings precedence enhancements** — local > global 우선순위 자동 적용
- **preset marketplace / sharing** — 원격 preset 저장소
- **advanced profile support** — 복수 프로파일
- **save → auto apply on init/fix** — 저장된 기본값으로 자동 흐름 시작
