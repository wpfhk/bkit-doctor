# Phase 07-3: CLI Refactor + Load Command — Plan

## 목표

CLI를 init/fix/save/load 4개 명령 중심으로 정리하고,
`load` 기능을 구현하여 save와의 관계를 완성한다.

## 범위

- `load` command 신규 구현
- `save` command 메시지 개선
- CLI index 정리 (load 등록)
- verify-release 업데이트
- 단위/통합 테스트 추가
- Phase 문서 작성

## 선행 조건

- Phase 06-5 (save command) 완료 ✓
- `saveConfig`, `configPaths` 모듈 존재 ✓

## 완료 조건

- [ ] `load --local/--global/--file` 동작
- [ ] 적용 대상: `.bkit-doctor/settings.local.json`만
- [ ] save + load roundtrip 검증
- [ ] verify-release 38 PASS
- [ ] tests/load.test.js 전체 통과
- [ ] CHANGELOG v0.7.0 업데이트

## 리스크

- 없음 (기존 save 인프라 재사용)

## Backlog (이 Phase에서 구현하지 않음)

- custom preset CRUD
- config merge strategy 고도화
- multi-profile / cloud sync
- interactive wizard
