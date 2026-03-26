# bkit-doctor

> ⚠️ **開発中** — このプロジェクトは現在活発に開発されています。

> bkitスタイルのプロジェクト環境を診断・初期化・維持するCLIツール。

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.5.8-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/wpfhak/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | **日本語** | [中文](README.zh.md) | [Español](README.es.md)

---

## はじめに

**bkit-doctor** は、あらゆるプロジェクトで bkit スタイルのワークフロー環境を構築・維持するための CLI ツールです。現在のプロジェクト構造を診断し、不足しているものや誤設定を報告し、安全かつ非破壊的な方法で不足ファイルを自動生成できます。

このプロジェクト自体が、bkit-doctor が推奨するフェーズベースのワークフローで構築されています。すべての機能は Plan → Design → Do → Check の手法で計画・設計・実装・検証されています。

---

## なぜこのプロジェクトが必要か

構造化された AI ネイティブ開発ワークフローを導入すると強力な生産性が得られますが、始めることが難しい場合があります。適切なディレクトリ構造、エージェント定義、スキルファイル、テンプレート、ポリシーファイルを手動で設定するのは手間がかかり、ミスが起きやすいです。

**bkit-doctor** はその参入障壁を下げるために作られました:

- **診断** — 何が存在し、何が不足していて、何が必要かを即座に確認
- **推薦** — 診断後に実行すべき init ターゲットを自動提案
- **初期化** — 既存ファイルを変更せずに必要な構造を数秒で生成
- **ターゲット指定** — 必要なものだけを一つずつ選んで適用
- **プレビュー** — 実際にファイルが書き込まれる前に何が変わるかを確認
- **確認** — 適用前に計画をレビューして承認

このツールはシンプルなアイデアから生まれました: *ワークフローは、使い始めることが簡単でなければならない。*

---

## 機能

| 機能 | 説明 |
|------|------|
| `check` | プロジェクト環境の診断 — 項目ごとに pass / warn / fail |
| 推薦機能 | check 後に実行すべき `init` ターゲットを自動提案 |
| ターゲットグループ化 | 関連ターゲットを自動統合（例: `docs-core`） |
| スナップショットキャッシュ | `check` が推薦スナップショットを保存; `init --recommended` が再利用 |
| `init` | 不足しているディレクトリとファイルを非破壊的に生成 |
| `--recommended` | 現在のプロジェクト状態から init ターゲットを自動選択 |
| `--dry-run` | ファイルシステムを変更せずに生成計画だけを出力 |
| `--yes / -y` | 確認プロンプトをスキップして即座に適用 |
| `--fresh` | 推薦を強制再計算、キャッシュを無視 |
| `--target` | 特定のターゲットのみ選択適用（繰り返し使用可能） |
| `--targets` | カンマ区切りで複数のターゲットを一度に適用 |
| `--overwrite` | 必要に応じて既存ファイルを上書き |
| `--backup` | 上書き前に既存ファイルをバックアップ |
| 確認プロンプト | 適用計画を表示し `Continue? (y/N)` を待機 |
| タイポ検出 | `did you mean: docs-report?` ヒントを提供 |
| クロスプラットフォーム | macOS および Windows で動作 |

---

## ワークフロー哲学

bkit-doctor は **フェーズベースの開発モデル** を基盤としています:

```
PM → PLAN → DESIGN → DO → CHECK → REPORT
```

各フェーズはドキュメントを生成します。各ドキュメントは予測可能な場所に保存されます。すべての作業は要件から実装、検証まで追跡可能です。

---

## bkit との関係

> **bkit-doctor は独立したプロジェクトです。bkit の公式プラグインではなく、bkit プロジェクトとの公式な提携関係もありません。**

bkit-doctor は **bkit に触発されました** — 強力な AI ネイティブ開発ワークフロー ツールキットです。

bkit-doctor:

- bkit コードを **含みません**
- bkit なしでも **動作します**
- bkit チームに **保証・管理されていません**
- bkit 自体を置き換えたり拡張したりするものではなく、bkit スタイルのワークフローと一緒に役立つように設計されています

---

