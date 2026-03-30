# bkit-doctor

> 诊断 AI 编程工具构建的项目结构，并自动修复的 CLI 工具。

[![npm version](https://img.shields.io/badge/npm-v1.1.0-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](https://github.com/dotoricode/bkit-doctor/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](./README.md) | [한국어](./README.ko.md) | [日本語](./README.ja.md) | **中文** | [Español](./README.es.md)

---

## 什么是 bkit-doctor？

使用 Claude Code、Cursor 等 AI 编程工具构建项目时，项目结构容易变得混乱。上下文文件缺失、文档目录不存在、配置文件未到位。随着时间推移，AI 会逐渐失去有效工作所需的结构化上下文。

**bkit-doctor** 用一条命令诊断并自动修复这些问题。它检查项目是否具备必要的结构 — `.claude/` 目录、hooks、settings、agent 定义文件、skill 文件、模板、策略以及文档骨架 — 并自动创建缺失的部分。

把它理解为**项目结构的 ESLint**：14 项诊断、逐项 pass/warn/fail，一键自动修复所有缺失内容。

```bash
npx bkit-doctor check          # 诊断项目
npx bkit-doctor fix --yes      # 全部自动修复
```

bkit-doctor 基于 [bkit](https://github.com/popup-studio-ai/bkit-claude-code) PDCA 工作流方法论构建，但独立运行 — 无需安装 bkit。

---

## 快速开始：使用 bkit 配置新项目

> bkit-doctor 单独使用就很实用，但与 [bkit](https://github.com/popup-studio-ai/bkit-claude-code) 搭配使用可解锁完整的 PDCA 工作流、31 个 agent 和 36 个 skill。

### Step 1 — 使用 bkit-doctor 搭建项目结构

在新项目目录中执行以下命令。

```bash
# 1. 诊断项目（新项目大多数项目 warn/fail 是正常的）
npx bkit-doctor check

# 2. 自动生成所有缺失的结构
npx bkit-doctor init --preset default --yes

# 3. 重新诊断确认 HEALTHY 状态
npx bkit-doctor check
```

完成此步骤后，项目内会生成 `.claude/`、`docs/`、`CLAUDE.md` 等**目录和文件骨架**。

```
your-project/
├── .claude/
│   ├── hooks.json
│   ├── settings.local.json
│   ├── agents/          ← agent 定义文件（占位符）
│   ├── skills/          ← skill 文件（占位符）
│   ├── templates/       ← 文档模板
│   └── policies/        ← 策略文件
├── docs/
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-task/
│   └── 04-report/
├── CLAUDE.md
└── CHANGELOG.md
```

> **此时只是骨架。** `.claude/agents/` 和 `.claude/skills/` 中的文件是占位符，实际的 bkit agent/skill 逻辑尚未包含 — 下一步会补充。

---

### Step 2 — 在 Claude Code 中安装 bkit 插件

bkit 的实际功能（PDCA 工作流、CTO 智能体团队、质量门禁等）作为 **Claude Code 插件**运行。打开 Claude Code 并执行以下命令：

```
# 在 Claude Code 终端中执行
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

安装完成后，Claude Code 会将插件保存到 `~/.claude/plugins/bkit/`。从此，bkit 的 36 个 skill 和 31 个 agent 将在所有项目中自动激活。

---

### Step 3 — 开始第一次开发

在安装了 bkit 插件的 Claude Code 中，通过以下命令启动 PDCA 工作流：

```
# 开始新功能开发（例如：登录功能）
/pdca plan login-feature

# 生成设计文档
/pdca design login-feature

# 实现
/pdca do login-feature

# 验证和差距分析
/pdca analyze login-feature
```

文档将写入 bkit-doctor 创建的 `docs/` 目录结构中。

---

### 两个工具的关系

```
bkit-doctor                       bkit（Claude Code 插件）
──────────────────────────        ──────────────────────────────────
创建项目骨架                        驱动 AI 工作流引擎
.claude/ 目录结构                   36 个 skill / 31 个 agent
docs/ 文档布局                      PDCA 状态机
hooks.json 配置                     质量门禁 / 审计日志
CLAUDE.md 上下文文件                CTO-Led 智能体团队
```

bkit-doctor 是**一次性配置工具**。之后，bkit 在 Claude Code 内负责所有工作流。

---

## 安装

```bash
# 无需安装直接运行（推荐初次尝试）
npx bkit-doctor check

# 全局安装
npm install -g bkit-doctor

# 或作为项目开发依赖添加
npm install --save-dev bkit-doctor
```

需要 **Node.js >= 18**。

### 从源码运行

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## 命令

bkit-doctor 提供 8 个命令。

### `check` — 诊断项目结构

运行 14 项诊断检查，并对每项报告 pass/warn/fail 状态。保存推荐快照，供后续 `init --recommended` 或 `fix` 使用。

```bash
bkit-doctor check                    # 检查当前目录
bkit-doctor check --path ./other     # 检查其他目录
```

Exit code：任何硬性检查失败则返回 **1**，否则返回 **0**。

**输出示例：**

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

### `init` — 搭建缺失文件

创建缺失的目录和文件。默认为非破坏性操作 — 除非显式传入 `--overwrite`，否则不会覆盖现有文件。

```bash
bkit-doctor init --recommended --yes      # 应用上次检查的推荐
bkit-doctor init --preset default --yes   # 应用预设方案
bkit-doctor init --target hooks-json      # 搭建单个目标
bkit-doctor init --targets agents-core,docs-core  # 多个目标
bkit-doctor init --recommended --dry-run  # 预览（不写入文件）
bkit-doctor init --overwrite --backup     # 覆盖并备份
```

### `fix` — 一键自动修复

`check` + `recommend` + `init` 的快捷方式。执行诊断、计算推荐方案并应用。

```bash
bkit-doctor fix --yes           # 全部修复，无需确认
bkit-doctor fix --dry-run       # 预览修复计划
bkit-doctor fix --fresh --yes   # 忽略快照，重新计算
```

### `preset` — 预定义搭建方案

preset 决定要搭建哪些目标，并影响生成文件的内容。

```bash
bkit-doctor preset list              # 显示可用 preset
bkit-doctor preset show default      # 显示 preset 详情
bkit-doctor preset recommend         # 推荐适合当前项目的 preset
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

将偏好的默认模式（recommended 或 preset）保存到本地或全局，之后可以重新应用或在多个项目间共享。

```bash
bkit-doctor save --local --recommended    # 本地保存设置
bkit-doctor save --global --preset lean   # 全局保存（所有项目）
bkit-doctor save --both --preset default  # 两者都保存

bkit-doctor load --local                  # 重新应用本地设置
bkit-doctor load --global                 # 将全局设置应用到当前项目
bkit-doctor load --file ./settings.json   # 从指定文件加载
```

### `pdca` — 生成PDCA指南文档

为特定主题生成PDCA（Plan-Do-Check-Act）指南文档。

```bash
bkit-doctor pdca "部署审批标准"                             # 生成指南
bkit-doctor pdca "支付故障应对指南" --stdout                # 输出到终端
bkit-doctor pdca "运维检查流程" --overwrite                 # 覆盖已有文件
bkit-doctor pdca "登录功能" --type feature --owner alice
bkit-doctor pdca-plan "部署审批" --type guideline           # 仅Plan阶段文档
bkit-doctor pdca-list                                      # 列出已生成文档
```

**默认输出路径:** `output/pdca/<slug>-pdca-guide.md`

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--stdout` | 输出到终端而非文件 | — |
| `--dry-run` | 预览生成计划、路径和冲突 | — |
| `--overwrite` | 覆盖已有文件 | — |
| `--type <kind>` | `guideline` / `feature` / `bugfix` / `refactor` | `guideline` |
| `--owner <name>` | 负责人 | `TBD` |
| `--priority <level>` | 优先级（`P0`~`P3`） | `P1` |

**阶段命令:** `pdca-plan`, `pdca-do`, `pdca-check`, `pdca-report`

**范围（v1）:** 仅基于模板生成。无状态管理工作流、AI生成或多步子命令。

### `version` — 显示版本信息

```bash
bkit-doctor version       # 版本 + 平台详情
bkit-doctor --version     # 仅版本号
```

---

## 诊断项目（14 项）

| 分类 | 检查项 | 严重程度 |
|------|--------|----------|
| structure | `.claude/` 目录存在 | **hard**（缺失则 exit 1） |
| config | `CLAUDE.md` 存在 | **hard**（缺失则 exit 1） |
| config | `.claude/hooks.json` 存在 | soft |
| config | `.claude/settings.local.json` 存在 | soft |
| docs | `docs/01-plan/` 至 `docs/04-report/`（4 项） | soft |
| agents | 4 个必需的 agent 定义文件 | soft |
| skills | 7 个必需的 SKILL.md 文件 | soft |
| policies | 4 个必需的策略文件 | soft |
| templates | 4 个必需的模板文件 | soft |
| context | `.claude/context/` 目录 | soft |
| changelog | `CHANGELOG.md`（3 个候选路径） | soft |

**Hard 检查**会导致 `check` 以 exit code 1 退出。**Soft 检查**仅产生警告，exit code 为 0。

---

## CI 使用

`bkit-doctor check` 在关键结构缺失时返回 exit code 1，适合用作 CI 门禁：

```yaml
# GitHub Actions
- name: 检查项目结构
  run: npx bkit-doctor check
```

```bash
# Shell 脚本
bkit-doctor check || { echo "结构检查失败"; exit 1; }
```

Exit code 行为：

- **Hard FAIL**（`.claude/` 或 `CLAUDE.md` 缺失） → exit 1，CI 失败
- **Soft FAIL**（仅有警告） → exit 0，CI 通过

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

## FAQ

**Q: 运行了 `init --preset default`，但 bkit 功能没有激活。**

A: bkit-doctor 是创建项目**文件结构**的工具。bkit 的实际功能（PDCA 工作流、agent、skill）需要作为 **Claude Code 插件**单独安装。打开 Claude Code 并执行：

```
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

**Q: `.claude/agents/` 里生成了文件，这些是 bkit 的 agent 吗？**

A: 不是。bkit-doctor 生成的 agent 文件是**占位符**。实际的 bkit 31 个 agent 包含在 Claude Code 的 bkit 插件中（`~/.claude/plugins/bkit/agents/`）。bkit-doctor 创建的文件可作为编写自定义 agent 的参考。

**Q: 需要安装 bkit 吗？**

A: 不需要。bkit-doctor 是独立的 CLI 工具，无需 bkit 即可运行。但如果想使用 `/pdca` 命令等 bkit 工作流功能，则需要在 Claude Code 中安装 bkit 插件。

**Q: 会覆盖现有文件吗？**

A: 默认不会覆盖。需要显式传入 `--overwrite`。结合 `--backup` 使用可在覆盖前创建备份。

**Q: 如何预览将创建哪些文件？**

A: 使用 `--dry-run` 选项可以预览。实际文件不会有任何变更。

```bash
bkit-doctor init --recommended --dry-run
bkit-doctor fix --dry-run
```

**Q: 可以在 CI 中使用吗？**

A: 可以。`check` 在核心结构缺失时返回 exit code 1，因此可用作 CI 门禁。

---

## 什么是 bkit？

[bkit](https://github.com/popup-studio-ai/bkit-claude-code)（Vibecoding Kit）是面向 Claude Code 的基于 PDCA 的开发工作流框架。为 AI 原生开发提供结构化阶段（Plan、Design、Do、Check、Report）、agent 团队和质量门禁。

**bkit-doctor 可以独立于 bkit 使用：**

| 功能 | 不使用 bkit | 使用 bkit |
|------|:-----------:|:---------:|
| `check` — 项目结构诊断 | ✅ | ✅ |
| `init` — 搭建缺失文件 | ✅ | ✅ |
| `fix` — 自动修复 | ✅ | ✅ |
| `preset` — 工作流优化方案 | Partial | Full |
| `/pdca` 工作流命令 | ❌ | ✅ |
| 31 个 agent / 36 个 skill | ❌ | ✅ |
| PDCA 质量门禁 / 审计日志 | ❌ | ✅ |

详细了解 bkit：https://github.com/popup-studio-ai/bkit-claude-code

---

## 架构

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI 入口（commander）
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — 注册并运行诊断
│   ├── checkers/                 # 14 个诊断模块
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

## 与 bkit 的关系

> **bkit-doctor 是一个独立项目。** 它不是 bkit 的官方插件，与 bkit 团队没有关联。

bkit-doctor 受到 [bkit](https://github.com/popup-studio-ai/bkit-claude-code) — 基于 PDCA 的 AI 原生开发工作流 — 的启发而开发。作者通过 bkit 的资料学习了结构化 AI 协作，这些知识影响了本工具的设计。

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

Apache License 2.0 — 完整条款请参阅 [LICENSE](./LICENSE)。

---

## 致谢

- **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** — 启发本项目的工作流理念
- 开源社区 — 本项目所依赖的工具和模式

---

> **免责声明**：本工具是独立的社区工具，不是 POPUP STUDIO 的官方产品。"bkit" 是 POPUP STUDIO PTE. LTD. 的商标。
