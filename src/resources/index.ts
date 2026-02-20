import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadReference(filename: string): string {
    // Search locations (in priority order):
    // 1. Bundled with package: dist/references/ (works after npm publish)
    // 2. Development: .github/skills/references/ (relative to project root)
    // 3. User's project: cwd/.github/skills/references/ (if user has specs locally)
    const candidates = [
        path.join(__dirname, "..", "references", filename),
        path.join(__dirname, "..", "..", ".github", "skills", "references", filename),
        path.join(process.cwd(), ".github", "skills", "references", filename)
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return fs.readFileSync(candidate, "utf-8");
        }
    }

    return `Reference file '${filename}' not found. Searched: ${candidates.join(", ")}`;
}

export function registerResources(server: McpServer): void {
    server.registerResource(
        "player-specs",
        "next2d://specs/player",
        {
            "description":
                "Next2D Player API reference - DisplayObject, MovieClip, Sprite, Shape, TextField, " +
                "Video, Sound, Tween, Events, Filters, Geom. Read when implementing rendering, " +
                "animation, graphics, or interaction logic.",
            "mimeType": "text/markdown"
        },
        async () => ({
            "contents": [
                {
                    "uri": "next2d://specs/player",
                    "mimeType": "text/markdown",
                    "text": loadReference("player-specs.md")
                }
            ]
        })
    );

    server.registerResource(
        "framework-specs",
        "next2d://specs/framework",
        {
            "description":
                "Next2D Framework reference - MVVM architecture, routing, config, " +
                "View/ViewModel lifecycle, Animation Tool integration, gotoView flow. " +
                "Read when working on application architecture, screen transitions, or configuration.",
            "mimeType": "text/markdown"
        },
        async () => ({
            "contents": [
                {
                    "uri": "next2d://specs/framework",
                    "mimeType": "text/markdown",
                    "text": loadReference("framework-specs.md")
                }
            ]
        })
    );

    server.registerResource(
        "develop-specs",
        "next2d://specs/develop",
        {
            "description":
                "Development template specs - project structure, CLI commands, interfaces, " +
                "Model layer, UI layer with Atomic Design, View/ViewModel patterns. " +
                "Read when creating new components, setting up projects, or following coding patterns.",
            "mimeType": "text/markdown"
        },
        async () => ({
            "contents": [
                {
                    "uri": "next2d://specs/develop",
                    "mimeType": "text/markdown",
                    "text": loadReference("develop-specs.md")
                }
            ]
        })
    );

    server.registerResource(
        "architecture-overview",
        "next2d://architecture",
        {
            "description":
                "Next2D architecture overview - Clean Architecture layers, MVVM pattern, " +
                "dependency rules, and data flow diagrams.",
            "mimeType": "text/markdown"
        },
        async () => ({
            "contents": [
                {
                    "uri": "next2d://architecture",
                    "mimeType": "text/markdown",
                    "text": ARCHITECTURE_OVERVIEW
                }
            ]
        })
    );
}

const ARCHITECTURE_OVERVIEW = `# Next2D Architecture Overview

## Technology Stack
- **Rendering Engine**: Next2D Player (WebGL/WebGPU hardware-accelerated 2D)
- **Framework**: Next2D Framework (MVVM + Clean Architecture)
- **UI Design**: Atomic Design (Atom/Molecule/Organism/Page)
- **Language**: TypeScript (strict, no \`any\`)
- **Build Tool**: Vite
- **Testing**: Vitest
- **Platforms**: Web, Steam (Windows/macOS/Linux), iOS, Android

## Layer Architecture

\`\`\`
View Layer (view/, ui/)
  └─ depends on ─→ Interface Layer (interface/)
                     ↑
Application Layer (model/application/)
  ├─ depends on ─→ Interface Layer
  ├─ depends on ─→ Domain Layer (model/domain/)
  └─ calls ──────→ Infrastructure Layer (model/infrastructure/)
\`\`\`

### View Layer (src/view/, src/ui/)
- **View**: Extends Sprite, manages display structure. No business logic.
- **ViewModel**: Bridge between View and Model. Holds UseCases.
- **UI Components**: Atomic Design hierarchy (Atom → Molecule → Organism → Page)

### Interface Layer (src/interface/)
- TypeScript interfaces with \`I\` prefix
- Defines contracts between layers
- Enables dependency inversion

### Application Layer (src/model/application/)
- **UseCase**: 1 action = 1 class. Entry point: \`execute()\`
- Orchestrates business logic
- Depends only on interfaces and domain

### Domain Layer (src/model/domain/)
- Core business rules
- No external API/DB dependencies (Next2D display APIs are allowed)
- Pure logic (callbacks, services)

### Infrastructure Layer (src/model/infrastructure/)
- **Repository**: Data access abstraction
- External API calls with try-catch
- Endpoints from config.json

## Configuration Files

### stage.json
\`\`\`json
{ "width": 240, "height": 240, "fps": 60, "options": { "fullScreen": true } }
\`\`\`

### config.json
Environment-specific settings (local/dev/stg/prd) + common settings (all).
- \`defaultTop\`: Default view name
- \`spa\`: Enable SPA mode
- \`loading.callback\`: Loading screen class
- \`gotoView.callback\`: Post-transition callback(s)

### routing.json
URL-to-View mapping with request configurations.
- \`type\`: json | content | custom | cluster
- \`path\`: URL with config variable interpolation (\`{{ api.endPoint }}\`)
- \`name\`: Response key for \`app.getResponse().get(name)\`
- \`cache\`: Persist data across screen transitions

## View Lifecycle
\`\`\`
ViewModel.constructor → ViewModel.initialize() → View.constructor(vm) → View.initialize() → View.onEnter() → (interaction) → View.onExit()
\`\`\`

## Key Rules
1. View: Display only. Delegate events to ViewModel.
2. ViewModel: Hold UseCases. Depend on interfaces. Get data via \`app.getResponse()\`.
3. UseCase: Single responsibility. \`execute()\` entry point. Can call Repository, Domain, framework APIs.
4. Repository: try-catch required. Config for endpoints. Return typed interfaces.
5. Interface: \`I\` prefix. Minimal properties.
6. No \`any\` type. Explicit types always.
7. Domain: No external API/DB dependencies (Next2D display APIs allowed). Pure business logic.
8. Animation: Separate from components. Use Tween/Easing/Job.

## DisplayObject Centering Pattern
\`\`\`typescript
// Center child in parent for correct scale/rotation pivot
const sprite = new Sprite();
const child = new Shape();
child.x = -child.width / 2;
child.y = -child.height / 2;
sprite.addChild(child);
\`\`\`

## npm Commands
| Command | Description |
|---------|-------------|
| \`npm start\` | Dev server (Vite, localhost:5173) |
| \`npm test\` | Run tests (Vitest) |
| \`npm run generate\` | Auto-generate View/ViewModel from routing.json |
| \`npm run build:web -- --env prd\` | Build for web |
| \`npm run build:steam:windows -- --env prd\` | Build for Steam/Windows |
| \`npm run build:ios -- --env prd\` | Build for iOS |
| \`npm run build:android -- --env prd\` | Build for Android |
`;
