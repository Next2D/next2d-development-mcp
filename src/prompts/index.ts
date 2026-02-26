import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
    server.registerPrompt(
        "new-screen",
        {
            "description": "Step-by-step guide for adding a new screen to a Next2D project",
            "argsSchema": {
                "screenName": z.string().describe("Screen name (e.g. 'quest/list', 'settings', 'profile')"),
                "hasApi": z.string().optional().describe("Does this screen need API data? (yes/no)"),
                "hasAnimation": z.string().optional().describe("Does this screen use Animation Tool content? (yes/no)")
            }
        },
        async ({ screenName, hasApi, hasAnimation }) => {
            const pascal = screenName
                .split(/[\\/]/)
                .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
                .join("");

            // Screen directory is the first segment for slash-separated routes
            const screenDir = screenName.includes("/") ? screenName.split("/")[0].toLowerCase() : screenName.toLowerCase();

            const steps: string[] = [
                `# Adding New Screen: ${pascal}`,
                "",
                "## Step 1: Add Route",
                "Add to `src/config/routing.json`:",
                "```json",
                `"${screenName}": {`,
                "    \"requests\": ["
            ];

            if (hasAnimation === "yes") {
                steps.push(
                    "        {",
                    "            \"type\": \"content\",",
                    `            "path": "{{ content.endPoint }}content/${screenName.toLowerCase()}.json",`,
                    `            "name": "${pascal}Content",`,
                    "            \"cache\": true",
                    `        }${hasApi === "yes" ? "," : ""}`
                );
            }

            if (hasApi === "yes") {
                steps.push(
                    "        {",
                    "            \"type\": \"json\",",
                    `            "path": "{{ api.endPoint }}api/${screenName.toLowerCase()}.json",`,
                    `            "name": "${pascal}Data"`,
                    "        }"
                );
            }

            steps.push(
                "    ]",
                "}",
                "```",
                "",
                "## Step 2: Generate View/ViewModel",
                "```bash",
                "npm run generate",
                "```",
                "> **Note:** `npm run generate` auto-creates View, ViewModel, Packages.ts registration, and IViewName.ts update.",
                "> Steps 3-4 below are only needed if creating files manually.",
                "",
                "Or manually create:",
                `- \`src/view/${screenDir}/${pascal}View.ts\``,
                `- \`src/view/${screenDir}/${pascal}ViewModel.ts\``,
                "",
                "## Step 3: Create UI Components",
                `Create Page component: \`src/ui/component/page/${screenDir}/${pascal}Page.ts\``,
                "",
                "## Step 4: Register in Packages.ts",
                "```typescript",
                `import { ${pascal}View } from "@/view/${screenDir}/${pascal}View";`,
                `import { ${pascal}ViewModel } from "@/view/${screenDir}/${pascal}ViewModel";`,
                "```",
                "",
                "## Step 5: Implement ViewModel",
                "- Add UseCases for business logic",
                "- Get response data in `initialize()`",
                "",
                "## Step 6: Implement View",
                "- Add Page component in constructor",
                "- Bind events to ViewModel methods in `initialize()`"
            );

            return {
                "messages": [
                    {
                        "role": "user",
                        "content": {
                            "type": "text",
                            "text": steps.join("\n")
                        }
                    }
                ]
            };
        }
    );

    server.registerPrompt(
        "architecture-guide",
        {
            "description": "Next2D architecture rules and coding conventions reference"
        },
        async () => ({
            "messages": [
                {
                    "role": "user",
                    "content": {
                        "type": "text",
                        "text": ARCHITECTURE_GUIDE
                    }
                }
            ]
        })
    );

    server.registerPrompt(
        "orchestrate",
        {
            "description":
                "Activate orchestrator mode for systematic Next2D development. " +
                "Handles both NEW screen creation and EXISTING screen modification. " +
                "Claude will inspect the screen state, plan changes, execute MCP tools, and validate.",
            "argsSchema": {
                "task": z.string().describe(
                    "What you want to build or change (e.g. 'add search to quest/list', 'implement home screen')"
                ),
                "screenPath": z.string().describe(
                    "Target screen path matching routing.json key (e.g. 'quest/list', 'home')"
                ),
                "mode": z.enum(["create", "modify"]).optional().default("create").describe(
                    "'create' for a new screen, 'modify' to change an existing screen"
                )
            }
        },
        async ({ task, screenPath, mode }) => ({
            "messages": [
                {
                    "role": "user",
                    "content": {
                        "type": "text",
                        "text": ORCHESTRATE_GUIDE(task, screenPath, mode ?? "create")
                    }
                }
            ]
        })
    );

    server.registerPrompt(
        "debug-help",
        {
            "description": "Common Next2D debugging tips and troubleshooting guide",
            "argsSchema": {
                "issue": z.string().describe("Describe the issue you're experiencing")
            }
        },
        async ({ issue }) => ({
            "messages": [
                {
                    "role": "user",
                    "content": {
                        "type": "text",
                        "text": [
                            "# Next2D Debugging Guide",
                            "",
                            `## Issue: ${issue}`,
                            "",
                            "## Common Issues & Solutions",
                            "",
                            "### View not loading",
                            "1. Check routing.json has the route defined",
                            "2. Verify View/ViewModel are registered in Packages.ts",
                            "3. Check browser console for import errors",
                            "4. Verify config.json has correct `defaultTop` setting",
                            "",
                            "### API data not appearing",
                            "1. Check routing.json `requests` configuration",
                            "2. Verify `name` matches `app.getResponse().get('name')`",
                            "3. Check config.json endpoint for the current environment",
                            "4. Look for network errors in browser DevTools",
                            "",
                            "### Animation content not showing",
                            "1. Verify .n2d file exists in file/ directory",
                            "2. Check Content class `namespace` matches symbol name",
                            "3. Verify routing.json has `type: 'content'` request",
                            "4. Check `cache: true` if using shared content via cluster",
                            "",
                            "### Build errors",
                            "1. Run `npm run lint` to check for TypeScript errors",
                            "2. Verify all imports use path aliases (@/)",
                            "3. Check tsconfig.json paths configuration",
                            "4. Ensure all interfaces have `I` prefix",
                            "",
                            "### Performance issues",
                            "1. Use `cache: true` for shared content/data",
                            "2. Cluster shared requests with `type: 'cluster'`",
                            "3. Minimize DisplayObject tree depth",
                            "4. Use Texture Atlas for multiple images",
                            "5. Consider reducing fps in stage.json if not needed at 60"
                        ].join("\n")
                    }
                }
            ]
        })
    );
}

