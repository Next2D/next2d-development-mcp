import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

function checkDir(base: string, dir: string): { exists: boolean; path: string } {
    const full = path.join(base, dir);
    return { "exists": fs.existsSync(full), "path": full };
}

function checkFile(base: string, file: string): { exists: boolean; path: string } {
    const full = path.join(base, file);
    return { "exists": fs.existsSync(full), "path": full };
}

export function registerValidateArchitecture(server: McpServer): void {
    server.registerTool(
        "validate_architecture",
        {
            "description":
                "Validate that a Next2D project follows the expected architecture. " +
                "Checks directory structure, config files, and naming conventions. " +
                "Reports missing directories, files, and architecture violations.",
            "inputSchema": {
                "projectPath": z.string().optional().default(".").describe(
                    "Path to the project root directory (default: current directory)"
                )
            }
        },
        async ({ projectPath }) => {
            const base = path.resolve(projectPath);
            const issues: string[] = [];
            const ok: string[] = [];

            // Check required directories
            const requiredDirs = [
                "src/config",
                "src/interface",
                "src/model",
                "src/model/application",
                "src/model/domain",
                "src/model/infrastructure",
                "src/model/infrastructure/repository",
                "src/ui",
                "src/ui/animation",
                "src/ui/component",
                "src/ui/component/atom",
                "src/ui/component/molecule",
                "src/ui/component/page",
                "src/ui/content",
                "src/view"
            ];

            for (const dir of requiredDirs) {
                const check = checkDir(base, dir);
                if (check.exists) {
                    ok.push(`✅ ${dir}/`);
                } else {
                    issues.push(`❌ Missing directory: ${dir}/`);
                }
            }

            // Check required config files
            const requiredFiles = [
                "src/config/config.json",
                "src/config/routing.json",
                "src/config/stage.json",
                "src/config/Config.ts",
                "src/Packages.ts",
                "src/index.ts"
            ];

            for (const file of requiredFiles) {
                const check = checkFile(base, file);
                if (check.exists) {
                    ok.push(`✅ ${file}`);
                } else {
                    issues.push(`❌ Missing file: ${file}`);
                }
            }

            // Validate routing.json <-> view directory consistency
            const routingPath = path.join(base, "src/config/routing.json");
            if (fs.existsSync(routingPath)) {
                try {
                    const routing = JSON.parse(
                        fs.readFileSync(routingPath, "utf-8")
                    );

                    for (const key of Object.keys(routing)) {
                        if (key.startsWith("@")) { continue } // Skip cluster definitions
                        // View directory uses the first segment for slash routes (e.g. "quest/list" → "quest")
                        const screenDir = key.includes("/") ? key.split("/")[0].toLowerCase() : key.toLowerCase();
                        const viewDir = path.join(base, "src/view", screenDir);
                        if (fs.existsSync(viewDir)) {
                            ok.push(`✅ View directory for route '${key}'`);
                        } else {
                            issues.push(
                                `⚠️ Route '${key}' defined in routing.json but missing view directory: src/view/${screenDir}/`
                            );
                        }
                    }
                } catch {
                    issues.push("❌ routing.json is not valid JSON");
                }
            }

            // Check stage.json validity
            const stagePath = path.join(base, "src/config/stage.json");
            if (fs.existsSync(stagePath)) {
                try {
                    const stage = JSON.parse(
                        fs.readFileSync(stagePath, "utf-8")
                    );
                    if (!stage.width || !stage.height || !stage.fps) {
                        issues.push(
                            "⚠️ stage.json missing required fields: width, height, fps"
                        );
                    } else {
                        ok.push(`✅ stage.json valid (${stage.width}x${stage.height} @${stage.fps}fps)`);
                    }
                } catch {
                    issues.push("❌ stage.json is not valid JSON");
                }
            }

            const summary = issues.length === 0
                ? "🎉 Architecture validation passed! No issues found."
                : `⚠️ Found ${issues.length} issue(s).`;

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            "## Architecture Validation Report",
                            "",
                            `### Project: ${base}`,
                            "",
                            summary,
                            "",
                            issues.length > 0 ? "### Issues" : "",
                            ...issues,
                            "",
                            "### Passed Checks",
                            ...ok
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
