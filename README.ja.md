# bkit-doctor

> Claude Code プロジェクトの構造と設定状態を診断し、自動修正するCLIツール。

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.7.0-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | **日本語** | [中文](README.zh.md) | [Español](README.es.md)

---

## bkit-doctorとは？

**bkit-doctor**は、Claude Codeプロジェクトが正しい構造を備えているかを検査します — `.claude/`ディレクトリ、hooks、settings、エージェント定義、スキルファイル、テンプレート、ポリシー、ドキュメントスキャフォールド — そして不足しているものを自動的に修正します。

**Claude Codeプロジェクトレイアウト向けのESLint**と考えてください。14項目の診断チェックを実行し、各項目のpass/warn/failを報告し、不足しているすべてを1つのコマンドでスキャフォールディングできます。

```bash
npx bkit-doctor check          # プロジェクトを診断
npx bkit-doctor fix --yes      # すべてを自動修正
```

---

## 誰のためのツール？

- **すべてのClaude Codeユーザー** — プロジェクトがClaude Codeの期待する構造を備えているか確認（`.claude/`、`CLAUDE.md`、hooks、settings）
- **構造化されたAIワークフローを導入するチーム** — エージェント、スキル、テンプレート、ポリシー、PDCAドキュメントを数秒でスキャフォールディング
- **CIパイプライン** — `bkit-doctor check`は致命的な失敗時にexit code 1を返すため、デプロイゲートとして活用可能
- **bkitユーザー** — [bkit](https://github.com/anthropics/bkit)のPDCAワークフローに沿っている場合、環境全体を検証しブートストラップ

---

## どんな問題を解決するか？

Claude Codeプロジェクトを正しくセットアップするには、適切なディレクトリ、設定ファイル、エージェント定義、スキルファイル、ドキュメントスキャフォールドの作成が必要です。手作業で行うと面倒でミスが生じがちです。ファイル1つでも漏れればhooksが壊れたり、スキルが無効になったり、AIアシスタントがコンテキストを失ったりします。

**bkit-doctor**はこれを自動化します：

- **診断** — 何があり、何が足りず、何に注意が必要かを即座に把握
- **推奨** — 現在の状態に基づき初期化すべき項目を自動提案
- **修正** — 既存ファイルを上書きせず、1つのコマンドで正しい構造を生成
- **プレビュー** — ディスクに書き込む前に、何が変更されるかを正確に確認（`--dry-run`）
- **検証** — CIで実行してプロジェクト構造の健全性を維持

---

## bkitとは？

[bkit](https://github.com/anthropics/bkit)は、Claude Code向けのPDCAベース開発ワークフローフレームワークです。構造化されたフェーズ（Plan、Design、Do、Check、Report）、エージェントチーム、AIネイティブ開発のための品質ゲートを提供します。

**bkit-doctorはbkitなしでも使用できます：**

| 機能 | bkitなし | bkitあり |
|------|:---:|:---:|
| `check` — プロジェクト構造の診断 | Yes | Yes |
| `init` — 不足ファイルのスキャフォールディング | Yes | Yes |
| `fix` — 自動修正 | Yes | Yes |
| `preset` — ワークフロー最適化バンドル | 一部 | 全機能 |
| `save` / `load` — 設定の永続化 | Yes | Yes |

コアコマンド（`check`、`init`、`fix`）はすべてのClaude Codeプロジェクトで有用です。プリセットと高度なスキャフォールディングターゲットはbkitのPDCAワークフローに最適化されています。

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| `check` | プロジェクト環境の診断 — 項目ごとにpass / warn / fail |
| `init` | 不足ディレクトリとファイルを非破壊的に生成 |
| `fix` | ワンコマンド自動修正（check + recommend + init） |
| `preset` | 事前定義バンドルの適用（`default`、`lean`、`docs`） |
| `save` / `load` | チーム設定の保存と共有 |
| 推奨機能 | check後に実行すべき`init`ターゲットを自動提案 |
| ターゲットのグループ化 | 関連ターゲットの自動統合（例：`docs-core` = すべてのdocsディレクトリ） |
| スナップショットキャッシュ | `check`が結果をキャッシュし、`init --recommended`が再利用 |
| `--dry-run` | ファイルシステムに変更を加えずにプレビュー |
| `--yes / -y` | 確認プロンプトをスキップ（CI向け） |
| `--overwrite` / `--backup` | バックアップ付きの安全なファイル置換 |
| タイプミス検知 | `did you mean: docs-report?` のようなヒントを表示 |
| Exit codes | 致命的な失敗時にexit 1（CIパイプライン連携） |
| クロスプラットフォーム | macOSおよびWindows対応 |

---

## 診断項目（14項目）

| カテゴリ | 検査項目 | 深刻度 |
|----------|----------|--------|
| structure | `.claude/`ディレクトリの存在 | **hard**（未検出時exit 1） |
| config | `CLAUDE.md`の存在 | **hard**（未検出時exit 1） |
| config | `.claude/hooks.json`の存在 | soft |
| config | `.claude/settings.local.json`の存在 | soft |
| docs | `docs/01-plan/`から`docs/04-report/`（4項目） | soft |
| agents | 必須エージェント定義ファイル4件 | soft |
| skills | 必須SKILL.mdファイル7件 | soft |
| policies | 必須ポリシーファイル4件 | soft |
| templates | 必須テンプレートファイル4件 | soft |
| context | `.claude/context/`ディレクトリ | soft |
| changelog | `CHANGELOG.md`（候補パス3件） | soft |

**Hard検査**は`check`がexit code 1で終了します。**Soft検査**は警告のみ表示しexit 0です。

---

## bkitとの関係

> **bkit-doctorは独立したプロジェクトです。** bkitの公式プラグインではなく、bkitチームとの提携関係はありません。

bkit-doctorは[bkit](https://github.com/anthropics/bkit) — PDCAベースのAIネイティブ開発ワークフローからインスピレーションを得ました。作者はbkitの資料を通じて構造化されたAIコラボレーションを学び、その知見がこのツールの設計に反映されています。

bkit-doctorはbkitのコードを**含まず**、bkitがなくても**動作し**、bkitチームが**承認・保守するものではありません**。bkitスタイルのワークフローと組み合わせて活用できるよう設計されています。

---

## 謝辞

**bkitプロジェクト**に特別な感謝を捧げます。Plan、Design、Do、Checkの明快さ — そしてAIコラボレーションは構造化されたコンテキストの中でこそ最も効果を発揮するという考え方 — がbkit-doctorの設計に直接影響を与えました。

---

## インストール

### 必要条件

- Node.js >= 18.0.0
- npm

### グローバルインストール

```bash
npm install -g bkit-doctor
```

### ソースから実行

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## 使い方

```bash
bkit-doctor <command> [options]
```

### クイックスタート

```bash
# Claude Codeプロジェクト構造を診断
bkit-doctor check

# 不足しているものをすべて自動修正
bkit-doctor fix --yes

# ステップごとに：プレビューしてから適用
bkit-doctor init --recommended --dry-run
bkit-doctor init --recommended --yes

# 特定の項目だけを初期化
bkit-doctor init --target hooks-json --target skills-core

# CIで使用（致命的チェック失敗時にexit 1）
bkit-doctor check --path ./my-project
```

---

## コマンド

### `check`

現在のディレクトリ（または指定ディレクトリ）の環境を診断します。
診断後、`check`は推奨スナップショットを保存するため、
`init --recommended`が再チェックなしで結果を再利用できます。

```
bkit-doctor check [options]

Options:
  -p, --path <dir>   対象ディレクトリ（デフォルト：カレントディレクトリ）
```

**出力例：**

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

各項目は`pass`、`warn`、`fail`で評価されます。推奨セクションでは問題を解決する`init`ターゲットが表示され、関連ターゲットはグループ化されます（例：すべての`docs-*` → `docs-core`）。

---

### `init`

不足しているファイルとディレクトリを生成します。デフォルトでは非破壊的 — 明示的に要求しない限り既存ファイルは上書きされません。

適用前に`init`はプランの概要を表示し、`Continue? (y/N)`と確認します。
`--dry-run`でプレビュー、または`--yes`で確認をスキップできます。

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       対象ディレクトリ（デフォルト：カレントディレクトリ）
  --dry-run              何も書き込まずにプランのみ表示
  --recommended          現在のプロジェクト状態からターゲットを自動選択
  --fresh                推奨を再計算（スナップショットを無視）
  -y, --yes              確認プロンプトをスキップし即時適用
  --target <name>        特定のターゲットのみ適用（繰り返し使用可）
  --targets <list>       カンマ区切りで複数ターゲットを適用
  --overwrite            既存ファイルの上書きを許可
  --backup               上書き前に既存ファイルをバックアップ
  --backup-dir <dir>     カスタムバックアップディレクトリ
```

#### 利用可能なinitターゲット

| ターゲット | 生成される内容 |
|------------|----------------|
| `claude-root` | `.claude/`ルートディレクトリ |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/`配下の4つのエージェント定義ファイル |
| `skills-core` | `.claude/skills/`配下の6つのスキルSKILL.mdファイル |
| `templates-core` | `.claude/templates/`配下の4つのドキュメントテンプレート |
| `policies-core` | `.claude/policies/`配下の4つのポリシーファイル |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | すべてのdocs（全`docs-*`ターゲットのエイリアス） |

---

### `fix`

ワンコマンド自動修正。`check`を実行し、推奨を計算して適用します。

```
bkit-doctor fix [options]

Options:
  -p, --path <dir>   対象ディレクトリ（デフォルト：カレントディレクトリ）
  --dry-run          何も書き込まずにプランのみ表示
  --fresh            推奨を強制再計算（スナップショットを無視）
  -y, --yes          確認プロンプトをスキップ
```

### `preset`

事前定義されたスキャフォールドバンドルを適用します。

```bash
bkit-doctor preset list              # 利用可能なプリセット一覧
bkit-doctor preset show default      # プリセットの詳細表示
bkit-doctor preset recommend         # 現在のプロジェクトに適したプリセットを推奨
bkit-doctor init --preset lean --yes # プリセットを適用
```

### `save` / `load`

デフォルト設定を保存・共有します。

```bash
bkit-doctor save --local --recommended    # ローカルに設定を保存
bkit-doctor save --global --preset lean   # グローバルに設定を保存
bkit-doctor load --local                  # 保存した設定を再適用
bkit-doctor load --global                 # グローバル設定を現在のプロジェクトに適用
```

### `version`

バージョンとプラットフォーム情報を表示します。

```bash
bkit-doctor version
```

---

## 使用例

```bash
# 診断 → 自動修正 → 検証
bkit-doctor check                          # 不足項目を確認
bkit-doctor fix --yes                      # すべて修正
bkit-doctor check                          # 検証：HEALTHYであること

# 適用前にプレビュー
bkit-doctor init --recommended --dry-run   # 変更内容を確認
bkit-doctor init --recommended --yes       # 適用

# 選択的スキャフォールディング
bkit-doctor init --target hooks-json       # 単一ターゲット
bkit-doctor init --targets hooks-json,docs-core  # 複数ターゲット

# バックアップ付きで安全に上書き
bkit-doctor init --overwrite --backup      # .bkit-doctor/backups/にバックアップ

# CIパイプライン連携
bkit-doctor check --path ./my-project && echo "healthy" || echo "needs fix"

# チーム設定ワークフロー
bkit-doctor save --global --preset default # チームリードが標準設定を保存
bkit-doctor load --global                  # チームメンバーが適用
```

---

## アーキテクチャ概要

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLIエントリポイント（commander）
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — 診断の登録と実行
│   ├── checkers/                 # 14の診断モジュール（structure, config, docs, agents...）
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFileユーティリティ
│   ├── check/
│   │   ├── resultModel.js        # CheckResult型
│   │   ├── formatters/           # ターミナル出力レンダラー
│   │   └── recommendations/      # 推奨エンジン + スナップショットキャッシュ
│   ├── init/                     # スキャフォールドマニフェスト、プランビルダー、適用ロジック
│   ├── fix/                      # resolveFixTargets — スナップショット対応の修正
│   ├── preset/                   # プリセットスコアリング + 推奨
│   ├── config/                   # 設定の保存/読込（local + global）
│   ├── backup/                   # バックアップセッション管理
│   └── shared/
│       └── remediationMap.js     # checker id → initTargetマッピング
├── tests/                        # 167テスト（node:test）
├── scripts/
│   └── verify-release.js         # 38項目のリリース検証
└── docs/                         # PDCAフェーズドキュメント（plan, design, task, report）
```

---

## 開発方法論

このプロジェクトは、自ら推進するPDCAワークフローを用いて構築されました。すべての機能にPlan、Design、Task、Reportドキュメントが`docs/`に用意されています。これにより変更が意図的で、文書化され、追跡可能であることが保証されます。

---

## コントリビュート

コントリビュートを歓迎します。プルリクエストを提出する前に、まずissueを作成して提案する変更について議論してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成：`git checkout -b feat/your-feature`
3. 可能であればフェーズベースのワークフローに従う：Plan → Design → Implement → Check
4. 何をなぜ変更したかを明確に説明してプルリクエストを提出

---

## ライセンス

Apache License 2.0 — 全条件は[LICENSE](LICENSE)を参照してください。

---

## 謝辞

- **[bkit](https://github.com/anthropics/bkit)** — このプロジェクトにインスピレーションを与えたワークフロー哲学
- オープンソースコミュニティ — このプロジェクトが基盤とするツールとパターン
