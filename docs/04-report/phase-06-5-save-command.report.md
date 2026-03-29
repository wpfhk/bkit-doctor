# Phase 06-5 Report — save command

## 결과 요약

| 항목 | 결과 |
|------|------|
| 버전 | v0.6.4 |
| 테스트 | 122/122 통과 (기존 96 + 신규 26) |
| verify-release | 30/30 PASS |
| 신규 파일 | 4개 |
| 변경 파일 | 4개 |

## 구현 내용

### save command

```
bkit-doctor save --local --recommended
bkit-doctor save --global --preset default
bkit-doctor save --both --preset lean
```

- `--local` / `--global` / `--both` 범위 선택 (동시 사용 불가)
- `--recommended` / `--preset <name>` 대상 선택 (동시 사용 불가)
- unknown preset 명확한 에러 + 가능 목록 출력
- 절대 자동 적용하지 않음 (저장만)

### config 스키마

```json
{ "defaultMode": "recommended" }
{ "defaultMode": "preset", "presetName": "lean" }
```

### 저장 위치

| 범위 | 경로 |
|------|------|
| local | `.bkit-doctor/settings.local.json` |
| global | `~/.bkit-doctor/settings.global.json` |

## 테스트 결과

### save.test.js (26 케이스)

- configPaths 단위: 2 케이스
- saveConfig/readConfig 단위: 4 케이스
- CLI 성공 케이스: 9 케이스
- CLI 오류 케이스: 7 케이스
- config 구조 검증: 3 케이스
- regression: 2 케이스

### verify-release.js (신규 6종)

| 체크 | 결과 |
|------|------|
| save local recommended | PASS |
| save global preset | PASS |
| save both preset | PASS |
| save usage guard (no target) | PASS |
| save conflict guard (recommended+preset) | PASS |
| save unknown preset guard | PASS |

## 설계 결정 기록

### custom preset 대신 save command

custom preset은 "preset을 만드는 기능"으로 초기 배포 단계에서 사용자에게 너무 많은 개념을 요구한다.
`save`는 "내 기본 설정을 저장"이라는 단순한 의미로 직관적으로 이해 가능하다.

### top-level save

`init --save-recommended` 같은 형태는 init의 역할에 저장을 혼합해 명령 의미가 불명확해진다.
`save`를 독립된 top-level 명령으로 두면 역할이 명확하고 init/fix와 의미적으로 분리된다.

### 단순성 우선

처음 배포 단계에서는 "많은 기능"보다 "이해하기 쉬운 3개 명령"이 더 중요하다.
핵심: fix / init / save. 이 3개로 대부분의 사용 시나리오를 커버한다.

## Deferred / Backlog

아래 기능은 이번 단계에서 구현하지 않는다.

- **custom preset create/edit/delete** — 사용자 정의 preset 관리
- **preset import/export** — preset 파일 공유
- **richer global config management** — 설정 계층, 우선순위 관리
- **preset recommendation personalization** — 사용 기록 기반 추천
- **interactive mode** — wizard 형식의 대화형 설정
- **settings precedence enhancements** — local > global 우선순위 자동 적용
- **preset marketplace / sharing** — 원격 preset 저장소
- **advanced profile support** — 복수 프로파일
- **save → auto apply on init/fix** — 저장된 기본값으로 자동 흐름 시작

## 다음 Phase 제안

### Phase 7-1: fix 완료 후 snapshot 자동 갱신

fix apply 성공 시 새 상태로 snapshot 자동 저장.
이후 preset recommend / fix가 최신 상태를 반영.

### Phase 7-2: save 설정을 init/fix에서 읽기

`readConfig`로 저장된 기본값을 init/fix 실행 시 자동 반영.
이번 단계에서 `readConfig` 헬퍼를 이미 구현했으므로 연결만 하면 된다.
