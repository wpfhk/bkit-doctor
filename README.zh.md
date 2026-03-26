# bkit-doctor

> ⚠️ **开发中** — 本项目正在积极开发中。

> 用于诊断、初始化和维护 bkit 风格项目环境的 CLI 工具。

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.5.8-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/wpfhak/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | **中文** | [Español](README.es.md)

---

## 简介

**bkit-doctor** 是一个命令行工具，帮助您在任何项目中轻松建立和维护 bkit 风格的工作流环境。它可以诊断当前项目结构，报告缺失或错误配置的内容，并以安全、非破坏性的方式自动生成缺失的文件。

这个项目本身就是使用它所推广的阶段式工作流构建的。每个功能都经过 Plan → Design → Do → Check 方法论的计划、设计、实现和验证。

---

## 为什么需要这个项目

采用结构化的 AI 原生开发工作流虽然能带来强大的生产力，但入门可能令人望而却步。手动设置正确的目录结构、代理定义、技能文件、模板和策略文件既繁琐又容易出错。

**bkit-doctor** 的存在就是为了降低这个门槛：

- **诊断** — 立即查看项目中有什么、缺少什么、需要什么
- **推荐** — 诊断后自动建议要运行的 init 目标
- **初始化** — 在数秒内生成所需结构，而不覆盖任何已有文件
- **目标指定** — 一次只应用所需的部分
- **预览** — 在任何文件被写入之前，查看将会发生什么变化
- **确认** — 在应用前审查并批准计划

这个工具源于一个简单的想法：*工作流应该容易进入，而不仅仅是进入后容易使用。*

---

## 功能

| 功能 | 说明 |
|------|------|
| `check` | 诊断项目环境 — 每个项目显示 pass / warn / fail |
| 推荐功能 | check 后自动建议要运行的 `init` 目标 |
| 目标分组 | 自动合并相关目标（例如 `docs-core`） |
| 快照缓存 | `check` 保存推荐快照；`init --recommended` 重用它 |
| `init` | 非破坏性地生成缺失的目录和文件 |
| `--recommended` | 根据当前项目状态自动选择 init 目标 |
| `--dry-run` | 不修改文件系统，只输出生成计划 |
| `--yes / -y` | 跳过确认提示，立即应用 |
| `--fresh` | 强制重新计算推荐，忽略缓存 |
| `--target` | 只应用特定目标（可重复使用） |
| `--targets` | 用逗号分隔一次应用多个目标 |
| `--overwrite` | 需要时覆盖现有文件 |
| `--backup` | 覆盖前备份现有文件 |
| 确认提示 | 显示应用计划并等待 `Continue? (y/N)` |
| 错别字检测 | 提供 `did you mean: docs-report?` 提示 |
| 跨平台 | 支持 macOS 和 Windows |

---

## 工作流理念

bkit-doctor 基于**阶段式开发模型**构建：

```
PM → PLAN → DESIGN → DO → CHECK → REPORT
```

每个阶段生成一个文档。每个文档存储在可预测的位置。每项工作都可以从需求追踪到实现再到验证。

---

## 与 bkit 的关系

> **bkit-doctor 是一个独立项目。它不是 bkit 的官方插件，与 bkit 项目没有官方关联。**

bkit-doctor **受到 bkit 的启发** — 一个强大的 AI 原生开发工作流工具包。

bkit-doctor：

- **不包含** bkit 代码
- **不需要** bkit 即可运行
- **未获得** bkit 团队的认可或维护
- 设计为与 bkit 风格的工作流配合使用，而不是替代或扩展 bkit 本身

---

## 安装

### 要求

- Node.js >= 18.0.0
- npm

### 全局安装

```bash
npm install -g bkit-doctor
```

### 从源码运行

```bash
git clone https://github.com/wpfhak/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## 使用方法

```bash
bkit-doctor <command> [options]
```

### 快速开始

```bash
# 诊断项目的 bkit 环境
bkit-doctor check

# 应用基于 check 结果的推荐目标（有快照时重用）
bkit-doctor init --recommended

# 预览 init --recommended 的效果
bkit-doctor init --recommended --dry-run

# 初始化完整结构（带确认提示）
bkit-doctor init

# 跳过确认，立即应用
bkit-doctor init --yes

# 只初始化特定部分
bkit-doctor init --target hooks-json --target skills-core
```

---

## 命令

### `check`

诊断当前目录（或指定目录）的 bkit 环境。
诊断后，`check` 保存推荐快照，这样
`init --recommended` 可以在不重新运行所有检查的情况下重用结果。

```
bkit-doctor check [options]

Options:
  -p, --path <dir>   目标目录（默认：当前目录）
```

**输出示例：**

```
[bkit-doctor] 诊断目标: /path/to/project

──── 分类 ──────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ! docs        4 warn
  ...

──── 详情 ──────────────────────────────
[FAIL] structure.claude-root — .claude/ missing
  → run: bkit-doctor init --target claude-root
...

共 14 项 — PASS 0 / WARN 12 / FAIL 2   状态: FAILED

──── 推荐 ──────────────────────────────
  8 个推荐目标（基于 14 个问题）

  • claude-root — 创建 .claude/ 根目录
  • hooks-json  — 创建默认 hooks.json 文件
  • docs-core   — 创建所有 docs/ 脚手架
    (covers: docs-plan, docs-design, docs-task, docs-report, docs-changelog)

  推荐的下一步:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core

  先预览:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core --dry-run
