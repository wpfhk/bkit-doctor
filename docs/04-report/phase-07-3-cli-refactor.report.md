# Phase 07-3: CLI Refactor + Load Command — Report

## 요약

CLI를 init/fix/save/load 4개 명령 중심으로 정리하고 `load` 커맨드를 구현했다.

## 구현 결과

### 신규

| 파일 | 설명 |
|------|------|
| `src/config/loadConfig.js` | 설정 파일 로드 + 스키마 검증 |
| `src/cli/commands/load.js` | load 명령 핸들러 |
| `tests/load.test.js` | 11개 테스트 케이스 |

### 수정

| 파일 | 변경 내용 |
|------|---------|
| `src/cli/commands/save.js` | 성공 메시지 명확화 |
| `src/cli/index.js` | load 명령 등록 |
| `scripts/verify-release.js` | Phase 7-3 체크 8개 추가 (total 38) |
| `package.json` | v0.7.0 |
| `CHANGELOG.md` | v0.7.0 항목 |

## 설계 결정

1. **load는 항상 local에 기록**: 소스가 global이든 file이든 적용 대상은 `settings.local.json` 단일화. 예측 가능한 동작.

2. **preset 내부 유지**: `preset` 서브커맨드는 기능 보존, 4개 primary 명령(init/fix/save/load)만 강조.

3. **save 메시지 개선**: `Saved local bkit-doctor settings (recommended mode)` 형식으로 한 줄 요약.

4. **loadConfig 분리**: `readConfig`(파싱만)와 별도로 스키마 검증 포함한 `loadConfig` 모듈 작성.

## 테스트

```
load.test.js  : 11/11 pass
verify-release: 38/38 pass (8개 신규 포함)
```

## Backlog

- custom preset CRUD
- config merge strategy 고도화
- multi-profile support
- cloud sync
- interactive wizard
- AI 기반 추천

## 다음 Phase 제안

- **Phase 07-4**: `init` 정리 — preset list/show/recommend top-level 노출 제거, `--list-presets` 숨김 옵션화
- **Phase 08**: `check` 결과와 `save`/`load` 연동 (check 결과 기반 save 추천)
