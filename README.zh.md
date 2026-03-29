# bkit-doctor

> 通过命令行诊断、搭建和维护 Claude Code 项目结构。

![npm version](https://img.shields.io/npm/v/bkit-doctor)
![license](https://img.shields.io/npm/l/bkit-doctor)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | **中文** | [Español](README.es.md)

---

## 什么是 bkit-doctor？

**bkit-doctor** 用于检查你的 Claude Code 项目是否具备正确的结构 — `.claude/` 目录、hooks、settings、agent 定义文件、skill 文件、模板、策略以及文档骨架 — 并自动修复缺失的部分。

你可以把它理解为 **Claude Code 项目结构的 ESLint**：它运行 14 项诊断检查，对每一项报告通过/警告/失败状态，并且可以通过一条命令自动搭建所有缺失内容。

```bash
npx bkit-doctor check          # diagnose your project
npx bkit-doctor fix --yes      # auto-fix everything
```

---

## 适用人群

- **所有 Claude Code 用户** — 验证项目是否具备 Claude Code 所需的结构（`.claude/`、`CLAUDE.md`、hooks、settings）
- **采用结构化 AI 工作流的团队** — 在几秒内搭建 agents、skills、模板、策略和 PDCA 文档
- **CI 流水线** — `bkit-doctor check` 在关键检查失败时以 exit code 1 退出，可用于部署门禁
- **bkit 用户** — 如果你遵循 [bkit](https://github.com/anthropics/bkit) 的 PDCA 工作流，bkit-doctor 可以验证并引导搭建完整环境

---

## 安装

```bash
# Run without installing (recommended for trying it out)
npx bkit-doctor check

# Install globally
npm install -g bkit-doctor

# Or add to your project as a dev dependency
npm install --save-dev bkit-doctor
```

需要 **Node.js >= 18**。

---

## 快速开始

```bash
# 1. Diagnose your project
bkit-doctor check

# 2. Auto-fix everything that's missing
bkit-doctor fix --yes

# 3. Verify — should now be HEALTHY
bkit-doctor check
```

---

## 命令

bkit-doctor 提供 7 个命令：

### `check` — 诊断项目结构

运行 14 项诊断检查，并对每一项报告通过/警告/失败状态。会保存推荐快照，供后续 `init --recommended` 或 `fix` 使用。

```bash
bkit-doctor check                    # check current directory
bkit-doctor check --path ./other     # check a different directory
```

Exit code：如果任何硬性检查失败则返回 **1**，否则返回 **0**。

### `init` — 搭建缺失文件

创建缺失的目录和文件。默认为非破坏性操作 — 除非显式传入 `--overwrite`，否则不会覆盖现有文件。

```bash
bkit-doctor init --recommended --yes      # apply recommendations from last check
bkit-doctor init --preset default --yes   # apply a preset bundle
bkit-doctor init --target hooks-json      # scaffold a single target
bkit-doctor init --targets agents-core,docs-core  # multiple targets
bkit-doctor init --recommended --dry-run  # preview without writing
bkit-doctor init --overwrite --backup     # overwrite with backup
```

### `fix` — 一键自动修复

`check` + `recommend` + `init` 的快捷方式。执行诊断、计算推荐方案并应用。

```bash
bkit-doctor fix --yes           # fix everything, no prompts
bkit-doctor fix --dry-run       # preview what would be fixed
bkit-doctor fix --fresh --yes   # ignore snapshot, recompute
```

### `preset` — 预定义搭建方案

preset 决定要搭建哪些目标，并影响生成文件的内容。

```bash
bkit-doctor preset list              # show available presets
bkit-doctor preset show default      # show preset details
bkit-doctor preset recommend         # recommend preset for current project
```

可用的 preset：

| Preset | 说明 | 目标数 |
|--------|------|--------|
| `default` | 完整结构（config + agents + skills + templates + policies + docs） | 8 targets |
| `lean` | 最小结构（config + agents） | 4 targets |
| `workflow-core` | 工作流结构（agents + skills + templates + policies） | 5 targets |
| `docs` | 仅文档（plan、design、task、report、changelog） | 1 target |

不同 preset 生成的内容有所不同：`default` 会生成详细的 agent 角色和 skill 描述；`lean` 会生成简洁的占位内容。

### `save` / `load` — 保存与共享设置

将你偏好的默认模式（recommended 或 preset）保存到本地或全局，之后可以重新应用或在多个项目间共享。

```bash
bkit-doctor save --local --recommended    # save preference locally
bkit-doctor save --global --preset lean   # save globally (all projects)
bkit-doctor save --both --preset default  # save to both

bkit-doctor load --local                  # re-apply saved settings
bkit-doctor load --global                 # apply global to current project
bkit-doctor load --file ./settings.json   # apply from a specific file
```

### `version` — 显示版本信息

```bash
bkit-doctor version       # version + platform details
bkit-doctor --version     # version number only
```

---

## 诊断项目（14项）

| 分类 | 检查项 | 严重程度 |
|------|--------|----------|
| structure | `.claude/` 目录存在 | **hard**（缺失则 exit 1） |
| config | `CLAUDE.md` 存在 | **hard**（缺失则 exit 1） |
| config | `.claude/hooks.json` 存在 | soft |
| config | `.claude/settings.local.json` 存在 | soft |
| docs | `docs/01-plan/` 至 `docs/04-report/`（4 项检查） | soft |
| agents | 4 个必需的 agent 定义文件 | soft |
| skills | 7 个必需的 SKILL.md 文件 | soft |
| policies | 4 个必需的 policy 文件 | soft |
| templates | 4 个必需的 template 文件 | soft |
| context | `.claude/context/` 目录 | soft |
| changelog | `CHANGELOG.md`（3 个候选路径） | soft |

**Hard 检查**会导致 `check` 以 exit code 1 退出。**Soft 检查**仅产生警告，exit code 为 0。

---

## CI 使用

`bkit-doctor check` 在关键结构缺失时返回 exit code 1，适合用作 CI 门禁：

```bash
# GitHub Actions example
- name: Check Claude Code project health
  run: npx bkit-doctor check --path .

# Shell script
bkit-doctor check || { echo "Project health check failed"; exit 1; }
```

---

## 可用的 init 目标

| Target | 创建内容 |
|--------|----------|
| `claude-root` | `.claude/` 根目录 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 下的 4 个 agent 定义文件 |
| `skills-core` | `.claude/skills/` 下的 7 个 skill SKILL.md 文件 |
| `templates-core` | `.claude/templates/` 下的 4 个文档模板 |
| `policies-core` | `.claude/policies/` 下的 4 个策略文件 |
| `docs-plan` | `docs/01-plan/` 目录 |
| `docs-design` | `docs/02-design/` 目录 |
| `docs-task` | `docs/03-task/` 目录 |
| `docs-report` | `docs/04-report/` 目录 |
| `docs-changelog` | `CHANGELOG.md` |
| `docs-core` | 全部文档（所有 `docs-*` 目标的合集） |

---

## 什么是 bkit？

[bkit](https://github.com/anthropics/bkit) 是一个基于 PDCA 的 Claude Code 开发工作流框架。它为 AI 原生开发提供结构化的阶段（Plan、Design、Do、Check、Report）、agent 团队和质量门禁。

**bkit-doctor 可以独立于 bkit 使用：**

| 功能 | 不使用 bkit | 使用 bkit |
|------|:---:|:---:|
| `check` — 项目结构诊断 | Yes | Yes |
| `init` — 搭建缺失文件 | Yes | Yes |
| `fix` — 自动修复 | Yes | Yes |
| `preset` — 工作流优化方案 | Partial | Full |
| `save` / `load` — 设置持久化 | Yes | Yes |

核心命令（`check`、`init`、`fix`）适用于任何 Claude Code 项目。preset 和高级搭建目标针对 bkit PDCA 工作流进行了优化。

---

## 架构

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

## 与 bkit 的关系

> **bkit-doctor 是一个独立项目。** 它不是 bkit 的官方插件，与 bkit 团队没有关联。

bkit-doctor 受到 [bkit](https://github.com/anthropics/bkit) 的启发 — 一个基于 PDCA 的 AI 原生开发工作流。作者通过 bkit 的资料学习了结构化 AI 协作方法，这些知识影响了本工具的设计。

bkit-doctor **不**包含 bkit 的代码，**不**依赖 bkit 运行，也**未**得到 bkit 团队的认可或维护。

---

## 贡献

欢迎贡献。请在提交 pull request 之前先创建 issue，讨论你计划进行的更改。

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 建议遵循基于阶段的工作流：Plan → Design → Implement → Check
4. 提交 pull request，并清楚描述更改的内容和原因

---

## 许可证

Apache License 2.0 — 完整条款请参阅 [LICENSE](LICENSE)。

---

## 致谢

- **[bkit](https://github.com/anthropics/bkit)** — 启发本项目的工作流理念
- 开源社区 — 本项目所依赖的工具和模式
