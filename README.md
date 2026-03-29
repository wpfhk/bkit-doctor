# bkit-doctor

> Diagnose, scaffold, and maintain your AI-assisted project structure from the command line.

![npm version](https://img.shields.io/npm/v/bkit-doctor)
![license](https://img.shields.io/npm/l/bkit-doctor)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

**English** | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## What is bkit-doctor?

When you build projects with AI coding tools — Claude Code, Cursor, Copilot, and others — project structure tends to drift. Context files go missing, documentation scaffolds are incomplete, and configuration gets out of sync. Over time, the AI loses the structured context it needs to be effective.

**bkit-doctor** diagnoses these structural issues and fixes them automatically. It checks whether your project has the right directories, config files, agent definitions, skill files, templates, policies, and documentation scaffolds — then scaffolds everything that's missing in one command.

Think of it as **ESLint for your project layout**: 14 diagnostic checks, pass/warn/fail for each item, and one-command auto-fix.

```bash
npx bkit-doctor check          # diagnose your project
npx bkit-doctor fix --yes      # auto-fix everything
```

bkit-doctor was built on the [bkit](https://github.com/popup-studio-ai/bkit-claude-code) PDCA workflow methodology, but works independently — no bkit installation required.

---

## Who is this for?

- **AI-assisted development users** — verify that your project has the structure AI coding tools expect (`.claude/`, `CLAUDE.md`, hooks, settings)
- **Teams adopting structured AI workflows** — scaffold agents, skills, templates, policies, and PDCA documentation in seconds
- **CI pipelines** — `bkit-doctor check` exits with code 1 on critical failures, so you can gate deployments on project health
- **bkit users** — if you follow the [bkit](https://github.com/popup-studio-ai/bkit-claude-code) PDCA workflow, bkit-doctor validates and bootstraps the full environment

---

## Installation

```bash
# Run without installing (recommended for trying it out)
npx bkit-doctor check

# Install globally
npm install -g bkit-doctor

# Or add to your project as a dev dependency
npm install --save-dev bkit-doctor
```

Requires **Node.js >= 18**.

### Run from source

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## Quick start

```bash
# 1. Diagnose your project
bkit-doctor check

# 2. Auto-fix everything that's missing
bkit-doctor fix --yes

# 3. Verify — should now be HEALTHY
bkit-doctor check
```

---

## Commands

bkit-doctor provides 7 commands:

### `check` — diagnose project structure

Runs 14 diagnostic checks and reports pass/warn/fail for each item. Saves a recommendation snapshot for subsequent `init --recommended` or `fix`.

```bash
bkit-doctor check                    # check current directory
bkit-doctor check --path ./other     # check a different directory
```

Exit code: **1** if any hard check fails, **0** otherwise.

### `init` — scaffold missing files

Creates missing directories and files. Non-destructive by default — existing files are never overwritten unless you explicitly pass `--overwrite`.

```bash
bkit-doctor init --recommended --yes      # apply recommendations from last check
bkit-doctor init --preset default --yes   # apply a preset bundle
bkit-doctor init --target hooks-json      # scaffold a single target
bkit-doctor init --targets agents-core,docs-core  # multiple targets
bkit-doctor init --recommended --dry-run  # preview without writing
bkit-doctor init --overwrite --backup     # overwrite with backup
```

### `fix` — one-command auto-remediation

Shortcut for `check` + `recommend` + `init`. Runs diagnosis, computes recommendations, and applies them.

```bash
bkit-doctor fix --yes           # fix everything, no prompts
bkit-doctor fix --dry-run       # preview what would be fixed
bkit-doctor fix --fresh --yes   # ignore snapshot, recompute
```

### `preset` — predefined scaffold bundles

Presets select which targets to scaffold and affect the generated file content.

```bash
bkit-doctor preset list              # show available presets
bkit-doctor preset show default      # show preset details
bkit-doctor preset recommend         # recommend preset for current project
```

Available presets:

| Preset | Description | Targets |
|--------|-------------|---------|
| `default` | Full structure (config + agents + skills + templates + policies + docs) | 8 targets |
| `lean` | Minimal structure (config + agents only) | 4 targets |
| `workflow-core` | Workflow structure (agents + skills + templates + policies) | 5 targets |
| `docs` | Documentation only (plan, design, task, report, changelog) | 1 target |

Content varies by preset: `default` generates detailed agent roles and skill descriptions; `lean` generates compact placeholders.

### `save` / `load` — persist and share settings

Save your preferred default mode (recommended or preset) locally or globally, and re-apply it later or share it across projects.

```bash
bkit-doctor save --local --recommended    # save preference locally
bkit-doctor save --global --preset lean   # save globally (all projects)
bkit-doctor save --both --preset default  # save to both

bkit-doctor load --local                  # re-apply saved settings
bkit-doctor load --global                 # apply global to current project
bkit-doctor load --file ./settings.json   # apply from a specific file
```

### `version` — display version info

```bash
bkit-doctor version       # version + platform details
bkit-doctor --version     # version number only
```

---

## What gets checked (14 items)

| Category | Check | Severity |
|----------|-------|----------|
| structure | `.claude/` directory exists | **hard** (exit 1 if missing) |
| config | `CLAUDE.md` exists | **hard** (exit 1 if missing) |
| config | `.claude/hooks.json` exists | soft |
| config | `.claude/settings.local.json` exists | soft |
| docs | `docs/01-plan/` through `docs/04-report/` (4 checks) | soft |
| agents | 4 required agent definition files | soft |
| skills | 7 required SKILL.md files | soft |
| policies | 4 required policy files | soft |
| templates | 4 required template files | soft |
| context | `.claude/context/` directory | soft |
| changelog | `CHANGELOG.md` (3 candidate paths) | soft |

**Hard checks** cause `check` to exit with code 1. **Soft checks** produce warnings but exit 0.

---

## CI usage

`bkit-doctor check` returns exit code 1 when critical structure is missing, making it suitable for CI gates:

```yaml
# GitHub Actions
- name: Check project structure
  run: npx bkit-doctor check
```

```bash
# Shell script
bkit-doctor check || { echo "Structure check failed"; exit 1; }
```

Exit code behavior:
- **Hard FAIL** (`.claude/` or `CLAUDE.md` missing) → exit 1, CI fails
- **Soft FAIL** (warnings only) → exit 0, CI passes

---

## Available init targets

| Target | What it creates |
|--------|----------------|
| `claude-root` | `.claude/` root directory |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 agent definition files under `.claude/agents/` |
| `skills-core` | 7 skill SKILL.md files under `.claude/skills/` |
| `templates-core` | 4 document templates under `.claude/templates/` |
| `policies-core` | 4 policy files under `.claude/policies/` |
| `docs-plan` | `docs/01-plan/` directory |
| `docs-design` | `docs/02-design/` directory |
| `docs-task` | `docs/03-task/` directory |
| `docs-report` | `docs/04-report/` directory |
| `docs-changelog` | `CHANGELOG.md` |
| `docs-core` | All docs (alias for all `docs-*` targets) |

---

## What is bkit?

[bkit](https://github.com/popup-studio-ai/bkit-claude-code) is a PDCA-based development workflow framework for Claude Code. It provides structured phases (Plan, Design, Do, Check, Report), agent teams, and quality gates for AI-native development.

**bkit-doctor works with or without bkit:**

| Capability | Without bkit | With bkit |
|------------|:---:|:---:|
| `check` — project structure diagnosis | Yes | Yes |
| `init` — scaffold missing files | Yes | Yes |
| `fix` — auto-remediation | Yes | Yes |
| `preset` — workflow-optimized bundles | Partial | Full |
| `save` / `load` — settings persistence | Yes | Yes |

The core commands (`check`, `init`, `fix`) are useful for any AI-assisted project. Presets and advanced scaffolding targets are optimized for the bkit PDCA workflow.

Learn more about bkit: https://github.com/popup-studio-ai/bkit-claude-code

---

## Architecture

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

## Relationship with bkit

> **bkit-doctor is an independent project.** It is not an official bkit plugin and has no affiliation with the bkit team.

bkit-doctor was inspired by [bkit](https://github.com/popup-studio-ai/bkit-claude-code) — a PDCA-based AI-native development workflow. The author learned structured AI collaboration through bkit's materials, and that knowledge shaped this tool's design.

bkit-doctor does **not** include bkit code, does **not** require bkit to function, and is **not** endorsed or maintained by the bkit team.

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

- **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** — for the workflow philosophy that inspired this project
- The open-source community — for the tools and patterns this project builds on

---

> **Disclaimer**: This is an independent community tool, not an official POPUP STUDIO product. "bkit" is a trademark of POPUP STUDIO PTE. LTD.
