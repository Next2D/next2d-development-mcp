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
- Extends \`Sprite\` (via framework \`View\` class)
- **No business logic** - only display structure
- Constructor receives ViewModel and creates Page component with \`addChild()\`
- \`initialize()\`: Delegates to Page for UI setup and event binding
- \`onEnter()\`: Delegates to Page for entry animations
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

// In Page.initialize(vm):
button.addEventListener(PointerEvent.POINTER_UP, async (): Promise<void> => {
    button.disable();  // Immediately disable to prevent double-press
    await vm.onClickButton();
    button.enable();   // Re-enable after processing (skip if navigating away)
});

// In ViewModel (for async operations):
async onClickButton (): Promise<void> {
    try {
        await this.fetchDataUseCase.execute();
    } catch (error) {
        console.error(error);
    }
}
\`\`\`
`;