function ORCHESTRATE_GUIDE(task: string, screenPath: string, mode: "create" | "modify"): string {
    const isModify = mode === "modify";

    const createWorkflow = `
## Phase 1: Analyze Current State
Call **\`analyze_project\`** to understand the overall project state.

## Phase 2: Generate Implementation Plan
Call **\`plan_feature\`** with:
- \`screenPath\`: \`"${screenPath}"\`
- \`hasApi\`: \`true\` if API data is needed
- \`hasContent\`: \`true\` if Animation Tool (.n2d) assets are needed

The tool returns an ordered step list. Steps marked ✅ are already implemented — skip them.

## Phase 3: Execute the Plan
For each step in the plan:
1. Call the specified MCP tool to generate the code
2. Write the file to the exact path shown
3. Implement business logic as described in the step notes
4. Run \`npm run generate\` after updating routing.json

## Phase 4: Validate
Call **\`validate_architecture\`** to confirm all files exist and the structure is consistent.

**Start now:** call \`analyze_project\`.
`;

    const modifyWorkflow = `
## Phase 1: Inspect the Target Screen
Call **\`inspect_screen\`** with \`screenPath: "${screenPath}"\`.

This returns:
- routing.json configuration for this screen
- All related file paths (View, ViewModel, Page, UseCases, Repositories, Animations, Content)
- File line counts so you know how much is already implemented
- Missing files flagged with ❌

## Phase 2: Read the Relevant Files
Using the **Read** tool, read the files that are related to the change:
- If changing UI → read the Page component
- If changing data flow → read ViewModel + UseCase
- If changing API → read Repository + Interface
- If changing navigation → read UseCase that calls \`app.gotoView()\`

**Read only what you need** — targeted modification, not full rewrites.

## Phase 3: Plan and Execute Changes
Based on what you read, decide the minimal set of changes:

| Need to... | Action |
|---|---|
| Add a new action | Create UseCase with \`create_usecase\` tool |
| Add API access | Create Repository with \`create_repository\` tool |
| Add a UI element | Create component with \`create_ui_component\` tool |
| Add animation | Create animation with \`create_animation\` tool |
| Modify existing logic | Edit the specific file directly |

**Modification rules:**
- Change **only** what the task requires — no unrelated refactoring
- Keep single responsibility: one UseCase per action
- If modifying ViewModel, make sure View still delegates (no logic added to View)
- Buttons added/modified must use \`ButtonAtom.disable()\`/\`enable()\`

## Phase 4: Validate
Call **\`validate_architecture\`** to confirm the screen structure remains consistent.

**Start now:** call \`inspect_screen\` with \`screenPath: "${screenPath}"\`.
`;

    return `# Next2D Development Orchestrator

## Task
${task}

| Item | Value |
|------|-------|
| Target screen | \`${screenPath}\` |
| Mode | **${isModify ? "Modify existing screen" : "Create new screen"}** |

## Your Role
You are a systematic development orchestrator for Next2D projects.
Follow the workflow below **in order**. Do not skip phases.
${isModify ? modifyWorkflow : createWorkflow}
---

## Architecture Rules (always apply)
- **View** → extends \`View<ViewModel>\`, delegates to Page: \`page.initialize(this.vm)\`
- **ViewModel** → holds UseCases, no direct UI, fetches data in \`initialize()\`
- **UseCase** → one action = one class, single \`execute()\` entry point
- **Repository** → try-catch required, endpoint from \`config.api.endPoint\`, no \`any\` type
- **Buttons** → \`ButtonAtom.disable()\` on press, \`enable()\` after action or in \`Job.COMPLETE\`
- **Interfaces** → \`I\` prefix, minimal properties only

---

## Tool Reference

| Tool | When to use |
|------|-------------|
| \`inspect_screen\` | Before modifying — understand what exists |
| \`analyze_project\` | Before creating — see overall project state |
| \`plan_feature\` | Generate ordered creation steps |
| \`create_usecase\` | Add a new action/behavior |
| \`create_repository\` | Add new API/data access |
| \`create_interface\` | Define a new response/DTO type |
| \`create_ui_component\` | Add Page/Molecule/Atom/Content |
| \`create_animation\` | Add Tween animation |
| \`create_view\` | Generate View + ViewModel pair |
| \`add_route\` | Register new route in routing.json |
| \`validate_architecture\` | Final consistency check |
`;
}

