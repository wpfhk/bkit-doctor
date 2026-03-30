# bkit-doctor

> Diagnose, scaffold, and maintain your AI-assisted project structure from the command line.

[![npm version](https://img.shields.io/badge/npm-v1.1.0-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](https://github.com/dotoricode/bkit-doctor/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

**English** | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## What is bkit-doctor?

When you build projects with AI coding tools — Claude Code, Cursor, Copilot, and others — project structure tends to drift. Context files go missing, documentation scaffolds are incomplete, and configuration gets out of sync. Over time, the AI loses the structured context it needs to be effective.

**bkit-doctor** diagnoses these structural issues and fixes them automatically. It checks whether your project has the right directories, config files, agent definitions, skill files, templates, policies, and documentation scaffolds — then scaffolds everything that's missing in one command.

Think of it as **ESLint for your project layout**: 16 diagnostic checks, pass/warn/fail for each item, and one-command auto-fix.

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

## Quick Start: Setting Up a New Project with bkit

> bkit-doctor alone is useful, but pairing it with [bkit](https://github.com/popup-studio-ai/bkit-claude-code) unlocks the full PDCA workflow, 31 agents, and 36 skills inside Claude Code.

### Step 1 — Scaffold your project structure with bkit-doctor

Run the following inside your new project directory.

```bash
# 1. Diagnose (most items will warn/fail on a fresh project — that's expected)
npx bkit-doctor check

# 2. Auto-generate the missing structure
npx bkit-doctor init --preset default --yes

# 3. Re-diagnose and confirm HEALTHY status
npx bkit-doctor check
```

After this step, your project will have the following **directory and file skeleton**:

```
your-project/
├── .claude/
│   ├── hooks.json
│   ├── settings.local.json
│   ├── agents/          ← agent definition files (placeholders)
│   ├── skills/          ← skill files (placeholders)
│   ├── templates/       ← document templates
│   └── policies/        ← policy files
├── docs/
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-task/
│   └── 04-report/
├── CLAUDE.md
└── CHANGELOG.md
```

> **This is a skeleton.** The files inside `.claude/agents/` and `.claude/skills/` are placeholders. The actual bkit agent and skill logic is not included yet — that comes in the next step.

### Step 2 — Install the bkit plugin into Claude Code

bkit's actual capabilities — PDCA workflow, CTO agent teams, quality gates, and more — run as a **Claude Code plugin**. Open Claude Code and run:

```
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

Once installed, Claude Code saves the plugin at `~/.claude/plugins/bkit/`. From this point on, bkit's 36 skills and 31 agents are automatically active in every project.

### Step 3 — Start your first development session

In Claude Code with the bkit plugin installed, kick off the PDCA workflow:

```
# Start planning a new feature (e.g. login)
/pdca plan login-feature

# Generate a design document
/pdca design login-feature

# Implement
/pdca do login-feature

# Verify and gap-analyze
/pdca analyze login-feature
```

Documents are written into the `docs/` directory structure that bkit-doctor created.

### How the two tools relate

```
bkit-doctor                       bkit (Claude Code plugin)
──────────────────────────        ──────────────────────────────────
Creates project skeleton          Powers the AI workflow engine
.claude/ directory structure      36 skills / 31 agents
docs/ document layout             PDCA state machine
hooks.json configuration          Quality gates / audit logging
CLAUDE.md context file            CTO-Led Agent Teams
```

bkit-doctor is a **one-time setup tool**. After that, bkit handles everything inside Claude Code.

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

**Updating to the latest version:**

```bash
npm update -g bkit-doctor
# or
npm install -g bkit-doctor@latest
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

## Commands

bkit-doctor provides 13 commands:

### `check` — diagnose project structure

Runs 16 diagnostic checks and reports pass/warn/fail for each item. Saves a recommendation snapshot for subsequent `init --recommended` or `fix`.

```bash
bkit-doctor check                    # check current directory
bkit-doctor check --path ./other     # check a different directory
```

Exit code: **1** if any hard check fails, **0** otherwise.

**Example output:**

```
[bkit-doctor] target: /path/to/project

──── categories ────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ✓ docs        4 pass

──── details ───────────────────────────
[FAIL] structure.claude-root — .claude/ missing
[WARN] config.hooks-json — .claude/hooks.json missing
[PASS] docs.plan — docs/01-plan exists

14 total — PASS 8 / WARN 4 / FAIL 2   status: FAILED

──── recommendations ───────────────────
  bkit-doctor init --targets claude-root,hooks-json,...
```

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

### `pdca` — generate PDCA guide document

Generate a structured PDCA (Plan-Do-Check-Act) guide document for any topic. The output is a Markdown file with actionable placeholders ready for editing.

```bash
bkit-doctor pdca "Deploy Approval Criteria"              # generate guide
bkit-doctor pdca "Payment Failure Response" --stdout     # print to terminal
bkit-doctor pdca "Ops Checklist" --overwrite             # overwrite existing
bkit-doctor pdca "Release Checklist" -o docs/custom.md   # custom output path
bkit-doctor pdca "Login Feature" --type feature --owner alice --priority P0
```

**Default output path:** `output/pdca/<slug>-pdca-guide.md`

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --path <dir>` | Project root directory | `cwd` |
| `-o, --output <file>` | Custom output file path | — |
| `--stdout` | Print to stdout instead of writing a file | — |
| `--overwrite` | Overwrite existing file | — |
| `--type <kind>` | `guideline` / `feature` / `bugfix` / `refactor` | `guideline` |
| `--owner <name>` | Owner name | `TBD` |
| `--priority <level>` | Priority (`P0` / `P1` / `P2` / `P3`) | `P1` |

**Scope:** Template-based generation. No AI generation. For a stage-by-stage workflow, use the sub-commands below.

> For a complete walkthrough, see the [PDCA Tutorial](docs/tutorials/pdca-guide.md).

### `pdca-plan` / `pdca-do` / `pdca-check` / `pdca-report` — stage documents

Generate one document per PDCA stage and fill it in over time. Stage documents track state in `.bkit-doctor/pdca-state.json`.

```bash
bkit-doctor pdca-plan "User Auth" --type feature --owner alice --priority P1
bkit-doctor pdca-do "User Auth"
bkit-doctor pdca-check "User Auth"
bkit-doctor pdca-report "User Auth"
```

Each command outputs a separate file under `output/pdca/`:

```
output/pdca/
├── user-auth-pdca-plan.md
├── user-auth-pdca-do.md
├── user-auth-pdca-check.md
└── user-auth-pdca-report.md
```

All stage commands accept the same options as `pdca` (`--type`, `--owner`, `--priority`, `--output`, `--stdout`, `--dry-run`, `--overwrite`).

### `pdca-list` — list generated PDCA documents

Show all PDCA topics tracked under the current project.

```bash
bkit-doctor pdca-list
bkit-doctor pdca-list --path ./other-project
```

### `version` — display version info

```bash
bkit-doctor version       # version + platform details
bkit-doctor --version     # version number only
```

---

## What gets checked (16 items)

| Category | Check | Severity |
|----------|-------|----------|
| structure | `.claude/` directory exists | **hard** (exit 1 if missing) |
| config | `CLAUDE.md` exists | **hard** (exit 1 if missing) |
| config | `.claude/hooks.json` exists | soft |
| config | `.claude/settings.local.json` exists | soft |
| docs | `output/pdca/` PDCA guide output directory exists | soft |
| docs | `output/pdca/` has at least 1 guide with Meta/Plan/Do/Check/Act sections | soft |
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
| `docs-pdca` | `output/pdca/` PDCA guide output directory |
| `docs-core` | All docs (alias for all `docs-*` targets) |

---

## FAQ

**Q: I ran `init --preset default` but bkit features aren't working.**

A: bkit-doctor creates the **file structure** for your project. bkit's actual features — PDCA workflow, agents, skills — run as a **Claude Code plugin** and must be installed separately. Open Claude Code and run:

```
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

**Q: Files appeared in `.claude/agents/` — are these the bkit agents?**

A: No. The agent files bkit-doctor generates are **placeholders**. bkit's actual 31 agents live inside the Claude Code plugin (`~/.claude/plugins/bkit/agents/`). The placeholder files bkit-doctor creates are useful as a reference when writing your own custom agents.

**Q: Do I need to install bkit?**

A: No. bkit-doctor is a standalone CLI tool and works without bkit. If you want to use bkit's `/pdca` workflow commands and agent teams, install the bkit plugin into Claude Code.

**Q: Will it overwrite my existing files?**

A: Not by default. You must explicitly pass `--overwrite`. Combine it with `--backup` to back up existing files before overwriting.

**Q: How can I preview what will be created?**

A: Use `--dry-run`. Nothing is written to disk.

```bash
bkit-doctor init --recommended --dry-run
bkit-doctor fix --dry-run
```

**Q: Can I use this in CI?**

A: Yes. `check` returns exit code 1 when core structure is missing, so it works as a CI gate.

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
| `/pdca` workflow commands | No | Yes |
| 31 agents / 36 skills | No | Yes |
| PDCA quality gates / audit logging | No | Yes |

The core commands (`check`, `init`, `fix`) are useful for any AI-assisted project. Presets and advanced scaffolding targets are optimized for the bkit PDCA workflow.

Learn more about bkit: https://github.com/popup-studio-ai/bkit-claude-code

---

## Architecture

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI entry point (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, pdca, pdca-*, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — registers and runs diagnostics
│   ├── checkers/                 # 16 diagnostic modules
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
├── tests/                        # 226 tests (node:test)
├── scripts/
│   └── verify-release.js         # 45-check release verification
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
