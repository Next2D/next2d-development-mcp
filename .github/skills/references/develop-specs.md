# Next2D Framework TypeScript Template - Development Specs

## Table of Contents

1. [Overview](#next2d-framework-typescript-template---overview)
2. [CLI Commands Reference](#cli-commands-reference)
3. [Configuration Files](#configuration-files)
4. [Interface Definitions](#interface-definitions)
5. [Model Layer (Application / Domain / Infrastructure)](#model-layer-application--domain--infrastructure)
6. [UI Layer (Components / Animation / Content)](#ui-layer-components--animation--content)
7. [View / ViewModel (MVVM Pattern)](#view--viewmodel-mvvm-pattern)

---

# Next2D Framework TypeScript Template - Overview

## Project Summary

Next2D Frameworkを使用したTypeScriptプロジェクトテンプレート。MVVM + Clean Architecture + Atomic Designを採用。

- **レンダリングエンジン**: Next2D Player
- **フレームワーク**: Next2D Framework
- **言語**: TypeScript
- **ビルドツール**: Vite
- **テスト**: Vitest
- **パッケージマネージャ**: npm

## Requirements

- Node.js 22.x以上
- npm 10.x以上
- iOS: Xcode 14以上 (iOS/Androidビルド時のみ)
- Android: Android Studio, JDK 21以上 (iOS/Androidビルド時のみ)

## Architecture

**MVVM + Clean Architecture + Atomic Design** の5層構成:

```
View Layer (view/, ui/)
  └─ depends on ─→ Interface Layer (interface/)
                     ↑
Application Layer (model/application/)
  ├─ depends on ─→ Interface Layer
  ├─ depends on ─→ Domain Layer (model/domain/)
  └─ calls ──────→ Infrastructure Layer (model/infrastructure/)
```

### Layer Dependencies (依存関係の方向)

- **View層** → Interface経由でApplication層を使用
- **Application層** → Interface経由でDomain層・Infrastructure層を使用
- **Domain層** → 何にも依存しない（最も安定、純粋なビジネスロジック）
- **Infrastructure層** → Interface層を実装

### Key Design Patterns

1. **MVVM**: View(表示) / ViewModel(橋渡し) / Model(ビジネスロジック+データアクセス)
2. **UseCase Pattern**: ユーザーアクションごとに専用のUseCaseクラスを作成
3. **Dependency Inversion**: 具象クラスではなくインターフェースに依存
4. **Repository Pattern**: データアクセスを抽象化
5. **Atomic Design**: Atom → Molecule → Organism → Template → Page

## Directory Structure

```
src/
├── config/                    # 設定ファイル (stage.json, config.json, routing.json)
├── interface/                 # TypeScriptインターフェース定義
├── model/
│   ├── application/           # UseCase (ビジネスロジック実装)
│   │   └── {screen}/usecase/
│   ├── domain/                # コアビジネスロジック
│   │   └── {feature}/service/
│   └── infrastructure/        # Repository (データアクセス)
│       └── repository/
├── ui/
│   ├── animation/             # アニメーション定義
│   │   └── {screen}/
│   ├── component/
│   │   ├── atom/              # 最小コンポーネント (Button, Text等)
│   │   ├── molecule/          # 複合コンポーネント
│   │   ├── organism/          # 複数Moleculeの組み合わせ (拡張用)
│   │   ├── page/              # ページコンポーネント
│   │   │   └── {screen}/
│   │   └── template/          # ページテンプレート (拡張用)
│   └── content/               # Animation Tool生成コンテンツ
├── view/                      # View & ViewModel
│   └── {screen}/
│       ├── {Screen}View.ts
│       └── {Screen}ViewModel.ts
└── assets/                    # 静的ファイル (画像, JSON)

@types/                        # グローバル型定義 (.d.ts)
electron/                      # Electron設定 (デスクトップビルド用)
file/                          # Animation Tool n2dファイル
mock/                          # 開発用モックデータ (API, Content, 画像)
```

## Best Practices (全体共通)

1. **インターフェース優先**: 常に具象クラスではなくインターフェースに依存
2. **単一責任の原則**: 各クラスは1つの責務のみを持つ
3. **型安全性**: `any`型を避け、明示的な型定義を使用
4. **テスタブル**: 各層を独立してテスト可能にする
5. **JSDoc**: 処理内容を日英両方で明記
6. **executeメソッド**: UseCaseのエントリーポイントを統一
7. **エラーハンドリング**: Infrastructure層で適切に処理

---

# CLI Commands Reference

## Setup

```bash
npm install          # 依存パッケージのインストール
```

## Development

```bash
npm start            # 開発サーバー起動 (http://localhost:5173)
npm run generate     # routing.jsonからView/ViewModelクラスを自動生成
```

## Testing

```bash
npm test                    # 全テスト実行 (Vitest)
npm test -- --watch         # ウォッチモード
npm test -- --coverage      # カバレッジレポート
```

## Build

| Command | Platform | Output |
|---------|----------|--------|
| `npm run build:web -- --env prd` | Web (HTML) | `dist/web/prd/` |
| `npm run build:steam:windows -- --env prd` | Windows (Steam) | `dist/steam/windows/` |
| `npm run build:steam:macos -- --env prd` | macOS (Steam) | `dist/steam/macos/` |
| `npm run build:steam:linux -- --env prd` | Linux (Steam) | `dist/steam/linux/` |
| `npm run build:ios -- --env prd` | iOS | Xcode project |
| `npm run build:android -- --env prd` | Android | Android Studio project |

## Platform Emulators

```bash
npm run preview:windows -- --env prd    # Windows
npm run preview:macos -- --env prd      # macOS
npm run preview:linux -- --env prd      # Linux
npm run preview:ios -- --env prd        # iOS
npm run preview:android -- --env prd    # Android
```

`--env` オプション: `local`, `dev`, `stg`, `prd`

## Environment Configuration

環境ごとの設定は`src/config/config.json`で管理。`--env`で指定した環境名の設定値と`all`の設定値がマージされる。

---

# Configuration Files

設定ファイルは `src/config/` ディレクトリに配置。

## stage.json

表示領域(Stage)の設定。

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | number | 240 | 表示領域の幅 |
| `height` | number | 240 | 表示領域の高さ |
| `fps` | number | 60 | 描画回数/秒 (1-60) |
| `options` | object | null | オプション設定 |

### Stage Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options.fullScreen` | boolean | false | 画面全体に描画 |
| `options.tagId` | string | null | 描画先のエレメントID |
| `options.bgColor` | string | "transparent" | 背景色 (16進数) |

### Example

```json
{
    "width": 240,
    "height": 240,
    "fps": 60,
    "options": {
        "fullScreen": true
    }
}
```

---

## config.json

環境別の設定ファイル。`local`, `dev`, `stg`, `prd`, `all` に分離。

### Structure

```json
{
    "local": { "api": { "endPoint": "/" }, "content": { "endPoint": "/" } },
    "dev":   { "api": { "endPoint": "/" }, "content": { "endPoint": "/" } },
    "stg":   { "api": { "endPoint": "/" }, "content": { "endPoint": "/" } },
    "prd":   { "api": { "endPoint": "https://..." }, "content": { "endPoint": "https://..." } },
    "all":   { /* 全環境共通 */ }
}
```

### `all` Properties (全環境共通)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultTop` | string | "top" | ページトップのView名 |
| `spa` | boolean | true | SPA (URLでシーン制御) |
| `loading.callback` | string | "Loading" | ローディング画面のコールバッククラス。start/end関数が呼ばれる |
| `gotoView.callback` | string/array | ["callback.Background"] | 画面遷移完了後のコールバッククラス。execute関数がasync/awaitで呼ばれる |

### `platform` Property

ビルド時の`--platform`値がセットされる。値: `macos`, `windows`, `linux`, `ios`, `android`, `web`

### Config Access in Code

```typescript
import { config } from "@/config/Config";

const endpoint = config.api.endPoint;
const stageWidth = config.stage.width;
```

---

## routing.json

ルーティング設定。トッププロパティは英数字・スラッシュ。スラッシュをキーにCamelCaseでViewクラスにアクセス。

### Routing Example

```json
{
    "quest/list": {
        "requests": []
    }
}
```

→ `https://example.com/quest/list` でアクセス可能。`QuestListView`クラスがセットされる。

### Cluster Pattern (共通リクエストの再利用)

`@`プレフィックスで共通リクエスト群を定義し、他のルートから参照:

```json
{
    "@sample": {
        "requests": [
            {
                "type": "content",
                "path": "{{ content.endPoint }}content/sample.json",
                "name": "MainContent",
                "cache": true
            }
        ]
    },
    "top": {
        "requests": [
            { "type": "cluster", "path": "@sample" },
            { "type": "json", "path": "{{ api.endPoint }}api/top.json", "name": "TopText" }
        ]
    }
}
```

### Second Level Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `private` | boolean | false | true時、URLアクセスするとTopViewが読み込まれる |
| `requests` | array | null | Viewバインド前に実行するリクエスト群 |

### Request Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | "content" | `json`, `content`, `custom`, `cluster` |
| `path` | string | "" | `{{***}}`でconfig変数を参照可能。`@`プレフィックスでcluster参照 |
| `name` | string | "" | responseのキー名。`app.getResponse().get("key")` |
| `cache` | boolean | false | キャッシュ有効。`app.getCache().get("key")` |
| `callback` | string/array | null | リクエスト完了後のコールバッククラス。execute関数が呼ばれる |
| `class` | string | "" | custom type時のリクエスト実行クラス |
| `access` | string | "public" | custom type時の関数アクセス (`public`/`static`) |
| `method` | string | "" | custom type時の関数名 |

### Request Types

- **`json`**: URLからJSONを取得
- **`content`**: Animation Toolコンテンツを取得
- **`custom`**: 指定クラスのメソッドを実行
- **`cluster`**: `@`プレフィックスの共通リクエスト群を参照

### Data Access

```typescript
// responseデータ (画面遷移で初期化される)
const data = app.getResponse().get("HomeText");

// cacheデータ (画面遷移しても保持される)
const cached = app.getCache().get("MainContent");
```

---

## Static Files

### mock/ Directory

ローカル開発用モックデータ。`http://localhost:5173/***`でアクセス可能。`routing.json`のパスと重複しないよう注意。

```
mock/
├── api/          # APIモック (JSON)
├── content/      # Animation Toolコンテンツモック
└── img/          # 画像モック
```

### file/ Directory

Animation Toolで作成した`.n2d`ファイルを格納。バージョン管理可能。

### assets/ Directory

ビルド時にバンドルに含める静的アセット。

```typescript
// 画像インポート
import logoImage from "@/assets/logo.png?inline";

// JSONインポート
import animation from "@/assets/animation.json";
```

| 項目 | assets | mock |
|------|--------|------|
| 用途 | バンドルに含める | 開発サーバーで配信 |
| アクセス | importで取得 | URL経由でfetch |
| ビルド | バンドルに含まれる | 含まれない |

---

## @types/ Directory

グローバルな型定義ファイル (.d.ts)。`Window`インターフェースの拡張等。アプリケーション固有のインターフェースは`src/interface/`に配置。

---

# Interface Definitions

TypeScriptインターフェース定義。Clean Architecture原則に従い、各層の依存関係を抽象化。

## Rules

- 命名規則: `I` プレフィックスを使用 (例: `IDraggable`, `ITextField`)
- 必要最小限のプロパティのみ定義
- `any`型を禁止、常に明示的な型を使用
- JSDocコメントを追加

## Interface Categories

### 1. UI関連 (コンポーネントの振る舞い)

```typescript
// IDraggable.ts - ドラッグ可能なオブジェクト
export interface IDraggable {
    startDrag(): void;
    stopDrag(): void;
}
// 使用: HomeBtnMolecule, HomeContent

// ITextField.ts - テキストフィールドの基本プロパティ
export interface ITextField {
    width: number;
    x: number;
}
// 使用: TextAtom, CenterTextFieldUseCase

// ITextFieldProps.ts - テキストフィールドの詳細プロパティ設定
// 使用: TextAtomのコンストラクタ

// ITextFieldType.ts - テキストフィールドタイプ
// ITextFieldAutoSize.ts - テキストフィールドオートサイズ
// ITextFormatAlign.ts - テキストフォーマットアライン
// ITextFormatObject.ts - テキストフォーマットスタイル設定
```

### 2. データ転送オブジェクト (DTO)

```typescript
// IHomeTextResponse.ts - APIレスポンス型
export interface IHomeTextResponse {
    word: string;
}
// 使用: HomeTextRepository.get()の戻り値型
```

### 3. 画面遷移関連

```typescript
// IViewName.ts - 利用可能な画面名 (Union型)
export type ViewName = "top" | "home";
// 使用: NavigateToViewUseCase
// 新画面追加時はこの型にも追加が必要
```

### 4. 設定関連

- `IConfig.ts` - アプリケーション全体設定
- `IStage.ts` - ステージ設定 (`stage.json`の型)
- `IRouting.ts` - ルーティング設定
- `IGotoView.ts` - 画面遷移オプション
- `IRequest.ts` / `IRequestType.ts` - HTTPリクエスト設定
- `IOptions.ts` - オプション設定

## Interface Template

```typescript
/**
 * @description [インターフェースの説明]
 *              [Interface description]
 *
 * @interface
 */
export interface IYourInterface
{
    /**
     * @description [プロパティの説明]
     *              [Property description]
     *
     * @type {type}
     */
    propertyName: type;

    /**
     * @description [メソッドの説明]
     *              [Method description]
     *
     * @param  {ParamType} paramName
     * @return {ReturnType}
     * @method
     */
    methodName(paramName: ParamType): ReturnType;
}
```

## Best Practices

```typescript
// OK: 必要最小限
export interface ITextField {
    width: number;
    x: number;
}

// NG: 不要なプロパティ
export interface ITextField {
    width: number;
    height: number;  // 使用しない
    x: number;
    y: number;       // 使用しない
}

// OK: 型の再利用
export interface IPosition { x: number; y: number; }
export interface ITextField extends IPosition { width: number; }

// OK: 明示的型
export interface IHomeTextResponse { word: string; }

// NG: any型
export interface IHomeTextResponse { word: any; }
```

## Adding New Interface Steps

1. 目的を明確にする（どの層の依存を抽象化するか）
2. `I`プレフィックスの命名規則に従う
3. 必要最小限のプロパティ/メソッドのみ定義
4. JSDocコメントを追加
5. 使用箇所を明記

---

# Model Layer (Application / Domain / Infrastructure)

Model層はビジネスロジックとデータアクセスを担当。Clean Architectureに基づき3層で構成。

## Directory Structure

```
model/
├── application/           # UseCase (ビジネスロジック)
│   └── {screen}/
│       └── usecase/
│           └── {Action}UseCase.ts
├── domain/                # コアビジネスロジック
│   └── {feature}/
│       ├── {Feature}.ts
│       └── service/
│           └── {Feature}{Action}Service.ts
└── infrastructure/        # Repository (データアクセス)
    └── repository/
        └── {Resource}Repository.ts
```

## Layer Dependencies

```
Application → Domain (uses)
Application → Infrastructure (calls)
Domain → 依存なし (最も安定)
```

---

## Application Layer (UseCase)

### Rules

- 1つのユーザーアクションに対して1つのUseCaseクラスを作成
- エントリーポイントは `execute` メソッドに統一
- インターフェースに依存し、具象クラスに依存しない
- 画面ごとにディレクトリを作成: `application/{screen}/usecase/`

### UseCase Template

```typescript
import type { IYourInterface } from "@/interface/IYourInterface";

/**
 * @description [UseCaseの説明]
 *              [UseCase description]
 *
 * @class
 */
export class YourUseCase
{
    /**
     * @description [処理の説明]
     *              [Process description]
     *
     * @param  {IYourInterface} param
     * @return {void}
     * @method
     * @public
     */
    execute (param: IYourInterface): void
    {
        // ビジネスロジックを実装
    }
}
```

### UseCase with Repository

```typescript
import { YourRepository } from "@/model/infrastructure/repository/YourRepository";
import type { IYourResponse } from "@/interface/IYourResponse";

export class FetchDataUseCase
{
    async execute (): Promise<IYourResponse>
    {
        try {
            const data = await YourRepository.get();
            // ビジネスロジック: データの加工・検証
            return data;
        } catch (error) {
            console.error('Failed to fetch data:', error);
            throw error;
        }
    }
}
```

### UseCase Composition (複数UseCaseの組み合わせ)

```typescript
export class InitializeScreenUseCase
{
    private readonly fetchUseCase: FetchDataUseCase;
    private readonly centerUseCase: CenterTextFieldUseCase;

    constructor ()
    {
        this.fetchUseCase = new FetchDataUseCase();
        this.centerUseCase = new CenterTextFieldUseCase();
    }

    async execute (textField: ITextField): Promise<void>
    {
        const data = await this.fetchUseCase.execute();
        this.centerUseCase.execute(textField, stageWidth);
    }
}
```

### UseCase Anti-Patterns

```typescript
// NG: 複数の責務
export class DragUseCase {
    start(target: IDraggable): void { ... }
    stop(target: IDraggable): void { ... }
    validate(target: IDraggable): boolean { ... }
}

// OK: 単一の責務
export class StartDragUseCase {
    execute(target: IDraggable): void { target.startDrag(); }
}
export class StopDragUseCase {
    execute(target: IDraggable): void { target.stopDrag(); }
}

// NG: 具象クラスに依存
execute(target: HomeBtnMolecule): void { ... }

// OK: インターフェースに依存
execute(target: IDraggable): void { ... }
```

### UseCase Test Template

```typescript
import { StartDragUseCase } from "./StartDragUseCase";
import type { IDraggable } from "@/interface/IDraggable";

describe('StartDragUseCase', () => {
    test('should call startDrag on target', () => {
        const mockDraggable: IDraggable = {
            startDrag: vi.fn(),
            stopDrag: vi.fn()
        };

        const useCase = new StartDragUseCase();
        useCase.execute(mockDraggable);

        expect(mockDraggable.startDrag).toHaveBeenCalled();
    });
});
```

---

## Domain Layer

### Rules

- アプリケーションのコアビジネスルールを実装
- 可能な限りフレームワーク非依存（※Next2D描画機能の使用は許容）
- 純粋関数を心がけ、副作用を最小化
- 可能な限り不変オブジェクトを使用

### Domain Service (Functional Style)

```typescript
/**
 * @description [サービスの説明]
 *              [Service description]
 *
 * @param  {ParamType} param
 * @return {ReturnType}
 */
export const execute = (param: ParamType): ReturnType =>
{
    // ビジネスルールの実装
    return result;
};
```

### Domain Class (Class-based Style)

```typescript
import { Shape, stage } from "@next2d/display";
import { Event } from "@next2d/events";

/**
 * @description [ドメインクラスの説明]
 *              [Domain class description]
 *
 * @class
 */
export class YourDomainClass
{
    public readonly shape: Shape;

    constructor ()
    {
        this.shape = new Shape();
    }

    execute (): void
    {
        // コアビジネスロジック
    }
}
```

### Domain Callback Pattern

`config.json`の`gotoView.callback`で設定されたクラスは、画面遷移完了後に`execute()`が呼び出される。

```typescript
// config.json: "gotoView": { "callback": ["domain.callback.Background"] }
// → model/domain/callback/Background.ts の execute() が呼ばれる

export class Background
{
    execute (): void
    {
        const context = app.getContext();
        const view = context.view;
        if (!view) return;
        view.addChildAt(this.shape, 0);
    }
}
```

### Domain Directory Extensions (将来の拡張)

```
domain/
├── callback/      # コールバック処理
├── service/       # ドメインサービス
├── entity/        # エンティティ (ID持ち)
└── value-object/  # 値オブジェクト
```

---

## Infrastructure Layer (Repository)

### Rules

- 外部システムとの連携（API、DB等）を担当
- `any`型を避け、明示的な型定義を使用
- すべての外部アクセスでtry-catchを実装
- エンドポイントは`config`から取得（ハードコーディング禁止）
- シンプルな場合は静的メソッド、状態を持つ場合はインスタンスメソッド

### Repository Template

```typescript
import type { IYourResponse } from "@/interface/IYourResponse";
import { config } from "@/config/Config";

/**
 * @description [Repositoryの説明]
 *              [Repository description]
 *
 * @class
 */
export class YourRepository
{
    /**
     * @description [処理の説明]
     *              [Process description]
     *
     * @param  {string} id
     * @return {Promise<IYourResponse>}
     * @static
     * @throws {Error} [エラーの説明]
     */
    static async get (id: string): Promise<IYourResponse>
    {
        try {
            const response = await fetch(
                `${config.api.endPoint}api/your-endpoint/${id}`
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP error! status: ${response.status}`
                );
            }

            return await response.json() as IYourResponse;

        } catch (error) {
            console.error('Failed to fetch data:', error);
            throw error;
        }
    }
}
```

### Repository with Cache

```typescript
export class CachedRepository
{
    private static cache: Map<string, { data: Data; timestamp: number }> = new Map();
    private static readonly CACHE_TTL = 60000;

    static async get (id: string): Promise<Data>
    {
        const cached = this.cache.get(id);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        const response = await fetch(`${config.api.endPoint}api/${id}`);
        const data = await response.json();
        this.cache.set(id, { data, timestamp: now });

        return data;
    }
}
```

### Repository Anti-Patterns

```typescript
// NG: any型
static async get(): Promise<any> { ... }

// OK: 明示的型定義
static async get(): Promise<IHomeTextResponse> { ... }

// NG: エラーハンドリングなし
static async get(): Promise<Data> {
    const response = await fetch(...);
    return await response.json();
}

// NG: ハードコーディング
const response = await fetch('https://example.com/api/data.json');

// OK: configから取得
const response = await fetch(`${config.api.endPoint}api/data.json`);
```

### routing.json Custom Request Pattern

`routing.json`でRepositoryを直接呼び出すことも可能:

```json
{
    "home": {
        "requests": [
            {
                "type": "custom",
                "class": "infrastructure.repository.HomeTextRepository",
                "access": "static",
                "method": "get",
                "name": "HomeText",
                "cache": true
            }
        ]
    }
}
```

取得したデータは `app.getResponse().get("HomeText")` でアクセス可能。

---

# UI Layer (Components / Animation / Content)

## Directory Structure

```
ui/
├── animation/           # アニメーション定義
│   └── {screen}/
│       └── {Component}{Action}Animation.ts
├── component/
│   ├── atom/            # 最小単位 (Button, Text等)
│   ├── molecule/        # Atomの組み合わせ
│   ├── organism/        # 複数Moleculeの組み合わせ (拡張用)
│   ├── page/            # ページコンポーネント
│   │   └── {screen}/
│   └── template/        # ページテンプレート (拡張用)
└── content/             # Animation Tool生成コンテンツ
```

## Rules (共通)

- 各コンポーネントは単一の責務のみ
- ビジネスロジックやデータアクセスに直接依存しない
- データはViewModelから引数で受け取る
- インターフェースを実装して抽象化する

---

## DisplayObject 配置の基本方針（中心基準点パターン）

Next2D の座標系は画面左上 (0, 0) が基準点。Shape や Sprite をそのまま配置すると、スケールや回転アニメーション時に座標がずれる。
**基本方針として、子要素を親 Sprite に中心配置する。**

### パターン: Shape を Sprite に中心配置

```typescript
const sprite = new Sprite();
const shape  = new Shape();

// 画像の場合、Retina対応でスケールを設定
shape.scaleX = shape.scaleY = 0.5;

// スケール設定後に中心配置
shape.x = -shape.width  / 2;
shape.y = -shape.height / 2;

sprite.addChild(shape);
```

### パターン: Sprite を Sprite に中心配置

```typescript
const parent = new Sprite();
const child  = new Sprite();

// 子要素のサイズ確定後に中心配置
child.x = -child.width  / 2;
child.y = -child.height / 2;

parent.addChild(child);
```

### なぜ中心配置が必要か

- スケール・回転は DisplayObject の (0, 0) を基点に実行される
- 中心配置しないと、回転・拡縮時に意図しない位置ずれが発生する
- 中心配置により、親 Sprite の (x, y) がそのまま表示上の中心座標になる

**注意:** すべてのケースで必須ではないが、アニメーション対象の要素には基本的にこのパターンを適用する。

---

## Atomic Design Hierarchy

### Atom (原子) - 最小単位

最も基本的なUI要素。これ以上分割できない。

```typescript
// ButtonAtom: ボタンの基本機能 (enable/disable による連続押下防止機能付き)
import { Sprite } from "@next2d/display";

export class ButtonAtom extends Sprite
{
    constructor ()
    {
        super();
        this.buttonMode = true;
    }

    /**
     * @description ボタンを有効化する
     *              Enable button
     *
     * @return {void}
     * @method
     * @public
     */
    enable (): void
    {
        this.mouseEnabled  = true;
        this.mouseChildren = true;
    }

    /**
     * @description ボタンを無効化する
     *              Disable button
     *
     * @return {void}
     * @method
     * @public
     */
    disable (): void
    {
        this.mouseEnabled  = false;
        this.mouseChildren = false;
    }
}
```

```typescript
// TextAtom: テキスト表示の基本機能
import { TextField } from "@next2d/text";
import type { ITextField } from "@/interface/ITextField";
import type { ITextFormatObject } from "@/interface/ITextFormatObject";

export class TextAtom extends TextField implements ITextField
{
    constructor (
        text: string = "",
        props: any | null = null,
        format_object: ITextFormatObject | null = null
    ) {
        super();
        // プロパティ設定、フォーマット設定
    }
}
```

### ボタン連続押下防止パターン

ボタン押下後に処理が完了するまで連続押下を防止したい場合に使えるパターン。`ButtonAtom` の `disable()` / `enable()` を利用して `mouseEnabled` と `mouseChildren` を制御する。

連続押下を防止するかどうかはユースケースに応じて判断する。画面遷移やAPI通信など多重実行を避けたい処理では有効。

#### View でのイベント登録パターン

```typescript
// View: ボタン押下時にViewModelのハンドラを呼び出す
async initialize (): Promise<void>
{
    const btn = new YourBtnMolecule();
    btn.addEventListener(PointerEvent.POINTER_DOWN, (event) => {
        this.vm.handleButtonTap(event);
    });
    this.addChild(btn);
}
```

#### ViewModel での連続押下防止パターン

```typescript
// ViewModel: disable → 処理 → enable で連続押下を防止
handleButtonTap (event: PointerEvent): void
{
    // ボタンを即座に無効化して連続押下を防止
    const button = event.currentTarget as unknown as ButtonAtom;
    button.disable();

    // 処理実行 (画面遷移、API呼び出し、アニメーション等)
    this.someUseCase.execute();

    // 処理完了後にボタンを再有効化 (画面遷移の場合は不要)
    button.enable();
}
```

#### 非同期処理での連続押下防止パターン

```typescript
// ViewModel: 非同期処理の完了を待ってから再有効化
async handleButtonTap (event: PointerEvent): Promise<void>
{
    const button = event.currentTarget as unknown as ButtonAtom;
    button.disable();

    try {
        await this.fetchDataUseCase.execute();
    } finally {
        // エラー時も必ず再有効化
        button.enable();
    }
}
```

#### アニメーション完了後に再有効化するパターン

```typescript
// ViewModel: アニメーション完了コールバックで再有効化
handleButtonTap (event: PointerEvent): void
{
    const button = event.currentTarget as unknown as ButtonAtom;
    button.disable();

    new SomeAnimation(button, () => {
        // アニメーション完了後に再有効化
        button.enable();
    }).start();
}
```

#### 連続押下を許可するケース

以下のケースでは `disable()` / `enable()` を使わず、連続押下を許可する:

- **インクリメント/デクリメントボタン**: 数量の増減など、連打を前提とした操作
- **連射系ゲーム操作**: 連続タップがゲームメカニクスの一部である場合
- **トグルボタン**: ON/OFF を素早く切り替える必要がある場合

### Molecule (分子) - Atomの組み合わせ

複数のAtomを組み合わせた、特定の用途向けコンポーネント。

```typescript
import { ButtonAtom } from "../atom/ButtonAtom";
import { HomeContent } from "@/ui/content/HomeContent";
import type { IDraggable } from "@/interface/IDraggable";

export class HomeBtnMolecule extends ButtonAtom implements IDraggable
{
    private readonly homeContent: HomeContent;

    constructor ()
    {
        super();
        this.homeContent = new HomeContent();
        this.addChild(this.homeContent);
    }

    // IDraggableメソッド(startDrag/stopDrag)はMovieClipContentの親クラスから継承
}
```

```typescript
import { ButtonAtom } from "../atom/ButtonAtom";
import { TextAtom } from "../atom/TextAtom";

export class TopBtnMolecule extends ButtonAtom
{
    constructor (text: string) // ViewModelからテキストを受け取る
    {
        super();
        const textField = new TextAtom(text, { autoSize: "center" });
        this.addChild(textField);
    }

    playEntrance (callback: () => void): void
    {
        // アニメーション再生
    }
}
```

### Organism (有機体) - 拡張用

複数のMoleculeを組み合わせた大きな機能単位。必要に応じて実装。

### Page (ページ)

画面全体を構成するコンポーネント。ViewからPageを配置し、PageがMolecule/Atomを組み合わせて画面構築。

### Template (テンプレート) - 拡張用

ページのレイアウト構造を定義。必要に応じて実装。

## Component Creation Templates

### New Atom

```typescript
import { Sprite } from "@next2d/display";

export class YourAtom extends Sprite
{
    constructor (props: any = null)
    {
        super();
        if (props) {
            Object.assign(this, props);
        }
    }
}
```

### New Molecule

```typescript
import { ButtonAtom } from "../atom/ButtonAtom";
import { TextAtom } from "../atom/TextAtom";

export class YourMolecule extends ButtonAtom
{
    constructor ()
    {
        super();
        const text = new TextAtom("Click me");
        this.addChild(text);
    }
}
```

## Anti-Patterns

```typescript
// NG: コンポーネント内でデータ取得
export class BadAtom extends TextField {
    async fetchDataFromAPI() { ... } // NG: データ取得は別層の責務
}

// NG: 直接APIアクセス
constructor() {
    const data = await Repository.get(); // NG
}

// OK: ViewModelからデータを受け取る
constructor(text: string) {
    this.textField = new TextAtom(text); // OK
}
```

---

## Animation

アニメーションロジックをコンポーネントから分離し、再利用性と保守性を向上。

### Naming Convention

`{Component}{Action}Animation.ts` (例: `TopBtnShowAnimation.ts`)

### Animation Types

- **Show Animation**: 画面表示時のアニメーション
- **Exit Animation**: 画面遷移時のアニメーション
- **Interaction Animation**: ユーザー操作に対するアニメーション

### Animation Class Template

```typescript
import type { Sprite } from "@next2d/display";
import { Tween, Easing, type Job } from "@next2d/ui";
import { Event } from "@next2d/events";

/**
 * @description [アニメーションの説明]
 *              [Animation description]
 *
 * @class
 * @public
 */
export class YourAnimation
{
    private readonly _job: Job;

    /**
     * @param {Sprite} sprite - アニメーション対象
     * @param {() => void} callback - 完了時コールバック
     * @constructor
     * @public
     */
    constructor (
        sprite: Sprite,
        callback?: () => void
    ) {
        // 初期状態設定
        sprite.alpha = 0;

        // Tween設定: (対象, 開始値, 終了値, 秒数, 遅延秒数, イージング)
        this._job = Tween.add(sprite,
            { "alpha": 0 },
            { "alpha": 1 },
            0.5, 1, Easing.outQuad
        );

        if (callback) {
            this._job.addEventListener(Event.COMPLETE, callback);
        }
    }

    /**
     * @description アニメーション開始
     *              Start animation
     *
     * @method
     * @public
     */
    start (): void
    {
        this._job.start();
    }
}
```

### Component-Animation Coordination

```typescript
// component/molecule/TopBtnMolecule.ts
import { TopBtnShowAnimation } from "@/ui/animation/top/TopBtnShowAnimation";

export class TopBtnMolecule extends ButtonAtom {
    playShow(callback: () => void): void {
        new TopBtnShowAnimation(this, callback).start();
    }
}
```

---

## Content (Animation Tool)

Animation Toolで作成されたコンテンツをTypeScriptクラスとしてラップ。

### Content Template

```typescript
import { MovieClipContent } from "@next2d/framework";

/**
 * @description [コンテンツの説明]
 *              [Content description]
 *
 * @class
 * @extends {MovieClipContent}
 */
export class YourContent extends MovieClipContent
{
    /**
     * @description Animation Toolのシンボル名を返す
     *              Returns the Animation Tool symbol name
     *
     * @return {string}
     * @readonly
     */
    get namespace (): string
    {
        return "YourSymbolName"; // Animation Toolで設定した名前と一致させる
    }
}
```

### Content with Interface

```typescript
import { MovieClipContent } from "@next2d/framework";
import type { IDraggable } from "@/interface/IDraggable";

export class HomeContent extends MovieClipContent implements IDraggable
{
    get namespace (): string
    {
        return "HomeContent";
    }

    // IDraggableメソッド(startDrag/stopDrag)は
    // MovieClipContentの親クラス(MovieClip)から継承
}
```

### Content Creation Steps

1. Animation Toolでシンボルを作成
2. `.n2d`ファイルを`file/`ディレクトリに配置
3. Contentクラスを作成 (`namespace`はシンボル名と一致させる)
4. Molecule等のコンポーネントで使用

### Content Rules

- クラス名とシンボル名を一致させる
- アニメーションの制御のみを担当
- 必要な機能はインターフェースで定義

---

# View / ViewModel (MVVM Pattern)

## Rules

- 1画面にView + ViewModelをワンセット作成
- ディレクトリ名はキャメルケースの最初のブロック (例: `questList` → `view/quest/`)
- Viewは表示構造のみ担当、ビジネスロジックはViewModelに委譲
- イベントは必ずViewModelに委譲（View内で完結させない）
- ViewModelはインターフェースに依存し、具象クラスに依存しない

## Lifecycle (実行順序)

```
1. ViewModel インスタンス生成
2. ViewModel.initialize()    ← ViewModelが先
3. View インスタンス生成 (ViewModelを注入)
4. View.initialize()         ← UIコンポーネントの構築
5. View.onEnter()            ← 画面表示時の処理
   (ユーザー操作)
6. View.onExit()             ← 画面非表示時の処理
```

### View Lifecycle Methods

| Method | Timing | Purpose | Do | Don't |
|--------|--------|---------|-----|-------|
| `initialize()` | View生成直後、表示前 | UIコンポーネントの生成・配置・イベントリスナー登録 | addChild, addEventListener | API呼び出し、重い処理 |
| `onEnter()` | initialize完了後、画面表示直前 | 入場アニメーション、データ取得、タイマー開始 | アニメーション再生、fetchInitialData | UIコンポーネント生成 |
| `onExit()` | 別画面遷移前 | アニメーション停止、タイマークリア、リソース解放 | clearInterval, 状態リセット | 新リソース作成 |

### ViewModel Lifecycle Methods

| Method | Timing | Purpose | View参照 |
|--------|--------|---------|---------|
| `constructor()` | インスタンス生成時 | UseCaseの生成 | 不可 |
| `initialize()` | Viewの`initialize()`より前 | 初期データ取得、状態初期化 | 不可 |
| イベントハンドラ | ユーザー操作時 | ビジネスロジック実行 | 可能 |

## View Class Template

```typescript
import type { {Screen}ViewModel } from "./{Screen}ViewModel";
import { View } from "@next2d/framework";

/**
 * @class
 * @extends {View}
 */
export class {Screen}View extends View
{
    /**
     * @param {{Screen}ViewModel} vm
     * @constructor
     * @public
     */
    constructor (
        private readonly vm: {Screen}ViewModel
    ) {
        super();
    }

    /**
     * @description 画面の初期化 - UIコンポーネントの構築
     *              Initialize - Build UI components
     *
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async initialize (): Promise<void>
    {
        // UIコンポーネントの作成と配置
        // イベントリスナーの登録 (ViewModelのメソッドに接続)
    }

    /**
     * @description 画面表示時の処理
     *              On screen shown
     *
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async onEnter (): Promise<void>
    {
        // 入場アニメーション、データ取得
    }

    /**
     * @description 画面非表示時の処理
     *              On screen hidden
     *
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async onExit (): Promise<void>
    {
        // タイマークリア、リソース解放
    }
}
```

## ViewModel Class Template

```typescript
import { ViewModel } from "@next2d/framework";
import { YourUseCase } from "@/model/application/{screen}/usecase/YourUseCase";

/**
 * @class
 * @extends {ViewModel}
 */
export class {Screen}ViewModel extends ViewModel
{
    private readonly yourUseCase: YourUseCase;

    constructor ()
    {
        super();
        this.yourUseCase = new YourUseCase();
    }

    /**
     * @description ViewModelの初期化 (Viewのinitialize()より前に呼ばれる)
     *              Initialize ViewModel (called before View's initialize())
     *
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async initialize (): Promise<void>
    {
        // 初期データ取得、状態初期化
        // ※ この時点ではViewは未生成のためUI操作不可
    }

    /**
     * @description イベントハンドラ
     *              Event handler
     *
     * @param  {PointerEvent} event
     * @return {void}
     * @method
     * @public
     */
    yourEventHandler (event: PointerEvent): void
    {
        // インターフェースを通じてターゲットを取得
        const target = event.currentTarget as unknown as IYourInterface;
        this.yourUseCase.execute(target);
    }
}
```

## View-ViewModel Coordination Pattern

ViewModelの`initialize()`で事前取得したデータをViewで使用するパターン:

```typescript
// ViewModel: 事前にデータ取得
async initialize(): Promise<void> {
    const data = await HomeTextRepository.get();
    this.homeText = data.word;
}

getHomeText(): string {
    return this.homeText;
}

// View: ViewModelから取得済みデータを使用
async initialize(): Promise<void> {
    // vm.initialize()は既に完了している
    const text = this.vm.getHomeText();
    const textField = new TextAtom(text);
    this.addChild(textField);
}
```

## Code Generation

```bash
npm run generate
```

`routing.json`のトッププロパティ値を分解し、`view`ディレクトリ直下に対象ディレクトリがなければ作成。View/ViewModelが存在しない場合のみ新規クラスを生成。

## Anti-Patterns

```typescript
// NG: Viewでビジネスロジック
class BadView extends View {
    async initialize() {
        btn.addEventListener(PointerEvent.POINTER_DOWN, async () => {
            const data = await Repository.get(); // NG
            this.processData(data);              // NG
        });
    }
}

// NG: ViewModelで具象クラスに依存
homeContentPointerDownEvent(event: PointerEvent): void {
    const target = event.currentTarget as HomeBtnMolecule; // NG
    target.startDrag();
}

// OK: ViewModelでインターフェースに依存
homeContentPointerDownEvent(event: PointerEvent): void {
    const target = event.currentTarget as unknown as IDraggable; // OK
    this.startDragUseCase.execute(target);
}
```