const ARCHITECTURE_GUIDE = `# Next2D Architecture & Coding Conventions

## MVVM + Clean Architecture

### Layer Rules
1. **View → ViewModel → UseCase → Repository** (one-directional dependency)
2. All cross-layer communication through **interfaces** in src/interface/
3. **Domain Layer** has no external API/DB dependencies (Next2D display APIs are allowed)

### File Naming
- View: \`{PascalCase}View.ts\` in \`src/view/{lowercase}/\`
- ViewModel: \`{PascalCase}ViewModel.ts\` in same directory as View
- UseCase: \`{PascalCase}UseCase.ts\` in \`src/model/application/{screen}/usecase/\`
- Repository: \`{PascalCase}Repository.ts\` in \`src/model/infrastructure/repository/\`
- Interface: \`I{PascalCase}.ts\` in \`src/interface/\`
- UI Atom: \`{PascalCase}Atom.ts\` in \`src/ui/component/atom/\`
- UI Molecule: \`{PascalCase}Molecule.ts\` in \`src/ui/component/molecule/\`
- UI Organism: \`{PascalCase}Organism.ts\` in \`src/ui/component/organism/\`
- UI Page: \`{PascalCase}Page.ts\` in \`src/ui/component/page/{screen}/\`
- Content: \`{PascalCase}Content.ts\` in \`src/ui/content/\`

### TypeScript Rules
- \`any\` type is **prohibited**
- Interfaces always use \`I\` prefix
- Use \`import type\` for type-only imports
- Config values accessed via \`config\` import, not hardcoded
- All public methods must have JSDoc comments

### View Rules
- Extends \`View<ViewModel>\` generic class from framework
- **No business logic** - only display structure
- Constructor receives ViewModel, calls \`super(vm)\`, creates Page component and \`addChild()\`
- \`initialize()\`: Delegates to \`this._xxxPage.initialize(this.vm)\`
- \`onEnter()\`: Delegates to \`await this._xxxPage.onEnter()\`
- \`onExit()\`: Cleanup when view is hidden

### ViewModel Rules
- Extends framework \`ViewModel\` class
- Holds UseCase instances as private readonly properties
- \`initialize()\`: Get data from \`app.getResponse()\`
- Event handler methods receive typed events
- Cast event targets to interfaces, not concrete classes

### UseCase Rules
- One action = one UseCase class
- Single \`execute()\` method as entry point
- Parameters use interface types
- Can call Repository, Domain services, and framework APIs (e.g. \`app.gotoView()\`)
- Can compose with other UseCases (hold as private readonly properties, call their \`execute()\` methods)

### Repository Rules
- Static or instance methods for data access
- **Always** wrap in try-catch
- Endpoints from config: \`config.api.endPoint\`
- Return typed data (interface, not \`any\`)

### Atomic Design
- **Atom**: Smallest reusable unit (button, text, icon)
- **Molecule**: Combination of atoms
- **Organism**: Complex section with business logic connections
- **Page**: Full screen layout, used directly in View
- **Content**: Animation Tool asset wrapper (extends MovieClipContent)

### Event Handling Pattern
\`\`\`typescript
// In Page.initialize(vm):
// Use arrow function wrapper to preserve ViewModel context
component.addEventListener(PointerEvent.POINTER_UP, async (): Promise<void> => {
    await vm.onClickSomething();
});

// For drag operations, use POINTER_DOWN:
content.addEventListener(PointerEvent.POINTER_DOWN, (event: PointerEvent): void => {
    const target = event.currentTarget as unknown as IDraggable;
    vm.onStartDrag(target);
});
\`\`\`

### Button Double-Press Prevention
\`\`\`typescript
// ButtonAtom provides disable()/enable() for mouseEnabled/mouseChildren control

// Pattern 1: Normal button (re-enable on POINTER_UP)
button.addEventListener(PointerEvent.POINTER_UP, async (): Promise<void> => {
    button.disable();  // Immediately disable to prevent double-press
    await vm.onClickButton();
    button.enable();   // Re-enable after processing (skip if navigating away)
});

// Pattern 2: Tween animation (re-enable in Job.COMPLETE callback)
button.addEventListener(PointerEvent.POINTER_UP, (): void => {
    button.disable();
    new ButtonPointerUpAnimation(button, () => { button.enable(); }).start();
});
\`\`\`

### Display Object Hierarchy
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
**Key type constraints:**
- \`Shape\` does NOT extend \`DisplayObjectContainer\` → \`addChild()\` unavailable
- \`Shape\` cannot be directly cast to \`Sprite\` → use \`as unknown as Sprite\` two-step assertion
- \`hitArea\` property type is \`Sprite | null\` → type assertion required when passing \`Shape\`

### Content Security Policy (CSP)
Required directives for Next2D Player (WebGL/WebGPU, Web Workers, Blob URLs):
\`\`\`
default-src 'self' data: blob:    ← Blob URL/Data URI used internally
style-src 'self' 'unsafe-inline'  ← Dynamic style injection by Player
worker-src 'self' blob: data:     ← Web Worker via Blob/Data URI
\`\`\`
**NEVER add \`frame-ancestors 'none'\`** — it will break the application.

### E2E Testing Recommendation
After screen transitions or UI behavior changes, verify with Playwright:
\`\`\`bash
npx playwright test
\`\`\`
`;
