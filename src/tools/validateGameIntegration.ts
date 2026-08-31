import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

export interface GameIntegrationReport {
    issues: string[];
    ok: string[];
}

function walkTypeFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) { return []; }
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { files.push(...walkTypeFiles(full)); }
        if (entry.isFile() && entry.name === "types.ts") { files.push(full); }
    }
    return files;
}

/** Validate game-stage dimensions and ENTER_FRAME listener ownership. */
export function validateGameIntegration(base: string): GameIntegrationReport {
    const issues: string[] = [];
    const ok: string[] = [];
    const stagePath = path.join(base, "src/config/stage.json");
    let stage: Record<string, unknown> | null = null;
    try {
        stage = JSON.parse(fs.readFileSync(stagePath, "utf-8")) as Record<string, unknown>;
    } catch {
        issues.push("❌ Cannot read src/config/stage.json");
    }

    for (const typePath of walkTypeFiles(path.join(base, "src/model/domain"))) {
        const content = fs.readFileSync(typePath, "utf-8");
        const width = content.match(/PLAYFIELD_WIDTH\s*=\s*(\d+)/)?.[1];
        const height = content.match(/PLAYFIELD_HEIGHT\s*=\s*(\d+)/)?.[1];
        if (!width || !height || !stage) { continue; }
        if (stage.width !== Number(width) || stage.height !== Number(height)) {
            issues.push(`❌ stage.json (${String(stage.width)}x${String(stage.height)}) does not match ${path.relative(base, typePath)} (${width}x${height})`);
        } else {
            ok.push(`✅ stage.json matches ${path.relative(base, typePath)} (${width}x${height})`);
        }
    }

    const viewRoot = path.join(base, "src/view");
    const visit = (dir: string): void => {
        if (!fs.existsSync(dir)) { return; }
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) { visit(full); continue; }
            if (!entry.name.endsWith("View.ts")) { continue; }
            const content = fs.readFileSync(full, "utf-8");
            if (!content.includes("Event.ENTER_FRAME")) { continue; }
            const rel = path.relative(base, full);
            const usesGlobalStage = /import\s*{[^}]*\bstage\b[^}]*}\s*from\s*["']@next2d\/display/.test(content);
            const registers = content.includes("stage.addEventListener(Event.ENTER_FRAME");
            const removes = content.includes("stage.removeEventListener(Event.ENTER_FRAME");
            if (!usesGlobalStage || !registers || !removes) {
                issues.push(`❌ ${rel}: ENTER_FRAME must be registered and removed on global stage`);
            } else {
                ok.push(`✅ ${rel}: global stage ENTER_FRAME lifecycle is symmetric`);
            }
        }
    };
    visit(viewRoot);
    if (issues.length === 0 && ok.length === 0) {
        ok.push("✅ No game-specific integration markers found");
    }
    return { issues, ok };
}

export function registerValidateGameIntegration(server: McpServer): void {
    server.registerTool("validate_game_integration", {
        description: "Validate Next2D game integration: stage dimensions against domain playfield constants and global stage ENTER_FRAME lifecycle.",
        inputSchema: { projectPath: z.string().optional().default(".") }
    }, async ({ projectPath }) => {
        const report = validateGameIntegration(path.resolve(projectPath));
        return { content: [{ type: "text", text: [...report.issues, ...report.ok].join("\n") }] };
    });
}
