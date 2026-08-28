# next2d-development-mcp

[![UnitTest](https://github.com/Next2D/next2d-development-mcp/actions/workflows/integration.yml/badge.svg?branch=main)](https://github.com/Next2D/next2d-development-mcp/actions/workflows/integration.yml)
[![CodeQL](https://github.com/Next2D/next2d-development-mcp/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/Next2D/next2d-development-mcp/actions/workflows/github-code-scanning/codeql)
[![Lint](https://github.com/Next2D/next2d-development-mcp/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/Next2D/next2d-development-mcp/actions/workflows/lint.yml)

[![release](https://img.shields.io/github/v/release/Next2D/next2d-development-mcp)](https://github.com/Next2D/next2d-development-mcp/releases)

[Next2D](https://next2d.app) アプリケーション開発を支援する **MCP (Model Context Protocol) サーバー**です。  
[framework-typescript-template](https://github.com/Next2D/framework-typescript-template) を使った **MVVM + Clean Architecture + Atomic Design** パターンに従ったコード生成、アーキテクチャ検証、API リファレンスを提供します。

An **MCP (Model Context Protocol) server** for [Next2D](https://next2d.app) application development.  
Provides code generation, architecture validation, and API reference following **MVVM + Clean Architecture + Atomic Design** patterns used with the [framework-typescript-template](https://github.com/Next2D/framework-typescript-template).

---

## 目次 / Table of Contents

- [概要 / Overview](#概要--overview)
- [必要な環境 / Requirements](#必要な環境--requirements)
- [AI エージェントへの追加方法 / AI Agent Setup](#ai-エージェントへの追加方法--ai-agent-setup)
- [Tools / ツール](#tools--ツール)
- [Resources / リソース](#resources--リソース)
- [Prompts / プロンプト](#prompts--プロンプト)
- [サポートするアーキテクチャ / Supported Architecture](#サポートするアーキテクチャ--supported-architecture)
- [関連リンク / Related Links](#関連リンク--related-links)
- [License](#license)

---

## 概要 / Overview

Next2D は **WebGL/WebGPU** ベースの 2D レンダリングエンジン ([Player](https://github.com/Next2D/player)) と MVVM フレームワーク ([Framework](https://github.com/Next2D/framework)) で構成される、マルチプラットフォーム対応の開発環境です。

Next2D is a multi-platform development environment consisting of a **WebGL/WebGPU** based 2D rendering engine ([Player](https://github.com/Next2D/player)) and an MVVM framework ([Framework](https://github.com/Next2D/framework)).

この MCP サーバーは以下の機能を AI エージェントに提供します:

This MCP server provides the following capabilities to AI agents:

| 機能 / Feature | 説明 / Description |
|---|---|
| **コード生成** | View/ViewModel, UseCase, Repository, UI コンポーネント, Interface, Animation, Domain Service のスキャフォールディング |
| **ルーティング設定** | routing.json へのルートエントリ生成 |
| **アーキテクチャ検証** | プロジェクト構造の Clean Architecture 準拠チェック |
| **プロジェクト分析** | 実装済みファイルのスキャンと未実装箇所のレポート |
| **画面インスペクション** | 特定画面の全関連ファイルの一覧と実装状況の確認 |
| **実装計画生成** | 既存ファイルをスキップしつつ新規画面の順序付き実装ステップを生成 |
| **API リファレンス** | Player API, Framework 仕様, 開発テンプレート仕様の提供 |
| **リソース管理** | CLI コマンドでリファレンスリソースを登録（`add-resource` / `list-resources`） |
| **開発ガイド** | 画面追加手順, コーディング規約, デバッグガイドの提供 |
| **オーケストレーター** | 新規画面作成・既存画面修正をフェーズ別に自律実行 |

---

## 必要な環境 / Requirements

| ツール / Tool | バージョン / Version |
|---|---|
| Node.js | 24.x 以上 / 24.x or higher |
| npm | 10.x 以上 / 10.x or higher |

---

## AI エージェントへの追加方法 / AI Agent Setup

### VS Code Marketplace（推奨 / Recommended）

VS Code Marketplace からワンクリックでインストールできます。
Install with one click from the VS Code Marketplace:

**[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=next2d.next2d-development-mcp)**

インストール後、GitHub Copilot Chat で `@next2d` を入力すると MCP ツールが利用可能になります。
After installation, MCP tools are available by typing `@next2d` in GitHub Copilot Chat.

---

### GitHub Copilot (VS Code / VS Code Insiders)

プロジェクトルートに `.vscode/mcp.json` を作成します。  
Create `.vscode/mcp.json` at the project root:

```json
{
  "servers": {
    "next2d": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

VS Code の設定 (`settings.json`) で MCP を有効化:  
Enable MCP in VS Code settings (`settings.json`):

```json
{
  "github.copilot.chat.mcp.enabled": true
}
```

> 💡 Copilot Chat で `@mcp` を入力すると、利用可能なツールが表示されます。  
> 💡 Type `@mcp` in Copilot Chat to see available tools.

### Claude Desktop

設定ファイルを編集します。  
Edit the configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

> 💡 設定後、Claude Desktop を再起動してください。  
> 💡 Restart Claude Desktop after updating the configuration.

### Claude Code (CLI)

プロジェクトルートに `.mcp.json` を作成します。  
Create `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

または、CLI で直接追加:  
Or add directly via CLI:

```bash
claude mcp add next2d -- npx -y next2d-development-mcp
```

### OpenAI Codex (ChatGPT CLI)

プロジェクトルートに `.codex/mcp.json` を作成します。  
Create `.codex/mcp.json` at the project root:

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

> `npm` キャッシュ権限エラー (`EPERM`, `~/.npm/_npx`) が出る場合はキャッシュ先を明示してください。  
> If npm cache permission errors occur, set a writable cache path:
> `"args": ["-y", "--cache", "/tmp/next2d-mcp-npm-cache", "next2d-development-mcp"]`

### Gemini CLI

プロジェクトルートに `.gemini/settings.json` を作成します。  
Create `.gemini/settings.json` at the project root:

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

### Cline (VS Code Extension)

Cline の設定画面から MCP サーバーを追加します。  
Add the MCP server from Cline settings:

1. VS Code で Cline 拡張のサイドバーを開く / Open the Cline extension sidebar in VS Code
2. **MCP Servers** セクションを開く / Open the **MCP Servers** section
3. **Edit MCP Settings** をクリック / Click **Edit MCP Settings**
4. 以下を追加 / Add the following:

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

### Cursor

Cursor の設定ファイルに追加します。  
Add to Cursor settings:

- **プロジェクト単位 / Per-project**: `.cursor/mcp.json`
- **グローバル / Global**: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

### Windsurf

Windsurf の MCP 設定ファイルに追加します。  
Add to Windsurf MCP configuration:

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "next2d-development-mcp": {
      "command": "npx",
      "args": ["-y", "next2d-development-mcp"]
    }
  }
}
```

### その他の MCP 対応クライアント / Other MCP-compatible Clients

MCP は **stdio** トランスポートの標準プロトコルです。MCP 対応の任意のクライアントで以下のコマンドを設定すれば利用可能です:

MCP uses the standard **stdio** transport protocol. Configure the following command in any MCP-compatible client:

```
command: npx
args: -y next2d-development-mcp
```

---

## Tools / ツール

### オーケストレーション系 / Orchestration

| Tool | Description |
|---|---|
| `analyze_project` | routing.json をスキャンし、View/ViewModel/UseCase/Repository の実装状況を一覧表示。新機能追加前の現状把握に使用 |
| `inspect_screen` | 特定画面の全関連ファイル (View, ViewModel, Page, UseCase, Repository, Animation, Content) をファイル行数付きで一覧表示。既存画面修正前に使用 |
| `plan_feature` | 新規画面の実装ステップを順序付きで生成。既存ファイルは ✅ としてスキップ。`analyze_project` 実行後に使用 |

### コード生成系 / Code Generation

| Tool | Description |
|---|---|
| `create_view` | View/ViewModel ペアを生成 (MVVM パターン)。`name` にルートパスを指定 (例: `home`, `quest/list`) |
| `create_usecase` | UseCase クラスを生成 (Application 層)。1 アクション = 1 UseCase、`execute()` がエントリーポイント |
| `create_repository` | Repository クラスを生成 (Infrastructure 層)。try-catch 必須、config からエンドポイント取得 |
| `create_ui_component` | Atomic Design UI コンポーネント生成 (`atom` / `molecule` / `organism` / `page` / `content`) |
| `create_animation` | UI トランジション用 Animation クラスを生成。`@next2d/ui` の Tween/Easing/Job を使用。`src/ui/animation/{screen}/` に配置 |
| `create_domain_service` | Domain 層クラス (Service または Callback) を生成。Service はコアビジネスロジック、Callback は gotoView 完了後に実行 |
| `create_loading` | ローディング画面クラスを生成。`start()` / `end()` メソッドを持ち、config.json の `loading.callback` で登録 |
| `add_route` | routing.json へのルートエントリ生成。リクエスト設定 (`json` / `content` / `custom` / `cluster`) に対応 |
| `create_interface` | TypeScript インターフェースファイル生成 (`I` プレフィックス規約に準拠) |

### アーキテクチャ検証 / Architecture Validation

| Tool | Description |
|---|---|
| `validate_architecture` | プロジェクト構造の検証。ディレクトリ構成、設定ファイル、routing.json ↔ View の整合性（flat / ネスト両レイアウト対応）、**stage.json の有効キー検証**（`scaleMode` 等の無効キーを検出）をチェック |

### ツール使用例 / Tool Usage Example

AI エージェントへの指示例:

```
Next2Dプロジェクトに「quest/list」画面を追加して。
APIからクエスト一覧を取得して表示するようにして。
```

オーケストレーターモードでは `analyze_project` → `plan_feature` → `add_route` → `create_view` → `create_usecase` → `create_repository` → `create_interface` → `create_ui_component` → `create_animation` → `validate_architecture` を自律的に実行し、必要なファイルをすべて生成します。

---

## Resources / リソース

references ディレクトリ内の **Markdown ファイルはすべて自動的にリソースとして登録**されます。ファイル名が URI になります（`<name>.md` → `next2d://specs/<name>`）。

All markdown files in the references directory are **automatically registered as MCP resources**. The file name becomes the URI (`<name>.md` → `next2d://specs/<name>`).

| Resource | URI | Description |
|---|---|---|
| Specs Index | `next2d://specs` | 利用可能な全リファレンスリソースの索引 |
| Player Overview | `next2d://specs/player-overview` | Player概要・レンダリングパイプライン・DisplayListアーキテクチャ |
| Player Display Objects | `next2d://specs/player-display-objects` | クラス選び・型制約・キャッシュのポイント（クイック） |
| Player Events | `next2d://specs/player-events` | EventDispatcher / Pointer / Keyboard / Gamepad / Video / Job イベント |
| Player Media & Text | `next2d://specs/player-media-text` | テキスト・音声・動画のポイント（クイック） |
| Player Tween | `next2d://specs/player-tween` | Tween / Job / Easing（32種類） |
| Player Filters | `next2d://specs/player-filters` | BlurFilter / DropShadowFilter / GlowFilter 等の9種 |
| Framework Specs | `next2d://specs/framework-specs` | MVVM アーキテクチャ, ルーティング, config 設定, View/ViewModel ライフサイクル, gotoView フロー |
| Development Specs | `next2d://specs/develop-specs` | プロジェクト構造, CLI コマンド, Interface 定義, Model 層, UI 層 (Atomic Design), View/ViewModel パターン |
| Architecture Overview | `next2d://architecture` | アーキテクチャ概要, レイヤー構成, 設定ファイル仕様, ライフサイクル, npm コマンド一覧 |
| Player Sprite | `next2d://specs/player-sprite` | Sprite |
| Player Display Object | `next2d://specs/player-display-object` | DisplayObject |
| Player Movie Clip | `next2d://specs/player-movie-clip` | MovieClip |
| Player Shape | `next2d://specs/player-shape` | Shape |
| Player Text Field | `next2d://specs/player-text-field` | TextField |
| Player Video | `next2d://specs/player-video` | Video |
| Player Sound | `next2d://specs/player-sound` | Sound |

### リソースの追加 / Adding Resources

CLI コマンドで新しいリファレンスリソースを登録できます。ファイルのコピー、SKILL.md の References 更新、README の表更新が自動で行われます。

Register a new reference resource via CLI. It copies the file, updates the SKILL.md references list, and updates the table above automatically.

```bash
# このリポジトリで実行（ビルドは pre スクリプトで自動）
npm run add-resource -- path/to/new-spec.md --name new-spec --description "説明"

# インストール済みパッケージからも実行可能
npx next2d-development-mcp add-resource path/to/new-spec.md --name new-spec

# 登録されるリソースの一覧表示
npm run list-resources
```

| Option | Description |
|---|---|
| `--name <name>` | リソース名（既定: ファイル名）。`player-*` は Player セクションに、`framework-*` / `develop-*` は Framework セクションへ自動分類 |
| `--description <text>` | リソース説明（既定: ファイルの H1 と先頭本文から自動生成） |
| `--category <prefix>` | URI プレフィックス（既定 `specs`） |
| `--force` | 既存ファイルを上書き |
| `--target` / `--skill` / `--readme` | 更新先を明示指定 |
| `--no-skill` / `--no-readme` | ドキュメント更新をスキップ |

Example:

```bash
# Next2D Player の仕様から Sprite リファレンスを追加
npm run add-resource -- ../player/specs/ja/sprite.md --name player-sprite --description "Sprite"
```

追加後は `npm run build && npm publish` で公開してください。
After adding, run `npm run build && npm publish` to release the new resource.

### 情報量のガイドライン / Reference Size Guidelines

AI のコンテキスト負荷を抑えるためのルール。
Rules for keeping the AI context load low.

1. **SKILL.md は常時ロードされる** → References の各項目は短いトリガー文にする（API名の列挙は避ける）。
   SKILL.md is always loaded → keep each references bullet a short trigger phrase (no API enumerations).
2. **references はオンデマンド** → 1 ファイル = 1 トピック。AI はタスクに必要なファイルだけを1つ読む設計（SKILL.md に明示）。
   References are loaded on demand → one file per topic. The agent reads only the single file the task needs (stated in SKILL.md).
3. **2階層構成** → 「クイック」（実装パターン・落とし穴）を入口に、「クラス別フルAPI」（完全版）は詳細確認のときだけ参照。
   Two tiers → "quick" (patterns & pitfalls) as the entry point; "per-class full API" only when details are needed.
4. **登録時は `--description` で短いトリガー文を指定**（自動生成は長くなりがち）。
   Pass a short `--description` when registering (auto-generated ones tend to be long).

---

## Prompts / プロンプト

| Prompt | Parameters | Description |
|---|---|---|
| `orchestrate` | `task`, `screenPath`, `mode` | オーケストレーターモードを起動。`mode: "create"` で新規画面作成、`mode: "modify"` で既存画面修正のフェーズ別ワークフローを実行 |
| `new-screen` | `screenName`, `hasApi?`, `hasAnimation?` | 新しい画面追加のステップバイステップガイド |
| `architecture-guide` | — | アーキテクチャルールとコーディング規約のリファレンス |
| `debug-help` | `issue` | よくある問題のデバッグのヒントとトラブルシューティング |

### orchestrate プロンプトの使用例 / Orchestrate Prompt Example

```
# 新規画面作成
orchestrate(task="クエスト一覧画面を追加", screenPath="quest/list", mode="create")

# 既存画面修正
orchestrate(task="ホーム画面に検索機能を追加", screenPath="home", mode="modify")
```

`create` モードでは `analyze_project` → `plan_feature` → 実装 → `validate_architecture` の順に実行します。
`modify` モードでは `inspect_screen` → 対象ファイル Read → 最小変更 → `validate_architecture` の順に実行します。

---

## サポートするアーキテクチャ / Supported Architecture

```
src/
├── config/                    # 設定ファイル (stage.json, config.json, routing.json)
├── interface/                 # インターフェース定義 (I プレフィックス)
├── model/
│   ├── application/           # UseCase (ビジネスロジック)
│   ├── domain/
│   │   └── callback/          # gotoView Callback / Loading クラス
│   │       └── {name}/
│   │           └── service/   # Domain Service (純粋ビジネスロジック)
│   └── infrastructure/        # Repository (データアクセス)
├── ui/
│   ├── animation/             # UI トランジション Animation クラス
│   │   └── {screen}/          # 画面別ディレクトリ
│   ├── component/
│   │   ├── atom/              # 最小コンポーネント
│   │   ├── molecule/          # 複合コンポーネント
│   │   ├── organism/          # 複雑なコンポーネント
│   │   └── page/              # 画面レイアウト
│   └── content/               # Animation Tool コンテンツ
└── view/                      # View & ViewModel (MVVM)
```

### レイヤー依存関係 / Layer Dependencies

```
View Layer (view/, ui/)
  └─ depends on ─→ Interface Layer (interface/)
                     ↑
Application Layer (model/application/)
  ├─ depends on ─→ Interface Layer
  ├─ depends on ─→ Domain Layer (model/domain/)
  └─ calls ──────→ Infrastructure Layer (model/infrastructure/)
```

### View ライフサイクル / View Lifecycle

```
ViewModel.constructor
  → ViewModel.initialize()
    → View.constructor(vm)
      → View.initialize()
        → View.onEnter()
          → (ユーザー操作 / User interaction)
            → View.onExit()
```

---

## 関連リンク / Related Links

- [Next2D Player](https://github.com/Next2D/player) — WebGL/WebGPU 2D レンダリングエンジン
- [Next2D Framework](https://github.com/Next2D/framework) — MVVM フレームワーク
- [framework-typescript-template](https://github.com/Next2D/framework-typescript-template) — TypeScript テンプレート
- [Create Next2D App](https://github.com/Next2D/create-next2d-app) — プロジェクト生成ツール
- [Next2D Animation Tool](https://tool.next2d.app/) — アニメーション作成ツール
- [MCP Specification](https://modelcontextprotocol.io/) — Model Context Protocol 仕様

## License

MIT