## インストール

### 要件

- Node.js >= 18.0.0
- npm

### グローバルインストール

```bash
npm install -g bkit-doctor
```

### ソースから実行

```bash
git clone https://github.com/wpfhak/bkit-doctor.git
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
# プロジェクトの bkit 環境を診断
bkit-doctor check

# check 結果に基づく推薦ターゲットを適用（スナップショットがあれば再利用）
bkit-doctor init --recommended

# init --recommended のプレビュー
bkit-doctor init --recommended --dry-run

# 全構造を初期化（確認プロンプトあり）
bkit-doctor init

# 確認をスキップして即座に適用
bkit-doctor init --yes

# 特定のターゲットのみ初期化
bkit-doctor init --target hooks-json --target skills-core
```

---

## コマンド

### `check`

現在のディレクトリ（または指定したディレクトリ）の bkit 環境を診断します。
診断後、`check` は推薦スナップショットを保存するので、
`init --recommended` が再度チェックを実行せずに結果を再利用できます。

```
bkit-doctor check [options]

Options:
  -p, --path <dir>   対象ディレクトリ（デフォルト: カレントディレクトリ）
```

**出力例:**

```
[bkit-doctor] 診断対象: /path/to/project

──── カテゴリ ──────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ! docs        4 warn
  ...

──── 詳細 ──────────────────────────────
[FAIL] structure.claude-root — .claude/ missing
  → run: bkit-doctor init --target claude-root
...

合計 14件 — PASS 0 / WARN 12 / FAIL 2   状態: FAILED

──── 推薦 ──────────────────────────────
  8 個の推薦ターゲット（14 件の問題に基づく）

  • claude-root — .claude/ ルートディレクトリを作成
  • hooks-json  — デフォルトの hooks.json ファイルを作成
  • docs-core   — すべての docs/ スキャフォールドを作成
    (covers: docs-plan, docs-design, docs-task, docs-report, docs-changelog)

  推薦される次のステップ:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core

  先にプレビュー:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core --dry-run
```

---

### `init`

不足しているファイルとディレクトリを生成します。デフォルトは非破壊的 — 明示的に要求しない限り既存ファイルを上書きしません。

適用前に `init` は計画サマリーを表示し、`Continue? (y/N)` を待ちます。
`--dry-run` で書き込みなしにプレビュー、`--yes` で確認をスキップできます。

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       対象ディレクトリ（デフォルト: カレントディレクトリ）
  --dry-run              何も書き込まずに計画だけ表示
  --recommended          現在のプロジェクト状態からターゲットを自動選択
  --fresh                推薦を強制再計算（スナップショットを無視）
  -y, --yes              確認プロンプトをスキップして即座に適用
  --target <name>        特定のターゲットのみ適用（繰り返し使用可能）
  --targets <list>       カンマ区切りで複数ターゲットを適用
  --overwrite            既存ファイルの上書きを許可
  --backup               上書き前に既存ファイルをバックアップ
  --backup-dir <dir>     カスタムバックアップディレクトリ
```

#### 利用可能な init ターゲット

| ターゲット | 作成されるもの |
|-----------|--------------|
| `claude-root` | `.claude/` ルートディレクトリ |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 配下の4つのエージェント定義ファイル |
| `skills-core` | `.claude/skills/` 配下の6つのスキル SKILL.md ファイル |
| `templates-core` | `.claude/templates/` 配下の4つのドキュメントテンプレート |
| `policies-core` | `.claude/policies/` 配下の4つのポリシーファイル |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | すべての docs（全 `docs-*` ターゲットのエイリアス） |

---

### `version`

バージョンとプラットフォーム情報を表示します。

```bash
bkit-doctor version
```

---

## 使用例

### check 後に推薦を適用

```bash
# 1. 診断 — 推薦スナップショットを保存
bkit-doctor check

# 2. キャッシュされたスナップショットを使って推薦ターゲットを適用
bkit-doctor init --recommended

# 先にプレビュー
bkit-doctor init --recommended --dry-run

