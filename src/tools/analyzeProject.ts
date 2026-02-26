import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

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

export function registerAnalyzeProject(server: McpServer): void {
    server.registerTool(
        "analyze_project",
        {
            "description":
                "Analyze the current Next2D project state. " +
                "Reads routing.json, scans View/ViewModel/UseCase/Repository files, " +
                "and reports what is implemented vs. missing. " +
                "Use this before planning new features to understand the current state.",
            "inputSchema": {
                "projectPath": z.string().optional().default(".").describe(
                    "Path to the project root directory (default: current directory)"
                )
            }
        },
        async ({ projectPath }) => {
            const base = path.resolve(projectPath);
            const lines: string[] = [
                "## Next2D Project Analysis",
                "",
                `**Project root:** \`${base}\``,
                ""
            ];

            // --- routing.json ---
            const routingPath = path.join(base, "src/config/routing.json");
            const routes: string[] = [];
            const missingViews: string[] = [];

            if (fs.existsSync(routingPath)) {
                try {
                    const routing: Record<string, unknown> = JSON.parse(
                        fs.readFileSync(routingPath, "utf-8")
                    );
                    const clusters = Object.keys(routing).filter((k) => k.startsWith("@"));
                    const screenRoutes = Object.keys(routing).filter((k) => !k.startsWith("@"));

                    lines.push(`### Screens (${screenRoutes.length} routes, ${clusters.length} clusters)`);

                    for (const route of screenRoutes) {
                        routes.push(route);
                        const screenDir = route.includes("/")
                            ? route.split("/")[0].toLowerCase()
                            : route.toLowerCase();
                        const pascal = route
                            .split("/")
                            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                            .join("");

                        const viewFile = path.join(base, `src/view/${screenDir}/${pascal}View.ts`);
                        const vmFile = path.join(base, `src/view/${screenDir}/${pascal}ViewModel.ts`);
                        const hasView = fs.existsSync(viewFile);
                        const hasVM = fs.existsSync(vmFile);

                        const entry = routing[route] as Record<string, unknown>;
                        const reqs = Array.isArray(entry.requests)
                            ? (entry.requests as Array<Record<string, unknown>>)
                            : [];
                        const hasApi = reqs.some((r) => r.type === "json" || r.type === "custom");
                        const hasContent = reqs.some((r) => r.type === "content");
                        const isPrivate = entry.private === true;

                        const tags = [
                            hasApi ? "[API]" : "",
                            hasContent ? "[Content]" : "",
                            isPrivate ? "[private]" : ""
                        ].filter(Boolean).join(" ");

                        const missing: string[] = [];
                        if (!hasView) { missing.push("View") }
                        if (!hasVM) { missing.push("ViewModel") }

                        const icon = missing.length === 0 ? "✅" : "⚠️";
                        const missingNote = missing.length > 0 ? ` ← missing: ${missing.join(", ")}` : "";
                        lines.push(`- ${icon} \`${route}\` → ${pascal} ${tags}${missingNote}`);

                        if (missing.length > 0) {
                            missingViews.push(route);
                        }
                    }
                    lines.push("");
                } catch {
                    lines.push("❌ routing.json is not valid JSON", "");
                }
            } else {
                lines.push("❌ `src/config/routing.json` not found", "");
            }

            // --- UseCases ---
            const usecaseBase = path.join(base, "src/model/application");
            const usecaseFiles = walkDir(usecaseBase, "UseCase.ts");
            lines.push(`### UseCases (${usecaseFiles.length})`);
            if (usecaseFiles.length === 0) {
                lines.push("- (none)");
            } else {
                for (const f of usecaseFiles) {
                    lines.push(`- \`${path.relative(base, f)}\``);
                }
            }
            lines.push("");

            // --- Repositories ---
            const repoBase = path.join(base, "src/model/infrastructure/repository");
            const repoFiles = walkDir(repoBase, "Repository.ts");
            lines.push(`### Repositories (${repoFiles.length})`);
            if (repoFiles.length === 0) {
                lines.push("- (none)");
            } else {
                for (const f of repoFiles) {
                    lines.push(`- \`${path.relative(base, f)}\``);
                }
            }
            lines.push("");

            // --- UI Components ---
            const atomFiles = walkDir(path.join(base, "src/ui/component/atom"), ".ts");
            const moleculeFiles = walkDir(path.join(base, "src/ui/component/molecule"), ".ts");
            const pageFiles = walkDir(path.join(base, "src/ui/component/page"), ".ts");
            const contentFiles = walkDir(path.join(base, "src/ui/content"), ".ts");

            lines.push("### UI Components");
            lines.push(`- Atoms: ${atomFiles.length}`);
            lines.push(`- Molecules: ${moleculeFiles.length}`);
            lines.push(`- Pages: ${pageFiles.length}`);
            lines.push(`- Contents: ${contentFiles.length}`);
            lines.push("");

            // --- Summary & next actions ---
            lines.push("### Summary");
            if (missingViews.length === 0 && routes.length > 0) {
                lines.push("✅ All routes have corresponding View/ViewModel implementations.");
            } else if (missingViews.length > 0) {
                lines.push(`⚠️ ${missingViews.length} route(s) missing View/ViewModel:`);
                for (const r of missingViews) {
                    lines.push(`  - \`${r}\` → run \`npm run generate\` or use \`create_view\` tool`);
                }
            }
            lines.push("");
            lines.push("### Suggested Next Steps");
            lines.push("- Use `plan_feature` tool to generate an ordered implementation plan for a new screen");
            lines.push("- Use `validate_architecture` tool for a full structural check");
            if (missingViews.length > 0) {
                lines.push("- Run `npm run generate` to auto-create missing View/ViewModel pairs");
            }

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
