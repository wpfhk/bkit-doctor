# bkit-doctor

> ⚠️ **작업 진행 중** — 이 프로젝트는 현재 활발하게 개발되고 있습니다.

> bkit 스타일 프로젝트 환경을 진단하고, 초기화하고, 유지하는 CLI 도구.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.5.8-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/wpfhak/bkit-doctor/pulls)

[English](README.md) | **한국어** | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## 소개

**bkit-doctor**는 어떤 프로젝트에서도 bkit 스타일 워크플로 환경을 쉽게 구축하고 유지할 수 있도록 돕는 CLI 도구입니다. 현재 프로젝트 구조를 진단하고, 누락되거나 잘못 설정된 항목을 보고하며, 안전하고 비파괴적인 방식으로 누락된 파일을 자동으로 생성할 수 있습니다.

이 프로젝트 자체가 bkit-doctor가 지원하는 단계 기반 워크플로를 사용해 만들어졌습니다. 모든 기능은 Plan → Design → Do → Check 방법론으로 계획, 설계, 구현, 검증되었습니다.

---

## 왜 이 프로젝트가 필요한가

구조화된 AI 네이티브 개발 워크플로를 도입하면 강력한 생산성을 얻을 수 있지만, 시작이 어렵습니다. 올바른 디렉터리 구조, 에이전트 정의, 스킬 파일, 템플릿, 정책 파일을 손으로 설정하는 것은 번거롭고 오류가 발생하기 쉽습니다.

**bkit-doctor**는 그 진입 장벽을 낮추기 위해 만들어졌습니다:

- **진단** — 현재 프로젝트에 무엇이 있고, 무엇이 없으며, 무엇이 필요한지 즉시 확인
- **추천** — 진단 후 실행할 init 대상을 자동으로 제안
- **초기화** — 이미 존재하는 파일을 건드리지 않고 필요한 구조를 수 초 안에 생성
- **대상 지정** — 필요한 것만 하나씩 선택해서 적용
- **미리보기** — 실제로 파일이 쓰이기 전에 무엇이 변경될지 확인
- **확인** — 적용 전에 계획을 검토하고 승인

이 도구는 단순한 아이디어에서 출발했습니다: *워크플로는 일단 진입하기 쉬워야 한다.*

---

## 기능

| 기능 | 설명 |
|------|------|
| `check` | 프로젝트 환경 진단 — 항목별 pass / warn / fail |
| 추천 기능 | check 후 실행할 `init` 대상 자동 제안 |
| 대상 그룹화 | 관련 대상 자동 통합 (예: `docs-core`) |
| 스냅샷 캐시 | `check`가 추천 스냅샷 저장; `init --recommended`가 재사용 |
| `init` | 누락된 디렉터리와 파일을 비파괴적으로 생성 |
| `--recommended` | 현재 프로젝트 상태 기반 init 대상 자동 선택 |
| `--dry-run` | 파일 시스템을 변경하지 않고 생성 계획만 출력 |
| `--yes / -y` | 확인 프롬프트 건너뛰고 즉시 적용 |
| `--fresh` | 추천 재계산 강제 실행, 캐시 무시 |
| `--target` | 특정 target만 선택 적용 (반복 사용 가능) |
| `--targets` | 쉼표로 구분해 여러 target을 한 번에 적용 |
| `--overwrite` | 필요 시 기존 파일 덮어쓰기 |
| `--backup` | 덮어쓰기 전 기존 파일 백업 |
| 확인 프롬프트 | 적용 계획 표시 후 `Continue? (y/N)` 입력 대기 |
| 오타 감지 | `did you mean: docs-report?` 힌트 제공 |
| 크로스 플랫폼 | macOS 및 Windows 지원 |

---

## 워크플로 철학

bkit-doctor는 **단계 기반 개발 모델**을 기반으로 합니다:

```
PM → PLAN → DESIGN → DO → CHECK → REPORT
```