# 強制再計算（キャッシュを無視）
bkit-doctor init --recommended --fresh
```

### 初期化のプレビュー（何も書き込まれない）

```bash
bkit-doctor init --dry-run
```

### 適用前に確認

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

### 確認をスキップ（CI / 自動化）

```bash
bkit-doctor init --yes
bkit-doctor init --recommended --yes
```

### 必要なものだけ初期化

```bash
bkit-doctor init --target docs-report
bkit-doctor init --targets hooks-json,agents-core
bkit-doctor init --target skills-core --dry-run
```

### バックアップ付き安全な上書き

```bash
bkit-doctor init --overwrite --backup
# .bkit-doctor/backups/<timestamp>/ にバックアップ後
# 新しいスキャフォールド内容で上書き
```

### タイポ検出

```bash
bkit-doctor init --target docs-reprot
# [bkit-doctor] unknown targets:
#   - docs-reprot  (did you mean: docs-report?)
```

---

## アーキテクチャ概要

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js                     # CLI エントリポイント (commander)
│   │   └── commands/
│   │       ├── check.js                 # check コマンド + スナップショット保存
│   │       ├── init.js                  # init コマンド (confirm / recommended / snapshot)
│   │       └── version.js
│   ├── core/
│   │   └── checker.js                   # CheckerRunner
│   ├── checkers/                        # 診断モジュール (structure, config, agents...)
│   │   └── shared/fileRules.js
│   ├── check/
│   │   ├── resultModel.js               # CheckResult 型
│   │   ├── formatters/
│   │   │   └── defaultFormatter.js      # ターミナル出力 + グループ化推薦レンダリング
│   │   └── recommendations/
│   │       ├── recommendationModel.js   # Recommendation 型
│   │       ├── buildRecommendations.js  # warn/fail → 重複排除 + 優先度ソート
│   │       ├── groupingRegistry.js      # 親/子グループ化ポリシー
│   │       ├── groupRecommendations.js  # 生 → グループ化推薦
│   │       ├── buildSuggestedFlow.js    # Recommendation[] → SuggestedFlow
│   │       ├── suggestedFlowModel.js    # SuggestedFlow 型
│   │       ├── computeRecommendations.js# async: チェック実行 → グループ化推薦
│   │       ├── recommendationSnapshotModel.js
│   │       ├── buildRecommendationFingerprint.js
│   │       ├── saveRecommendationSnapshot.js
│   │       ├── loadRecommendationSnapshot.js
│   │       └── validateRecommendationSnapshot.js
│   ├── init/
│   │   ├── scaffoldManifest.js          # 作成項目 (dirs + files + aliases)
│   │   ├── fileTemplates.js             # 最小ファイル内容
│   │   ├── targetRegistry.js            # ターゲット名 + バリデーション + タイポヒント
│   │   ├── buildInitPlan.js             # 計画計算（読み取り専用 FS スキャン）
│   │   ├── applyInitPlan.js             # 計画実行（書き込み / バックアップ / dry-run）
│   │   └── confirmApply.js              # readline 確認プロンプト
│   ├── backup/                          # バックアップセッション管理
│   └── shared/
│       └── remediationMap.js            # checker id → initTarget マッピング
├── .bkit-doctor/
│   └── cache/
│       └── recommendation-snapshot.json # check 後に保存
└── docs/
    ├── 01-plan/
    ├── 02-design/
    ├── 03-task/
    └── 04-report/
```

---

## コントリビューション

コントリビューションを歓迎します。プルリクエストを送る前に、提案する変更についてイシューを開いて議論してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feat/your-feature`
3. 可能であればフェーズベースのワークフローに従う: Plan → Design → Implement → Check
4. 何が、なぜ変更されたかの明確な説明とともにプルリクエストを送信

---

## ライセンス

Apache License 2.0 — 完全な条件は [LICENSE](LICENSE) を参照してください。

---

## 謝辞

- **[bkit](https://github.com/upstageai/bkit)** — このプロジェクトに影響を与えたワークフロー哲学
- オープンソースコミュニティ — このプロジェクトが基盤とするツールとパターン
- 構造的で意図的な開発がより良い結果をもたらすと信じるすべての人々
