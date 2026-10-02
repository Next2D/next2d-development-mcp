import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

export interface GameIntegrationReport {
    issues: string[];
    ok: string[];
}

function walkTsFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) { return [] }
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { "withFileTypes": true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { files.push(...walkTsFiles(full)) }
        if (entry.isFile() && entry.name.endsWith(".ts")) { files.push(full) }
    }
    return files;
}

function collectNumericConstants(root: string): Map<string, number> {
    const expressions = new Map<string, string>();
    const pattern = /export\s+const\s+([A-Z][A-Z0-9_]*)\s*=\s*([^;\n]+);/g;
    for (const file of walkTsFiles(root)) {
        const content = fs.readFileSync(file, "utf-8");
        for (const match of content.matchAll(pattern)) {
            expressions.set(match[1], match[2].trim());
        }
    }

    const values = new Map<string, number>();
    for (let iteration = 0; iteration <= expressions.size; iteration++) {
        let changed = false;
        for (const [name, expression] of expressions) {
            if (values.has(name)) { continue }
            const factors = expression.split("*");
            let value = 1;
            let resolved = true;
            for (const factor of factors) {
                const token = factor.replace(/[()]/g, "").trim();
                const factorValue = /^\d+$/.test(token) ? Number(token) : values.get(token);
                if (factorValue === undefined) {
                    resolved = false;
                    break;
                }
                value *= factorValue;
            }
            if (resolved && Number.isFinite(value)) {
                values.set(name, value);
                changed = true;
            }
        }
        if (!changed) { break }
    }
    return values;
}

function getBoardPixels(constants: Map<string, number>): { width: number; height: number } | null {
    const pairs = [
        ["BOARD_PIXEL_WIDTH", "BOARD_PIXEL_HEIGHT"],
        ["PLAYFIELD_PIXEL_WIDTH", "PLAYFIELD_PIXEL_HEIGHT"]
    ] as const;
    for (const [widthName, heightName] of pairs) {
        const width = constants.get(widthName);
        const height = constants.get(heightName);
        if (width !== undefined && height !== undefined) { return { width, height } }
    }
    const columns = constants.get("BOARD_COLUMNS");
    const rows = constants.get("BOARD_ROWS");
    const cellSize = constants.get("CELL_SIZE");
    return columns !== undefined && rows !== undefined && cellSize !== undefined
        ? { "width": columns * cellSize, "height": rows * cellSize }
        : null;
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

    const board = getBoardPixels(collectNumericConstants(path.join(base, "src")));
    if (board && stage && typeof stage.width === "number" && typeof stage.height === "number") {
        const stageSize = `${stage.width}x${stage.height}`;
        const boardSize = `${board.width}x${board.height}`;
        if (board.width > stage.width || board.height > stage.height) {
            issues.push(`❌ game board (${boardSize}) exceeds stage.json (${stageSize})`);
        } else {
            ok.push(`✅ game board (${boardSize}) fits stage.json (${stageSize})`);
        }
    }

    const viewRoot = path.join(base, "src/view");
    const visit = (dir: string): void => {
        if (!fs.existsSync(dir)) { return }
        for (const entry of fs.readdirSync(dir, { "withFileTypes": true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) { visit(full); continue }
            if (!entry.name.endsWith("View.ts")) { continue }
            const content = fs.readFileSync(full, "utf-8");
            if (!content.includes("Event.ENTER_FRAME")) { continue }
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
        "description": "Validate Next2D game integration: game board fits within stage dimensions and global stage ENTER_FRAME lifecycle.",
        "inputSchema": { "projectPath": z.string().optional().default(".") }
    }, async ({ projectPath }) => {
        const report = validateGameIntegration(path.resolve(projectPath));
        return { "content": [{ "type": "text", "text": [...report.issues, ...report.ok].join("\n") }] };
    });
}
