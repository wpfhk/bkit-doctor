# Phase 07-3: CLI Refactor + Load Command — Design

## 제품 원칙

| 원칙 | 결정 |
|------|------|
| 사용자 기억 명령 | init / fix / save / load 4개 |
| 기본 비대화형 | 예외 상황만 메시지 출력 |
| preset 내부화 | `--preset` 옵션으로만 노출 |
| save/load 범위 | `.bkit-doctor/settings.local.json` 전용 |

## 명령 정의

```
init   → 프로젝트 준비 (scaffold 생성, optional preset 적용)
fix    → recommendation 기반 자동 보완
save   → bkit-doctor 설정 저장 (local/global/both)
load   → 저장된 설정 현재 프로젝트에 적용
```

## load 설계

### 소스 옵션

| 플래그 | 소스 | 동작 |
|--------|------|------|
| `--local` | `.bkit-doctor/settings.local.json` | 읽어서 재적용 (normalize) |
| `--global` | `~/.bkit-doctor/settings.global.json` | 읽어서 local에 쓰기 |
| `--file <path>` | 지정 경로 | 읽어서 local에 쓰기 |

### 적용 대상

항상 `{projectRoot}/.bkit-doctor/settings.local.json`에 기록.

절대 건드리지 않음:
- `package.json`
- OS config, shell config
- secrets, `.env`

### 에러 처리

| 상황 | 메시지 |
|------|--------|
| 소스 없음 | `specify a source: --local, --global, or --file <path>` |
| 복수 소스 | `specify only one source` |
| 파일 없음 | `config file not found: <path>` + save hint |
| 파싱 실패 | `failed to parse config file` |
| 스키마 오류 | `invalid config: missing defaultMode` |

### 성공 출력

```
[bkit-doctor] load: settings applied from local

  source  → /path/to/.bkit-doctor/settings.local.json
  applied → /path/to/.bkit-doctor/settings.local.json
  config  : defaultMode = recommended

Loaded local bkit-doctor settings (recommended mode)
```

## save 메시지 개선

변경 전:
```
[bkit-doctor] save: settings updated
  local  → /path/...
  defaultMode: recommended
```

변경 후:
```
[bkit-doctor] save: local → /path/...

Saved local bkit-doctor settings (recommended mode)
```

## 파일 구조

```
신규:
  src/config/loadConfig.js       설정 로드 + 검증
  src/cli/commands/load.js       load 명령 핸들러
  tests/load.test.js             11개 테스트 케이스

수정:
  src/cli/commands/save.js       성공 메시지 포맷 개선
  src/cli/index.js               load 명령 등록
  scripts/verify-release.js     Phase 7-3 체크 8개 추가
  package.json                   v0.7.0
  CHANGELOG.md
```

## 안내형 UX 전략

- 매번 질문하는 interactive flow 없음
- 소스 없음 → 명확한 에러 + 올바른 사용 예시
- 소스 파일 없음 → hint 포함 (save 먼저 실행하세요)
- 성공 시 → 어떤 설정이 어디에 적용됐는지 출력
