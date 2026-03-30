# Phase 08-1 — pdca command Design

## 변경 구조

```
src/
├── cli/
│   ├── index.js              # pdca 커맨드 등록 추가
│   └── commands/
│       └── pdca.js           # 커맨드 핸들러 (new)
├── pdca/
│   ├── slugify.js            # topic → slug 변환 (new)
│   ├── renderTemplate.js     # 템플릿 렌더링 (new)
│   └── writePdcaDoc.js       # 파일 쓰기 + 디렉터리 생성 (new)
tests/
└── pdca.test.js              # CLI 통합 테스트 (new)
```

## 모듈 설계

### 1. `src/pdca/slugify.js`

```js
slugify(topic: string) → string
```

- 소문자 변환
- 공백/특수문자 → 하이픈
- 연속 하이픈 제거
- 앞뒤 하이픈 제거
- 빈 결과 시 `'untitled'` 반환

### 2. `src/pdca/renderTemplate.js`

```js
renderTemplate({ topic, type, owner, priority, createdAt }) → string
```

- 마크다운 템플릿 반환
- PDCA 4단계 섹션: Plan / Do / Check / Act
- 메타데이터 헤더: topic, type, owner, priority, created

### 3. `src/pdca/writePdcaDoc.js`

```js
writePdcaDoc({ content, outputPath, overwrite }) → { written: boolean, path: string }
```

- 디렉터리 자동 생성 (`mkdirSync recursive`)
- overwrite=false + 파일 존재 시 에러 throw
- overwrite=true면 덮어쓰기

### 4. `src/cli/commands/pdca.js`

```js
pdcaCommand(topic, options) → void
```

흐름:
1. topic 유효성 검증
2. slug 생성
3. 출력 경로 결정 (`-o` 우선, 없으면 `docs/00-pdca/<slug>-pdca-guide.md`)
4. 템플릿 렌더링
5. `--stdout`이면 `process.stdout.write` → 종료
6. 파일 쓰기 (`writePdcaDoc`)
7. 성공 메시지 출력

### 5. `src/cli/index.js` 변경

```js
program
  .command('pdca <topic>')
  .description('PDCA 가이드라인 문서 생성')
  .option('-p, --path <dir>', '프로젝트 루트', process.cwd())
  .option('-o, --output <file>', '출력 파일 경로')
  .option('--stdout', '파일 대신 stdout 출력')
  .option('--overwrite', '기존 파일 덮어쓰기')
  .option('--type <kind>', '문서 종류', 'guideline')
  .option('--owner <name>', '소유자')
  .option('--priority <level>', '우선순위 (P0-P3)')
  .action(pdcaCommand);
```

## 영향 범위

- **추가**: 4개 새 파일 + 1개 테스트 파일
- **수정**: `src/cli/index.js` (커맨드 등록 1줄)
- **기존 기능 영향**: 없음 (독립 기능)

## 대안 비교

| 방안 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: 단일 파일 (commands/pdca.js에 전부) | 간단 | 테스트 어려움, 재사용 불가 | — |
| B: 3모듈 분리 (slugify/render/write) | 테스트 용이, 재사용 가능 | 파일 수 증가 | **선택** |

**이유**: 기존 init 구조가 모듈 분리 패턴이므로 일관성 유지. slugify/renderTemplate은 향후 재사용 가능.

## 에러 처리

| 상황 | 동작 | exit code |
|------|------|-----------|
| topic 미입력 | Commander 자동 에러 | 1 |
| 파일 존재 + no overwrite | stderr 메시지 + exit 1 | 1 |
| 디렉터리 생성 실패 | stderr 메시지 + exit 1 | 1 |
| 정상 완료 | stdout 메시지 | 0 |

## 테스트 케이스 (8건)

1. 기본 생성 — 파일 존재 확인 + 내용 검증
2. `--stdout` — stdout에 출력, 파일 미생성
3. 파일 존재 시 에러 (overwrite 없음)
4. `--overwrite` — 기존 파일 덮어쓰기
5. `-o` 커스텀 경로
6. `--type`, `--owner`, `--priority` 메타데이터 반영
7. slug 변환 검증 (특수문자, 공백, 한글)
8. topic 미입력 시 에러
