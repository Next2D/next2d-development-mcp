# next2d-development-mcp

<div align="center">
  <img src="https://github.com/Next2D/next2d-development-mcp/raw/main/icon.png" width="180" alt="Next2D">
</div>

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
- [License](#license)

---

## 概要 / Overview

Next2D は **WebGL/WebGPU** ベースの 2D レンダリングエンジン ([Player](https://github.com/Next2D/player)) と MVVM フレームワーク ([Framework](https://github.com/Next2D/framework)) で構成される、マルチプラットフォーム対応の開発環境です。

Next2D is a multi-platform development environment consisting of a **WebGL/WebGPU** based 2D rendering engine ([Player](https://github.com/Next2D/player)) and an MVVM framework ([Framework](https://github.com/Next2D/framework)).

この MCP サーバーは以下の機能を AI エージェントに提供します:

This MCP server provides the following capabilities to AI agents:

| 機能 / Feature | 説明 / Description |
|---|---|
| **コード生成** | View/ViewModel, UseCase, Repository, UI コンポーネント, Interface のスキャフォールディング |
| **ルーティング設定** | routing.json へのルートエントリ生成 |
| **アーキテクチャ検証** | プロジェクト構造の Clean Architecture 準拠チェック |
| **API リファレンス** | Player API, Framework 仕様, 開発テンプレート仕様の提供 |
| **開発ガイド** | 画面追加手順, コーディング規約, デバッグガイドの提供 |

---

## 必要な環境 / Requirements

| ツール / Tool | バージョン / Version |
|---|---|
| Node.js | 22.x 以上 / 22.x or higher |
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

| Tool | Description |
|---|---|
| `create_view` | View/ViewModel ペアを生成 (MVVM パターン)。`name` にルートパスを指定 (例: `home`, `quest/list`) |
| `create_usecase` | UseCase クラスを生成 (Application 層)。1 アクション = 1 UseCase、`execute()` がエントリーポイント |
| `create_repository` | Repository クラスを生成 (Infrastructure 層)。try-catch 必須、config からエンドポイント取得 |
| `create_ui_component` | Atomic Design UI コンポーネント生成 (`atom` / `molecule` / `organism` / `page` / `content`) |
| `add_route` | routing.json へのルートエントリ生成。リクエスト設定 (`json` / `content` / `custom` / `cluster`) に対応 |
| `create_interface` | TypeScript インターフェースファイル生成 (`I` プレフィックス規約に準拠) |
| `validate_architecture` | プロジェクト構造の検証。ディレクトリ構成、設定ファイル、routing.json ↔ View の整合性をチェック |

### ツール使用例 / Tool Usage Example

AI エージェントへの指示例:

```
Next2Dプロジェクトに「quest/list」画面を追加して。
APIからクエスト一覧を取得して表示するようにして。
```

エージェントが自動的に `add_route` → `create_view` → `create_usecase` → `create_repository` → `create_interface` → `create_ui_component` を順に実行し、必要なファイルをすべて生成します。

---

## Resources / リソース

| Resource | URI | Description |
|---|---|---|
| Player API Specs | `next2d://specs/player` | DisplayObject, MovieClip, Sprite, Shape, TextField, Video, Sound, Tween, Events, Filters 等の API リファレンス |
| Framework Specs | `next2d://specs/framework` | MVVM アーキテクチャ, ルーティング, config 設定, View/ViewModel ライフサイクル, gotoView フロー |
| Development Specs | `next2d://specs/develop` | プロジェクト構造, CLI コマンド, Interface 定義, Model 層, UI 層 (Atomic Design), View/ViewModel パターン |
| Architecture Overview | `next2d://architecture` | アーキテクチャ概要, レイヤー構成, 設定ファイル仕様, ライフサイクル, npm コマンド一覧 |

---

## Prompts / プロンプト

| Prompt | Parameters | Description |
|---|---|---|
| `new-screen` | `screenName`, `hasApi?`, `hasAnimation?` | 新しい画面追加のステップバイステップガイド |
| `architecture-guide` | — | アーキテクチャルールとコーディング規約のリファレンス |
| `debug-help` | `issue` | よくある問題のデバッグのヒントとトラブルシューティング |

---

## サポートするアーキテクチャ / Supported Architecture

```
src/
├── config/                    # 設定ファイル (stage.json, config.json, routing.json)
├── interface/                 # インターフェース定義 (I プレフィックス)
├── model/
│   ├── application/           # UseCase (ビジネスロジック)
│   ├── domain/                # コアビジネスルール
│   └── infrastructure/        # Repository (データアクセス)
├── ui/
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
