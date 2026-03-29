# Phase 06-2 — preset 탐색 기능 (list / show) + preset metadata 구조 개선

## 목표

preset을 단순 "적용 대상"에서 "탐색 가능한 개념"으로 확장한다.
사용자가 CLI에서 어떤 preset이 있고 어떤 구성인지 확인할 수 있어야 한다.

## 범위

### 포함

- `preset list` 서브커맨드
- `preset show <name>` 서브커맨드
- `getPreset(name)` API 추가 (presetRegistry)
- CLI 통합 테스트 (preset-command.test.js)
- verify-release.js Phase 6-2 체크 4종
- Phase 문서 + CHANGELOG

### 제외

- `preset apply` 커맨드 (init --preset이 담당, 중복 불필요)
- user-defined preset (파일 기반 커스텀 preset)
- preset 정렬/필터 옵션
- 대화형 preset 선택 UI

## 선행 조건

- Phase 6-1 완료 (fix command + init --preset)
- presetRegistry (PRESETS, resolvePreset, listPresets, validatePresetTargets)

## 완료 조건

- [ ] `bkit-doctor preset list` exit 0, preset 1개 이상
- [ ] `bkit-doctor preset show default` exit 0, name+targets 포함
- [ ] `bkit-doctor preset show unknown` non-zero exit, 에러 메시지
- [ ] `init --preset default --dry-run` 정상 동작 (regression 없음)
- [ ] verify-release 전체 PASS

## 리스크

| 항목 | 수준 | 대응 |
|------|------|------|
| Commander 서브커맨드 등록 구조 | 낮 | program.command('preset').command('list') 패턴 |
| resolvePreset backward compat | 없음 | getPreset 신규 추가, resolvePreset 유지 |
| 기존 init --preset regression | 낮 | 테스트에 regression 케이스 포함 |
