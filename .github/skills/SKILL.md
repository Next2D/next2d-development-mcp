---
name: next2d-development-assistant
description: >
  Next2D Player および Next2D Framework を用いたアプリケーション開発を支援するスキル。
  TypeScript ベースの MVVM + Clean Architecture + Atomic Design パターンに従ったコード生成、
  WebGL/WebGPU 2D レンダリングエンジン API の活用、デバッグ支援、パフォーマンス最適化を提供する。

  Use when:
  (1) Next2D Player の DisplayObject API (MovieClip, Sprite, Shape, TextField, Video, Sound, Tween, Filters) を使ったコードを書く
  (2) Next2D Framework の MVVM パターン (View/ViewModel, UseCase, Repository) に従った画面実装
  (3) routing.json, config.json, stage.json の設定
  (4) Atomic Design (Atom/Molecule/Organism/Page) による UI コンポーネント設計
  (5) Animation Tool (.n2d) アセットとの連携
  (6) マルチプラットフォームビルド (Web/Steam/iOS/Android)
  (7) Next2D プロジェクトの新規作成やセットアップ

  Trigger keywords: Next2D, next2d, @next2d/player, @next2d/framework, @next2d/display,
  @next2d/events, @next2d/text, @next2d/media, @next2d/ui, MovieClipContent,
  gotoView, routing.json, stage.json, create-next2d-app
---

# Next2D Development Assistant

## Overview

Next2D は WebGL/WebGPU ベースの 2D レンダリングエンジン (Player) と MVVM フレームワーク (Framework) で構成される。
Flash Player ライクな DisplayList アーキテクチャを Web/デスクトップ/モバイルで実現する。

## Architecture

```
View Layer (view/, ui/)
  └─ depends on ─→ Interface Layer (interface/)
                     ↑
Application Layer (model/application/)
  ├─ depends on ─→ Interface Layer
  ├─ depends on ─→ Domain Layer (model/domain/)
  └─ calls ──────→ Infrastructure Layer (model/infrastructure/)
```

**Design Patterns:** MVVM + Clean Architecture + Atomic Design
**Language:** TypeScript (any 禁止, Interface は I プレフィックス)
**Build Tool:** Vite / **Testing:** Vitest / **Package Manager:** npm

## Quick Start

```bash
npx create-next2d-app my-app
cd my-app
npm install
npm start           # http://localhost:5173
npm run generate    # routing.json から View/ViewModel を自動生成
```

## Core Workflow

### 1. 新しい画面を追加する

1. `src/config/routing.json` にルートを追加
2. `npm run generate` で View/ViewModel の雛形を自動生成
3. ViewModel に UseCase を追加
4. View に UI コンポーネント (Atomic Design) を配置
5. イベントは必ず ViewModel に委譲

### 2. API データを取得する画面

1. `interface/` にレスポンス型を定義 (`I` プレフィックス)
2. `model/infrastructure/repository/` に Repository を作成 (try-catch 必須, config からエンドポイント取得)
3. `model/application/{screen}/usecase/` に UseCase を作成 (`execute` メソッド統一)
4. `routing.json` の `requests` で自動取得、または ViewModel から UseCase 経由で取得

### 3. Animation Tool アセットを使う

1. Animation Tool でシンボルを作成 → `.n2d` ファイルを `file/` に配置
2. `ui/content/` に MovieClipContent 継承クラスを作成 (`namespace` でシンボル名を指定)
3. `routing.json` で `type: "content"` として読み込み

## View/ViewModel Lifecycle

```
ViewModel 生成 → ViewModel.initialize() → View 生成 (VM注入) → View.initialize() → View.onEnter() → (操作) → View.onExit()
```

**重要:** ViewModel の `initialize()` は View の `initialize()` より前に呼ばれる。View 初期化時にはデータ準備済み。

## Key Rules

- **View:** 表示構造のみ。ビジネスロジック禁止。イベントは ViewModel に委譲
- **ViewModel:** UseCase を保持。インターフェースに依存 (具象クラス禁止)
- **UseCase:** 1 アクション = 1 UseCase。エントリーポイントは `execute`。単一責任
- **Repository:** try-catch 必須。エンドポイントは `config` から取得。`any` 禁止
- **UI Component:** 単一責任。データは ViewModel から引数で受け取る
- **Interface:** `I` プレフィックス。必要最小限のプロパティのみ

## Build Commands

| Command | Platform | Output |
|---------|----------|--------|
| `npm run build:web -- --env prd` | Web | `dist/web/prd/` |
| `npm run build:steam:windows -- --env prd` | Windows | `dist/steam/windows/` |
| `npm run build:steam:macos -- --env prd` | macOS | `dist/steam/macos/` |
| `npm run build:ios -- --env prd` | iOS | Xcode project |
| `npm run build:android -- --env prd` | Android | Android Studio project |

Environment options: `--env local|dev|stg|prd`

## References

Detailed specifications are available in the `references/` directory. Read the relevant file based on the user's needs:

- **[player-specs.md](references/player-specs.md)** - Next2D Player API reference (DisplayObject, MovieClip, Sprite, Shape, TextField, Video, Sound, Tween, Events, Filters). Read when implementing rendering, animation, graphics, or interaction logic.
- **[framework-specs.md](references/framework-specs.md)** - Next2D Framework reference (MVVM architecture, routing, config, View/ViewModel lifecycle, Animation Tool integration). Read when working on application architecture, screen transitions, or configuration.
- **[develop-specs.md](references/develop-specs.md)** - Development template specs (project structure, CLI commands, interfaces, Model layer, UI layer with Atomic Design, View/ViewModel patterns). Read when creating new components, setting up projects, or following coding patterns.

### When to read which reference

| Task | Reference |
|------|-----------|
| DisplayObject のプロパティ/メソッドを確認 | player-specs.md |
| MovieClip/Sprite/Shape/TextField の使い方 | player-specs.md |
| フィルター (Blur, DropShadow, Glow 等) の適用 | player-specs.md |
| Tween アニメーションの実装 | player-specs.md |
| Sound/Video の再生 | player-specs.md |
| イベントシステム (addEventListener 等) | player-specs.md |
| routing.json / config.json の設定 | framework-specs.md |
| View/ViewModel のライフサイクル | framework-specs.md |
| 画面遷移 (gotoView) の実装 | framework-specs.md |
| Animation Tool 連携 | framework-specs.md |
| プロジェクト構造・ディレクトリ設計 | develop-specs.md |
| UseCase / Repository の作成 | develop-specs.md |
| Atomic Design コンポーネントの作成 | develop-specs.md |
| ボタン連続押下防止パターン | develop-specs.md |
| Interface の定義パターン | develop-specs.md |
| テストの書き方 (Vitest) | develop-specs.md |
