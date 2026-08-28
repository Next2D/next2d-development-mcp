import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateView, generateViewModel } from "../templates/view.js";
import { toPascalCase } from "../utils.js";

export function registerCreateView(server: McpServer): void {
    server.registerTool(
        "create_view",
        {
            "description":
                "Create a new View and ViewModel pair following MVVM pattern. " +
                "Generates {Name}View.ts and {Name}ViewModel.ts in src/view/{name}/. " +
                "View extends the framework View<ViewModel> generic class (display only, delegates to a Page component). " +
                "ViewModel holds UseCases and fetches data in initialize(). " +
                "Note: create the Page component first — the generated View imports it.",
            "inputSchema": {
                "name": z.string().describe(
                    "View name (e.g. 'home', 'quest/list'). " +
                    "Slash-separated names create nested paths and PascalCase class names."
                )
            }
        },
        async ({ name }) => {
            const pascal = toPascalCase(name);
            // Screen directory is the first segment for slash-separated routes
            const screenDir = name.includes("/") ? name.split("/")[0].toLowerCase() : name.toLowerCase();
            const dirPath = `src/view/${screenDir}`;
            const viewCode = generateView(name);
            const viewModelCode = generateViewModel(name);

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated View/ViewModel: ${pascal}`,
                            "",
                            `### File: ${dirPath}/${pascal}View.ts`,
                            "```typescript",
                            viewCode.trim(),
                            "```",
                            "",
                            `### File: ${dirPath}/${pascal}ViewModel.ts`,
                            "```typescript",
                            viewModelCode.trim(),
                            "```",
                            "",
                            "### Next Steps (in order)",
                            "1. Create the Page component FIRST (the generated View imports it, so the project won't compile without it):",
                            "   use `create_ui_component` with level \"page\" and screen \"${name.toLowerCase()}\"",
                            `2. Create directory: \`${dirPath}/\` and save the View/ViewModel files above`,
                            "3. Add route to `src/config/routing.json`:",
                            "```json",
                            `"${name.toLowerCase()}": {`,
                            "    \"requests\": []",
                            "}",
                            "```",
                            "4. Register in `src/Packages.ts`:",
                            "```typescript",
                            `import { ${pascal}View } from "@/view/${screenDir}/${pascal}View";`,
                            `import { ${pascal}ViewModel } from "@/view/${screenDir}/${pascal}ViewModel";`,
                            "```",
                            `5. Update \`src/interface/IViewName.ts\` (add "${name.toLowerCase()}" to ViewName union type)`,
                            "6. Add the remaining UI components (Molecule/Atom) in `src/ui/` as needed"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
