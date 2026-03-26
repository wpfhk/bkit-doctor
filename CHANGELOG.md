# Changelog — bkit-doctor

## [Unreleased]

### Added
-

---

## [v0.4.3] - 2026-03-27

### Added
- `src/init/targetRegistry.js`: target 상수 정의, validateTargets, suggestTarget (Dice coefficient)

### Changed
- `src/init/scaffoldManifest.js`: DIRECTORIES에 targets[] 추가, TARGET_ALIASES 도입, 명칭 통일 (`required-*` → `*-core`, docs 개별 target)
- `src/shared/remediationMap.js`: initTarget 명칭 동기화 (CLAUDE.md → null)
- `src/init/buildInitPlan.js`: targets 필터링 + alias 확장 + neededDirs 동적 계산
- `src/cli/commands/init.js`: --target / --targets 처리, unknown target validation + hint, 요약 개선
- `src/cli/index.js`: --target (collect 반복) / --targets (쉼표) 옵션 등록

---

## [v0.4.2] - 2026-03-27

### Added
- `src/init/initPlanModel.js`: PlanItem 타입 정의 + makeItem 헬퍼
- `src/init/buildInitPlan.js`: 계획 계산 분리 (FS 읽기 전용, overwrite 옵션)
- `src/init/applyInitPlan.js`: 계획 실행 (dry-run / backup / overwrite 지원)
- `src/backup/createBackupSession.js`: timestamp 기반 백업 세션 (.bkit-doctor/backups/<ts>/)
- `src/backup/copyToBackup.js`: 단일 파일 복사 유틸 (디렉터리 구조 유지)
- `src/backup/backupManifest.js`: backup manifest.json 기록

### Changed
- `src/cli/commands/init.js`: plan/apply 구조로 재작성, 출력 개선
- `src/cli/index.js`: --dry-run / --overwrite / --backup / --backup-dir 옵션 등록

---

## [v0.4.1] - 2026-03-27

### Added
- `src/init/scaffoldManifest.js`: 생성 대상 디렉터리 13개 + 파일 25개 manifest 정의 (initTarget 포함)
- `src/init/fileTemplates.js`: 파일 타입별 최소 내용 생성 (9가지 타입)
- `src/init/writeIfMissing.js`: ensureDir / writeIfMissing 유틸 (non-destructive)
- `src/init/generateScaffold.js`: manifest 기반 스캐폴드 생성 루프

### Changed
- `src/cli/commands/init.js`: stub → 실제 init MVP 동작 (CREATE/SKIP 결과 요약 출력)

---

## [v0.3.3] - 2026-03-27

### Added
- `src/check/resultModel.js`: CheckResult 타입 + normalizeResult 헬퍼
- `src/shared/remediationMap.js`: checker id → initTarget + fixHint 매핑 (9개)
- `src/check/formatters/defaultFormatter.js`: 카테고리 요약 + 상세 + 총계 포맷터

### Changed
- `check.js`: console.log 직접 제거 → formatter.format() 위임
- checker 7종: details 필드 제거, missing/found/expected 표준화
- `CheckerRunner`: missing/found/expected pass-through

---

## [v0.3.2] - 2026-03-27

### Added
- `src/checkers/shared/fileRules.js`: findMissingFiles / hasAnyFile / hasAllFiles 공통 유틸
- `src/checkers/policies.js`: policies.required checker (정책 파일 4종)
- checker 결과에 `category` 필드 추가 (id prefix 자동 추출)

### Changed
- `skills.required`: 디렉터리 존재 → SKILL.md 파일 존재 기준 강화 (7종)
- `templates.required`: 디렉터리 존재 → 4개 특정 템플릿 파일 검사
- `changelog.exists`: 단일 경로 → 3개 후보 경로 다중 지원

---

## [v0.3.1] - 2026-03-27

### Changed
- checker API: `run(targetPath)` → `run(context)` (context = `{ projectRoot, platform }`)
- `CheckerRunner.run()`: 내부에서 context 객체 빌드 후 각 checker에 전달

---

## [v0.3.0] - 2026-03-26

### Added
- `src/checkers/`: 카테고리별 checker 파일 6종 (structure, config, docs, agents, skills, misc)
- 13개 checker 구현 — pass/warn/fail 결과 출력
- `src/checkers/index.js`: DEFAULT_CHECKERS 자동 등록
- `src/cli/commands/check.js`: [PASS]/[WARN]/[FAIL] 포맷 + 종합 상태(HEALTHY/WARNING/FAILED)
- `src/core/checker.js`: title·details 필드 추가

### Removed
- `doctor` 커맨드 제거 — `check` 기준으로 통일

---

## [v0.2.0] - 2026-03-26

### Added
- `src/core/checker.js`: CheckerRunner class (register/run API)
- `src/checks/`: 진단 모듈 디렉터리 (Phase 3 진단 항목 위치)
- `check` 커맨드: `doctor`와 동일 동작, 별도 진입점 제공
- doctor 출력 포맷: `[✓]/[!]/[✗]` 결과 표시 + 통계 줄

### Changed
- `src/cli/commands/doctor.js`: stub → CheckerRunner 기반 진단 루프

---

## [v0.1.0] - 2026-03-26

### Added
- CLI 진입점 `src/cli/index.js` (commander 기반)
- `version` 명령: 버전 + 플랫폼 정보 출력
- `doctor` 명령: stub (Phase 3 구현 예정)
- `init` 명령: stub (Phase 2 구현 예정)
- `src/utils/platform.js`: OS 감지, 크로스플랫폼 경로 유틸
- Phase 1 PDCA 문서 4종 (plan/design/task/report)

---

## [v0.0.1] - 2026-03-26

### Added
- 프로젝트 초기 생성
- `.claude/` bkit 운영 환경 세팅 완료
  - agents: planner-orchestrator, implementer, phase-reviewer, report-summarizer
  - skills: phase-bootstrap, plan, design, do, check, report, work-summary
  - templates: prd, plan, design, task, report, changelog
  - context: project-overview, architecture, conventions, constraints, phase-index
  - policies: global, output, security, documentation
  - state: active-phase, workstream-status, agent-status
- `docs/` 디렉터리 구조 생성
- `CLAUDE.md` 프로젝트 규칙 작성
