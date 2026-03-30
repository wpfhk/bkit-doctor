<div align="center">

# 🩺 bkit-doctor

**Claude Code のための AI ワークフロー CLI。**
プロジェクトを一度セットアップすれば、あとは Claude Code が自動で — 一貫して、毎回 — 処理します。

[![npm version](https://img.shields.io/badge/npm-v1.1.1-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) · [한국어](README.ko.md) · **日本語** · [中文](README.zh.md) · [Español](README.es.md)

</div>

---

## なぜ bkit-doctor なのか？

Claude Code でプロジェクトを構築していると、数日のうちに 2 つの問題が発生します:

1. **構造のドリフト** — `.claude/` ディレクトリが消え、`CLAUDE.md` のルールがずれ、フックが消えます。
2. **ワークフローの健忘** — Claude Code が何を作ったか文書化するのを忘れます。計画も、追跡も、監査証跡もありません。

**bkit-doctor が両方を解決します。** プロジェクト構造を強制し、毎回ユーザーが聞かなくても Claude Code が PDCA (Plan-Do-Check-Act) ワークフローに従うよう連携します。

```
Claude Code がロジックを生成します。
bkit-doctor が構造とワークフローの状態を永続的に追跡します。
```

---

## 🚀 クイックスタート

新規または既存のプロジェクトを最速でセットアップする方法:

```bash
npx bkit-doctor setup
```

このコマンド一つでインタラクティブウィザードが起動します:

```
bkit-doctor setup

  [1/4] プロジェクト構造を診断中...
        ✔ .claude/ ディレクトリを発見
        ✔ CLAUDE.md を発見
        ⚠ hooks.json が見つかりません → 修正します

  [2/4] 3 件の問題を自動修正中...
        ✔ hooks.json を作成
        ✔ settings.local.json を作成
        ✔ docs/ をスキャフォールド

  [3/4] CLAUDE.md を生成中...
        ✔ CLAUDE.md を書き込みました (バックアップ: CLAUDE_20260330_backup.md)

  [4/4] SKILL.md + npm スクリプトを生成中...
        ✔ SKILL.md を作成
        ✔ package.json に追加: bkit:check, bkit:fix, bkit:setup

  セットアップ完了。Claude Code がこれから PDCA ワークフローを自動的に実行します。
```

セットアップ後は `npx bkit-doctor ...` の代わりに npm ショートカットを使用できます:

```bash
npm run bkit:check   # → bkit-doctor check
npm run bkit:fix     # → bkit-doctor fix --yes
npm run bkit:setup   # → bkit-doctor setup
```

---

## ✨ コア機能

### 🧙 `setup` — ワンコマンドプロジェクト初期化

```bash
bkit-doctor setup [--path <dir>]
```

4 つのステップを順番に実行します: **診断 → 修正 → CLAUDE.md 生成 → SKILL.md + npm スクリプト生成**

- 上書き前に既存の `CLAUDE.md` を `CLAUDE_{date}_backup.md` としてバックアップ
- CI/CD でも安全: 非 TTY 環境ではインタラクティブプロンプトをスキップ (既存ファイルを保持)
- 冪等性: 2 回実行しても安全です

---

### 🤖 `skill` — プロンプト不要の PDCA ドキュメント化

```bash
bkit-doctor skill [--append-claude] [--overwrite] [--stdout] [--dry-run]
```

Claude Code があらゆるタスクを自動的に文書化するようプログラムする `SKILL.md` ファイルを生成します — プロンプト不要。

```markdown
## RULE 1: PROACTIVE DOCUMENTATION
コードを書く前に自動的に実行:
  npx bkit-doctor pdca-plan "<topic>" --type <feature|bugfix|refactor|guideline>

## RULE 2: STATE SYNC
コードを書く前に既存の PDCA 状態を確認:
  npx bkit-doctor pdca-list

## RULE 3: PIPELINE
コーディング後に残りのステージを自動実行:
  npx bkit-doctor pdca-do "<topic>"
  npx bkit-doctor pdca-check "<topic>"
  npx bkit-doctor pdca-report "<topic>"
```

**`--append-claude`** でこれらのルールを `CLAUDE.md` に直接注入し、プロジェクト全体に適用します。

---

### 📋 `pdca` — ファイルシステム AI ワークフローエンジン

任意のタスクに対して構造化された PDCA ドキュメントを生成します。状態は `.bkit-doctor/pdca-state.json` で追跡されます。

```bash
# ワンショット: 完全なガイドを生成
bkit-doctor pdca "ユーザー認証" --type feature --owner alice --priority P1

# ステージごとのワークフロー
bkit-doctor pdca-plan "ユーザー認証"
bkit-doctor pdca-do   "ユーザー認証"
bkit-doctor pdca-check "ユーザー認証"
bkit-doctor pdca-report "ユーザー認証"

# アクティブなトピックをすべて表示
bkit-doctor pdca-list
```

ドキュメントタイプ: `guideline` · `feature` · `bugfix` · `refactor`

出力: `output/pdca/<slug>-pdca-{stage}.md` — バージョン管理可能、監査可能、git 追跡可能。

---

### 🧹 `clear` — 安全な設定のクリーンアップ

```bash
bkit-doctor clear [--path <dir>]
```

bkit-doctor が生成したファイルをインタラクティブに選択して削除します。削除前に明示的な確認が必要です — データが静かに消えることはありません。

---

### 🔍 `check` / `fix` / `init` — 構造の強制適用

```bash
bkit-doctor check        # 16 件の診断チェックを実行 → pass/warn/fail
bkit-doctor fix --yes    # すべての問題を自動修正 (check + recommend + init)
bkit-doctor init --preset default --yes   # 完全なプロジェクト構造をスキャフォールド
```

**16 件の診断チェック**: 構造 · 設定 · エージェント · スキル · ポリシー · テンプレート · ドキュメント · 変更履歴

ハード失敗 (`.claude/` または `CLAUDE.md` が見つからない) 時に終了コード `1` — CI フレンドリー。

---

## 🤖 Claude Code 連携の仕組み

プロジェクトルートに `SKILL.md` が存在すると、Claude Code はそれをプロジェクトコンテキストとして読み込み、すべてのタスクでそのルールに従います。

```
your-project/
├── CLAUDE.md          ← プロジェクトルール + ワークフロー指示
├── SKILL.md           ← Claude Code 自動化ルール
├── .claude/
│   ├── hooks.json
│   └── settings.local.json
└── output/
    └── pdca/
        ├── user-auth-pdca-plan.md
        ├── user-auth-pdca-do.md
        └── user-auth-pdca-report.md     ← 自動生成、プロンプト不要
```

結果: **すべての機能、バグ修正、リファクタリングが自動的に計画・実行・検証・報告され**、手作業なしに永続的な監査証跡が構築されます。

---

## 📖 コマンドリファレンス

| コマンド | 説明 |
|---------|------|
| `setup` | インタラクティブウィザード: check → fix → CLAUDE.md → SKILL.md → npm スクリプト |
| `skill` | Claude Code 自動化ルールを含む `SKILL.md` を生成 |
| `clear` | 確認後に設定ファイルをインタラクティブ削除 |
| `check` | 16 件の診断チェックを実行 |
| `fix` | すべての問題を自動修正 (check + recommend + init) |
| `init` | 不足しているファイルとディレクトリをスキャフォールド |
| `pdca <topic>` | 完全な PDCA ガイドドキュメントを生成 |
| `pdca-plan <topic>` | Plan ステージドキュメントを生成 |
| `pdca-do <topic>` | Do ステージドキュメントを生成 |
| `pdca-check <topic>` | Check ステージドキュメントを生成 |
| `pdca-report <topic>` | Report ステージドキュメントを生成 |
| `pdca-list` | アクティブな PDCA トピック一覧 |
| `preset` | プリセットの一覧表示、詳細表示、または推奨 |
| `save` | 現在の設定を保存 (local / global / both) |
| `load` | 保存した設定を現在のプロジェクトに適用 |
| `version` | バージョンとプラットフォーム情報を表示 |

---

## 📦 チェック項目 (16 件)

| カテゴリ | チェック内容 | 深刻度 |
|----------|------------|--------|
| structure | `.claude/` ディレクトリ | **hard** (exit 1) |
| config | `CLAUDE.md` | **hard** (exit 1) |
| config | `hooks.json` | soft |
| config | `settings.local.json` | soft |
| agents | エージェント定義ファイル 4 件 | soft |
| skills | `.claude/skills/` 配下のスキルファイル 7 件 | soft |
| policies | ポリシーファイル 4 件 | soft |
| templates | テンプレートファイル 4 件 | soft |
| docs | `docs/01-plan/` → `docs/04-report/` (4 件) | soft |
| docs | `output/pdca/` ディレクトリ | soft |
| docs | PDCA ガイドコンテンツの有効性 | soft |
| context | `.claude/context/` ディレクトリ | soft |
| changelog | `CHANGELOG.md` | soft |

---

## 🛠 利用可能な `init` ターゲット

| ターゲット | 作成内容 |
|-----------|---------|
| `claude-root` | `.claude/` ディレクトリ |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | エージェント定義ファイル 4 件 |
| `skills-core` | `.claude/skills/` 配下の SKILL.md ファイル 7 件 |
| `templates-core` | ドキュメントテンプレート 4 件 |
| `policies-core` | ポリシーファイル 4 件 |
| `docs-core` | すべての `docs/` ディレクトリ |
| `docs-pdca` | `output/pdca/` PDCA 出力ディレクトリ |
| `docs-changelog` | `CHANGELOG.md` |

**プリセット:** `default` (フル) · `lean` (最小) · `workflow-core` · `docs`

---

## 🔗 bkit との連携

bkit-doctor は構造と状態を強制します。**[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** は AI ワークフローエンジン自体を動かす Claude Code プラグインです (31 エージェント、36 スキル、PDCA オーケストレーション)。

| | bkit-doctor | bkit (プラグイン) |
|--|-------------|-----------------|
| プロジェクト構造 | ✅ 作成 & 検証 | — |
| CLAUDE.md / SKILL.md | ✅ 生成 | 読み取り |
| PDCA ドキュメントエンジン | ✅ ファイル生成 | オーケストレーション |
| AI エージェント & スキル | — | ✅ 31 エージェント / 36 スキル |
| 実行環境 | ターミナル | Claude Code |

```bash
# Claude Code 内で bkit をインストール
/plugin marketplace add popup-studio-ai/bkit-claude-code
```

---

## CI での使用

```yaml
# GitHub Actions
- name: プロジェクト構造チェック
  run: npx bkit-doctor check
# .claude/ または CLAUDE.md が見つからない場合 exit 1
```

---

## コントリビューション

コントリビューションを歓迎します。変更したい内容がある場合は、まずイシューを開いて相談してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feat/my-feature`
3. テストを実行: `npm test`
4. プルリクエストを提出

---

<div align="center">
  Claude Code で開発するすべての人のために作られました。<br>
  <a href="https://github.com/dotoricode/bkit-doctor">GitHub</a> · <a href="https://www.npmjs.com/package/bkit-doctor">npm</a> · <a href="CHANGELOG.md">Changelog</a>
</div>
