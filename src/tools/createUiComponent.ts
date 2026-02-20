import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateUiComponent, generateContent } from "../templates/uiComponent.js";
import { toPascalCase } from "../utils.js";

export function registerCreateUiComponent(server: McpServer): void {
    server.registerTool(
        "create_ui_component",
        {
            "description":
                "Create a new UI component following Atomic Design pattern. " +
                "Levels: atom (smallest), molecule (composite), organism (complex), page (full screen). " +
                "Located in src/ui/component/{level}/. " +
                "Also supports creating Animation Tool content wrappers in src/ui/content/.",
            "inputSchema": {
                "name": z.string().describe(
                    "Component name (e.g. 'Button', 'HomeBtn', 'QuestCard')"
                ),
                "level": z.enum(["atom", "molecule", "organism", "page", "content"]).describe(
                    "Atomic Design level: atom, molecule, organism, page, or 'content' for Animation Tool wrapper"
                ),
                "parentClass": z.string().optional().default("Sprite").describe(
                    "Parent DisplayObject class (default: 'Sprite'). Options: Sprite, MovieClip, Shape, TextField"
                ),
                "screen": z.string().optional().describe(
                    "Screen name for page-level components (e.g. 'top', 'home', 'quest'). " +
                    "Determines the subdirectory under page/. Required for page level."
                )
            }
        },
        async ({ name, level, parentClass, screen }) => {
            const pascal = toPascalCase(name);

            if (level === "content") {
                const contentName = pascal.endsWith("Content") ? pascal : `${pascal}Content`;
                const filePath = `src/ui/content/${contentName}.ts`;
                const code = generateContent(name.replace("Content", ""));

                return {
                    "content": [
                        {
                            "type": "text",
                            "text": [
                                `## Generated Content: ${contentName}`,
                                "",
                                `### File: ${filePath}`,
                                "```typescript",
                                code.trim(),
                                "```",
                                "",
                                "### Usage",
                                "- Content wraps Animation Tool (.n2d) assets",
                                "- Set `namespace` to match the symbol name in the .n2d file",
                                "- Load via routing.json with `type: \"content\"`"
                            ].join("\n")
                        }
                    ]
                };
            }

            const suffix = level.charAt(0).toUpperCase() + level.slice(1);
            const className = pascal.endsWith(suffix) ? pascal : `${pascal}${suffix}`;
            // Page components are organized by screen subdirectory
            const screenDir = level === "page"
                ? (screen || name.toLowerCase())
                : "";
            const filePath = level === "page"
                ? `src/ui/component/page/${screenDir}/${className}.ts`
                : `src/ui/component/${level}/${className}.ts`;
            const code = generateUiComponent(
                name.endsWith(suffix) ? name.replace(new RegExp(`${suffix}$`), "") : name,
                level as "atom" | "molecule" | "organism" | "page",
                parentClass,
                screenDir
            );

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Generated ${suffix} Component: ${className}`,
                            "",
                            `### File: ${filePath}`,
                            "```typescript",
                            code.trim(),
                            "```",
                            "",
                            `### Atomic Design - ${suffix} Level`,
                            level === "atom"
                                ? "- Smallest reusable unit (Button, Text, Icon)"
                                : level === "molecule"
                                    ? "- Combination of Atoms (e.g. TopBtnMolecule extends ButtonAtom with TextAtom child)"
                                    : level === "organism"
                                        ? "- Complex component with business logic connections"
                                        : "- Full screen layout, used directly in View"
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
