# bkit-doctor

> ⚠️ **Work in progress** — This project is under active development.

> A CLI tool for diagnosing, initializing, and maintaining bkit-style project environments.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.4.2-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/wpfhak/bkit-doctor/pulls)

**English** | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## Introduction

**bkit-doctor** is a command-line tool that helps you set up and maintain a bkit-style workflow environment in any project. It diagnoses your current project structure, reports what is missing or misconfigured, and can automatically scaffold the missing pieces — safely and non-destructively.

This project was built using the same phase-based workflow it promotes. Every feature you see here was planned, designed, implemented, and verified using the exact methodology bkit-doctor is designed to support.

---

## Why This Project Exists

Adopting a structured AI-native development workflow is powerful, but getting started can be daunting. Setting up the right directory structure, agent definitions, skill files, templates, and policies by hand is tedious and error-prone.

**bkit-doctor** exists to lower that barrier:

- **Diagnose** — instantly see what is present, what is missing, and what needs attention
- **Init** — scaffold the correct structure in seconds, without overwriting anything you already have
- **Target** — apply only what you need, one piece at a time
- **Preview** — see exactly what will change before anything is written to disk

This tool was born from a simple idea: *the workflow should be easy to enter, not just easy to use once you're in it.*

---

## Features

| Feature | Description |
|---------|-------------|
| `check` | Diagnose project environment — pass / warn / fail per item |
| `init` | Scaffold missing directories and files non-destructively |
| `--dry-run` | Preview what will be created without touching the filesystem |
| `--target` | Apply only specific targets (e.g. `hooks-json`, `skills-core`) |
| `--targets` | Apply multiple targets in one command (comma-separated) |
| `--overwrite` | Replace existing files when needed |
| `--backup` | Back up existing files before overwriting |
| Typo hints | `did you mean: docs-report?` when a target name is mistyped |
| Cross-platform | Works on macOS and Windows |

---

## Workflow Philosophy

bkit-doctor is built around a **phase-based development model**:

```
PM → PLAN → DESIGN → DO → CHECK → REPORT
```

Each phase produces a document. Each document lives in a predictable location. Each piece of work is traceable from requirement to implementation to verification.

This structure gives AI assistants — and human developers — a shared, stable context to work from. It reduces ambiguity, improves traceability, and makes handoffs between phases reliable.

bkit-doctor enforces this structure by:

1. **Checking** whether the required files and directories exist
2. **Reporting** what is missing or misconfigured, with actionable hints
3. **Scaffolding** the correct structure when it is absent
4. **Connecting** the diagnostic output back to the init tool via a shared `initTarget` system

---

## Relationship with bkit

> **bkit-doctor is an independent project. It is not an official bkit plugin and has no official affiliation with the bkit project.**

bkit-doctor was **inspired by bkit** — a powerful AI-native development workflow toolkit. The author learned about structured AI collaboration through bkit's introductory materials, and that knowledge directly shaped the design of this tool.

bkit-doctor:

- Does **not** include bkit code
- Does **not** require bkit to function
- Is **not** endorsed or maintained by the bkit team
- Is designed to be useful alongside bkit-style workflows, not to replace or extend bkit itself

If you use bkit and want a fast way to verify and scaffold your project environment, bkit-doctor is designed with you in mind.

---

## Acknowledgements

> **Special thanks to the bkit project.**

Watching bkit's introduction videos was a turning point. The clarity of the phase-based workflow, the discipline of Plan → Design → Do → Check, and the idea that AI collaboration works best when both sides share structured context — these ideas deeply influenced how bkit-doctor was designed and built.

Thanks to bkit, the author was able to achieve high-quality vibe coding. This project exists because bkit made structured AI-native development feel achievable. The goal of bkit-doctor is to help more developers reach that same experience, more easily.

---

## Installation

### Requirements

- Node.js >= 18.0.0
- npm

### Install globally

```bash
npm install -g bkit-doctor
```

### Run from source

```bash
git clone https://github.com/wpfhak/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## Usage

```bash
bkit-doctor <command> [options]
```

### Quick start

```bash
# Check your project's bkit environment
bkit-doctor check

# Preview what init would create, without changing anything
bkit-doctor init --dry-run

# Initialize the full structure
bkit-doctor init

# Initialize only specific pieces
bkit-doctor init --target hooks-json --target skills-core
```

---

## Commands

### `check`

Diagnose the bkit environment in the current (or specified) directory.

```bash
bkit-doctor check [options]