각 단계는 문서를 생성합니다. 각 문서는 예측 가능한 위치에 저장됩니다. 모든 작업은 요구사항에서 구현, 검증까지 추적 가능합니다.

이 구조는 AI 어시스턴트와 개발자 모두에게 안정적인 공유 컨텍스트를 제공합니다. 모호함을 줄이고, 추적성을 높이며, 단계 간 인수인계를 신뢰할 수 있게 만듭니다.

---

## bkit과의 관계

> **bkit-doctor는 독립 프로젝트입니다. bkit의 공식 플러그인이 아니며 bkit 프로젝트와 공식적인 제휴 관계가 없습니다.**

bkit-doctor는 **bkit에서 영감을 받았습니다** — 강력한 AI 네이티브 개발 워크플로 툴킷입니다.

bkit-doctor:

- bkit 코드를 **포함하지 않습니다**
- bkit 없이도 **작동합니다**
- bkit 팀이 **보증하거나 유지관리하지 않습니다**
- bkit 자체를 대체하거나 확장하려는 것이 아니라, bkit 스타일 워크플로와 함께 유용하게 사용할 수 있도록 설계되었습니다

---

## 설치

### 요구 사항

- Node.js >= 18.0.0
- npm

### 전역 설치

```bash
npm install -g bkit-doctor
```

### 소스에서 실행

```bash
git clone https://github.com/wpfhak/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## 사용법

```bash
bkit-doctor <command> [options]
```

### 빠른 시작

```bash
# 프로젝트 bkit 환경 진단
bkit-doctor check

# check 결과 기반 추천 대상 적용 (스냅샷 있으면 재사용)
bkit-doctor init --recommended

# init --recommended 미리보기
bkit-doctor init --recommended --dry-run

# 전체 구조 초기화 (확인 프롬프트 포함)
bkit-doctor init

# 확인 건너뛰고 즉시 적용
bkit-doctor init --yes

# 특정 항목만 초기화
bkit-doctor init --target hooks-json --target skills-core
```

---

## 명령어

### `check`

현재 디렉터리(또는 지정한 디렉터리)의 bkit 환경을 진단합니다.
진단 후 `check`는 추천 스냅샷을 저장하므로
`init --recommended`가 다시 검사 실행 없이 결과를 재사용할 수 있습니다.

```
bkit-doctor check [options]

Options:
  -p, --path <dir>   대상 디렉터리 (기본값: 현재 디렉터리)
```

**출력 예시:**

```
[bkit-doctor] 진단 대상: /path/to/project

──── 카테고리 ──────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ! docs        4 warn
  ...

──── 상세 ──────────────────────────────
[FAIL] structure.claude-root — .claude/ missing
  → run: bkit-doctor init --target claude-root
...

총 14개 — PASS 0 / WARN 12 / FAIL 2   상태: FAILED

──── 추천 ──────────────────────────────
  8개 추천 target (14개 문제 기반)

  • claude-root — create the .claude/ root directory
  • hooks-json  — create the default hooks.json file
  • docs-core   — create all docs/ scaffolds (plan, design, task, report, changelog)
    (covers: docs-plan, docs-design, docs-task, docs-report, docs-changelog)

  Recommended next step:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core

  Preview first:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core --dry-run
