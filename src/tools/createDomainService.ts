import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateDomainService, generateDomainCallback } from "../templates/domainService.js";
import { toPascalCase } from "../utils.js";

export function registerCreateDomainService(server: McpServer): void {
    server.registerTool(
        "create_domain_service",
        {
            "description":
                "Create a Domain layer class (service or callback). " +
                "Services implement core business rules with no external dependencies. " +
                "Callbacks are executed after gotoView completes (configured in config.json gotoView.callback). " +
                "Located in src/model/domain/.",
            "inputSchema": {
                "name": z.string().describe(
                    "Feature name (e.g. 'Background', 'Score', 'Timer')"
                ),
                "type": z.enum(["service", "callback"]).describe(
                    "Domain type: 'service' for business logic, 'callback' for gotoView.callback handler"
                ),
                "action": z.string().optional().describe(
                    "Action name for service type (e.g. 'Draw', 'ChangeScale'). Not needed for callback."
                )
            }
        },
        async ({ name, type, action }) => {
            const pascal = toPascalCase(name);

            if (type === "callback") {
                const filePath = `src/model/domain/callback/${pascal}.ts`;
                const code = generateDomainCallback(name);

                return {
                    "content": [
                        {
                            "type": "text",
                            "text": [
                                `## Generated Domain Callback: ${pascal}`,
                                "",
                                `### File: ${filePath}`,
                                "```typescript",
                                code.trim(),
                                "```",
                                "",
                                "### Register in config.json",
                                "```json",
                                "\"gotoView\": {",
                                `    "callback": ["domain.callback.${pascal}"]`,
                                "}",
                                "```",
                                "",
                                "### Rules",
                                "- `execute()` is called after every screen transition completes",
                                "- Multiple callbacks are executed sequentially with async/await",
                                "- Use `app.getContext().view` to access the current view"
                            ].join("\n")
                        }
                    ]
                };
            }

            // Service type — services are nested under their parent callback directory
            const actionPascal = action ? toPascalCase(action) : "Execute";
            const className = `${pascal}${actionPascal}Service`;
            const filePath = `src/model/domain/callback/${pascal}/service/${className}.ts`;
            const code = generateDomainService(name, action || "Execute");

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated Domain Service: ${className}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            "### Usage in Callback",
                            "```typescript",
                            `import { execute as ${name.toLowerCase()}${actionPascal} } from "./service/${className}";`,
                            "",
                            `${name.toLowerCase()}${actionPascal}(param);`,
                            "```",
                            "",
                            "### Rules",
                            "- Domain layer has no external API/DB dependencies (Next2D display APIs are allowed)",
                            "- Pure business logic (no fetch calls, no direct data access)",
                            "- Prefer functional style with `execute` export"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
