import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateRepository } from "../templates/repository.js";
import { toPascalCase } from "../utils.js";

export function registerCreateRepository(server: McpServer): void {
    server.registerTool(
        "create_repository",
        {
            "description":
                "Create a new Repository class in the Infrastructure layer. " +
                "Repositories abstract data source access (API, DB). " +
                "Located in src/model/infrastructure/repository/. " +
                "Must include try-catch and use config for endpoints.",
            "inputSchema": {
                "name": z.string().describe(
                    "Repository name (e.g. 'HomeText', 'UserData', 'QuestList')"
                ),
                "method": z.string().optional().default("get").describe(
                    "Method name for the repository (default: 'get')"
                )
            }
        },
        async ({ name, method }) => {
            const pascal = toPascalCase(name);
            const repoName = pascal.endsWith("Repository") ? pascal : `${pascal}Repository`;
            const actualName = name.endsWith("Repository") ? name : `${name}Repository`;
            const filePath = `src/model/infrastructure/repository/${repoName}.ts`;
            const code = generateRepository(actualName.replace("Repository", ""), method);

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated Repository: ${repoName}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            "### Usage in routing.json (custom request)",
                            "```json",
                            "{",
                            "    \"type\": \"custom\",",
                            `    "class": "infrastructure.repository.${repoName}",`,
                            "    \"access\": \"static\",",
                            `    "method": "${method}",`,
                            `    "name": "${pascal.replace("Repository", "")}",`,
                            "    \"cache\": false",
                            "}",
                            "```",
                            "",
                            "### Rules",
                            "- Always wrap external calls in try-catch",
                            "- Get endpoints from config (not hardcode)",
                            "- Define response type as interface in src/interface/",
                            "- Never use `any` type"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
