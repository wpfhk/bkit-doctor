# bkit-doctor

> 从命令行诊断、搭建和维护 Claude Code 项目结构。

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.7.0-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | **中文** | [Español](README.es.md)

---

## 什么是 bkit-doctor？

**bkit-doctor** 检查你的 Claude Code 项目是否具备正确的结构 — `.claude/` 目录、hooks、settings、agent 定义、skill 文件、模板、策略和文档脚手架 — 并自动修复缺失的部分。

可以把它理解为 **Claude Code 项目布局的 ESLint**：它运行 14 项诊断检查，为每一项报告 pass/warn/fail 状态，并能通过一条命令搭建所有缺失的内容。

```bash
npx bkit-doctor check          # 诊断你的项目
npx bkit-doctor fix --yes      # 自动修复全部问题
```

---

## 适用人群

- **所有 Claude Code 用户** — 验证项目是否具备 Claude Code 所需的结构（`.claude/`、`CLAUDE.md`、hooks、settings）
- **采用结构化 AI 工作流的团队** — 在几秒内搭建 agent、skill、模板、策略和 PDCA 文档
- **CI 流水线** — `bkit-doctor check` 在关键检查失败时返回 exit code 1，可用作部署门禁
- **bkit 用户** — 如果你遵循 [bkit](https://github.com/anthropics/bkit) PDCA 工作流，bkit-doctor 可以验证并引导完整环境

---

## 解决什么问题？

正确搭建一个 Claude Code 项目意味着需要创建正确的目录、配置文件、agent 定义、skill 文件和文档脚手架。手动完成这些工作既繁琐又容易出错。遗漏一个文件就可能导致 hooks 失效、skill 被禁用，或 AI 助手丢失上下文。

**bkit-doctor** 将这一切自动化：

- **诊断** — 即时查看哪些已存在、哪些缺失、哪些需要关注
- **推荐** — 根据当前状态自动建议需要初始化的目标
- **修复** — 通过一条命令搭建正确的结构，不会覆盖已有内容
- **预览** — 在写入磁盘之前查看将要发生的变更（`--dry-run`）
- **验证** — 在 CI 中运行，确保项目结构持续保持健康

---

## 什么是 bkit？

[bkit](https://github.com/anthropics/bkit) 是一个面向 Claude Code 的 PDCA 开发工作流框架。它提供结构化阶段（Plan、Design、Do、Check、Report）、agent 团队以及 AI 原生开发的质量门禁。

**bkit-doctor 可以独立于 bkit 使用：**

| 功能 | 无 bkit | 有 bkit |
|------|:---:|:---:|
| `check` — 项目结构诊断 | Yes | Yes |
| `init` — 搭建缺失文件 | Yes | Yes |
| `fix` — 自动修复 | Yes | Yes |
| `preset` — 工作流优化套件 | 部分 | 全部 |
| `save` / `load` — 设置持久化 | Yes | Yes |

核心命令（`check`、`init`、`fix`）适用于任何 Claude Code 项目。Preset 和高级搭建目标针对 bkit PDCA 工作流进行了优化。

---

## 功能

| 功能 | 描述 |
|------|------|
| `check` | 诊断项目环境 — 每项结果为 pass / warn / fail |
| `init` | 以非破坏性方式创建缺失的目录和文件 |
| `fix` | 一键自动修复（check + recommend + init） |
| `preset` | 应用预定义套件（`default`、`lean`、`docs`） |
| `save` / `load` | 保存和共享团队设置 |
| 推荐功能 | check 后自动建议需要运行的 `init` 目标 |
| 目标分组 | 相关目标自动合并（例如 `docs-core` = 所有 docs 目录） |
| 快照缓存 | `check` 缓存结果；`init --recommended` 复用缓存 |
| `--dry-run` | 不修改文件系统，仅预览变更 |
| `--yes / -y` | 跳过确认提示（CI 友好） |
| `--overwrite` / `--backup` | 带备份的安全文件替换 |
| 拼写提示 | 目标名称拼写错误时提示 `did you mean: docs-report?` |
| Exit codes | 关键检查失败时返回 exit 1（CI 流水线集成） |
| 跨平台 | 支持 macOS 和 Windows |

---

## 诊断项目（14项）

| 类别 | 检查项 | 严重度 |
|------|--------|--------|
| structure | `.claude/` 目录存在 | **hard**（缺失时 exit 1） |
| config | `CLAUDE.md` 存在 | **hard**（缺失时 exit 1） |
| config | `.claude/hooks.json` 存在 | soft |
| config | `.claude/settings.local.json` 存在 | soft |
| docs | `docs/01-plan/` 至 `docs/04-report/`（4 项检查） | soft |
| agents | 4 个必需的 agent 定义文件 | soft |
| skills | 7 个必需的 SKILL.md 文件 | soft |
| policies | 4 个必需的策略文件 | soft |
| templates | 4 个必需的模板文件 | soft |
| context | `.claude/context/` 目录 | soft |
| changelog | `CHANGELOG.md`（3 个候选路径） | soft |

**Hard 检查**会导致 `check` 以 exit code 1 退出。**Soft 检查**仅产生警告，以 exit 0 退出。

---

## 与 bkit 的关系

> **bkit-doctor 是一个独立项目。** 它不是 bkit 的官方插件，与 bkit 团队没有隶属关系。

bkit-doctor 受到 [bkit](https://github.com/anthropics/bkit) — 基于 PDCA 的 AI 原生开发工作流的启发。作者通过 bkit 的资料学习了结构化 AI 协作，这些知识直接影响了本工具的设计。

bkit-doctor **不包含** bkit 代码，**不依赖** bkit 运行，也**不由** bkit 团队认可或维护。它被设计为可与 bkit 风格的工作流配合使用。

---

## 致谢

特别感谢 **bkit 项目**所带来的工作流理念。Plan、Design、Do、Check 的清晰性 — 以及 AI 协作在结构化上下文中效果最佳的理念 — 直接影响了 bkit-doctor 的设计。

---

## 安装

### 系统要求

- Node.js >= 18.0.0
- npm

### 全局安装

```bash
npm install -g bkit-doctor
```

### 从源码运行

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## 使用方法

```bash
bkit-doctor <command> [options]
```

### 快速入门

```bash
# 诊断 Claude Code 项目结构
bkit-doctor check

# 自动修复所有缺失项
bkit-doctor fix --yes

# 分步操作：先预览，再应用
bkit-doctor init --recommended --dry-run
bkit-doctor init --recommended --yes

# 仅初始化特定部分
bkit-doctor init --target hooks-json --target skills-core

# 在 CI 中使用（关键检查失败时 exit 1）
bkit-doctor check --path ./my-project
```

---

## 命令

### `check`

诊断当前目录（或指定目录）的环境。
诊断完成后，`check` 会保存推荐快照，
`init --recommended` 可以直接复用结果而无需重新运行检查。

```
bkit-doctor check [options]

Options:
  -p, --path <dir>   目标目录（默认：当前目录）
```

**输出示例：**

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

每一项检查结果为 `pass`、`warn` 或 `fail`。推荐部分展示哪些 `init` 目标能解决问题，并将相关目标分组（例如所有 `docs-*` → `docs-core`）。

---

### `init`

搭建缺失的文件和目录。默认为非破坏性操作 — 除非你明确要求，否则不会覆盖已有文件。

应用之前，`init` 会显示计划摘要并询问 `Continue? (y/N)`。
使用 `--dry-run` 进行预览，或使用 `--yes` 跳过确认。

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       目标目录（默认：当前目录）
  --dry-run              仅显示计划，不写入任何内容
  --recommended          根据当前项目状态自动选择目标
  --fresh                强制重新计算推荐（忽略快照）
  -y, --yes              跳过确认提示，立即应用
  --target <name>        仅应用特定目标（可重复使用）
  --targets <list>       应用多个目标，以逗号分隔
  --overwrite            允许覆盖已有文件
  --backup               覆盖前备份已有文件
  --backup-dir <dir>     自定义备份目录
```

#### 可用的 init 目标

| 目标 | 创建内容 |
|------|----------|
| `claude-root` | `.claude/` 根目录 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 下的 4 个 agent 定义文件 |
| `skills-core` | `.claude/skills/` 下的 6 个 skill SKILL.md 文件 |
| `templates-core` | `.claude/templates/` 下的 4 个文档模板 |
| `policies-core` | `.claude/policies/` 下的 4 个策略文件 |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | 所有 docs（所有 `docs-*` 目标的别名） |

---

### `fix`

一键自动修复。运行 `check`，计算推荐，然后应用。

```
bkit-doctor fix [options]

Options:
  -p, --path <dir>   目标目录（默认：当前目录）
  --dry-run          仅显示计划，不写入任何内容
  --fresh            强制重新计算（忽略快照）
  -y, --yes          跳过确认提示
```

### `preset`

应用预定义的脚手架套件。

```bash
bkit-doctor preset list              # 显示可用的 preset 列表
bkit-doctor preset show default      # 显示 preset 详情
bkit-doctor preset recommend         # 为当前项目推荐 preset
bkit-doctor init --preset lean --yes # 应用 preset
```

### `save` / `load`

保存和共享默认设置。

```bash
bkit-doctor save --local --recommended    # 本地保存设置
bkit-doctor save --global --preset lean   # 全局保存设置
bkit-doctor load --local                  # 重新应用已保存的设置
bkit-doctor load --global                 # 将全局设置应用到当前项目
```

### `version`

显示版本和平台信息。

```bash
bkit-doctor version
```

---

## 示例

```bash
# 诊断 → 自动修复 → 验证
bkit-doctor check                          # 查看缺失项
bkit-doctor fix --yes                      # 修复全部
bkit-doctor check                          # 验证：应为 HEALTHY 状态

# 应用前预览
bkit-doctor init --recommended --dry-run   # 查看将要变更的内容
bkit-doctor init --recommended --yes       # 应用

# 选择性搭建
bkit-doctor init --target hooks-json       # 仅单个目标
bkit-doctor init --targets hooks-json,docs-core  # 多个目标

# 带备份的安全覆盖
bkit-doctor init --overwrite --backup      # 备份到 .bkit-doctor/backups/

# CI 流水线集成
bkit-doctor check --path ./my-project && echo "healthy" || echo "needs fix"

# 团队设置工作流
bkit-doctor save --global --preset default # 团队负责人保存标准配置
bkit-doctor load --global                  # 团队成员应用配置
```

---

## 架构概览

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI 入口（commander）
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — 注册并运行诊断
│   ├── checkers/                 # 14 个诊断模块（structure, config, docs, agents...）
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFile 工具函数
│   ├── check/
│   │   ├── resultModel.js        # CheckResult 类型
│   │   ├── formatters/           # 终端输出渲染器
│   │   └── recommendations/      # 推荐引擎 + 快照缓存
│   ├── init/                     # 脚手架清单、计划构建器、应用逻辑
│   ├── fix/                      # resolveFixTargets — 快照感知修复
│   ├── preset/                   # preset 评分 + 推荐
│   ├── config/                   # 设置保存/加载（local + global）
│   ├── backup/                   # 备份会话管理
│   └── shared/
│       └── remediationMap.js     # checker id → initTarget 映射
├── tests/                        # 167 个测试（node:test）
├── scripts/
│   └── verify-release.js         # 38 项发布验证
└── docs/                         # PDCA 阶段文档（plan, design, task, report）
```

---

## 开发方法论

本项目使用其自身推广的 PDCA 工作流构建。每个功能在 `docs/` 中都有 Plan、Design、Task 和 Report 文档。这确保了每次变更都是有意为之、有据可查且可追溯的。

---

## 贡献

欢迎贡献。请在提交 Pull Request 之前先开一个 Issue 来讨论你的修改方案。

1. Fork 仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 建议遵循阶段式工作流：Plan → Design → Implement → Check
4. 提交 Pull Request，并清晰描述变更内容和原因

---

## 许可证

Apache License 2.0 — 完整条款请参阅 [LICENSE](LICENSE)。

---

## 致谢

- **[bkit](https://github.com/anthropics/bkit)** — 本项目的灵感来源：工作流理念
- 开源社区 — 本项目所依赖的工具和模式
