import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateAnimation } from "../templates/animation.js";
import { toPascalCase } from "../utils.js";

export function registerCreateAnimation(server: McpServer): void {
    server.registerTool(
        "create_animation",
        {
            "description":
                "Create a new Animation class for UI transitions. " +
                "Uses Tween/Easing/Job from @next2d/ui. " +
                "Naming: {Component}{Action}Animation.ts in src/ui/animation/{screen}/. " +
                "Separates animation logic from components for reusability.",
            "inputSchema": {
                "component": z.string().describe(
                    "Component name (e.g. 'TopBtn', 'HomeCard')"
                ),
                "action": z.string().describe(
                    "Animation action (e.g. 'Show', 'Exit', 'Hover')"
                ),
                "screen": z.string().describe(
                    "Screen this animation belongs to (e.g. 'top', 'home')"
                )
            }
        },
        async ({ component, action, screen }) => {
            const componentPascal = toPascalCase(component);
            const actionPascal = toPascalCase(action);
            const className = `${componentPascal}${actionPascal}Animation`;
            const filePath = `src/ui/animation/${screen.toLowerCase()}/${className}.ts`;
            const code = generateAnimation(component, action);

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated Animation: ${className}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            "### Usage in Component",
                            "```typescript",
                            `import { ${className} } from "@/ui/animation/${screen.toLowerCase()}/${className}";`,
                            "",
                            "// In Molecule/Component:",
                            `play${actionPascal} (callback: () => void): void {`,
                            `    new ${className}(this, callback).start();`,
                            "}",
                            "```",
                            "",
                            "### Animation Types",
                            "- **Show**: Entrance animation when screen appears",
                            "- **Exit**: Exit animation before screen transition",
                            "- **Hover/Interaction**: Response to user input"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
