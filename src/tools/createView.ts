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
                "View extends Sprite and manages UI display. ViewModel handles business logic via UseCases.",
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
                            "### Next Steps",
                            `1. Create directory: \`${dirPath}/\``,
                            "2. Save the above files",
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
                            "6. Add UI components (Page/Molecule/Atom) in `src/ui/`"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
