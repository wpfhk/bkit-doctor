# bkit-doctor

> AI コーディングツールで作ったプロジェクトの構造を診断し、自動的に修正する CLI ツール。

[![npm version](https://img.shields.io/npm/v/bkit-doctor)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](https://github.com/dotoricode/bkit-doctor/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](./README.md) | [한국어](./README.ko.md) | **日本語** | [中文](./README.zh.md) | [Español](./README.es.md)

---

## bkit-doctorとは？

Claude Code や Cursor といった AI コーディングツールでプロジェクトを作っていると、構造が乱れがちです。コンテキストファイルが欠けていたり、ドキュメントディレクトリがなかったり、設定ファイルが不足していたり。時間が経つと、AI が効果的に動作するために必要な構造化されたコンテキストを失ってしまいます。

**bkit-doctor** はこうした問題をひとつのコマンドで診断し、自動修正します。`.claude/` ディレクトリ、hooks、settings、エージェント定義、スキルファイル、テンプレート、ポリシー、ドキュメントスキャフォールド — プロジェクトに必要な構造があるか確認し、不足しているものを自動的に作成します。

**プロジェクトレイアウトのための ESLint** と考えてください。14 項目の診断、各項目の pass/warn/fail、ワンコマンド自動修正。

```bash
npx bkit-doctor check          # プロジェクトを診断
npx bkit-doctor fix --yes      # すべてを自動修正
```

bkit-doctor は [bkit](https://github.com/popup-studio-ai/bkit-claude-code) PDCA ワークフロー方法論をベースに作られていますが、独立して動作します — bkit のインストールは不要です。

---

## クイックスタート: bkit と一緒に新しいプロジェクトを設定する

> bkit-doctor だけでも十分便利ですが、[bkit](https://github.com/popup-studio-ai/bkit-claude-code) と組み合わせると PDCA ワークフロー、31 個のエージェント、36 個のスキルが使えるようになります。

### Step 1 — bkit-doctor でプロジェクト構造をスキャフォールド

新しいプロジェクトフォルダ内で以下のコマンドを実行します。

```bash
# 1. プロジェクトを診断（最初は多くが warn/fail になるのが正常です）
npx bkit-doctor check

# 2. 不足している構造をすべて自動生成
npx bkit-doctor init --preset default --yes

# 3. 再診断して HEALTHY を確認
npx bkit-doctor check
```

このステップが完了すると、プロジェクト内に `.claude/`、`docs/`、`CLAUDE.md` などの**ディレクトリとファイルの骨格**が作成されます。

```
your-project/
├── .claude/
│   ├── hooks.json
│   ├── settings.local.json
│   ├── agents/          ← エージェント定義ファイル（プレースホルダー）
│   ├── skills/          ← スキルファイル（プレースホルダー）
│   ├── templates/       ← ドキュメントテンプレート
│   └── policies/        ← ポリシーファイル
├── docs/
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-task/
│   └── 04-report/
├── CLAUDE.md
└── CHANGELOG.md
```

> **この状態はスケルトンです。** `.claude/agents/` と `.claude/skills/` 内のファイルはプレースホルダーです。実際の bkit エージェント/スキルのロジックはまだ含まれていません。次のステップで追加されます。

---

### Step 2 — Claude Code に bkit プラグインをインストール

bkit の実際の機能（PDCA ワークフロー、CTO エージェントチーム、品質ゲートなど）は **Claude Code プラグイン**として動作します。Claude Code を開き、以下のコマンドを実行します。

```
# Claude Code のターミナル内で実行
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

インストールが完了すると、Claude Code がプラグインを `~/.claude/plugins/bkit/` に保存します。これで bkit の 36 個のスキルと 31 個のエージェントがすべてのプロジェクトで自動的に有効になります。

---

### Step 3 — 最初の開発セッションを開始

bkit プラグインがインストールされた Claude Code で、以下のコマンドで PDCA ワークフローを開始します。

```
# 新機能の開発開始（例: ログイン機能）
/pdca plan login-feature

# 設計ドキュメントの生成
/pdca design login-feature

# 実装
/pdca do login-feature

# 検証とギャップ分析
/pdca analyze login-feature
```

ドキュメントは bkit-doctor が作成した `docs/` ディレクトリ構造に保存されます。

---

### 構造の概要

```
bkit-doctor                       bkit（Claude Code プラグイン）
──────────────────────────        ──────────────────────────────────
プロジェクトスケルトンを作成         実際の AI ワークフローエンジン
.claude/ ディレクトリ構造           36 スキル / 31 エージェント
docs/ ドキュメント構造              PDCA ステートマシン
hooks.json 設定                    品質ゲート / 監査ログ
CLAUDE.md コンテキストファイル      CTO-Led エージェントチーム
```

bkit-doctor は**一度実行すれば終わり**です。その後は bkit が Claude Code 内ですべてのワークフローを担当します。

---

## インストール

```bash
# インストールせずに即時実行（お試しにおすすめ）
npx bkit-doctor check

# グローバルインストール
npm install -g bkit-doctor

# またはプロジェクトの devDependency として追加
npm install --save-dev bkit-doctor
```

**Node.js >= 18** が必要です。

### ソースから実行

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## コマンド

bkit-doctor には 8 つのコマンドがあります。

### `check` — プロジェクト構造の診断

14 項目の診断チェックを実行し、各項目について pass/warn/fail を報告します。後続の `init --recommended` や `fix` のために推奨スナップショットを保存します。

```bash
bkit-doctor check                    # カレントディレクトリをチェック
bkit-doctor check --path ./other     # 別のディレクトリをチェック
```

Exit code: いずれかのハードチェックが失敗した場合は **1**、それ以外は **0**。

**出力例:**

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

### `init` — 不足ファイルのスキャフォールド

不足しているディレクトリやファイルを作成します。デフォルトでは非破壊的です — 明示的に `--overwrite` を指定しない限り、既存のファイルは上書きされません。

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

利用可能なプリセット:

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

### `pdca` — PDCA ガイドドキュメントの生成

任意のトピックに対して構造化された PDCA（Plan-Do-Check-Act）ガイドドキュメントを生成します。出力は編集可能なプレースホルダー付きの Markdown ファイルです。

```bash
bkit-doctor pdca "デプロイ承認基準"                           # ガイドを生成
bkit-doctor pdca "決済エラー対応" --stdout                    # ターミナルに出力
bkit-doctor pdca "オペレーションチェックリスト" --overwrite    # 既存ファイルを上書き
bkit-doctor pdca "リリースチェックリスト" -o docs/custom.md   # カスタム出力パス
bkit-doctor pdca "ログイン機能" --type feature --owner alice --priority P0
```

**デフォルト出力パス:** `docs/00-pdca/<slug>-pdca-guide.md`

**オプション:**

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `-p, --path <dir>` | プロジェクトルートディレクトリ | `cwd` |
| `-o, --output <file>` | カスタム出力ファイルパス | — |
| `--stdout` | ファイルに書かず標準出力に出力 | — |
| `--overwrite` | 既存ファイルを上書き | — |
| `--type <kind>` | `guideline` / `feature` / `bugfix` / `refactor` | `guideline` |
| `--owner <name>` | オーナー名 | `TBD` |
| `--priority <level>` | 優先度（`P0` / `P1` / `P2` / `P3`） | `P1` |

**スコープ（v1）:** テンプレートベースの生成のみ。ステートフルな PDCA ワークフロー、AI 生成、マルチステップサブコマンドは含みません。

### `version` — バージョン情報の表示

```bash
bkit-doctor version       # バージョン + プラットフォーム情報
bkit-doctor --version     # バージョン番号のみ
```

---

## 診断項目（14 項目）

| カテゴリ | チェック内容 | 重要度 |
|----------|-------------|--------|
| structure | `.claude/` ディレクトリの存在 | **hard**（未検出時 exit 1） |
| config | `CLAUDE.md` の存在 | **hard**（未検出時 exit 1） |
| config | `.claude/hooks.json` の存在 | soft |
| config | `.claude/settings.local.json` の存在 | soft |
| docs | `docs/01-plan/` から `docs/04-report/`（4 項目） | soft |
| agents | 必須エージェント定義ファイル 4 件 | soft |
| skills | 必須 SKILL.md ファイル 7 件 | soft |
| policies | 必須ポリシーファイル 4 件 | soft |
| templates | 必須テンプレートファイル 4 件 | soft |
| context | `.claude/context/` ディレクトリ | soft |
| changelog | `CHANGELOG.md`（候補パス 3 箇所） | soft |

**ハードチェック**は `check` を exit code 1 で終了させます。**ソフトチェック**は警告を出力しますが exit code 0 で終了します。

---

## CI での使用

`bkit-doctor check` は重要な構造が不足している場合に exit code 1 を返すため、CI ゲートとして利用できます。

```yaml
# GitHub Actions
- name: プロジェクト構造チェック
  run: npx bkit-doctor check
```

```bash
# シェルスクリプト
bkit-doctor check || { echo "構造チェック失敗"; exit 1; }
```

Exit code の動作:

- **ハード FAIL**（`.claude/` または `CLAUDE.md` 欠損） → exit 1、CI 失敗
- **ソフト FAIL**（警告のみ） → exit 0、CI 通過

---

## 利用可能な init ターゲット

| Target | 作成されるもの |
|--------|---------------|
| `claude-root` | `.claude/` ルートディレクトリ |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | `.claude/agents/` 配下にエージェント定義ファイル 4 件 |
| `skills-core` | `.claude/skills/` 配下にスキル SKILL.md ファイル 7 件 |
| `templates-core` | `.claude/templates/` 配下にドキュメントテンプレート 4 件 |
| `policies-core` | `.claude/policies/` 配下にポリシーファイル 4 件 |
| `docs-plan` | `docs/01-plan/` ディレクトリ |
| `docs-design` | `docs/02-design/` ディレクトリ |
| `docs-task` | `docs/03-task/` ディレクトリ |
| `docs-report` | `docs/04-report/` ディレクトリ |
| `docs-changelog` | `CHANGELOG.md` |
| `docs-core` | 全ドキュメント（すべての `docs-*` ターゲットのエイリアス） |

---

## FAQ

**Q: `init --preset default` を実行しましたが bkit の機能が有効になりません。**

A: bkit-doctor はプロジェクトの**ファイル構造**を作成するツールです。bkit の実際の機能（PDCA ワークフロー、エージェント、スキル）は **Claude Code プラグイン**として別途インストールが必要です。Claude Code を開き、以下のコマンドを実行してください。

```
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

**Q: `.claude/agents/` にファイルが作成されましたが、これが bkit のエージェントですか？**

A: いいえ。bkit-doctor が生成するエージェントファイルは**プレースホルダー**です。実際の bkit の 31 個のエージェントは Claude Code の bkit プラグインに含まれています（`~/.claude/plugins/bkit/agents/`）。bkit-doctor が作成したファイルはカスタムエージェントを追加する際の参考として使用できます。

**Q: bkit をインストールする必要がありますか？**

A: いいえ。bkit-doctor はスタンドアロンの CLI ツールです。bkit なしでも動作します。`/pdca` コマンドなど bkit のワークフローを使いたい場合は、Claude Code に bkit プラグインのインストールが必要です。

**Q: 既存のファイルが上書きされますか？**

A: デフォルトでは上書きしません。`--overwrite` を明示的に指定する必要があります。`--overwrite --backup` を組み合わせると、上書き前にバックアップを作成します。

**Q: 作成されるファイルを事前に確認できますか？**

A: `--dry-run` オプションで事前確認できます。実際のファイルは変更されません。

```bash
bkit-doctor init --recommended --dry-run
bkit-doctor fix --dry-run
```

**Q: CI で使用できますか？**

A: はい。`check` はコア構造が欠損している場合に exit code 1 を返すため、CI ゲートとして使用できます。

---

## bkitとは？

[bkit](https://github.com/popup-studio-ai/bkit-claude-code)（Vibecoding Kit）は Claude Code のための PDCA ベースの開発ワークフローフレームワークです。AI ネイティブ開発のための構造化されたフェーズ（Plan, Design, Do, Check, Report）、エージェントチーム、品質ゲートを提供します。

**bkit-doctor は bkit の有無にかかわらず動作します:**

| 機能 | bkit なし | bkit あり |
|------|:---------:|:---------:|
| `check` — プロジェクト構造の診断 | ✅ | ✅ |
| `init` — 不足ファイルのスキャフォールド | ✅ | ✅ |
| `fix` — 自動修復 | ✅ | ✅ |
| `preset` — ワークフロー最適化バンドル | Partial | Full |
| `/pdca` ワークフローコマンド | ❌ | ✅ |
| 31 エージェント / 36 スキル | ❌ | ✅ |
| PDCA 品質ゲート / 監査ログ | ❌ | ✅ |

bkit 詳細: https://github.com/popup-studio-ai/bkit-claude-code

---

## アーキテクチャ

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI 進入点（commander）
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — 診断の登録と実行
│   ├── checkers/                 # 14 個の診断モジュール
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFile ユーティリティ
│   ├── check/
│   │   ├── resultModel.js        # CheckResult 型
│   │   ├── formatters/           # ターミナル出力レンダラー
│   │   └── recommendations/      # 推奨エンジン + スナップショットキャッシュ
│   ├── init/                     # スキャフォールドマニフェスト、プランビルダー、適用ロジック
│   ├── fix/                      # resolveFixTargets — スナップショット対応の修復
│   ├── preset/                   # プリセットスコアリング + 推薦
│   ├── config/                   # 設定の保存/読み込み（local + global）
│   ├── backup/                   # バックアップセッション管理
│   └── shared/
│       └── remediationMap.js     # checker id → initTarget マッピング
├── tests/                        # 167 個のテスト（node:test）
├── scripts/
│   └── verify-release.js         # 38 項目のリリース検証
└── docs/                         # PDCA フェーズドキュメント（plan, design, task, report）
```

---

## bkitとの関係

> **bkit-doctor は独立したプロジェクトです。** bkit の公式プラグインではなく、bkit チームとの提携関係もありません。

bkit-doctor は [bkit](https://github.com/popup-studio-ai/bkit-claude-code) — PDCA ベースの AI ネイティブ開発ワークフロー — にインスピレーションを受けて開発されました。著者は bkit の資料を通じて構造化された AI コラボレーションを学び、その知見がこのツールの設計に反映されています。

bkit-doctor は bkit のコードを**含まず**、動作に bkit を**必要とせず**、bkit チームによって**承認・メンテナンスされているものではありません**。

---

## コントリビューション

コントリビューションを歓迎します。プルリクエストを提出する前に、まず Issue を作成して変更内容について議論してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feat/your-feature`
3. 可能であれば、フェーズベースのワークフローに従ってください: Plan → Design → Implement → Check
4. 変更内容と理由を明確に記述したプルリクエストを提出

---

## ライセンス

Apache License 2.0 — 全文は [LICENSE](./LICENSE) をご覧ください。

---

## 謝辞

- **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** — このプロジェクトに影響を与えたワークフロー哲学
- オープンソースコミュニティ — このプロジェクトが基盤とするツールとパターン

---

> **免責事項**: このツールは独立したコミュニティツールであり、POPUP STUDIO の公式製品ではありません。"bkit" は POPUP STUDIO PTE. LTD. の商標です。
