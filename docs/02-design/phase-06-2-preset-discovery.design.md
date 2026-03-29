# Phase 06-2 Design — preset 탐색 기능

## 핵심 설계 결정

### 1. preset list/show = 조회 전용, 실행은 init이 담당

```
preset list       → 조회 (변경 없음)
preset show <n>   → 조회 (변경 없음)
init --preset <n> → 실행 (기존 유지)
```

preset apply 커맨드를 만들지 않는 이유:
- init은 이미 안전한 실행 흐름(plan/preview/confirm/apply)을 갖추고 있다
- 중복 진입점은 UX를 복잡하게 만든다
- "탐색 후 init으로 적용"이 명확한 흐름이다

### 2. getPreset() vs resolvePreset()

| 함수 | 반환 | 용도 |
|------|------|------|
| `resolvePreset(name)` | `{ description, targets }` | 기존 코드 (init.js) backward compat |
| `getPreset(name)` | `{ name, description, targets }` | 신규 코드 (preset.js 핸들러) |

name 필드를 포함한 getPreset을 추가해 핸들러가 name을 별도로 전달할 필요 없게 한다.

### 3. 커맨드 구조

Commander.js 서브커맨드 방식:
```
program.command('preset')          ← 커맨드 그룹
  .command('list')                 ← 서브커맨드
  .command('show <name>')          ← 서브커맨드 (위치 인수)
```

`preset apply`는 등록하지 않는다.

## 모듈 설계

### 신규

```
src/cli/commands/preset.js         presetListCommand, presetShowCommand
tests/preset-command.test.js       CLI 통합 + getPreset 단위 테스트 (23 케이스)
```

### 변경

```
src/init/presetRegistry.js         getPreset() 추가 (resolvePreset 유지)
src/cli/index.js                   preset 커맨드 그룹 등록
scripts/verify-release.js          Phase 6-2 체크 4종
package.json                       v0.6.1, test:preset-command script
CHANGELOG.md
```

## 출력 포맷

### preset list

```
available presets:

  default   기본 bkit 운영 구조 전체 ...
  lean      최소 구조 ...
  docs      문서 구조만 ...

use: bkit-doctor init --preset <name>
```

### preset show <name>

```
preset: default
  description : 기본 bkit 운영 구조 전체 ...
  targets     : claude-root, hooks-json, ...

apply: bkit-doctor init --preset default [--dry-run]
```

### preset show <unknown>

```stderr
[bkit-doctor] unknown preset: "unknown"

available presets:
  default   ...
  lean      ...
  docs      ...
```
exit code: 1

## init과의 관계

```
탐색 흐름:
  preset list      → 어떤 preset이 있는지 확인
  preset show lean → 구성 확인

적용 흐름:
  init --preset lean --dry-run   → 미리보기
  init --preset lean             → 적용 (confirm 후)
```

## 후속 확장 방향

- **Phase 6-3**: `.bkit-doctor/presets.json` 사용자 정의 preset
- **Phase 6-4**: fix 완료 후 snapshot 자동 갱신
- **미래**: `preset apply <name>` (init --preset의 shortcut, 필요 시)
