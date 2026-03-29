# bkit-doctor

> Claude Code 프로젝트 구조를 커맨드 라인에서 진단하고, 스캐폴딩하고, 유지 관리하세요.

![npm version](https://img.shields.io/npm/v/bkit-doctor)
![license](https://img.shields.io/npm/l/bkit-doctor)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | **한국어** | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## bkit-doctor란?

**bkit-doctor**는 Claude Code 프로젝트의 구조가 올바른지 점검합니다 — `.claude/` 디렉터리, hooks, settings, 에이전트 정의, 스킬 파일, 템플릿, 정책, 문서 스캐폴드 — 그리고 누락된 항목을 자동으로 수정합니다.

**Claude Code 프로젝트 레이아웃을 위한 ESLint**라고 생각하면 됩니다. 14가지 진단 항목을 실행하여 각 항목의 pass/warn/fail을 보고하고, 누락된 모든 것을 한 번의 명령으로 스캐폴딩할 수 있습니다.

```bash
npx bkit-doctor check          # diagnose your project
npx bkit-doctor fix --yes      # auto-fix everything
```

---

## 누구를 위한 도구인가?

- **모든 Claude Code 사용자** — 프로젝트가 Claude Code가 기대하는 구조(`.claude/`, `CLAUDE.md`, hooks, settings)를 갖추고 있는지 확인하세요
- **구조화된 AI 워크플로를 도입하는 팀** — 에이전트, 스킬, 템플릿, 정책, PDCA 문서를 몇 초 만에 스캐폴딩하세요
- **CI 파이프라인** — `bkit-doctor check`는 치명적 실패 시 exit code 1을 반환하므로, 프로젝트 상태를 배포 게이트로 활용할 수 있습니다
- **bkit 사용자** — [bkit](https://github.com/anthropics/bkit) PDCA 워크플로를 따르고 있다면, bkit-doctor가 전체 환경을 검증하고 부트스트랩합니다

---

## 설치

```bash
# Run without installing (recommended for trying it out)
npx bkit-doctor check

# Install globally
npm install -g bkit-doctor

# Or add to your project as a dev dependency
npm install --save-dev bkit-doctor
```

**Node.js >= 18**이 필요합니다.

---

## 빠른 시작

```bash
# 1. Diagnose your project
bkit-doctor check

# 2. Auto-fix everything that's missing
bkit-doctor fix --yes

# 3. Verify — should now be HEALTHY
bkit-doctor check
```

---

## 명령어

bkit-doctor는 7가지 명령어를 제공합니다:

### `check` — 프로젝트 구조 진단

14가지 진단 항목을 실행하고 각 항목의 pass/warn/fail을 보고합니다. 이후 `init --recommended` 또는 `fix`에서 사용할 권장 사항 스냅샷을 저장합니다.

```bash
bkit-doctor check                    # check current directory
bkit-doctor check --path ./other     # check a different directory
```

Exit code: 하드 체크 실패 시 **1**, 그 외에는 **0**.

### `init` — 누락된 파일 스캐폴딩

누락된 디렉터리와 파일을 생성합니다. 기본적으로 비파괴적입니다 — `--overwrite`를 명시적으로 전달하지 않는 한 기존 파일은 절대 덮어쓰지 않습니다.

```bash
bkit-doctor init --recommended --yes      # apply recommendations from last check
bkit-doctor init --preset default --yes   # apply a preset bundle
bkit-doctor init --target hooks-json      # scaffold a single target
bkit-doctor init --targets agents-core,docs-core  # multiple targets
bkit-doctor init --recommended --dry-run  # preview without writing
bkit-doctor init --overwrite --backup     # overwrite with backup
```

### `fix` — 원커맨드 자동 수정

`check` + `recommend` + `init`의 단축 명령입니다. 진단을 실행하고, 권장 사항을 계산한 후, 이를 적용합니다.

```bash
bkit-doctor fix --yes           # fix everything, no prompts
bkit-doctor fix --dry-run       # preview what would be fixed
bkit-doctor fix --fresh --yes   # ignore snapshot, recompute
```

### `preset` — 사전 정의된 스캐폴드 번들

프리셋은 스캐폴딩할 대상을 선택하고, 생성되는 파일 내용에 영향을 줍니다.

```bash
bkit-doctor preset list              # show available presets
bkit-doctor preset show default      # show preset details
bkit-doctor preset recommend         # recommend preset for current project
```

사용 가능한 프리셋:

| Preset | 설명 | Targets |
|--------|------|---------|
| `default` | 전체 구조 (config + agents + skills + templates + policies + docs) | 8 targets |
| `lean` | 최소 구조 (config + agents만) | 4 targets |
| `workflow-core` | 워크플로 구조 (agents + skills + templates + policies) | 5 targets |
| `docs` | 문서만 (plan, design, task, report, changelog) | 1 target |

프리셋에 따라 내용이 달라집니다: `default`는 상세한 에이전트 역할과 스킬 설명을 생성하고, `lean`은 간결한 플레이스홀더를 생성합니다.

### `save` / `load` — 설정 저장 및 공유

선호하는 기본 모드(recommended 또는 preset)를 로컬 또는 전역으로 저장하고, 나중에 다시 적용하거나 프로젝트 간에 공유할 수 있습니다.

```bash
bkit-doctor save --local --recommended    # save preference locally
bkit-doctor save --global --preset lean   # save globally (all projects)
bkit-doctor save --both --preset default  # save to both

bkit-doctor load --local                  # re-apply saved settings
bkit-doctor load --global                 # apply global to current project
bkit-doctor load --file ./settings.json   # apply from a specific file
```

### `version` — 버전 정보 표시

```bash
bkit-doctor version       # version + platform details
bkit-doctor --version     # version number only
```

---

## 진단 항목 (14개)

| 카테고리 | 검사 항목 | 심각도 |
|----------|----------|--------|
| structure | `.claude/` 디렉터리 존재 여부 | **hard** (미존재 시 exit 1) |
| config | `CLAUDE.md` 존재 여부 | **hard** (미존재 시 exit 1) |
| config | `.claude/hooks.json` 존재 여부 | soft |
| config | `.claude/settings.local.json` 존재 여부 | soft |
| docs | `docs/01-plan/` ~ `docs/04-report/` (4개 검사) | soft |
| agents | 필수 에이전트 정의 파일 4개 | soft |
| skills | 필수 SKILL.md 파일 7개 | soft |
| policies | 필수 정책 파일 4개 | soft |
| templates | 필수 템플릿 파일 4개 | soft |
| context | `.claude/context/` 디렉터리 | soft |
| changelog | `CHANGELOG.md` (후보 경로 3개) | soft |

**하드 체크**는 `check` 명령이 exit code 1로 종료되게 합니다. **소프트 체크**는 경고를 출력하지만 exit 0으로 종료됩니다.

---

## CI 사용법

`bkit-doctor check`는 핵심 구조가 누락되었을 때 exit code 1을 반환하므로, CI 게이트에 적합합니다:

```bash
# GitHub Actions example
- name: Check Claude Code project health
  run: npx bkit-doctor check --path .

# Shell script
bkit-doctor check || { echo "Project health check failed"; exit 1; }
```

---

## 사용 가능한 init 대상

| Target | 생성되는 항목 |
|--------|-------------|
| `claude-root` | `.claude/` 루트 디렉터리 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 하위 에이전트 정의 파일 4개 |
| `skills-core` | `.claude/skills/` 하위 스킬 SKILL.md 파일 7개 |
| `templates-core` | `.claude/templates/` 하위 문서 템플릿 4개 |
| `policies-core` | `.claude/policies/` 하위 정책 파일 4개 |
| `docs-plan` | `docs/01-plan/` 디렉터리 |
| `docs-design` | `docs/02-design/` 디렉터리 |
| `docs-task` | `docs/03-task/` 디렉터리 |
| `docs-report` | `docs/04-report/` 디렉터리 |
| `docs-changelog` | `CHANGELOG.md` |
| `docs-core` | 모든 docs (모든 `docs-*` 대상의 별칭) |

---

## bkit이란?

[bkit](https://github.com/anthropics/bkit)은 Claude Code를 위한 PDCA 기반 개발 워크플로 프레임워크입니다. AI 네이티브 개발을 위해 구조화된 단계(Plan, Design, Do, Check, Report), 에이전트 팀, 품질 게이트를 제공합니다.

**bkit-doctor는 bkit 유무와 관계없이 동작합니다:**

| 기능 | bkit 없이 | bkit과 함께 |
|------|:---:|:---:|
| `check` — 프로젝트 구조 진단 | Yes | Yes |
| `init` — 누락된 파일 스캐폴딩 | Yes | Yes |
| `fix` — 자동 수정 | Yes | Yes |
| `preset` — 워크플로 최적화 번들 | Partial | Full |
| `save` / `load` — 설정 저장 | Yes | Yes |

핵심 명령어(`check`, `init`, `fix`)는 모든 Claude Code 프로젝트에 유용합니다. 프리셋과 고급 스캐폴딩 대상은 bkit PDCA 워크플로에 최적화되어 있습니다.

---

## 아키텍처

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI entry point (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — registers and runs diagnostics
│   ├── checkers/                 # 14 diagnostic modules
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFile utilities
│   ├── check/
│   │   ├── resultModel.js        # CheckResult type
│   │   ├── formatters/           # terminal output renderer
│   │   └── recommendations/      # recommendation engine + snapshot cache
│   ├── init/                     # scaffold manifest, plan builder, apply logic
│   ├── fix/                      # resolveFixTargets — snapshot-aware remediation
│   ├── preset/                   # preset scoring + recommendation
│   ├── config/                   # save/load settings (local + global)
│   ├── backup/                   # backup session management
│   └── shared/
│       └── remediationMap.js     # checker id → initTarget mapping
├── tests/                        # 167 tests (node:test)
├── scripts/
│   └── verify-release.js         # 38-check release verification
└── docs/                         # PDCA phase documents (plan, design, task, report)
```

---

## bkit과의 관계

> **bkit-doctor는 독립 프로젝트입니다.** bkit의 공식 플러그인이 아니며, bkit 팀과 관련이 없습니다.

bkit-doctor는 [bkit](https://github.com/anthropics/bkit) — PDCA 기반 AI 네이티브 개발 워크플로에서 영감을 받았습니다. 저자는 bkit의 자료를 통해 구조화된 AI 협업을 배웠으며, 그 지식이 이 도구의 설계에 반영되었습니다.

bkit-doctor는 bkit 코드를 **포함하지 않으며**, bkit이 **없어도 동작하고**, bkit 팀이 **보증하거나 유지 관리하지 않습니다**.

---

## 기여

기여를 환영합니다. 풀 리퀘스트를 제출하기 전에 이슈를 먼저 열어 제안하려는 변경 사항을 논의해 주세요.

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다: `git checkout -b feat/your-feature`
3. 가능하면 단계 기반 워크플로를 따릅니다: Plan → Design → Implement → Check
4. 변경 내용과 이유를 명확히 설명하는 풀 리퀘스트를 제출합니다

---

## 라이선스

Apache License 2.0 — 전문은 [LICENSE](LICENSE)를 참조하세요.

---

## 감사의 말

- **[bkit](https://github.com/anthropics/bkit)** — 이 프로젝트에 영감을 준 워크플로 철학
- 오픈소스 커뮤니티 — 이 프로젝트가 기반으로 하는 도구와 패턴들
