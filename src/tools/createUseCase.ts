import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateUseCase } from "../templates/usecase.js";
import { toPascalCase } from "../utils.js";

export function registerCreateUseCase(server: McpServer): void {
    server.registerTool(
        "create_usecase",
        {
            "description":
                "Create a new UseCase class in the Application layer. " +
                "Each UseCase represents a single user action with an execute() method. " +
                "Located in src/model/application/{screen}/usecase/.",
            "inputSchema": {
                "name": z.string().describe(
                    "UseCase name (e.g. 'StartDrag', 'NavigateToView', 'FetchUserData')"
                ),
                "screen": z.string().describe(
                    "Screen/view name this UseCase belongs to (e.g. 'home', 'top')"
                )
            }
        },
        async ({ name, screen }) => {
            const pascal = toPascalCase(name);
            const useCaseName = pascal.endsWith("UseCase") ? pascal : `${pascal}UseCase`;
            const filePath = `src/model/application/${screen.toLowerCase()}/usecase/${useCaseName}.ts`;
            const code = generateUseCase(
                name.endsWith("UseCase") ? name : `${name}UseCase`,
                screen
            );

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated UseCase: ${useCaseName}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            "### Usage in ViewModel",
                            "```typescript",
                            `import { ${useCaseName} } from "@/model/application/${screen.toLowerCase()}/usecase/${useCaseName}";`,
                            "",
                            `private readonly ${useCaseName.charAt(0).toLowerCase() + useCaseName.slice(1)}: ${useCaseName};`,
                            "",
                            "constructor () {",
                            "    super();",
                            `    this.${useCaseName.charAt(0).toLowerCase() + useCaseName.slice(1)} = new ${useCaseName}();`,
                            "}",
                            "```",
                            "",
                            "### Rules",
                            "- 1 action = 1 UseCase (single responsibility)",
                            "- Entry point is always `execute()` method",
                            "- Depend on interfaces, not concrete classes"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
