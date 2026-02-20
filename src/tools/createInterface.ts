import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateInterface } from "../templates/interfaceFile.js";
import { toPascalCase } from "../utils.js";

export function registerCreateInterface(server: McpServer): void {
    server.registerTool(
        "create_interface",
        {
            "description":
                "Create a TypeScript interface file with I prefix convention. " +
                "Interfaces go in src/interface/ and define contracts between layers. " +
                "Used for dependency inversion (View depends on interface, not concrete class).",
            "inputSchema": {
                "name": z.string().describe(
                    "Interface name (e.g. 'Draggable', 'HomeTextResponse'). " +
                    "Will be prefixed with 'I' automatically if not already."
                ),
                "properties": z
                    .array(
                        z.object({
                            "name": z.string().describe("Property name"),
                            "type": z.string().describe("TypeScript type (e.g. 'string', 'number', 'boolean')")
                        })
                    )
                    .optional()
                    .default([])
                    .describe("Interface properties")
            }
        },
        async ({ name, properties }) => {
            const pascal = toPascalCase(name);
            const interfaceName = pascal.startsWith("I") ? pascal : `I${pascal}`;
            const fileName = `${interfaceName}.ts`;
            const filePath = `src/interface/${fileName}`;
            const code = generateInterface(name, properties);

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated Interface: ${interfaceName}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            "### Usage Example",
                            "```typescript",
                            `import type { ${interfaceName} } from "@/interface/${interfaceName}";`,
                            "",
                            "// In UseCase (depend on interface, not concrete class)",
                            `execute (target: ${interfaceName}): void {`,
                            "    // ...",
                            "}",
                            "```",
                            "",
                            "### Rules",
                            "- Always prefix with 'I'",
                            "- Define only necessary properties (minimal interface)",
                            "- Used for dependency inversion between layers"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
