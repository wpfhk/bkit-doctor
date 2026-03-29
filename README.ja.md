# bkit-doctor

> Claude Code プロジェクト構造の診断、スキャフォールド、メンテナンスをコマンドラインから実行できるツールです。

![npm version](https://img.shields.io/npm/v/bkit-doctor)
![license](https://img.shields.io/npm/l/bkit-doctor)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | **日本語** | [中文](README.zh.md) | [Español](README.es.md)

---

## bkit-doctorとは？

**bkit-doctor** は、Claude Code プロジェクトが正しい構造を持っているかを検証するツールです。`.claude/` ディレクトリ、hooks、settings、エージェント定義、スキルファイル、テンプレート、ポリシー、ドキュメントのスキャフォールドをチェックし、不足しているものを自動的に修正します。

Claude Code プロジェクトレイアウトのための **ESLint** のようなものです。14項目の診断チェックを実行し、各項目について pass/warn/fail を報告し、不足しているものをすべて1つのコマンドでスキャフォールドできます。

```bash
npx bkit-doctor check          # プロジェクトを診断
npx bkit-doctor fix --yes      # すべてを自動修正
```

---

## 誰のためのツール？

- **すべての Claude Code ユーザー** — プロジェクトが Claude Code の期待する構造（`.claude/`、`CLAUDE.md`、hooks、settings）を持っているか確認できます
- **構造化されたAIワークフローを導入するチーム** — エージェント、スキル、テンプレート、ポリシー、PDCA ドキュメントを数秒でスキャフォールドできます
- **CI パイプライン** — `bkit-doctor check` は重大な問題がある場合に exit code 1 で終了するため、デプロイメントのゲートとして利用できます
- **bkit ユーザー** — [bkit](https://github.com/anthropics/bkit) の PDCA ワークフローに従っている場合、bkit-doctor が環境全体を検証・ブートストラップします

---

## インストール

```bash
# インストールせずに実行（お試しにおすすめ）
npx bkit-doctor check

# グローバルインストール
npm install -g bkit-doctor

# またはプロジェクトの開発依存として追加
npm install --save-dev bkit-doctor
```

**Node.js >= 18** が必要です。

---

## クイックスタート

```bash
# 1. プロジェクトを診断
bkit-doctor check

# 2. 不足しているものをすべて自動修正
bkit-doctor fix --yes

# 3. 確認 — HEALTHY になっているはずです
bkit-doctor check
```

---

## コマンド

bkit-doctor には7つのコマンドがあります：

### `check` — プロジェクト構造の診断

14項目の診断チェックを実行し、各項目について pass/warn/fail を報告します。後続の `init --recommended` や `fix` のために推奨スナップショットを保存します。

```bash
bkit-doctor check                    # カレントディレクトリをチェック
bkit-doctor check --path ./other     # 別のディレクトリをチェック
```

Exit code: いずれかのハードチェックが失敗した場合は **1**、それ以外は **0**。

### `init` — 不足ファイルのスキャフォールド

不足しているディレクトリやファイルを作成します。デフォルトでは非破壊的です。明示的に `--overwrite` を指定しない限り、既存のファイルは上書きされません。

```bash
bkit-doctor init --recommended --yes      # 前回チェックの推奨を適用
bkit-doctor init --preset default --yes   # プリセットバンドルを適用
bkit-doctor init --target hooks-json      # 単一ターゲットをスキャフォールド
bkit-doctor init --targets agents-core,docs-core  # 複数ターゲット
bkit-doctor init --recommended --dry-run  # 書き込みなしでプレビュー
bkit-doctor init --overwrite --backup     # バックアップ付きで上書き
```

### `fix` — ワンコマンド自動修復

`check` + `recommend` + `init` のショートカットです。診断を実行し、推奨を計算し、適用します。

```bash
bkit-doctor fix --yes           # すべてを修正、プロンプトなし
bkit-doctor fix --dry-run       # 修正内容をプレビュー
bkit-doctor fix --fresh --yes   # スナップショットを無視して再計算
```

### `preset` — 定義済みスキャフォールドバンドル

プリセットは、スキャフォールドするターゲットを選択し、生成されるファイルの内容に影響を与えます。

```bash
bkit-doctor preset list              # 利用可能なプリセットを表示
bkit-doctor preset show default      # プリセットの詳細を表示
bkit-doctor preset recommend         # 現在のプロジェクトに適したプリセットを推薦
```

利用可能なプリセット：

| Preset | 説明 | Targets |
|--------|------|---------|
| `default` | フル構造（config + agents + skills + templates + policies + docs） | 8 targets |
| `lean` | 最小構造（config + agents のみ） | 4 targets |
| `workflow-core` | ワークフロー構造（agents + skills + templates + policies） | 5 targets |
| `docs` | ドキュメントのみ（plan, design, task, report, changelog） | 1 target |

プリセットによって生成される内容は異なります。`default` は詳細なエージェントロールとスキル説明を生成し、`lean` はコンパクトなプレースホルダーを生成します。

### `save` / `load` — 設定の保存と共有

デフォルトモード（recommended またはプリセット）をローカルまたはグローバルに保存し、後から再適用したり、プロジェクト間で共有できます。

```bash
bkit-doctor save --local --recommended    # 設定をローカルに保存
bkit-doctor save --global --preset lean   # グローバルに保存（全プロジェクト共通）
bkit-doctor save --both --preset default  # 両方に保存

bkit-doctor load --local                  # 保存済みのローカル設定を再適用
bkit-doctor load --global                 # グローバル設定を現在のプロジェクトに適用
bkit-doctor load --file ./settings.json   # 指定ファイルから適用
```

### `version` — バージョン情報の表示

```bash
bkit-doctor version       # バージョン + プラットフォーム情報
bkit-doctor --version     # バージョン番号のみ
```

---

## 診断項目（14項目）

| カテゴリ | チェック内容 | 重要度 |
|----------|-------------|--------|
| structure | `.claude/` ディレクトリの存在 | **hard**（未検出時 exit 1） |
| config | `CLAUDE.md` の存在 | **hard**（未検出時 exit 1） |
| config | `.claude/hooks.json` の存在 | soft |
| config | `.claude/settings.local.json` の存在 | soft |
| docs | `docs/01-plan/` から `docs/04-report/`（4項目） | soft |
| agents | 必須エージェント定義ファイル4件 | soft |
| skills | 必須 SKILL.md ファイル7件 | soft |
| policies | 必須ポリシーファイル4件 | soft |
| templates | 必須テンプレートファイル4件 | soft |
| context | `.claude/context/` ディレクトリ | soft |
| changelog | `CHANGELOG.md`（候補パス3箇所） | soft |

**ハードチェック** は `check` を exit code 1 で終了させます。**ソフトチェック** は警告を出力しますが exit code 0 で終了します。

---

## CI での使用

`bkit-doctor check` は重要な構造が不足している場合に exit code 1 を返すため、CI ゲートとして利用できます：

```bash
# GitHub Actions の例
- name: Check Claude Code project health
  run: npx bkit-doctor check --path .

# シェルスクリプト
bkit-doctor check || { echo "Project health check failed"; exit 1; }
```

---

## 利用可能な init ターゲット

| Target | 作成されるもの |
|--------|---------------|
| `claude-root` | `.claude/` ルートディレクトリ |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 配下にエージェント定義ファイル4件 |
| `skills-core` | `.claude/skills/` 配下にスキル SKILL.md ファイル7件 |
| `templates-core` | `.claude/templates/` 配下にドキュメントテンプレート4件 |
| `policies-core` | `.claude/policies/` 配下にポリシーファイル4件 |
| `docs-plan` | `docs/01-plan/` ディレクトリ |
| `docs-design` | `docs/02-design/` ディレクトリ |
| `docs-task` | `docs/03-task/` ディレクトリ |
| `docs-report` | `docs/04-report/` ディレクトリ |
| `docs-changelog` | `CHANGELOG.md` |
| `docs-core` | 全ドキュメント（すべての `docs-*` ターゲットのエイリアス） |

---

## bkitとは？

[bkit](https://github.com/anthropics/bkit) は、Claude Code のための PDCA ベースの開発ワークフローフレームワークです。AI ネイティブ開発のための構造化されたフェーズ（Plan, Design, Do, Check, Report）、エージェントチーム、品質ゲートを提供します。

**bkit-doctor は bkit の有無にかかわらず動作します：**

| 機能 | bkit なし | bkit あり |
|------|:---:|:---:|
| `check` — プロジェクト構造の診断 | Yes | Yes |
| `init` — 不足ファイルのスキャフォールド | Yes | Yes |
| `fix` — 自動修復 | Yes | Yes |
| `preset` — ワークフロー最適化バンドル | Partial | Full |
| `save` / `load` — 設定の永続化 | Yes | Yes |

コアコマンド（`check`、`init`、`fix`）はすべての Claude Code プロジェクトで利用できます。プリセットと高度なスキャフォールドターゲットは bkit の PDCA ワークフローに最適化されています。

---

## アーキテクチャ

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

## bkitとの関係

> **bkit-doctor は独立したプロジェクトです。** bkit の公式プラグインではなく、bkit チームとの提携関係もありません。

bkit-doctor は [bkit](https://github.com/anthropics/bkit) — PDCA ベースの AI ネイティブ開発ワークフロー — にインスピレーションを受けて開発されました。著者は bkit の資料を通じて構造化された AI コラボレーションを学び、その知見がこのツールの設計に反映されています。

bkit-doctor は bkit のコードを **含まず**、動作に bkit を **必要とせず**、bkit チームによって **承認・メンテナンスされているものではありません**。

---

## コントリビューション

コントリビューションを歓迎します。プルリクエストを提出する前に、まず Issue を作成して変更内容について議論してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feat/your-feature`
3. 可能であれば、フェーズベースのワークフローに従ってください: Plan → Design → Implement → Check
4. 変更内容と理由を明確に記述したプルリクエストを提出

---

## ライセンス

Apache License 2.0 — 全文は [LICENSE](LICENSE) をご覧ください。

---

## 謝辞

- **[bkit](https://github.com/anthropics/bkit)** — このプロジェクトに影響を与えたワークフロー哲学に感謝します
- オープンソースコミュニティ — このプロジェクトが活用しているツールやパターンに感謝します
