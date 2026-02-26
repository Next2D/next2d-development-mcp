import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

function toPascal(name: string): string {
    return name
        .split(/[/\-_]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
}

export function registerPlanFeature(server: McpServer): void {
    server.registerTool(
        "plan_feature",
        {
            "description":
                "Generate a systematic, ordered implementation plan for a new Next2D screen or feature. " +
                "Checks what already exists in the project and produces step-by-step instructions " +
                "with specific MCP tool calls to execute. " +
                "Run analyze_project first to understand current state.",
            "inputSchema": {
                "screenPath": z.string().describe(
                    "Screen path matching routing.json key (e.g. 'quest/list', 'home', 'settings')"
                ),
                "hasApi": z.boolean().optional().default(false).describe(
                    "Does this screen fetch data from an external API?"
                ),
                "hasContent": z.boolean().optional().default(false).describe(
                    "Does this screen use Animation Tool (.n2d) content?"
                ),
                "projectPath": z.string().optional().default(".").describe(
                    "Path to project root directory (default: current directory)"
                )
            }
        },
        async ({ screenPath, hasApi, hasContent, projectPath }) => {
            const base = path.resolve(projectPath);
            const pascal = toPascal(screenPath);
            const screenDir = screenPath.includes("/")
                ? screenPath.split("/")[0].toLowerCase()
                : screenPath.toLowerCase();

            // --- Detect what already exists ---
            const routingPath = path.join(base, "src/config/routing.json");
            let routeExists = false;
            if (fs.existsSync(routingPath)) {
                try {
                    const routing: Record<string, unknown> = JSON.parse(
                        fs.readFileSync(routingPath, "utf-8")
                    );
                    routeExists = screenPath in routing;
                } catch { /* ignore */ }
            }

            const viewExists = fs.existsSync(
                path.join(base, `src/view/${screenDir}/${pascal}View.ts`)
            );
            const vmExists = fs.existsSync(
                path.join(base, `src/view/${screenDir}/${pascal}ViewModel.ts`)
            );
            const repoExists = fs.existsSync(
                path.join(base, `src/model/infrastructure/repository/${pascal}Repository.ts`)
            );
            const pageExists = fs.existsSync(
                path.join(base, `src/ui/component/page/${screenDir}/${pascal}Page.ts`)
            );
            const contentExists = fs.existsSync(
                path.join(base, `src/ui/content/${pascal}Content.ts`)
            );

            const lines: string[] = [
                `## Implementation Plan: \`${screenPath}\``,
                "",
                "| Item | Value |",
                "|------|-------|",
                `| Screen path | \`${screenPath}\` |`,
                `| Class prefix | \`${pascal}\` |`,
                `| View directory | \`src/view/${screenDir}/\` |`,
                `| Features | ${[hasApi ? "API data" : "", hasContent ? "Animation Tool content" : ""].filter(Boolean).join(", ") || "Basic screen"} |`,
                "",
                "---",
                ""
            ];

            let step = 1;

            // ── Step: Route ──────────────────────────────────────────────
            if (routeExists) {
                lines.push(`### ✅ Route \`${screenPath}\` already defined in routing.json`);
            } else {
                lines.push(`### Step ${step}: Add Route`);
                lines.push("**Tool:** `add_route`");
                lines.push("```json");
                lines.push("{");
                lines.push(`  "path": "${screenPath}",`);
                lines.push("  \"requests\": [");
                if (hasContent) {
                    lines.push(`    { "type": "content", "path": "{{ content.endPoint }}content/${screenPath}.json", "name": "${pascal}Content", "cache": true }${hasApi ? "," : ""}`);
                }
                if (hasApi) {
                    lines.push(`    { "type": "json", "path": "{{ api.endPoint }}api/${screenPath}.json", "name": "${pascal}Data" }`);
                }
                lines.push("  ]");
                lines.push("}");
                lines.push("```");
                step++;
            }
            lines.push("");

            // ── Step: Interface (API response type) ──────────────────────
            if (hasApi) {
                lines.push(`### Step ${step}: Define API Response Interface`);
                lines.push("**Tool:** `create_interface`");
                lines.push("```");
                lines.push("create_interface({");
                lines.push(`  name: "${pascal}Response",`);
                lines.push("  properties: [{ name: \"id\", type: \"string\" }, { name: \"name\", type: \"string\" }]");
                lines.push("})");
                lines.push("```");
                lines.push(`**Output:** \`src/interface/I${pascal}Response.ts\``);
                lines.push("**Note:** Define only the properties you actually use (minimal interface rule)");
                lines.push("");
                step++;

                // ── Step: Repository ─────────────────────────────────────
                if (repoExists) {
                    lines.push(`### ✅ ${pascal}Repository already exists`);
                } else {
                    lines.push(`### Step ${step}: Create Repository`);
                    lines.push("**Tool:** `create_repository`");
                    lines.push("```");
                    lines.push(`create_repository({ name: "${pascal}", method: "get" })`);
                    lines.push("```");
                    lines.push(`**Output:** \`src/model/infrastructure/repository/${pascal}Repository.ts\``);
                    lines.push("**Implement:**");
                    lines.push(`- Endpoint: \`\${config.api.endPoint}api/${screenPath}.json\``);
                    lines.push(`- Return type: \`Promise<I${pascal}Response>\``);
                    lines.push("- Wrap in try-catch (required)");
                    step++;
                }
                lines.push("");

                // ── Step: Fetch UseCase ──────────────────────────────────
                lines.push(`### Step ${step}: Create Fetch UseCase`);
                lines.push("**Tool:** `create_usecase`");
                lines.push("```");
                lines.push(`create_usecase({ name: "Fetch${pascal}Data", screen: "${screenDir}" })`);
                lines.push("```");
                lines.push(`**Output:** \`src/model/application/${screenDir}/usecase/Fetch${pascal}DataUseCase.ts\``);
                lines.push("**Implement:** Call Repository, return typed data");
                lines.push("");
                step++;
            }

            // ── Step: Navigation UseCase ─────────────────────────────────
            lines.push(`### Step ${step}: Create Navigation UseCase`);
            lines.push("**Tool:** `create_usecase`");
            lines.push("```");
            lines.push(`create_usecase({ name: "NavigateToView", screen: "${screenDir}" })`);
            lines.push("```");
            lines.push(`**Output:** \`src/model/application/${screenDir}/usecase/NavigateToViewUseCase.ts\``);
            lines.push("**Implement:** `await app.gotoView(viewName)` inside execute()");
            lines.push("");
            step++;

            // ── Step: View / ViewModel ───────────────────────────────────
            if (viewExists && vmExists) {
                lines.push(`### ✅ ${pascal}View and ${pascal}ViewModel already exist`);
            } else {
                lines.push(`### Step ${step}: Generate View & ViewModel`);
                lines.push("**Preferred:** `npm run generate` (auto-generates from routing.json)");
                lines.push("**Or Tool:** `create_view`");
                lines.push("```");
                lines.push(`create_view({ name: "${screenPath}" })`);
                lines.push("```");
                lines.push("**Output:**");
                lines.push(`- \`src/view/${screenDir}/${pascal}View.ts\``);
                lines.push(`- \`src/view/${screenDir}/${pascal}ViewModel.ts\``);
                lines.push("**After creation:**");
                lines.push(`- Register in \`src/Packages.ts\` (import ${pascal}View, ${pascal}ViewModel)`);
                lines.push(`- Add \`"${screenPath}"\` to \`src/interface/IViewName.ts\` union type`);
                step++;
            }
            lines.push("");

            // ── Step: Page Component ─────────────────────────────────────
            if (pageExists) {
                lines.push(`### ✅ ${pascal}Page already exists`);
            } else {
                lines.push(`### Step ${step}: Create Page Component`);
                lines.push("**Tool:** `create_ui_component`");
                lines.push("```");
                lines.push(`create_ui_component({ name: "${pascal}Page", level: "page", screen: "${screenDir}" })`);
                lines.push("```");
                lines.push(`**Output:** \`src/ui/component/page/${screenDir}/${pascal}Page.ts\``);
                lines.push("**Implement:**");
                lines.push("- `initialize(vm)`: Create Atom/Molecule components, register event listeners");
                lines.push("- `onEnter()`: Start entry animations");
                lines.push("- Events must delegate to ViewModel methods (no logic in Page)");
                step++;
            }
            lines.push("");

            // ── Step: Content (if needed) ────────────────────────────────
            if (hasContent) {
                if (contentExists) {
                    lines.push(`### ✅ ${pascal}Content already exists`);
                } else {
                    lines.push(`### Step ${step}: Create Animation Tool Content Wrapper`);
                    lines.push("**Tool:** `create_ui_component`");
                    lines.push("```");
                    lines.push(`create_ui_component({ name: "${pascal}Content", level: "content" })`);
                    lines.push("```");
                    lines.push(`**Output:** \`src/ui/content/${pascal}Content.ts\``);
                    lines.push("**Remember:** Set `namespace` to match the Animation Tool symbol name exactly");
                    step++;
                }
                lines.push("");
            }

            // ── Step: Animation ──────────────────────────────────────────
            lines.push(`### Step ${step}: Create Entry Animation (recommended)`);
            lines.push("**Tool:** `create_animation`");
            lines.push("```");
            lines.push(`create_animation({ component: "${pascal}Page", action: "Show", screen: "${screenDir}" })`);
            lines.push("```");
            lines.push(`**Output:** \`src/ui/animation/${screenDir}/${pascal}PageShowAnimation.ts\``);
            lines.push("**Implement:** Use `Tween.add()` with `Easing.*`. Call `job.start()` in `onEnter()`");
            lines.push("");
            step++;

            // ── Step: Validate ───────────────────────────────────────────
            lines.push(`### Step ${step}: Validate Architecture`);
            lines.push("**Tool:** `validate_architecture`");
            lines.push("Confirm all required files exist and the project structure is consistent.");
            lines.push("");

            // ── Implementation Notes ─────────────────────────────────────
            lines.push("---");
            lines.push("");
            lines.push("## Key Implementation Rules");
            lines.push("");
            lines.push("### View Pattern");
            lines.push("```typescript");
            lines.push(`export class ${pascal}View extends View<${pascal}ViewModel> {`);
            lines.push(`    private readonly _${screenDir}Page: ${pascal}Page;`);
            lines.push(`    constructor(vm: ${pascal}ViewModel) {`);
            lines.push("        super(vm);");
            lines.push(`        this._${screenDir}Page = new ${pascal}Page();`);
            lines.push(`        this.addChild(this._${screenDir}Page);`);
            lines.push("    }");
            lines.push(`    async initialize(): Promise<void> { this._${screenDir}Page.initialize(this.vm); }`);
            lines.push(`    async onEnter(): Promise<void> { await this._${screenDir}Page.onEnter(); }`);
            lines.push("    async onExit(): Promise<void> { return void 0; }");
            lines.push("}");
            lines.push("```");
            lines.push("");
            lines.push("### ViewModel Pattern");
            if (hasApi) {
                lines.push("```typescript");
                lines.push("async initialize(): Promise<void> {");
                lines.push("    const response = app.getResponse();");
                lines.push(`    if (response.has("${pascal}Data")) {`);
                lines.push(`        this.data = response.get("${pascal}Data") as I${pascal}Response;`);
                lines.push("    }");
                lines.push("}");
                lines.push("```");
            }
            lines.push("");
            lines.push("### Button Double-Press Prevention");
            lines.push("```typescript");
            lines.push("// In Page.initialize(vm):");
            lines.push("btn.addEventListener(PointerEvent.POINTER_UP, async (): Promise<void> => {");
            lines.push("    btn.disable();");
            lines.push("    await vm.onClickButton();");
            lines.push("    btn.enable(); // omit if navigating away");
            lines.push("});");
            lines.push("```");

            return {
                "content": [
                    {
                        "type": "text",
                        "text": lines.join("\n")
                    }
                ]
            };
        }
    );
}
