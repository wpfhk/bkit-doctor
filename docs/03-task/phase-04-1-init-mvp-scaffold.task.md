# Phase 04-1: init MVP Scaffold — Task

## Status
done

## Tasks

- [x] scaffoldManifest.js 작성 (DIRECTORIES + FILES 정의)
- [x] fileTemplates.js 작성 (타입별 최소 내용 생성)
- [x] writeIfMissing.js 작성 (ensureDir, writeIfMissing 유틸)
- [x] generateScaffold.js 작성 (manifest 기반 생성 루프)
- [x] init.js 업데이트 (stub → 실제 동작)
- [x] 시나리오 A 검증: 빈 프로젝트 → 전체 CREATE
- [x] 시나리오 B/C 검증: 기존 파일 → SKIP, 기존 보존

## 검증 결과

| 시나리오 | 결과 |
|----------|------|
| A: 빈 프로젝트 | dirs 13 created, files 25 created |
| B/C: 재실행 | dirs 0 created, files 0 created, files 25 skipped |
