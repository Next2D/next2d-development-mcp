import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// dist/resources or src/resources -> project root
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

export interface DiscoveredResource {
    name: string;
    uri: string;
    description: string;
    filePath: string;
}

/**
 * Reference directories that may exist, in priority order.
 * The first existing directory provides a given file.
 */
export function findReferenceDirs(cwd: string = process.cwd()): string[] {
    // Search locations (in priority order):
    // 1. Bundled with package: dist/references/ (works after npm publish)
    // 2. Development submodule: next2d-development-assistant/skills/next2d-development-assistant/references/
    // 3. Development submodule (legacy layout): next2d-development-assistant/.github/skills/references/
    // 4. Development (legacy): .github/skills/references/ (relative to project root)
    // 5. User's project submodule: cwd/next2d-development-assistant/skills/next2d-development-assistant/references/
    // 6. User's project submodule (legacy layout): cwd/next2d-development-assistant/.github/skills/references/
    // 7. User's project (legacy): cwd/.github/skills/references/
    const candidates = [
        path.join(__dirname, "..", "references"),
        path.join(PROJECT_ROOT, "next2d-development-assistant", "skills", "next2d-development-assistant", "references"),
        path.join(PROJECT_ROOT, "next2d-development-assistant", ".github", "skills", "references"),
        path.join(PROJECT_ROOT, ".github", "skills", "references"),
        path.join(cwd, "next2d-development-assistant", "skills", "next2d-development-assistant", "references"),
        path.join(cwd, "next2d-development-assistant", ".github", "skills", "references"),
        path.join(cwd, ".github", "skills", "references")
    ];

    return candidates.filter((dir) => fs.existsSync(dir));
}

/**
 * Default destination for the add-resource CLI command.
 * Prefers the source-of-truth submodule directory when available.
 */
export function defaultTargetDir(): string {
    const candidates = [
        path.join(PROJECT_ROOT, "next2d-development-assistant", "skills", "next2d-development-assistant", "references"),
        path.join(__dirname, "..", "references")
    ];
    const existing = candidates.find((dir) => fs.existsSync(dir));
    return existing ?? candidates[0];
}

/**
 * Derive a one-line description from a markdown document.
 * Uses the first H1 title and the first non-heading body line.
 */
