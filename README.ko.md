# bkit-doctor

> AI 코딩 도구로 만든 프로젝트의 구조를 진단하고, 자동으로 보정하는 CLI 도구.

[![npm version](https://img.shields.io/badge/npm-v1.1.0-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](https://github.com/dotoricode/bkit-doctor/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](./README.md) | **한국어** | [日本語](./README.ja.md) | [中文](./README.zh.md) | [Español](./README.es.md)

---

## bkit-doctor란?

Claude Code, Cursor 같은 AI 코딩 도구로 프로젝트를 만들다 보면 구조가 뒤죽박죽이 되기 쉽습니다. 컨텍스트 파일이 빠져있거나, 문서 디렉터리가 없거나, 설정 파일이 누락되거나. 시간이 지나면 AI가 효과적으로 작동하는 데 필요한 구조화된 컨텍스트를 잃게 됩니다.

**bkit-doctor**는 이런 문제를 한 명령어로 진단하고 자동 보정해줍니다. `.claude/` 디렉터리, hooks, settings, 에이전트 정의, 스킬 파일, 템플릿, 정책, 문서 스캐폴드 — 프로젝트에 필요한 구조가 있는지 확인하고, 없는 것은 자동으로 만들어줍니다.

**프로젝트 레이아웃을 위한 ESLint**라고 생각하면 됩니다. 14가지 진단, 항목별 pass/warn/fail, 원커맨드 자동 수정.

```bash
npx bkit-doctor check          # 프로젝트 진단
npx bkit-doctor fix --yes      # 전체 자동 수정
```

bkit-doctor는 [bkit](https://github.com/popup-studio-ai/bkit-claude-code) PDCA 워크플로 방법론을 기반으로 만들어졌지만, 독립적으로 동작합니다 — bkit 설치 불필요.

---

## 빠른 시작: bkit과 함께 새 프로젝트 설정하기

> bkit-doctor만 써도 충분하지만, [bkit](https://github.com/popup-studio-ai/bkit-claude-code)을 함께 사용하면 PDCA 워크플로, 31개 에이전트, 36개 스킬이 활성화됩니다.

### Step 1 — bkit-doctor로 프로젝트 구조 스캐폴딩

새 프로젝트 폴더에서 아래 명령어를 실행합니다.

```bash
# 1. 프로젝트 진단 (처음엔 대부분 warn/fail이 뜨는 게 정상입니다)
npx bkit-doctor check

# 2. 누락된 구조 전체 자동 생성
npx bkit-doctor init --preset default --yes

# 3. 다시 진단해서 HEALTHY 확인
npx bkit-doctor check
```

이 단계가 끝나면 프로젝트 안에 `.claude/`, `docs/`, `CLAUDE.md` 등의 **디렉터리와 파일 골격**이 생깁니다.

```
your-project/
├── .claude/
│   ├── hooks.json
│   ├── settings.local.json
│   ├── agents/          ← 에이전트 정의 파일 (플레이스홀더)
│   ├── skills/          ← 스킬 파일 (플레이스홀더)
│   ├── templates/       ← 문서 템플릿
│   └── policies/        ← 정책 파일
├── docs/
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-task/
│   └── 04-report/
├── CLAUDE.md
└── CHANGELOG.md
```

> **이 상태는 껍데기입니다.** `.claude/agents/`와 `.claude/skills/` 안의 파일들은 플레이스홀더이며, 실제 bkit의 에이전트/스킬 로직은 아직 들어있지 않습니다. 다음 단계에서 채워집니다.

---

### Step 2 — Claude Code에 bkit 플러그인 설치

bkit의 실제 기능(PDCA 워크플로, CTO 에이전트, 품질 게이트 등)은 **Claude Code 플러그인**으로 동작합니다. Claude Code를 열고 아래 명령어를 실행합니다.

```
# Claude Code 터미널 안에서 실행
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

설치가 완료되면 Claude Code가 `~/.claude/plugins/bkit/` 경로에 플러그인을 저장합니다. 이제 bkit의 36개 스킬과 31개 에이전트가 모든 프로젝트에서 자동으로 활성화됩니다.

---

### Step 3 — 첫 번째 개발 시작

bkit 플러그인이 설치된 Claude Code에서 아래 명령어로 PDCA 워크플로를 시작합니다.

```
# 새 기능 개발 시작 (예: 로그인 기능)
/pdca plan 로그인-기능

# 설계 문서 생성
/pdca design 로그인-기능

# 구현
/pdca do 로그인-기능

# 검증 및 갭 분석
/pdca analyze 로그인-기능
```

문서는 bkit-doctor가 만들어 둔 `docs/` 디렉터리 구조를 그대로 활용합니다.

---

### 구조 요약

```
bkit-doctor                   bkit (Claude Code 플러그인)
──────────────────────        ──────────────────────────────
프로젝트 골격 생성               실제 AI 워크플로 엔진
.claude/ 디렉터리 구조           36개 스킬 / 31개 에이전트
docs/ 문서 구조                  PDCA 상태 머신
hooks.json 설정                  품질 게이트 / 감사 로그
CLAUDE.md 컨텍스트 파일          CTO-Led 에이전트 팀
```

bkit-doctor는 **한 번 실행하면 끝**입니다. 이후에는 bkit이 Claude Code 안에서 모든 워크플로를 담당합니다.

---

## 설치

```bash
# 설치 없이 즉시 실행 (처음 써보기에 좋습니다)
npx bkit-doctor check

# 글로벌 설치
npm install -g bkit-doctor

# 또는 프로젝트 devDependency로 추가
npm install --save-dev bkit-doctor
```

**Node.js >= 18**이 필요합니다.

### 소스에서 실행

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## 명령어

bkit-doctor는 7가지 명령어를 제공합니다.

### `check` — 프로젝트 구조 진단

14가지 진단 항목을 실행하고 각 항목의 pass/warn/fail을 보고합니다. 이후 `init --recommended` 또는 `fix`에서 사용할 권장 사항 스냅샷을 저장합니다.

```bash
bkit-doctor check                    # 현재 디렉터리 진단
bkit-doctor check --path ./other     # 다른 디렉터리 진단
```

Exit code: 하드 체크 실패 시 **1**, 그 외에는 **0**.

**출력 예시:**

```
[bkit-doctor] 진단 대상: /path/to/project

──── 카테고리 ──────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ✓ docs        4 pass

──── 상세 ──────────────────────────────
[FAIL] structure.claude-root — .claude/ 없음
[WARN] config.hooks-json — .claude/hooks.json 없음
[PASS] docs.plan — docs/01-plan 존재

총 14개 — PASS 8 / WARN 4 / FAIL 2   상태: FAILED

──── 추천 ──────────────────────────────
  bkit-doctor init --targets claude-root,hooks-json,...
```

### `init` — 누락된 파일 스캐폴딩

누락된 디렉터리와 파일을 생성합니다. 기본적으로 비파괴적입니다 — `--overwrite`를 명시적으로 전달하지 않는 한 기존 파일은 절대 덮어쓰지 않습니다.

```bash
bkit-doctor init --recommended --yes      # 마지막 check 결과 기반 추천 적용
bkit-doctor init --preset default --yes   # 프리셋 번들 적용
bkit-doctor init --target hooks-json      # 단일 대상 스캐폴딩
bkit-doctor init --targets agents-core,docs-core  # 여러 대상
bkit-doctor init --recommended --dry-run  # 미리보기 (파일 변경 없음)
bkit-doctor init --overwrite --backup     # 덮어쓰기 + 백업
```

### `fix` — 원커맨드 자동 수정

`check` + `recommend` + `init`의 단축 명령입니다. 진단을 실행하고, 권장 사항을 계산한 후, 이를 적용합니다.

```bash
bkit-doctor fix --yes           # 전체 수정, 프롬프트 없음
bkit-doctor fix --dry-run       # 수정 계획만 미리보기
bkit-doctor fix --fresh --yes   # 스냅샷 무시, 재계산
```

### `preset` — 사전 정의된 스캐폴드 번들

프리셋은 스캐폴딩할 대상을 선택하고, 생성되는 파일 내용에 영향을 줍니다.

```bash
bkit-doctor preset list              # 프리셋 목록
bkit-doctor preset show default      # 프리셋 상세 정보
bkit-doctor preset recommend         # 현재 프로젝트에 맞는 프리셋 추천
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
bkit-doctor save --local --recommended    # 로컬에 설정 저장
bkit-doctor save --global --preset lean   # 전역 설정 저장
bkit-doctor save --both --preset default  # 양쪽 모두 저장

bkit-doctor load --local                  # 저장된 설정 재적용
bkit-doctor load --global                 # 전역 설정을 현재 프로젝트에 적용
bkit-doctor load --file ./settings.json   # 특정 파일에서 설정 로드
```

### `pdca` — PDCA 가이드 문서 생성

특정 주제에 대한 PDCA (Plan-Do-Check-Act) 가이드 문서를 생성합니다. 바로 편집 가능한 마크다운 템플릿입니다.

```bash
bkit-doctor pdca "배포 승인 기준"                           # 가이드 생성
bkit-doctor pdca "결제 장애 대응 지침" --stdout              # 터미널에 출력
bkit-doctor pdca "운영 점검 절차" --overwrite                # 기존 파일 덮어쓰기
bkit-doctor pdca "로그인 기능" --type feature --owner alice  # 메타데이터 지정
bkit-doctor pdca-plan "배포 승인" --type guideline           # Plan 단계 문서만
bkit-doctor pdca-list                                       # 생성된 문서 목록
```

**기본 출력 경로:** `output/pdca/<slug>-pdca-guide.md`

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--stdout` | 파일 대신 터미널에 출력 | — |
| `--dry-run` | 생성 계획/경로/충돌 미리보기 | — |
| `--overwrite` | 기존 파일 덮어쓰기 | — |
| `--type <kind>` | `guideline` / `feature` / `bugfix` / `refactor` | `guideline` |
| `--owner <name>` | 담당자 | `TBD` |
| `--priority <level>` | 우선순위 (`P0`~`P3`) | `P1` |

**단계별 명령:** `pdca-plan`, `pdca-do`, `pdca-check`, `pdca-report`

**범위 (v1):** 템플릿 기반 생성만. 상태 관리형 워크플로우, AI 생성, 다단계 서브커맨드 없음.

### `version` — 버전 정보 표시

```bash
bkit-doctor version       # 버전 + 플랫폼 상세 정보
bkit-doctor --version     # 버전 번호만 출력
```

---

## 진단 항목 (14개)

| 카테고리 | 검사 항목 | 심각도 |
|----------|-----------|--------|
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

`bkit-doctor check`는 핵심 구조가 누락되었을 때 exit code 1을 반환하므로, CI 게이트에 적합합니다.

```yaml
# GitHub Actions
- name: 프로젝트 구조 점검
  run: npx bkit-doctor check
```

```bash
# Shell script
bkit-doctor check || { echo "구조 점검 실패"; exit 1; }
```

Exit code 동작:

- **하드 FAIL** (`.claude/` 또는 `CLAUDE.md` 누락) → exit 1, CI 실패
- **소프트 FAIL** (경고만) → exit 0, CI 통과

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

## FAQ

**Q: `init --preset default`를 실행했는데 bkit 기능이 활성화되지 않았어요.**

A: bkit-doctor는 프로젝트의 **파일 구조**를 만들어주는 도구입니다. bkit의 실제 기능(PDCA 워크플로, 에이전트, 스킬)은 **Claude Code 플러그인**으로 별도 설치해야 합니다. Claude Code를 열고 아래 명령어를 실행하세요.

```
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

**Q: `.claude/agents/` 파일이 생겼는데 이게 bkit 에이전트인가요?**

A: 아닙니다. bkit-doctor가 생성하는 에이전트 파일은 **플레이스홀더**입니다. 실제 bkit의 31개 에이전트는 Claude Code의 bkit 플러그인 안에 포함되어 있습니다 (`~/.claude/plugins/bkit/agents/`). bkit-doctor가 만든 파일은 커스텀 에이전트를 추가할 때 참고용으로 쓸 수 있습니다.

**Q: bkit를 설치해야 하나요?**

A: 아니요. bkit-doctor는 독립 CLI 도구입니다. bkit 없이도 동작합니다. 하지만 `/pdca` 명령어 등 bkit의 워크플로를 쓰고 싶다면 Claude Code에 bkit 플러그인 설치가 필요합니다.

**Q: 기존 파일을 덮어쓰나요?**

A: 기본적으로 덮어쓰지 않습니다. `--overwrite` 옵션을 명시해야 합니다. `--overwrite --backup`을 함께 쓰면 덮어쓰기 전 백업을 만듭니다.

**Q: 어떤 파일을 생성하나요?**

A: `--dry-run` 옵션으로 미리 확인할 수 있습니다. 실제 파일은 변경되지 않습니다.

```bash
bkit-doctor init --recommended --dry-run
bkit-doctor fix --dry-run
```

**Q: CI에서 쓸 수 있나요?**

A: 네. `check`는 핵심 구조 누락 시 exit code 1을 반환하므로 CI 게이트로 사용 가능합니다.

---

## bkit이란?

[bkit](https://github.com/popup-studio-ai/bkit-claude-code)(Vibecoding Kit)은 Claude Code를 위한 PDCA 기반 개발 워크플로 프레임워크입니다. AI 네이티브 개발을 위해 구조화된 단계(Plan, Design, Do, Check, Report), 에이전트 팀, 품질 게이트를 제공합니다.

**bkit-doctor는 bkit 유무와 관계없이 동작합니다:**

| 기능 | bkit 없이 | bkit과 함께 |
|------|:---------:|:-----------:|
| `check` — 프로젝트 구조 진단 | ✅ | ✅ |
| `init` — 누락된 파일 스캐폴딩 | ✅ | ✅ |
| `fix` — 자동 수정 | ✅ | ✅ |
| `preset` — 워크플로 최적화 번들 | Partial | Full |
| `/pdca` 워크플로 명령어 | ❌ | ✅ |
| 31개 에이전트 / 36개 스킬 | ❌ | ✅ |
| PDCA 품질 게이트 / 감사 로그 | ❌ | ✅ |

bkit 자세히 보기: https://github.com/popup-studio-ai/bkit-claude-code

---

## 아키텍처

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI 진입점 (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — 진단 등록 및 실행
│   ├── checkers/                 # 14개 진단 모듈
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFile 유틸리티
│   ├── check/
│   │   ├── resultModel.js        # CheckResult 타입
│   │   ├── formatters/           # 터미널 출력 렌더러
│   │   └── recommendations/      # 추천 엔진 + 스냅샷 캐시
│   ├── init/                     # 스캐폴드 매니페스트, 계획 빌더, 적용 로직
│   ├── fix/                      # resolveFixTargets — 스냅샷 인식 보정
│   ├── preset/                   # 프리셋 스코어링 + 추천
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

## bkit과의 관계

> **bkit-doctor는 독립 프로젝트입니다.** bkit의 공식 플러그인이 아니며, bkit 팀과 관련이 없습니다.

bkit-doctor는 [bkit](https://github.com/popup-studio-ai/bkit-claude-code) — PDCA 기반 AI 네이티브 개발 워크플로에서 영감을 받았습니다. 저자는 bkit의 자료를 통해 구조화된 AI 협업을 배웠으며, 그 지식이 이 도구의 설계에 반영되었습니다.

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

Apache License 2.0 — 전문은 [LICENSE](./LICENSE)를 참조하세요.

---

## 감사의 말

- **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** — 이 프로젝트에 영감을 준 워크플로 철학
- 오픈소스 커뮤니티 — 이 프로젝트가 기반으로 하는 도구와 패턴들

---

> **면책 조항**: 이 도구는 독립적인 커뮤니티 도구이며, POPUP STUDIO의 공식 제품이 아닙니다. "bkit"은 POPUP STUDIO PTE. LTD.의 상표입니다.
