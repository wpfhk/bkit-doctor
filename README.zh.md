<div align="center">

# 🩺 bkit-doctor

**专为 Claude Code 打造的 AI 工作流 CLI。**
一次配置项目，让 Claude Code 自动处理其余一切 — 一致、可靠、每次如此。

[![npm version](https://img.shields.io/badge/npm-v1.1.1-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · **中文** · [Español](README.es.md)

</div>

---

## 为什么选择 bkit-doctor？

用 Claude Code 构建项目时，几天内就会出现两个问题：

1. **结构漂移** — `.claude/` 目录消失，`CLAUDE.md` 规则失同步，hooks 不见了。
2. **工作流失忆** — Claude Code 忘记记录它构建了什么。没有计划，没有追踪，没有审计轨迹。

**bkit-doctor 同时解决这两个问题。** 它强制执行项目结构，并将 Claude Code 连接到 PDCA（计划-执行-检查-行动）工作流，无需每次手动提醒。

```
Claude Code 生成逻辑。
bkit-doctor 永久追踪结构和工作流状态。
```

---

## 🚀 快速开始

最快速地设置新项目或现有项目：

```bash
npx bkit-doctor setup
```

这一条命令会运行交互式向导：

```
bkit-doctor setup

  [1/4] 正在诊断项目结构...
        ✔ 找到 .claude/ 目录
        ✔ 找到 CLAUDE.md
        ⚠ hooks.json 缺失 → 将自动修复

  [2/4] 正在自动修复 3 个问题...
        ✔ 已创建 hooks.json
        ✔ 已创建 settings.local.json
        ✔ 已脚手架 docs/

  [3/4] 正在生成 CLAUDE.md...
        ✔ CLAUDE.md 已写入 (备份: CLAUDE_20260330_backup.md)

  [4/4] 正在生成 SKILL.md + npm 脚本...
        ✔ 已创建 SKILL.md
        ✔ 已添加到 package.json: bkit:check, bkit:fix, bkit:setup

  设置完成。Claude Code 现在将自动遵循 PDCA 工作流。
```

设置完成后，使用 npm 快捷方式代替 `npx bkit-doctor ...`：

```bash
npm run bkit:check   # → bkit-doctor check
npm run bkit:fix     # → bkit-doctor fix --yes
npm run bkit:setup   # → bkit-doctor setup
```

---

## ✨ 核心功能

### 🧙 `setup` — 一键项目初始化

```bash
bkit-doctor setup [--path <dir>]
```

按顺序执行四个步骤：**诊断 → 修复 → 生成 CLAUDE.md → 生成 SKILL.md + npm 脚本**

- 覆盖前将现有 `CLAUDE.md` 备份为 `CLAUDE_{date}_backup.md`
- CI/CD 安全：非 TTY 环境跳过交互提示（保留现有文件）
- 幂等性：运行两次也是安全的

---

### 🤖 `skill` — 零提示的 PDCA 文档化

```bash
bkit-doctor skill [--append-claude] [--overwrite] [--stdout] [--dry-run]
```

生成 `SKILL.md` 文件，将 Claude Code **编程**为自动记录每个任务 — 无需提示。

```markdown
## RULE 1: PROACTIVE DOCUMENTATION
在编写任何代码之前，自动运行：
  npx bkit-doctor pdca-plan "<topic>" --type <feature|bugfix|refactor|guideline>

## RULE 2: STATE SYNC
编写代码前，检查现有 PDCA 状态：
  npx bkit-doctor pdca-list

## RULE 3: PIPELINE
编码后，自动运行剩余阶段：
  npx bkit-doctor pdca-do "<topic>"
  npx bkit-doctor pdca-check "<topic>"
  npx bkit-doctor pdca-report "<topic>"
```

**`--append-claude`** 将这些规则直接注入 `CLAUDE.md`，在整个项目中生效。

---

### 📋 `pdca` — 文件系统 AI 工作流引擎

为任何任务生成结构化 PDCA 文档。状态追踪在 `.bkit-doctor/pdca-state.json` 中。

```bash
# 一键生成完整指南
bkit-doctor pdca "用户认证" --type feature --owner alice --priority P1

# 分阶段工作流
bkit-doctor pdca-plan "用户认证"
bkit-doctor pdca-do   "用户认证"
bkit-doctor pdca-check "用户认证"
bkit-doctor pdca-report "用户认证"

# 查看所有活跃主题
bkit-doctor pdca-list
```

文档类型：`guideline` · `feature` · `bugfix` · `refactor`

输出：`output/pdca/<slug>-pdca-{stage}.md` — 可版本控制、可审计、可 git 追踪。

---

### 🧹 `clear` — 安全的配置清理

```bash
bkit-doctor clear [--path <dir>]
```

交互式选择并删除 bkit-doctor 生成的文件。删除前需明确确认 — 不会静默删除数据。

---

### 🔍 `check` / `fix` / `init` — 结构强制执行

```bash
bkit-doctor check        # 运行 16 项诊断检查 → pass/warn/fail
bkit-doctor fix --yes    # 自动修复所有问题 (check + recommend + init)
bkit-doctor init --preset default --yes   # 脚手架完整项目结构
```

**16 项诊断检查**，涵盖：结构 · 配置 · 代理 · 技能 · 策略 · 模板 · 文档 · 变更日志

硬性失败（`.claude/` 或 `CLAUDE.md` 缺失）时退出码为 `1` — 适合 CI。

---

## 🤖 Claude Code 集成工作原理

当项目根目录存在 `SKILL.md` 时，Claude Code 将其作为项目上下文读取，并在每个任务中遵循其规则。

```
your-project/
├── CLAUDE.md          ← 项目规则 + 工作流指令
├── SKILL.md           ← Claude Code 自动化规则
├── .claude/
│   ├── hooks.json
│   └── settings.local.json
└── output/
    └── pdca/
        ├── user-auth-pdca-plan.md
        ├── user-auth-pdca-do.md
        └── user-auth-pdca-report.md     ← 自动生成，无需提示
```

结果：**每个功能、bug 修复和重构都被自动计划、执行、验证和报告** — 无需人工操作，形成永久审计轨迹。

---

## 📖 命令参考

| 命令 | 描述 |
|------|------|
| `setup` | 交互式向导：check → fix → CLAUDE.md → SKILL.md → npm 脚本 |
| `skill` | 生成包含 Claude Code 自动化规则的 `SKILL.md` |
| `clear` | 确认后交互式删除配置文件 |
| `check` | 运行 16 项诊断检查 |
| `fix` | 自动修复所有问题 (check + recommend + init) |
| `init` | 脚手架缺失的文件和目录 |
| `pdca <topic>` | 生成完整 PDCA 指南文档 |
| `pdca-plan <topic>` | 生成 Plan 阶段文档 |
| `pdca-do <topic>` | 生成 Do 阶段文档 |
| `pdca-check <topic>` | 生成 Check 阶段文档 |
| `pdca-report <topic>` | 生成 Report 阶段文档 |
| `pdca-list` | 列出所有活跃 PDCA 主题 |
| `preset` | 列出、查看或推荐预设 |
| `save` | 保存当前配置 (local / global / both) |
| `load` | 将保存的配置应用到当前项目 |
| `version` | 显示版本和平台信息 |

---

## 📦 检查项目（16 项）

| 类别 | 检查内容 | 严重度 |
|------|---------|--------|
| structure | `.claude/` 目录 | **hard** (exit 1) |
| config | `CLAUDE.md` | **hard** (exit 1) |
| config | `hooks.json` | soft |
| config | `settings.local.json` | soft |
| agents | 4 个代理定义文件 | soft |
| skills | `.claude/skills/` 下 7 个技能文件 | soft |
| policies | 4 个策略文件 | soft |
| templates | 4 个模板文件 | soft |
| docs | `docs/01-plan/` → `docs/04-report/`（4 项） | soft |
| docs | `output/pdca/` 目录 | soft |
| docs | PDCA 指南内容有效性 | soft |
| context | `.claude/context/` 目录 | soft |
| changelog | `CHANGELOG.md` | soft |

---

## 🛠 可用的 `init` 目标

| 目标 | 创建内容 |
|------|---------|
| `claude-root` | `.claude/` 目录 |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 个代理定义文件 |
| `skills-core` | `.claude/skills/` 下 7 个 SKILL.md 文件 |
| `templates-core` | 4 个文档模板 |
| `policies-core` | 4 个策略文件 |
| `docs-core` | 所有 `docs/` 目录 |
| `docs-pdca` | `output/pdca/` PDCA 输出目录 |
| `docs-changelog` | `CHANGELOG.md` |

**预设：** `default`（完整）· `lean`（最小）· `workflow-core` · `docs`

---

## 🔗 与 bkit 配合使用

bkit-doctor 强制执行结构和状态。**[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** 是驱动 AI 工作流引擎本身的 Claude Code 插件（31 个代理、36 个技能、PDCA 编排）。

| | bkit-doctor | bkit（插件） |
|--|-------------|------------|
| 项目结构 | ✅ 创建 & 验证 | — |
| CLAUDE.md / SKILL.md | ✅ 生成 | 读取 |
| PDCA 文档引擎 | ✅ 文件生成 | 编排 |
| AI 代理 & 技能 | — | ✅ 31 个代理 / 36 个技能 |
| 运行环境 | 终端 | Claude Code |

```bash
# 在 Claude Code 内安装 bkit
/plugin marketplace add popup-studio-ai/bkit-claude-code
```

---

## CI 使用

```yaml
# GitHub Actions
- name: 检查项目结构
  run: npx bkit-doctor check
# .claude/ 或 CLAUDE.md 缺失时退出码为 1
```

---

## 贡献

欢迎贡献。请先开一个 issue 讨论您想做的更改。

1. Fork 仓库
2. 创建功能分支：`git checkout -b feat/my-feature`
3. 运行测试：`npm test`
4. 提交 Pull Request

---

<div align="center">
  为使用 Claude Code 构建项目的开发者而生。<br>
  <a href="https://github.com/dotoricode/bkit-doctor">GitHub</a> · <a href="https://www.npmjs.com/package/bkit-doctor">npm</a> · <a href="CHANGELOG.md">Changelog</a>
</div>
