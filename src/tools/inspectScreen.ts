import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

function toPascal(name: string): string {
    return name
        .split(/[/\-_]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
}

function walkDir(dir: string, suffix: string, results: string[] = []): string[] {
    if (!fs.existsSync(dir)) { return results }
    for (const entry of fs.readdirSync(dir, { "withFileTypes": true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(full, suffix, results);
        } else if (entry.isFile() && entry.name.endsWith(suffix)) {
            results.push(full);
        }
    }
    return results;
}

function fileStatus(
    base: string,
    relativePath: string
): { exists: boolean; lines: number; path: string } {
    const full = path.join(base, relativePath);
    if (!fs.existsSync(full)) {
        return { "exists": false, "lines": 0, "path": relativePath };
    }
    const content = fs.readFileSync(full, "utf-8");
    const lines = content.split("\n").length;
    return { "exists": true, lines, "path": relativePath };
}

export function registerInspectScreen(server: McpServer): void {
    server.registerTool(
        "inspect_screen",
        {
            "description":
                "Inspect all implementation files for a specific Next2D screen. " +
                "Lists View, ViewModel, Page, UseCases, Repositories, Animations, and Content " +
                "related to the given screen path. Shows file existence, line counts, and " +
                "routing.json configuration. Use this before modifying an existing screen " +
                "to understand what is already implemented.",
            "inputSchema": {
                "screenPath": z.string().describe(
                    "Screen path matching routing.json key (e.g. 'quest/list', 'home', 'settings')"
                ),
                "projectPath": z.string().optional().default(".").describe(
                    "Path to the project root directory (default: current directory)"
                )
            }
        },
        async ({ screenPath, projectPath }) => {
            const base = path.resolve(projectPath);
            const pascal = toPascal(screenPath);
            const screenDir = screenPath.includes("/")
                ? screenPath.split("/")[0].toLowerCase()
                : screenPath.toLowerCase();

            const lines: string[] = [
                `## Screen Inspection: \`${screenPath}\``,
                "",
                "| Item | Value |",
                "|------|-------|",
                `| Screen path | \`${screenPath}\` |`,
                `| Class prefix | \`${pascal}\` |`,
                `| Screen directory | \`src/view/${screenDir}/\` |`,
                ""
            ];

            // --- routing.json entry ---
            lines.push("### routing.json Configuration");
            const routingPath = path.join(base, "src/config/routing.json");
            if (fs.existsSync(routingPath)) {
                try {
                    const routing: Record<string, unknown> = JSON.parse(
                        fs.readFileSync(routingPath, "utf-8")
                    );
                    if (screenPath in routing) {
                        lines.push("```json");
                        lines.push(JSON.stringify({ [screenPath]: routing[screenPath] }, null, 4));
                        lines.push("```");
                    } else {
                        lines.push(`⚠️ Route \`${screenPath}\` not found in routing.json`);
                        lines.push("→ Add route first with `add_route` tool or `npm run generate`");
                    }
                } catch {
                    lines.push("❌ routing.json parse error");
                }
            } else {
                lines.push("❌ routing.json not found");
            }
            lines.push("");

            // --- Core MVVM files ---
            lines.push("### MVVM Files");
            const coreFiles = [
                { "label": "View", "rel": `src/view/${screenDir}/${pascal}View.ts` },
                { "label": "ViewModel", "rel": `src/view/${screenDir}/${pascal}ViewModel.ts` }
            ];
            for (const f of coreFiles) {
                const s = fileStatus(base, f.rel);
                const icon = s.exists ? "✅" : "❌";
                const detail = s.exists ? `(${s.lines} lines)` : "← missing";
                lines.push(`- ${icon} **${f.label}**: \`${f.rel}\` ${detail}`);
            }
            lines.push("");

            // --- Page component ---
            lines.push("### Page Component");
            const pageStat = fileStatus(base, `src/ui/component/page/${screenDir}/${pascal}Page.ts`);
            const pageIcon = pageStat.exists ? "✅" : "❌";
            const pageDetail = pageStat.exists ? `(${pageStat.lines} lines)` : "← missing";
            lines.push(`- ${pageIcon} **Page**: \`${pageStat.path}\` ${pageDetail}`);
            lines.push("");

            // --- UseCases ---
            lines.push("### UseCases");
            const usecaseDir = path.join(base, `src/model/application/${screenDir}/usecase`);
            const usecaseFiles = walkDir(usecaseDir, ".ts");
            if (usecaseFiles.length === 0) {
                lines.push("- ❌ No UseCases found");
                lines.push(`  → Expected in: \`src/model/application/${screenDir}/usecase/\``);
            } else {
                for (const f of usecaseFiles) {
                    const rel = path.relative(base, f);
                    const content = fs.readFileSync(f, "utf-8");
                    const lc = content.split("\n").length;
                    lines.push(`- ✅ \`${rel}\` (${lc} lines)`);
                }
            }
            lines.push("");

            // --- Repositories ---
            lines.push("### Repositories");
            const repoDir = path.join(base, "src/model/infrastructure/repository");
            const allRepos = walkDir(repoDir, "Repository.ts");
            // Match repositories whose name starts with the pascal prefix
            const screenRepos = allRepos.filter((f) =>
                path.basename(f).startsWith(pascal)
            );
            if (screenRepos.length === 0) {
                lines.push("- (none matching this screen)");
            } else {
                for (const f of screenRepos) {
                    const rel = path.relative(base, f);
                    const content = fs.readFileSync(f, "utf-8");
                    const lc = content.split("\n").length;
                    lines.push(`- ✅ \`${rel}\` (${lc} lines)`);
                }
            }
            lines.push("");

            // --- Animations ---
            lines.push("### Animations");
            const animDir = path.join(base, `src/ui/animation/${screenDir}`);
            const animFiles = walkDir(animDir, "Animation.ts");
            if (animFiles.length === 0) {
                lines.push("- (none)");
            } else {
                for (const f of animFiles) {
                    const rel = path.relative(base, f);
                    lines.push(`- ✅ \`${rel}\``);
                }
            }
            lines.push("");

            // --- Content ---
            lines.push("### Animation Tool Content");
            const contentStat = fileStatus(base, `src/ui/content/${pascal}Content.ts`);
            if (contentStat.exists) {
                lines.push(`- ✅ \`${contentStat.path}\` (${contentStat.lines} lines)`);
            } else {
                lines.push("- (none)");
            }
            lines.push("");

            // --- Interfaces ---
            lines.push("### Interfaces");
            const interfaceDir = path.join(base, "src/interface");
            const allInterfaces = walkDir(interfaceDir, ".ts");
            // Match interfaces whose name contains the pascal prefix
            const screenInterfaces = allInterfaces.filter((f) => {
                const name = path.basename(f, ".ts");
                return name.includes(pascal) || name.startsWith(`I${pascal}`);
            });
            if (screenInterfaces.length === 0) {
                lines.push("- (none matching this screen)");
            } else {
                for (const f of screenInterfaces) {
                    const rel = path.relative(base, f);
                    lines.push(`- ✅ \`${rel}\``);
                }
            }
            lines.push("");

            // --- Summary ---
            const missing: string[] = [];
            if (!coreFiles[0] || !fileStatus(base, coreFiles[0].rel).exists) {
                missing.push("View");
            }
            if (!coreFiles[1] || !fileStatus(base, coreFiles[1].rel).exists) {
                missing.push("ViewModel");
            }
            if (!pageStat.exists) { missing.push("Page") }
            if (usecaseFiles.length === 0) { missing.push("UseCase") }

            lines.push("### Summary");
            if (missing.length === 0) {
                lines.push("✅ All core files are implemented.");
            } else {
                lines.push(`⚠️ Missing: ${missing.join(", ")}`);
            }
            lines.push("");
            lines.push("### Next Steps for Modification");
            lines.push("Read the files listed above with the **Read** tool to understand the current implementation.");
            lines.push("Then plan your changes:");
            lines.push("- **Add UseCase**: `create_usecase` tool");
            lines.push("- **Add Repository**: `create_repository` tool");
            lines.push("- **Add UI component**: `create_ui_component` tool");
            lines.push("- **Add Animation**: `create_animation` tool");
            lines.push("- **Modify existing file**: Read → plan changes → Edit");

            return {
                "content": [
                    {
                        "type": "text",
                        "text": lines.join("\n")
                    }
                ]
            };
        }
    );
}
