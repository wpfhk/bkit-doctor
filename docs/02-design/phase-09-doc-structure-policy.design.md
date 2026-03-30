# Phase 09 — 문서 구조 정리 (PDCA 문서 위치 정책)

## 결정

PDCA guide 문서의 출력 경로를 `output/pdca/`로 통일한다.

## 이유

| 경로 | 역할 | 비고 |
|------|------|------|
| `docs/01-plan/` ~ `docs/04-report/` | 프로젝트 phase 문서 (bkit-doctor 자체 개발용) | 유지 |
| `output/pdca/` | `pdca` 명령으로 생성되는 사용자 문서 | **primary** |
| `docs/00-pdca/` | 이전 경로 (deprecated) | 제거 예정 |

## 근거

1. `docs/` 하위는 bkit-doctor 프로젝트 자체의 개발 문서 (plan/design/task/report)
2. `output/` 하위는 CLI가 생성하는 사용자 산출물
3. 두 역할을 같은 `docs/` 아래 혼합하면 혼선 발생

## 마이그레이션

### 즉시
- `docs/00-pdca/` 내용을 `output/pdca/`로 이동
- checker/init/scaffold에서 `docs/00-pdca` 참조 제거
- `docs-pdca` target → `output/pdca/` 기준으로 통일

### 이미 완료된 항목
- `src/cli/commands/pdca.js` — `output/pdca/` 사용
- `src/cli/commands/pdcaStage.js` — `output/pdca/` 사용
- `src/cli/commands/pdcaList.js` — `output/pdca/` 사용
- `src/checkers/docs.js` — `output/pdca` 체크
- `src/init/scaffoldManifest.js` — `output/pdca` scaffold
- 테스트 — `output/pdca` 경로 사용

### 남은 항목
- `docs/00-pdca/` 디렉터리 및 파일 삭제
- checkers/scaffoldManifest에서 `docs/00-pdca` 관련 잔존 참조 제거

## guide 문서와 실행 문서 관계

| 문서 종류 | 경로 | 생성 방법 |
|-----------|------|-----------|
| 전체 guide | `output/pdca/<slug>-pdca-guide.md` | `bkit-doctor pdca <topic>` |
| Plan 문서 | `output/pdca/<slug>-pdca-plan.md` | `bkit-doctor pdca-plan <topic>` |
| Do 문서 | `output/pdca/<slug>-pdca-do.md` | `bkit-doctor pdca-do <topic>` |
| Check 문서 | `output/pdca/<slug>-pdca-check.md` | `bkit-doctor pdca-check <topic>` |
| Report 문서 | `output/pdca/<slug>-pdca-report.md` | `bkit-doctor pdca-report <topic>` |

전체 guide와 단계별 문서는 독립적. 동일 topic에 대해 guide 1개 + stage 문서 여러 개 생성 가능.

## P3 참고

- i18n: `--lang` 옵션으로 템플릿 언어 전환 → `src/pdca/templates/` 하위에 `ko/`, `ja/` 등 추가
- status: `pdca-state.json`의 `currentStage` 확장 (draft/in-progress/review/done/archived)
- 상태 전이: 별도 설계 필수 — workflow engine 수준의 복잡도 예상
