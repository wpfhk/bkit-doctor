# Phase 08-1 — pdca command (PDCA 가이드라인 문서 생성)

## 목표

`bkit-doctor pdca <topic>` 명령어를 추가하여 PDCA 가이드라인 마크다운 문서를 생성한다.
사용자가 주제를 입력하면 `docs/00-pdca/` 디렉터리에 템플릿 기반 문서를 자동 생성한다.

## 제품 원칙

1. 단일 명령어로 PDCA 문서 즉시 생성
2. 기존 CLI 패턴(init, check, fix)과 일관된 옵션 체계
3. 파일 안전 — overwrite 없이는 기존 파일 보호
4. stdout 모드로 파이프라인 활용 가능

## 범위

### 포함

- `pdca` top-level 커맨드 등록 (`src/cli/index.js`)
- 커맨드 핸들러 (`src/cli/commands/pdca.js`)
- slug 생성 유틸 (`src/pdca/slugify.js`)
- 템플릿 렌더링 (`src/pdca/renderTemplate.js`)
- 파일 쓰기 로직 (`src/pdca/writePdcaDoc.js`)
- 테스트 (`tests/pdca.test.js`)

### 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-p, --path <dir>` | 프로젝트 루트 | `cwd` |
| `-o, --output <file>` | 커스텀 출력 경로 | — |
| `--stdout` | 파일 대신 stdout 출력 | `false` |
| `--overwrite` | 기존 파일 덮어쓰기 허용 | `false` |
| `--type <kind>` | 문서 종류 | `guideline` |
| `--owner <name>` | 소유자 메타데이터 | — |
| `--priority <level>` | 우선순위 (P0-P3) | — |

### 제외 (Non-Goals v1)

- 상태 관리형 PDCA 워크플로우
- 다중 명령어 PDCA 라이프사이클 (plan/design/do/report)
- AI 기반 문서 생성 (템플릿만 사용)

## 선행 조건

- 없음 (독립 기능)

## 완료 조건

1. `bkit-doctor pdca <topic>` 실행 시 `docs/00-pdca/<slug>-pdca-guide.md` 생성
2. `--stdout` 옵션 시 파일 대신 stdout 출력
3. 기존 파일 존재 시 `--overwrite` 없으면 에러 + exit 1
4. CLI help에 pdca 명령어 표시
5. 테스트 전체 통과

## 리스크

| 리스크 | 대응 |
|--------|------|
| slug 충돌 (특수문자 topic) | 안전한 slugify 로직 + 테스트 |
| 디렉터리 미존재 | `fs.mkdirSync({ recursive: true })` |
| 경로 구분자 OS 차이 | `path.join` 일관 사용 |

## 테스트 계획

- CLI 통합 테스트 (spawnSync 패턴, 기존 init.test.js와 동일)
- 케이스: 기본 생성, stdout, overwrite 보호, overwrite 허용, 옵션 조합, slug 변환
