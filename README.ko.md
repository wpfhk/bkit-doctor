<div align="center">

# 🩺 bkit-doctor

**Claude Code를 위한 AI 워크플로우 CLI.**
프로젝트를 한 번 설정하면, Claude Code가 이후를 자동으로 — 일관되게, 매번 — 처리합니다.

[![npm version](https://img.shields.io/badge/npm-v1.1.1-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) · **한국어** · [日本語](README.ja.md) · [中文](README.zh.md) · [Español](README.es.md)

</div>

---

## 왜 bkit-doctor인가?

Claude Code로 프로젝트를 구축하다 보면 며칠 내에 두 가지 문제가 생깁니다:

1. **구조 드리프트** — `.claude/` 디렉터리가 사라지고, `CLAUDE.md` 규칙이 틀어지고, hooks가 없어집니다.
2. **워크플로우 기억 상실** — Claude Code가 빌드한 것을 문서화하는 걸 잊습니다. 계획도, 흔적도, 감사 추적도 없습니다.

**bkit-doctor가 둘 다 해결합니다.** 프로젝트 구조를 강제하고, Claude Code가 매번 묻지 않아도 PDCA(Plan-Do-Check-Act) 워크플로우를 자동으로 따르도록 연결합니다.

```
Claude Code가 로직을 생성합니다.
bkit-doctor가 구조와 워크플로우 상태를 영구적으로 추적합니다.
```

---

## 🚀 빠른 시작

신규 또는 기존 프로젝트를 가장 빠르게 설정하는 방법:

```bash
npx bkit-doctor setup
```

이 단일 명령어가 대화형 마법사를 실행합니다:

```
bkit-doctor setup

  [1/4] 프로젝트 구조 진단 중...
        ✔ .claude/ 디렉터리 발견
        ✔ CLAUDE.md 발견
        ⚠ hooks.json 없음 → 수정 예정

  [2/4] 3개 문제 자동 수정 중...
        ✔ hooks.json 생성
        ✔ settings.local.json 생성
        ✔ docs/ 스캐폴드 완료

  [3/4] CLAUDE.md 생성 중...
        ✔ CLAUDE.md 작성 완료 (백업: CLAUDE_20260330_backup.md)

  [4/4] SKILL.md + npm 스크립트 생성 중...
        ✔ SKILL.md 생성
        ✔ package.json에 추가: bkit:check, bkit:fix, bkit:setup

  설정 완료. Claude Code가 이제 자동으로 PDCA 워크플로우를 따릅니다.
```

설정 후에는 `npx bkit-doctor ...` 대신 npm 단축 명령어를 사용하세요:

```bash
npm run bkit:check   # → bkit-doctor check
npm run bkit:fix     # → bkit-doctor fix --yes
npm run bkit:setup   # → bkit-doctor setup
```

---

## ✨ 핵심 기능

### 🧙 `setup` — 원커맨드 프로젝트 초기화

```bash
bkit-doctor setup [--path <dir>]
```

네 단계를 순서대로 실행합니다: **진단 → 수정 → CLAUDE.md 생성 → SKILL.md + npm 스크립트 생성**

- 덮어쓰기 전에 기존 `CLAUDE.md`를 `CLAUDE_{날짜}_backup.md`로 백업
- CI/CD에서 안전: 비-TTY 환경에서는 대화형 프롬프트를 건너뜁니다 (기존 파일 유지)
- 멱등성: 두 번 실행해도 안전합니다

---

### 🤖 `skill` — 프롬프트 없는 PDCA 문서화

```bash
bkit-doctor skill [--append-claude] [--overwrite] [--stdout] [--dry-run]
```

모든 작업을 자동으로 문서화하도록 Claude Code를 프로그래밍하는 `SKILL.md` 파일을 생성합니다 — 별도 프롬프트 불필요.

```markdown
## RULE 1: PROACTIVE DOCUMENTATION
코드를 작성하기 전에 자동으로 실행:
  npx bkit-doctor pdca-plan "<topic>" --type <feature|bugfix|refactor|guideline>

## RULE 2: STATE SYNC
코드 작성 전, 기존 PDCA 상태를 확인:
  npx bkit-doctor pdca-list

## RULE 3: PIPELINE
코딩 후, 나머지 단계를 자동으로 실행:
  npx bkit-doctor pdca-do "<topic>"
  npx bkit-doctor pdca-check "<topic>"
  npx bkit-doctor pdca-report "<topic>"
```

**`--append-claude`** 를 사용하면 이 규칙들이 `CLAUDE.md`에 직접 주입되어 프로젝트 전체에 적용됩니다.

---

### 📋 `pdca` — 파일 시스템 AI 워크플로우 엔진

모든 작업에 대한 구조화된 PDCA 문서를 생성합니다. 상태는 `.bkit-doctor/pdca-state.json`에 추적됩니다.

```bash
# 원샷: 전체 가이드 생성
bkit-doctor pdca "사용자 인증" --type feature --owner alice --priority P1

# 단계별 워크플로우
bkit-doctor pdca-plan "사용자 인증"
bkit-doctor pdca-do   "사용자 인증"
bkit-doctor pdca-check "사용자 인증"
bkit-doctor pdca-report "사용자 인증"

# 활성 토픽 전체 보기
bkit-doctor pdca-list
```

문서 유형: `guideline` · `feature` · `bugfix` · `refactor`

출력: `output/pdca/<slug>-pdca-{stage}.md` — 버전 관리 가능, 감사 가능, git 추적 가능.

---

### 🧹 `clear` — 안전한 설정 정리

```bash
bkit-doctor clear [--path <dir>]
```

bkit-doctor가 생성한 파일을 대화형으로 선택하고 삭제합니다. 삭제 전 명시적 확인이 필요합니다 — 데이터가 조용히 사라지지 않습니다.

---

### 🔍 `check` / `fix` / `init` — 구조 강제 적용

```bash
bkit-doctor check        # 16개 진단 검사 실행 → pass/warn/fail
bkit-doctor fix --yes    # 모든 문제 자동 수정 (check + recommend + init)
bkit-doctor init --preset default --yes   # 전체 프로젝트 구조 스캐폴드
```

**16개 진단 검사**: 구조 · 설정 · 에이전트 · 스킬 · 정책 · 템플릿 · 문서 · 변경 이력

하드 실패(`.claude/` 또는 `CLAUDE.md` 없음) 시 종료 코드 `1` — CI 친화적.

---

## 🤖 Claude Code 연동 방식

프로젝트 루트에 `SKILL.md`가 존재하면, Claude Code가 이를 프로젝트 컨텍스트로 읽고 모든 작업에서 그 규칙을 따릅니다.

```
your-project/
├── CLAUDE.md          ← 프로젝트 규칙 + 워크플로우 지시사항
├── SKILL.md           ← Claude Code 자동화 규칙
├── .claude/
│   ├── hooks.json
│   └── settings.local.json
└── output/
    └── pdca/
        ├── user-auth-pdca-plan.md
        ├── user-auth-pdca-do.md
        └── user-auth-pdca-report.md     ← 자동 생성, 프롬프트 불필요
```

결과: **모든 기능, 버그 수정, 리팩터링이 자동으로 계획되고, 실행되고, 검증되고, 보고됩니다** — 수동 작업 없이 영구적인 감사 추적이 쌓입니다.

---

## 📖 명령어 레퍼런스

| 명령어 | 설명 |
|--------|------|
| `setup` | 대화형 마법사: check → fix → CLAUDE.md → SKILL.md → npm 스크립트 |
| `skill` | Claude Code 자동화 규칙이 담긴 `SKILL.md` 생성 |
| `clear` | 확인 후 설정 파일 대화형 삭제 |
| `check` | 16개 진단 검사 실행 |
| `fix` | 모든 문제 자동 수정 (check + recommend + init) |
| `init` | 누락된 파일 및 디렉터리 스캐폴드 |
| `pdca <topic>` | 전체 PDCA 가이드 문서 생성 |
| `pdca-plan <topic>` | Plan 단계 문서 생성 |
| `pdca-do <topic>` | Do 단계 문서 생성 |
| `pdca-check <topic>` | Check 단계 문서 생성 |
| `pdca-report <topic>` | Report 단계 문서 생성 |
| `pdca-list` | 활성 PDCA 토픽 목록 |
| `preset` | 프리셋 목록, 상세 보기, 또는 추천 |
| `save` | 현재 설정 저장 (local / global / both) |
| `load` | 저장된 설정을 현재 프로젝트에 적용 |
| `version` | 버전 및 플랫폼 정보 표시 |

---

## 📦 검사 항목 (16개)

| 카테고리 | 검사 항목 | 심각도 |
|----------|-----------|--------|
| structure | `.claude/` 디렉터리 | **hard** (exit 1) |
| config | `CLAUDE.md` | **hard** (exit 1) |
| config | `hooks.json` | soft |
| config | `settings.local.json` | soft |
| agents | 에이전트 정의 파일 4개 | soft |
| skills | `.claude/skills/` 하위 스킬 파일 7개 | soft |
| policies | 정책 파일 4개 | soft |
| templates | 템플릿 파일 4개 | soft |
| docs | `docs/01-plan/` → `docs/04-report/` (4개) | soft |
| docs | `output/pdca/` 디렉터리 | soft |
| docs | PDCA 가이드 콘텐츠 유효성 | soft |
| context | `.claude/context/` 디렉터리 | soft |
| changelog | `CHANGELOG.md` | soft |

---

## 🛠 사용 가능한 `init` 타깃

| 타깃 | 생성 항목 |
|------|----------|
| `claude-root` | `.claude/` 디렉터리 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 에이전트 정의 파일 4개 |
| `skills-core` | `.claude/skills/` 하위 SKILL.md 파일 7개 |
| `templates-core` | 문서 템플릿 4개 |
| `policies-core` | 정책 파일 4개 |
| `docs-core` | 모든 `docs/` 디렉터리 |
| `docs-pdca` | `output/pdca/` PDCA 출력 디렉터리 |
| `docs-changelog` | `CHANGELOG.md` |

**프리셋:** `default` (전체) · `lean` (최소) · `workflow-core` · `docs`

---

## 🔗 bkit과 함께 사용하기

bkit-doctor는 구조와 상태를 강제합니다. **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** 은 AI 워크플로우 엔진 자체를 구동하는 Claude Code 플러그인입니다 (31개 에이전트, 36개 스킬, PDCA 오케스트레이션).

| | bkit-doctor | bkit (플러그인) |
|--|-------------|-----------------|
| 프로젝트 구조 | ✅ 생성 및 검증 | — |
| CLAUDE.md / SKILL.md | ✅ 생성 | 읽기 |
| PDCA 문서 엔진 | ✅ 파일 생성 | 오케스트레이션 |
| AI 에이전트 & 스킬 | — | ✅ 31개 에이전트 / 36개 스킬 |
| 실행 환경 | 터미널 | Claude Code |

```bash
# Claude Code 내에서 bkit 설치
/plugin marketplace add popup-studio-ai/bkit-claude-code
```

---

## CI 사용법

```yaml
# GitHub Actions
- name: 프로젝트 구조 검사
  run: npx bkit-doctor check
# .claude/ 또는 CLAUDE.md 없으면 exit 1
```

---

## 기여하기

기여를 환영합니다. 변경하고 싶은 내용이 있으면 먼저 이슈를 열어 논의해 주세요.

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feat/my-feature`
3. 테스트 실행: `npm test`
4. Pull Request 제출

---

<div align="center">
  Claude Code로 개발하는 모든 이를 위해 만들어졌습니다.<br>
  <a href="https://github.com/dotoricode/bkit-doctor">GitHub</a> · <a href="https://www.npmjs.com/package/bkit-doctor">npm</a> · <a href="CHANGELOG.md">Changelog</a>
</div>