```

---

### `init`

生成缺失的文件和目录。默认非破坏性 — 除非明确要求，否则绝不覆盖现有文件。

应用前，`init` 显示计划摘要并等待 `Continue? (y/N)`。
使用 `--dry-run` 预览而不写入，或使用 `--yes` 跳过确认。

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       目标目录（默认：当前目录）
  --dry-run              显示计划但不写入任何内容
  --recommended          根据当前项目状态自动选择目标
  --fresh                强制重新计算推荐（忽略快照）
  -y, --yes              跳过确认提示，立即应用
  --target <name>        只应用特定目标（可重复使用）
  --targets <list>       应用多个目标，逗号分隔
  --overwrite            允许覆盖现有文件
  --backup               覆盖前备份现有文件
  --backup-dir <dir>     自定义备份目录
```

#### 可用的 init 目标

| 目标 | 创建内容 |
|------|---------|
| `claude-root` | `.claude/` 根目录 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 下的 4 个代理定义文件 |
| `skills-core` | `.claude/skills/` 下的 6 个技能 SKILL.md 文件 |
| `templates-core` | `.claude/templates/` 下的 4 个文档模板 |
| `policies-core` | `.claude/policies/` 下的 4 个策略文件 |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | 所有 docs（所有 `docs-*` 目标的别名） |

---

### `version`

显示版本和平台信息。

```bash
bkit-doctor version
```

---

## 示例

### check 后应用推荐

```bash
# 1. 诊断 — 保存推荐快照
bkit-doctor check

# 2. 使用缓存快照应用推荐目标
bkit-doctor init --recommended

# 先预览
bkit-doctor init --recommended --dry-run

# 强制重新计算（忽略缓存快照）
bkit-doctor init --recommended --fresh
```

### 预览初始化（不写入任何内容）

```bash
bkit-doctor init --dry-run
```

### 应用前确认

```bash
bkit-doctor init --targets hooks-json,docs-core

# Apply?
#   targets      : hooks-json, docs-core
#   mkdir        : 1
#   create       : 6
#   skip         : 0
#
# Continue? (y/N) y
```

### 跳过确认（CI / 自动化）

```bash
bkit-doctor init --yes
bkit-doctor init --recommended --yes
```

### 只初始化需要的部分

```bash
bkit-doctor init --target docs-report
bkit-doctor init --targets hooks-json,agents-core
bkit-doctor init --target skills-core --dry-run
```

### 带备份的安全覆盖

```bash
bkit-doctor init --overwrite --backup
# 备份到 .bkit-doctor/backups/<timestamp>/
# 然后用新脚手架内容覆盖
```

### 错别字检测

```bash
bkit-doctor init --target docs-reprot
# [bkit-doctor] unknown targets:
#   - docs-reprot  (did you mean: docs-report?)
```

---

## 架构概述

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js                     # CLI 入口点 (commander)
│   │   └── commands/
│   │       ├── check.js                 # check 命令 + 快照保存
│   │       ├── init.js                  # init 命令 (confirm / recommended / snapshot)
│   │       └── version.js
│   ├── core/
│   │   └── checker.js                   # CheckerRunner
│   ├── checkers/                        # 诊断模块 (structure, config, agents...)
│   │   └── shared/fileRules.js
│   ├── check/
│   │   ├── resultModel.js               # CheckResult 类型
│   │   ├── formatters/
│   │   │   └── defaultFormatter.js      # 终端输出 + 分组推荐渲染
│   │   └── recommendations/
│   │       ├── recommendationModel.js   # Recommendation 类型
│   │       ├── buildRecommendations.js  # warn/fail → 去重 + 优先级排序
│   │       ├── groupingRegistry.js      # 父/子分组策略
│   │       ├── groupRecommendations.js  # 原始 → 分组推荐
│   │       ├── buildSuggestedFlow.js    # Recommendation[] → SuggestedFlow
│   │       ├── suggestedFlowModel.js    # SuggestedFlow 类型
│   │       ├── computeRecommendations.js# async: 运行检查 → 分组推荐
│   │       ├── recommendationSnapshotModel.js
│   │       ├── buildRecommendationFingerprint.js
│   │       ├── saveRecommendationSnapshot.js
│   │       ├── loadRecommendationSnapshot.js
│   │       └── validateRecommendationSnapshot.js
│   ├── init/
│   │   ├── scaffoldManifest.js          # 创建内容 (dirs + files + aliases)
│   │   ├── fileTemplates.js             # 最小文件内容
│   │   ├── targetRegistry.js            # 目标名称 + 验证 + 错别字提示
│   │   ├── buildInitPlan.js             # 计划计算（只读 FS 扫描）
│   │   ├── applyInitPlan.js             # 计划执行（写入 / 备份 / dry-run）
│   │   └── confirmApply.js              # readline 确认提示
│   ├── backup/                          # 备份会话管理
│   └── shared/
│       └── remediationMap.js            # checker id → initTarget 映射
├── .bkit-doctor/
│   └── cache/
│       └── recommendation-snapshot.json # 每次 check 后保存
└── docs/
    ├── 01-plan/
    ├── 02-design/
    ├── 03-task/
    └── 04-report/
```

---

## 贡献

欢迎贡献。在提交 pull request 之前，请先开一个 issue 讨论您建议的更改。

1. Fork 仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 理想情况下，遵循阶段式工作流：Plan → Design → Implement → Check
4. 提交 pull request，并清晰描述更改内容和原因

---

## 许可证

Apache License 2.0 — 完整条款请参阅 [LICENSE](LICENSE)。

---

## 致谢

- **[bkit](https://github.com/upstageai/bkit)** — 启发了这个项目的工作流理念
- 开源社区 — 这个项目所基于的工具和模式
- 所有相信结构化、有意图的开发能产生更好结果的人们
