import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateLoading } from "../templates/loading.js";
import { toPascalCase } from "../utils.js";

export function registerCreateLoading(server: McpServer): void {
    server.registerTool(
        "create_loading",
        {
            "description":
                "Create a Loading screen class for screen transition loading indicator. " +
                "The class has start() and end() methods called by the framework during gotoView transitions. " +
                "Configured in config.json loading.callback. Located in src/model/domain/callback/.",
            "inputSchema": {
                "name": z.string().optional().default("Loading").describe(
                    "Loading class name (default: 'Loading')"
                )
            }
        },
        async ({ name }) => {
            const pascal = toPascalCase(name);
            const filePath = `src/model/domain/callback/${pascal}.ts`;
            const code = generateLoading(name);

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated Loading Class: ${pascal}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            "### Register in config.json",
                            "Add to the `all` section:",
                            "```json",
                            "\"loading\": {",
                            `    "callback": "${pascal}"`,
                            "}",
                            "```",
                            "",
                            "### Lifecycle",
                            "1. `constructor()`: Called once when the app starts",
                            "2. `start()`: Called when screen transition begins (show loading indicator)",
                            "3. `end()`: Called when new screen is ready (hide loading indicator)",
                            "",
                            "### Tips",
                            "- Register the Loading class in `src/Packages.ts`",
                            "- Use `stage.addChild()` to overlay loading on top of everything",
                            "- Use `shape.remove()` or `stage.removeChild()` to clean up",
                            "- Can use Tween for fade in/out effects"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