Options:
  -p, --path <dir>   Target directory (default: current directory)
```

**Output example:**

```
[bkit-doctor] 진단 대상: /path/to/project

[structure]
  [✓] .claude/ exists

[config]
  [✗] .claude/hooks.json missing
      fix: run init --target hooks-json

[agents]
  [✗] required agents not found
      fix: run init --target agents-core

총 12개 — pass: 8, warn: 1, fail: 3
```

Each item is rated `pass`, `warn`, or `fail`. Warn and fail items include a `fixHint` pointing to the relevant `init` target.

---

### `init`

Scaffold missing files and directories. Non-destructive by default — existing files are never overwritten unless you explicitly request it.

```bash
bkit-doctor init [options]

Options:
  -p, --path <dir>       Target directory (default: current directory)
  --dry-run              Show plan without writing anything
  --target <name>        Apply a specific target only (repeatable)
  --targets <list>       Apply multiple targets, comma-separated
  --overwrite            Allow overwriting existing files
  --backup               Back up existing files before overwriting
  --backup-dir <dir>     Custom backup directory
```

#### Available init targets

| Target | What it creates |
|--------|----------------|
| `claude-root` | `.claude/` root directory |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 agent definition files under `.claude/agents/` |
| `skills-core` | 6 skill SKILL.md files under `.claude/skills/` |
| `templates-core` | 4 document templates under `.claude/templates/` |
| `policies-core` | 4 policy files under `.claude/policies/` |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | All docs (alias for all `docs-*` targets) |

---

### `version`

Display version and platform information.

```bash
bkit-doctor version
```

---

## Examples

### Preview initialization (nothing written)

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
# init completed (dry-run)
# no files changed
```

### Initialize only what you need

```bash
# Single target
bkit-doctor init --target docs-report

# Multiple targets
bkit-doctor init --targets hooks-json,agents-core

# Combined with dry-run
bkit-doctor init --target skills-core --dry-run
```

### Safe overwrite with backup

```bash
bkit-doctor init --overwrite --backup
# Backs up to .bkit-doctor/backups/<timestamp>/
# then overwrites with fresh scaffold content
```

### Typo detection

```bash
bkit-doctor init --target docs-reprot
# [bkit-doctor] unknown targets:
#   - docs-reprot  (did you mean: docs-report?)
# available targets: claude-root, hooks-json, ...
```

---

## Architecture Overview

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI entry point (commander)
│   │   └── commands/
│   │       ├── check.js          # check command
│   │       ├── init.js           # init command
│   │       └── version.js        # version command
│   ├── core/
│   │   └── checker.js            # CheckerRunner
│   ├── checkers/                 # diagnostic checkers (structure, config, agents...)
│   │   └── shared/fileRules.js
│   ├── check/
│   │   ├── resultModel.js        # CheckResult type
│   │   └── formatters/
│   ├── init/
│   │   ├── scaffoldManifest.js   # what to create
│   │   ├── fileTemplates.js      # minimal file content
│   │   ├── targetRegistry.js     # target names + validation + typo hints
│   │   ├── buildInitPlan.js      # plan computation (read-only)
│   │   └── applyInitPlan.js      # plan execution (write / backup / dry-run)
│   ├── backup/                   # backup session management
│   └── shared/
│       └── remediationMap.js     # checker id → initTarget mapping
└── docs/
    ├── 01-plan/
    ├── 02-design/
    ├── 03-task/
    └── 04-report/
```

---

## Phase-Based Workflow

Every feature in bkit-doctor was built using a four-document phase model:

| Phase | Document | Purpose |
|-------|----------|---------|
| Plan | `phase-XX.plan.md` | Scope, goals, risks, completion criteria |
| Design | `phase-XX.design.md` | Architecture, decisions, tradeoffs |
| Task | `phase-XX.task.md` | Implementation checklist, verification results |
| Report | `phase-XX.report.md` | Outcomes, decisions made, next steps |

This model ensures that every change is intentional, documented, and traceable. It also makes AI-assisted development significantly more reliable — the AI always has structured context to work from.

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request to discuss your proposed change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Ideally, follow the phase-based workflow: Plan → Design → Implement → Check
4. Submit a pull request with a clear description of what changed and why

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for full terms.

---

## Acknowledgements

- **[bkit](https://github.com/upstageai/bkit)** — for the workflow philosophy that inspired this project
- The open-source community — for the tools and patterns this project builds on
- Everyone who believes structured, intentional development produces better outcomes