export function deriveDescription(content: string, maxLength = 256): string {
    const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim());
    const isBodyLine = (line: string): boolean =>
        line !== "" &&
        !/^#{1,6}\s/.test(line) &&
        !/^-{3,}$/.test(line) &&
        !/^\*{3,}$/.test(line) &&
        !/^_{3,}$/.test(line);
    const title = lines.find((line) => /^#\s+/.test(line));
    const body = lines.find(isBodyLine);
    const parts = [title ? title.replace(/^#\s+/, "") : "", body ?? ""].filter((part) => part !== "");
    const text = parts.join(" - ");
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength - 1) + "…";
}

/**
 * Discover all markdown reference files across the reference directories.
 * Each file becomes a resource: <name>.md -> next2d://specs/<name>
 * Files are deduplicated by name; earlier directories take priority.
 */
export function discoverResources(dirs: string[] = findReferenceDirs()): DiscoveredResource[] {
    const seen = new Map<string, DiscoveredResource>();

    for (const dir of dirs) {
        let entries: string[];
        try {
            entries = fs.readdirSync(dir).sort();
        } catch {
            continue;
        }

        for (const file of entries) {
            if (!file.endsWith(".md")) {
                continue;
            }
            const name = file.slice(0, -".md".length);
            if (seen.has(name)) {
                continue;
            }
            const filePath = path.join(dir, file);
            let description = name;
            try {
                description = deriveDescription(fs.readFileSync(filePath, "utf-8")) || name;
            } catch {
                // Unreadable file: keep the file name as description
            }
            seen.set(name, {
                name,
                "uri": `next2d://specs/${name}`,
                description,
                filePath
            });
        }
    }

    return [...seen.values()];
}

export function registerResources(server: McpServer): void {
    const resources = discoverResources();

    for (const res of resources) {
        server.registerResource(
            res.name,
            res.uri,
            {
                "description": res.description,
                "mimeType": "text/markdown"
            },
            async () => ({
                "contents": [
                    {
                        "uri": res.uri,
                        "mimeType": "text/markdown",
                        "text": fs.readFileSync(res.filePath, "utf-8")
                    }
                ]
            })
        );
    }

    server.registerResource(
        "specs-index",
        "next2d://specs",
        {
            "description":
                "Index of all available Next2D reference resources. " +
                "Read this first to discover what references exist, then read the specific resource.",
            "mimeType": "text/markdown"
        },
        async () => ({
            "contents": [
                {
                    "uri": "next2d://specs",
                    "mimeType": "text/markdown",
                    "text": buildSpecsIndex(resources)
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

function buildSpecsIndex(resources: DiscoveredResource[]): string {
    const rows = resources
        .map((res) => `| ${res.name} | \`${res.uri}\` | ${res.description} |`)
        .join("\n");

    return [
        "# Next2D Reference Resources",
        "",
        `Found ${resources.length} reference resource(s).`,
        "",
        "| Resource | URI | Description |",
        "|---|---|---|",
        rows,
        "",
        "Read a specific resource by its URI to get the full reference."
    ].join("\n");
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
- **View**: Extends \`View<ViewModel>\` generic class. No business logic. Constructor calls \`super(vm)\`, creates Page component.
- **ViewModel**: Bridge between View and Model. Holds UseCases. Initialized before View.
- **UI Components**: Atomic Design hierarchy (Atom → Molecule → Organism → Page). View delegates to Page for UI setup.

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
**Warning:** Only \`width\`/\`height\`/\`fps\`/\`options\` (\`fullScreen\`, \`tagId\`, \`bgColor\`) can be set in stage.json. Flash-era options (\`scaleMode\`, \`align\`, \`quality\`, \`wmode\`, etc.) are NOT supported — Next2D Player is not a Flash Player derivative. Unknown keys are silently ignored. Use \`options.fullScreen: true\` to fill the window.

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
**Note:** View delegates to Page component: \`initialize()\` calls \`page.initialize(this.vm)\`, \`onEnter()\` calls \`await page.onEnter()\`.

## Display Object Hierarchy
\`\`\`
DisplayObject (base)
├── InteractiveObject
│   ├── DisplayObjectContainer
│   │   └── Sprite
│   │       └── MovieClip    ← addChild() allowed, timeline animation
│   └── TextField            ← addChild() NOT allowed, text display/input
├── Shape                    ← addChild() NOT allowed, lightweight vector drawing
└── Video                    ← addChild() NOT allowed, video playback
\`\`\`
**Key constraints:**
- \`Shape\` has no \`addChild()\` — use \`Sprite\` or \`MovieClip\` as container
- Casting \`Shape\` to \`Sprite\`: requires \`as unknown as Sprite\` two-step assertion
- \`hitArea\` is \`Sprite | null\` — type assertion required for \`Shape\`

## Key Rules
1. View: Display only. Delegate events to ViewModel. Use \`View<ViewModel>\` generic.
2. ViewModel: Hold UseCases. Depend on interfaces. Get data via \`app.getResponse()\`.
3. UseCase: Single responsibility. \`execute()\` entry point. Can call Repository, Domain, framework APIs.
4. Repository: try-catch required. Config for endpoints. Return typed interfaces.
5. Interface: \`I\` prefix. Minimal properties.
6. No \`any\` type. Explicit types always.
7. Domain: No external API/DB dependencies (Next2D display APIs allowed). Pure business logic.
8. Animation: Separate from components. Use Tween/Easing/Job.
9. CSP: \`default-src 'self' data: blob:\`, \`worker-src 'self' blob: data:\`, \`style-src 'self' 'unsafe-inline'\` required. NEVER add \`frame-ancestors 'none'\`.
10. E2E: After UI/screen changes, run \`npx playwright test\` to verify behavior.

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
