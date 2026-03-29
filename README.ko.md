# bkit-doctor

> Claude Code 프로젝트의 구조와 설정 상태를 진단하고 자동 보정하는 CLI 도구.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.7.0-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | **한국어** | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## bkit-doctor란?

**bkit-doctor**는 Claude Code 프로젝트에 올바른 구조가 갖춰져 있는지 검사합니다 — `.claude/` 디렉터리, hooks, settings, 에이전트 정의, 스킬 파일, 템플릿, 정책, 문서 스캐폴드 — 그리고 누락된 항목을 자동으로 수정합니다.

**Claude Code 프로젝트 레이아웃을 위한 ESLint**라고 생각하세요: 14개 진단 항목을 검사하고, 각 항목별 pass/warn/fail을 보고하며, 누락된 모든 것을 한 명령으로 스캐폴딩할 수 있습니다.

```bash
npx bkit-doctor check          # 프로젝트 진단
npx bkit-doctor fix --yes      # 전체 자동 수정
```

---

## 누구를 위한 도구인가?

- **모든 Claude Code 사용자** — 프로젝트가 Claude Code가 기대하는 구조를 갖추고 있는지 확인 (`.claude/`, `CLAUDE.md`, hooks, settings)
- **구조화된 AI 워크플로를 도입하는 팀** — 에이전트, 스킬, 템플릿, 정책, PDCA 문서를 수 초 안에 스캐폴딩
- **CI 파이프라인** — `bkit-doctor check`는 치명적 실패 시 exit code 1을 반환하므로 배포 게이트로 활용 가능
- **bkit 사용자** — [bkit](https://github.com/anthropics/bkit) PDCA 워크플로를 따르는 경우, 전체 환경을 검증하고 부트스트랩

---

## 어떤 문제를 해결하나?

Claude Code 프로젝트를 올바르게 세팅하려면 적절한 디렉터리, 설정 파일, 에이전트 정의, 스킬 파일, 문서 스캐폴드를 만들어야 합니다. 이를 수작업으로 하면 번거롭고 오류가 발생하기 쉽습니다. 파일 하나를 빠뜨리면 hooks가 깨지거나, 스킬이 비활성화되거나, AI 어시스턴트가 컨텍스트를 잃을 수 있습니다.

**bkit-doctor**는 이를 자동화합니다:

- **진단** — 무엇이 있고, 없고, 필요한지 즉시 확인
- **추천** — 현재 상태를 기반으로 초기화할 항목을 자동 제안
- **수정** — 기존 파일을 건드리지 않고 한 명령으로 올바른 구조 생성
- **미리보기** — 파일이 쓰이기 전에 무엇이 변경될지 정확히 확인 (`--dry-run`)
- **검증** — CI에서 실행하여 프로젝트 구조가 건강한 상태를 유지하는지 확인

---

## bkit이란?

[bkit](https://github.com/anthropics/bkit)은 Claude Code를 위한 PDCA 기반 개발 워크플로 프레임워크입니다. 구조화된 단계(Plan, Design, Do, Check, Report), 에이전트 팀, AI 네이티브 개발을 위한 품질 게이트를 제공합니다.

**bkit-doctor는 bkit 없이도 사용 가능합니다:**

| 기능 | bkit 없이 | bkit과 함께 |
|------|:---:|:---:|
| `check` — 프로젝트 구조 진단 | Yes | Yes |
| `init` — 누락 파일 스캐폴딩 | Yes | Yes |
| `fix` — 자동 보정 | Yes | Yes |
| `preset` — 워크플로 최적화 번들 | 부분 | 전체 |
| `save` / `load` — 설정 유지 | Yes | Yes |

핵심 명령어(`check`, `init`, `fix`)는 모든 Claude Code 프로젝트에서 유용합니다. Preset과 고급 스캐폴딩 대상은 bkit PDCA 워크플로에 최적화되어 있습니다.

---

## 기능

| 기능 | 설명 |
|------|------|
| `check` | 프로젝트 환경 진단 — 항목별 pass / warn / fail |
| `init` | 누락된 디렉터리와 파일을 비파괴적으로 생성 |
| `fix` | 원커맨드 자동 보정 (check + recommend + init) |
| `preset` | 사전 정의 번들 적용 (`default`, `lean`, `docs`) |
| `save` / `load` | 팀 설정 저장 및 공유 |
| 추천 기능 | check 후 실행할 `init` 대상 자동 제안 |
| 대상 그룹화 | 관련 대상 자동 통합 (예: `docs-core` = 모든 docs 디렉터리) |
| 스냅샷 캐시 | `check`가 결과 캐시; `init --recommended`가 재사용 |
| `--dry-run` | 파일 시스템을 변경하지 않고 미리보기 |
| `--yes / -y` | 확인 프롬프트 건너뛰기 (CI 친화적) |
| `--overwrite` / `--backup` | 백업과 함께 안전한 파일 교체 |
| 오타 감지 | `did you mean: docs-report?` 힌트 제공 |
| Exit codes | 치명적 실패 시 exit 1 (CI 파이프라인 연동) |
| 크로스 플랫폼 | macOS 및 Windows 지원 |

---

## 진단 항목 (14개)

| 카테고리 | 검사 항목 | 심각도 |
|----------|----------|--------|
| structure | `.claude/` 디렉터리 존재 | **hard** (없으면 exit 1) |
| config | `CLAUDE.md` 존재 | **hard** (없으면 exit 1) |
| config | `.claude/hooks.json` 존재 | soft |
| config | `.claude/settings.local.json` 존재 | soft |
| docs | `docs/01-plan/` ~ `docs/04-report/` (4개 검사) | soft |
| agents | 필수 에이전트 정의 파일 4개 | soft |
| skills | 필수 SKILL.md 파일 7개 | soft |
| policies | 필수 정책 파일 4개 | soft |
| templates | 필수 템플릿 파일 4개 | soft |
| context | `.claude/context/` 디렉터리 | soft |
| changelog | `CHANGELOG.md` (3개 후보 경로) | soft |

**Hard 검사**는 `check`가 exit code 1로 종료합니다. **Soft 검사**는 경고만 표시하고 exit 0입니다.

---

## bkit과의 관계

> **bkit-doctor는 독립 프로젝트입니다.** bkit의 공식 플러그인이 아니며 bkit 팀과 제휴 관계가 없습니다.

bkit-doctor는 [bkit](https://github.com/anthropics/bkit) — PDCA 기반 AI 네이티브 개발 워크플로에서 영감을 받았습니다. 저자는 bkit의 자료를 통해 구조화된 AI 협업을 배웠고, 그 지식이 이 도구의 설계에 반영되었습니다.

bkit-doctor는 bkit 코드를 **포함하지 않으며**, bkit 없이도 **작동하고**, bkit 팀이 **보증하거나 유지관리하지 않습니다**. bkit 스타일 워크플로와 함께 유용하게 사용할 수 있도록 설계되었습니다.

---

## 감사의 말

**bkit 프로젝트**에 특별히 감사드립니다. Plan, Design, Do, Check의 명확함 — 그리고 AI 협업이 구조화된 컨텍스트에서 가장 잘 작동한다는 아이디어 — 가 bkit-doctor의 설계에 직접적인 영향을 주었습니다.

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
git clone https://github.com/dotoricode/bkit-doctor.git
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
# Claude Code 프로젝트 구조 진단
bkit-doctor check

# 누락된 항목 전체 자동 수정
bkit-doctor fix --yes

# 단계별: 미리보기 후 적용
bkit-doctor init --recommended --dry-run
bkit-doctor init --recommended --yes

# 특정 항목만 초기화
bkit-doctor init --target hooks-json --target skills-core

# CI에서 사용 (치명적 검사 실패 시 exit 1)
bkit-doctor check --path ./my-project
```

---

## 명령어

### `check`

현재 디렉터리(또는 지정한 디렉터리)의 환경을 진단합니다.
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

  • claude-root — .claude/ 루트 디렉터리 생성
  • hooks-json  — 기본 hooks.json 파일 생성
  • docs-core   — 모든 docs/ 스캐폴드 생성
    (covers: docs-plan, docs-design, docs-task, docs-report, docs-changelog)

  Recommended next step:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core

  Preview first:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core --dry-run
```

각 항목은 `pass`, `warn`, `fail`로 평가됩니다. 추천 섹션은 문제를 해결하는 `init` 대상을 보여주며, 관련 대상을 그룹화합니다 (예: 모든 `docs-*` → `docs-core`).

---

### `init`

누락된 파일과 디렉터리를 생성합니다. 기본적으로 비파괴적 — 명시적으로 요청하지 않으면 기존 파일을 절대 덮어쓰지 않습니다.

적용 전에 `init`은 계획 요약을 보여주고 `Continue? (y/N)`을 묻습니다.
`--dry-run`으로 미리보기하거나, `--yes`로 확인을 건너뛸 수 있습니다.

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

### `fix`

원커맨드 자동 보정. `check`를 실행하고 추천을 계산해서 적용합니다.

```
bkit-doctor fix [options]

Options:
  -p, --path <dir>   대상 디렉터리 (기본값: 현재 디렉터리)
  --dry-run          아무것도 쓰지 않고 계획만 표시
  --fresh            강제 재계산 (스냅샷 무시)
  -y, --yes          확인 프롬프트 건너뛰기
```

### `preset`

사전 정의된 스캐폴드 번들을 적용합니다.

```bash
bkit-doctor preset list              # 사용 가능한 preset 목록
bkit-doctor preset show default      # preset 상세 정보
bkit-doctor preset recommend         # 현재 프로젝트에 맞는 preset 추천
bkit-doctor init --preset lean --yes # preset 적용
```

### `save` / `load`

기본 설정을 저장하고 공유합니다.

```bash
bkit-doctor save --local --recommended    # 로컬에 설정 저장
bkit-doctor save --global --preset lean   # 전역 설정 저장
bkit-doctor load --local                  # 저장된 설정 재적용
bkit-doctor load --global                 # 전역 설정을 현재 프로젝트에 적용
```

### `version`

버전 및 플랫폼 정보를 표시합니다.

```bash
bkit-doctor version
```

---

## 예시

```bash
# 진단 → 자동 수정 → 검증
bkit-doctor check                          # 누락 항목 확인
bkit-doctor fix --yes                      # 전체 수정
bkit-doctor check                          # 검증: HEALTHY 상태여야 함

# 적용 전 미리보기
bkit-doctor init --recommended --dry-run   # 변경 사항 확인
bkit-doctor init --recommended --yes       # 적용

# 선택적 스캐폴딩
bkit-doctor init --target hooks-json       # 단일 대상
bkit-doctor init --targets hooks-json,docs-core  # 여러 대상

# 백업과 함께 안전하게 덮어쓰기
bkit-doctor init --overwrite --backup      # .bkit-doctor/backups/에 백업

# CI 파이프라인 연동
bkit-doctor check --path ./my-project && echo "healthy" || echo "needs fix"

# 팀 설정 워크플로
bkit-doctor save --global --preset default # 팀 리드가 표준 저장
bkit-doctor load --global                  # 팀원이 적용
```

---

## 아키텍처 개요

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI 진입점 (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — 진단 등록 및 실행
│   ├── checkers/                 # 14개 진단 모듈 (structure, config, docs, agents...)
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFile 유틸리티
│   ├── check/
│   │   ├── resultModel.js        # CheckResult 타입
│   │   ├── formatters/           # 터미널 출력 렌더러
│   │   └── recommendations/      # 추천 엔진 + 스냅샷 캐시
│   ├── init/                     # 스캐폴드 매니페스트, 계획 빌더, 적용 로직
│   ├── fix/                      # resolveFixTargets — 스냅샷 인식 보정
│   ├── preset/                   # preset 스코어링 + 추천
│   ├── config/                   # 설정 저장/로드 (local + global)
│   ├── backup/                   # 백업 세션 관리
│   └── shared/
│       └── remediationMap.js     # checker id → initTarget 매핑
├── tests/                        # 167개 테스트 (node:test)
├── scripts/
│   └── verify-release.js         # 38개 항목 릴리스 검증
└── docs/                         # PDCA 단계 문서 (plan, design, task, report)
```

---

## 개발 방법론

이 프로젝트는 자체적으로 홍보하는 PDCA 워크플로를 사용해 구축되었습니다. 모든 기능에 Plan, Design, Task, Report 문서가 `docs/`에 있습니다. 이를 통해 변경이 의도적이고, 문서화되고, 추적 가능합니다.

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

- **[bkit](https://github.com/anthropics/bkit)** — 이 프로젝트에 영감을 준 워크플로 철학
- 오픈소스 커뮤니티 — 이 프로젝트가 기반으로 하는 도구와 패턴