```

각 항목은 `pass`, `warn`, `fail` 중 하나로 평가됩니다. 추천 섹션은 문제를 해결하는 `init` 대상을 보여주며, 관련 대상을 그룹화합니다 (예: 모든 `docs-*` → `docs-core`).

---

### `init`

누락된 파일과 디렉터리를 생성합니다. 기본적으로 비파괴적 — 명시적으로 요청하지 않으면 기존 파일을 절대 덮어쓰지 않습니다.

적용 전에 `init`은 계획 요약을 보여주고 `Continue? (y/N)`을 묻습니다.
`--dry-run`으로 쓰기 없이 미리보기하거나, `--yes`로 확인을 건너뛸 수 있습니다.

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       대상 디렉터리 (기본값: 현재 디렉터리)
  --dry-run              아무것도 쓰지 않고 계획만 표시
  --recommended          현재 프로젝트 상태에서 대상 자동 선택
  --fresh                추천 재계산 강제 실행 (스냅샷 무시)
  -y, --yes              확인 프롬프트 건너뛰고 즉시 적용
  --target <name>        특정 대상만 적용 (반복 사용 가능)
  --targets <list>       쉼표로 구분된 여러 대상 적용
  --overwrite            기존 파일 덮어쓰기 허용
  --backup               덮어쓰기 전 기존 파일 백업
  --backup-dir <dir>     커스텀 백업 디렉터리
```

#### 사용 가능한 init 대상

| 대상 | 생성하는 항목 |
|------|--------------|
| `claude-root` | `.claude/` 루트 디렉터리 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 하위 4개 에이전트 정의 파일 |
| `skills-core` | `.claude/skills/` 하위 6개 스킬 SKILL.md 파일 |
| `templates-core` | `.claude/templates/` 하위 4개 문서 템플릿 |
| `policies-core` | `.claude/policies/` 하위 4개 정책 파일 |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | 모든 docs (모든 `docs-*` 대상의 별칭) |

---

### `version`

버전 및 플랫폼 정보를 표시합니다.

```bash
bkit-doctor version
```

---

## 예시

### check 후 추천 적용

```bash
# 1. 진단 — 추천 스냅샷 저장
bkit-doctor check

# 2. 캐시 스냅샷을 이용해 추천 대상 적용
bkit-doctor init --recommended

# 먼저 미리보기
bkit-doctor init --recommended --dry-run

# 강제 재계산 (캐시 무시)
bkit-doctor init --recommended --fresh
```

### 초기화 미리보기 (아무것도 쓰이지 않음)

```bash
bkit-doctor init --dry-run

# [bkit-doctor] init: /path/to/project
# [dry-run] no files will be changed
#
#   [MKDIR]    .claude
#   [MKDIR]    .claude/agents
#   [CREATE]   .claude/hooks.json
#   [CREATE]   .claude/agents/planner-orchestrator.md
#   ...
#
# 요약
#   directories created : 13
#   files created       : 25
#   files skipped       : 0
#
# init completed (dry-run)
# no files changed
```

### 적용 전 확인

```bash
bkit-doctor init --targets hooks-json,docs-core

# [bkit-doctor] init: /path/to/project
# [targets] hooks-json, docs-core
#
#   [MKDIR]    .claude
#   [CREATE]   .claude/hooks.json
#   ...
#
# Apply?
#   targets      : hooks-json, docs-core
#   mkdir        : 1
#   create       : 6
#   skip         : 0
#
# Continue? (y/N) y
#
# 요약
#   selected targets     : hooks-json, docs-core
#   directories created  : 1
#   files created        : 6
#   files skipped        : 0
#
# init completed
```

### 확인 건너뛰기 (CI / 자동화)

```bash
bkit-doctor init --yes
bkit-doctor init --recommended --yes
```

### 필요한 것만 초기화

```bash
# 단일 대상
bkit-doctor init --target docs-report

# 여러 대상
bkit-doctor init --targets hooks-json,agents-core

# dry-run과 함께
bkit-doctor init --target skills-core --dry-run
```

### 백업과 함께 안전하게 덮어쓰기

```bash
bkit-doctor init --overwrite --backup
# .bkit-doctor/backups/<timestamp>/에 백업 후
# 새 스캐폴드 내용으로 덮어씀
```

### 오타 감지

```bash
bkit-doctor init --target docs-reprot
# [bkit-doctor] unknown targets:
#   - docs-reprot  (did you mean: docs-report?)
# available targets: claude-root, hooks-json, ...
```

---

