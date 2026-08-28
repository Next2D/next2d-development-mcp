import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import { viewDirCandidates } from "../utils.js";

function checkDir(base: string, dir: string): { exists: boolean; path: string } {
    const full = path.join(base, dir);
    return { "exists": fs.existsSync(full), "path": full };
}

function checkFile(base: string, file: string): { exists: boolean; path: string } {
    const full = path.join(base, file);
    return { "exists": fs.existsSync(full), "path": full };
}

const STAGE_ALLOWED_TOP_KEYS = ["width", "height", "fps", "options"];
// "base" is declared in the framework IOptions interface (build-time asset path)
const STAGE_ALLOWED_OPTION_KEYS = ["fullScreen", "tagId", "bgColor", "base"];
const FLASH_KEY_HINTS: Record<string, string> = {
    "scaleMode": "Next2D is not a Flash Player derivative. To fill the window, use options.fullScreen: true",
    "align": "Next2D is not a Flash Player derivative. To fill the window, use options.fullScreen: true",
    "quality": "Not supported. Adjust fps or use cacheAsBitmap for performance",
    "wmode": "Not supported. No equivalent setting in Next2D",
    "allowFullScreen": "Wrong name. Use options.fullScreen instead",
    "backgroundColor": "Wrong location. Use options.bgColor instead"
};

export interface StageJsonReport {
    issues: string[];
    ok: string[];
}

/**
 * Validate stage.json content against the strict whitelist of supported keys.
 * Next2D Player is not a Flash Player derivative: unknown keys are silently
 * ignored by the framework, so they must be flagged as configuration mistakes.
 */
export function validateStageJson(content: string): StageJsonReport {
    const issues: string[] = [];
    const ok: string[] = [];

    let stage: unknown;
    try {
        stage = JSON.parse(content);
    } catch {
        issues.push("❌ stage.json is not valid JSON");
        return { issues, ok };
    }
    if (typeof stage !== "object" || stage === null || Array.isArray(stage)) {
        issues.push("❌ stage.json must be a JSON object");
        return { issues, ok };
    }

    const obj = stage as Record<string, unknown>;

    const flagUnknownKey = (key: string, allowed: string[]): void => {
        if (allowed.includes(key)) { return }
        const hint = FLASH_KEY_HINTS[key];
        issues.push(
            `❌ Invalid stage.json key: '${key}' (silently ignored by the framework). ` +
            (hint ?? "Only whitelisted keys are valid. Remove it or implement the behavior in code.")
        );
    };

    for (const key of Object.keys(obj)) {
        flagUnknownKey(key, STAGE_ALLOWED_TOP_KEYS);
    }

    const width = obj.width;
    const height = obj.height;
    const fps = obj.fps;

    if (width === undefined || height === undefined || fps === undefined) {
        issues.push("⚠️ stage.json missing required fields: width, height, fps");
    }
    if (width !== undefined && (typeof width !== "number" || width <= 0)) {
        issues.push("⚠️ stage.json: width must be a positive number");
    }
    if (height !== undefined && (typeof height !== "number" || height <= 0)) {
        issues.push("⚠️ stage.json: height must be a positive number");
    }
    if (fps !== undefined && (typeof fps !== "number" || fps < 1 || fps > 60)) {
        issues.push("⚠️ stage.json: fps must be a number between 1 and 60");
    }

    if (obj.options !== undefined) {
        if (typeof obj.options !== "object" || obj.options === null || Array.isArray(obj.options)) {
            issues.push("⚠️ stage.json: options must be an object");
        } else {
            for (const key of Object.keys(obj.options as Record<string, unknown>)) {
                flagUnknownKey(key, STAGE_ALLOWED_OPTION_KEYS);
            }
        }
    }

    if (issues.length === 0) {
        ok.push(`✅ stage.json valid (${width}x${height} @${fps}fps)`);
    }

    return { issues, ok };
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
                        // View directory may use the first segment or the full nested path
                        const candidateDirs = viewDirCandidates(key);
                        const viewDir = candidateDirs
                            .map((dir) => path.join(base, "src/view", dir))
                            .find((dir) => fs.existsSync(dir));
                        if (viewDir) {
                            ok.push(`✅ View directory for route '${key}'`);
                        } else {
                            const dirs = candidateDirs.map((dir) => `src/view/${dir}/`).join(" or ");
                            issues.push(
                                `⚠️ Route '${key}' defined in routing.json but missing view directory: ${dirs}`
                            );
                        }
                    }
                } catch {
                    issues.push("❌ routing.json is not valid JSON");
                }
            }

            // Check stage.json validity (strict key whitelist: Next2D is not a Flash Player derivative)
            const stagePath = path.join(base, "src/config/stage.json");
            if (fs.existsSync(stagePath)) {
                const report = validateStageJson(fs.readFileSync(stagePath, "utf-8"));
                for (const issue of report.issues) {
                    issues.push(issue);
                }
                for (const pass of report.ok) {
                    ok.push(pass);
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
