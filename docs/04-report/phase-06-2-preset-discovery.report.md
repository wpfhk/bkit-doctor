# Phase 06-2 Report — preset 탐색 기능

## 결과 요약

| 항목 | 결과 |
|------|------|
| 버전 | v0.6.1 |
| 테스트 | 23/23 통과 (+ 기존 27/27 유지) |
| verify-release | 17/17 PASS |
| 신규 파일 | 2개 |
| 변경 파일 | 5개 |

## 구현 내용

### preset list

```
bkit-doctor preset list
```

- 전체 preset 이름 + description 출력
- name 컬럼 자동 정렬 (padEnd)
- 사용 방법 힌트 출력

### preset show

```
bkit-doctor preset show <name>
```

- name / description / targets 상세 출력
- apply 힌트 출력 (`init --preset <name> [--dry-run]`)
- unknown name: exitCode=1 + 에러 + 전체 목록 안내

### getPreset() API

```js
// 기존 (backward compat 유지)
resolvePreset('lean') → { description, targets }

// 신규 (name 포함)
getPreset('lean') → { name: 'lean', description, targets }
```

핸들러에서 name을 별도로 조합할 필요 없이 getPreset 하나로 처리 가능.

## 테스트 결과

### preset-command.test.js (23 케이스)

- getPreset 단위: 3 케이스 (반환 구조, unknown, name 일치)
- preset list CLI: 6 케이스 (exit 0, 출력 내용, usage hint)
- preset show default/lean: 6 케이스 (exit 0, 내용, apply hint)
- preset show unknown: 3 케이스 (exit non-zero, 에러 메시지, 목록 포함)
- regression init --preset: 3 케이스 (default, lean, unknown)
- regression init --recommended: 1 케이스

### verify-release.js (신규 4종)

| 체크 | 결과 |
|------|------|
| preset list | PASS |
| preset show default | PASS |
| preset show unknown | PASS |
| preset compatibility | PASS |

## 설계 결정 기록

### preset apply를 만들지 않은 이유

init --preset이 이미 안전한 실행 흐름(plan/preview/confirm/apply)을 갖추고 있다.
`preset apply`를 추가하면 동일 기능의 진입점이 두 개가 되어 UX가 복잡해진다.
"탐색(list/show) → 실행(init --preset)" 흐름이 명확하다.

### list/show를 독립 command가 아닌 subcommand로 설계한 이유

`preset`이라는 네임스페이스 아래 list/show를 묶으면:
- 향후 `preset show`, `preset edit`, `preset create` 확장이 자연스럽다
- 최상위 커맨드 공간을 오염시키지 않는다

## 후속 Phase 제안

### Phase 6-3: 사용자 정의 preset

`.bkit-doctor/presets.json`으로 프로젝트별 custom preset 정의.
presetRegistry가 built-in과 user-defined를 병합하여 반환.

### Phase 6-4: fix 완료 후 snapshot 자동 갱신

fix apply 성공 후 새 상태로 snapshot을 자동 저장.
다음 fix 실행 시 최신 상태 기반으로 즉시 응답 가능.