## 아키텍처 개요

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js                     # CLI 진입점 (commander)
│   │   └── commands/
│   │       ├── check.js                 # check 명령어 + 스냅샷 저장
│   │       ├── init.js                  # init 명령어 (confirm / recommended / snapshot)
│   │       └── version.js
│   ├── core/
│   │   └── checker.js                   # CheckerRunner
│   ├── checkers/                        # 진단 모듈 (structure, config, agents...)
│   │   └── shared/fileRules.js
│   ├── check/
│   │   ├── resultModel.js               # CheckResult 타입
│   │   ├── formatters/
│   │   │   └── defaultFormatter.js      # 터미널 출력 + 그룹화 추천 렌더링
│   │   └── recommendations/
│   │       ├── recommendationModel.js   # Recommendation 타입
│   │       ├── buildRecommendations.js  # warn/fail → 중복 제거 + 우선순위 정렬
│   │       ├── groupingRegistry.js      # 부모/자식 그룹화 정책
│   │       ├── groupRecommendations.js  # 원시 → 그룹화 추천
│   │       ├── buildSuggestedFlow.js    # Recommendation[] → SuggestedFlow
│   │       ├── suggestedFlowModel.js    # SuggestedFlow 타입
│   │       ├── computeRecommendations.js# async: 검사 실행 → 그룹화 추천
│   │       ├── recommendationSnapshotModel.js
│   │       ├── buildRecommendationFingerprint.js
│   │       ├── saveRecommendationSnapshot.js
│   │       ├── loadRecommendationSnapshot.js
│   │       └── validateRecommendationSnapshot.js
│   ├── init/
│   │   ├── scaffoldManifest.js          # 생성 항목 (dirs + files + aliases)
│   │   ├── fileTemplates.js             # 최소 파일 내용
│   │   ├── targetRegistry.js            # 대상 이름 + 유효성 검사 + 오타 힌트
│   │   ├── buildInitPlan.js             # 계획 계산 (읽기 전용 FS 스캔)
│   │   ├── applyInitPlan.js             # 계획 실행 (쓰기 / 백업 / dry-run)
│   │   └── confirmApply.js              # readline 확인 프롬프트
│   ├── backup/                          # 백업 세션 관리
│   └── shared/
│       └── remediationMap.js            # checker id → initTarget 매핑
├── .bkit-doctor/
│   └── cache/
│       └── recommendation-snapshot.json # check 후 저장
└── docs/
    ├── 01-plan/
    ├── 02-design/
    ├── 03-task/
    └── 04-report/
```

---

## 단계 기반 워크플로

bkit-doctor의 모든 기능은 4개 문서 단계 모델로 구축되었습니다:

| 단계 | 문서 | 목적 |
|------|------|------|
| Plan | `phase-XX.plan.md` | 범위, 목표, 위험, 완료 기준 |
| Design | `phase-XX.design.md` | 아키텍처, 결정, 트레이드오프 |
| Task | `phase-XX.task.md` | 구현 체크리스트, 검증 결과 |
| Report | `phase-XX.report.md` | 결과, 결정 사항, 다음 단계 |

---

## 기여

기여를 환영합니다. 풀 리퀘스트 제출 전에 이슈를 열어 제안하는 변경 사항에 대해 논의해 주세요.

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feat/your-feature`
3. 가능하면 단계 기반 워크플로 따르기: Plan → Design → Implement → Check
4. 무엇이 왜 변경되었는지 명확한 설명과 함께 풀 리퀘스트 제출

---

## 라이선스

Apache License 2.0 — 전체 조건은 [LICENSE](LICENSE)를 참조하세요.

---

## 감사의 말

- **[bkit](https://github.com/upstageai/bkit)** — 이 프로젝트에 영감을 준 워크플로 철학
- 오픈소스 커뮤니티 — 이 프로젝트가 기반으로 하는 도구와 패턴
- 구조적이고 의도적인 개발이 더 나은 결과를 만든다고 믿는 모든 분들
