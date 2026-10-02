import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateView } from "./createView.js";
import { registerCreateUseCase } from "./createUseCase.js";
import { registerCreateRepository } from "./createRepository.js";
import { registerCreateUiComponent } from "./createUiComponent.js";
import { registerAddRoute } from "./addRoute.js";
import { registerCreateInterface } from "./createInterface.js";
import { registerCreateAnimation } from "./createAnimation.js";
import { registerCreateDomainService } from "./createDomainService.js";
import { registerAnalyzeProject } from "./analyzeProject.js";
import { registerPlanFeature } from "./planFeature.js";
import { registerInspectScreen } from "./inspectScreen.js";
import { registerTools } from "./index.js";
import { validateStageJson } from "./validateArchitecture.js";
import { validateGameIntegration } from "./validateGameIntegration.js";

describe("Tool registration", () => {
    let server: McpServer;

    beforeEach(() => {
        server = new McpServer({ name: "test", version: "0.0.1" });
    });

    it("registerCreateView registers without error", () => {
        expect(() => registerCreateView(server)).not.toThrow();
    });

    it("registerCreateUseCase registers without error", () => {
        expect(() => registerCreateUseCase(server)).not.toThrow();
    });

    it("registerCreateRepository registers without error", () => {
        expect(() => registerCreateRepository(server)).not.toThrow();
    });

    it("registerCreateUiComponent registers without error", () => {
        expect(() => registerCreateUiComponent(server)).not.toThrow();
    });

    it("registerAddRoute registers without error", () => {
        expect(() => registerAddRoute(server)).not.toThrow();
    });

    it("registerCreateInterface registers without error", () => {
        expect(() => registerCreateInterface(server)).not.toThrow();
    });

    it("registerCreateAnimation registers without error", () => {
        expect(() => registerCreateAnimation(server)).not.toThrow();
    });

    it("registerCreateDomainService registers without error", () => {
        expect(() => registerCreateDomainService(server)).not.toThrow();
    });

    it("registerAnalyzeProject registers without error", () => {
        expect(() => registerAnalyzeProject(server)).not.toThrow();
    });

    it("registerPlanFeature registers without error", () => {
        expect(() => registerPlanFeature(server)).not.toThrow();
    });

    it("registerInspectScreen registers without error", () => {
        expect(() => registerInspectScreen(server)).not.toThrow();
    });

    it("registerTools registers all 14 tools", () => {
        const spy = vi.spyOn(server, "registerTool");
        registerTools(server);
        expect(spy).toHaveBeenCalledTimes(14);

        const toolNames = spy.mock.calls.map((call) => call[0]);
        expect(toolNames).toContain("create_view");
        expect(toolNames).toContain("validate_architecture");
        expect(toolNames).toContain("create_usecase");
        expect(toolNames).toContain("create_repository");
        expect(toolNames).toContain("create_ui_component");
        expect(toolNames).toContain("add_route");
        expect(toolNames).toContain("create_interface");
        expect(toolNames).toContain("create_animation");
        expect(toolNames).toContain("create_domain_service");
        expect(toolNames).toContain("create_loading");
        expect(toolNames).toContain("analyze_project");
        expect(toolNames).toContain("plan_feature");
        expect(toolNames).toContain("inspect_screen");
        expect(toolNames).toContain("validate_game_integration");
    });
});

describe("validateGameIntegration", () => {
    function createGameProject(stage?: { width: number; height: number }): string {
        const base = mkdtempSync(path.join(tmpdir(), "next2d-game-"));
        mkdirSync(path.join(base, "src/config"), { "recursive": true });
        mkdirSync(path.join(base, "src/model/domain/tetris"), { "recursive": true });
        mkdirSync(path.join(base, "src/ui/component/atom"), { "recursive": true });
        if (stage) {
            writeFileSync(path.join(base, "src/config/stage.json"), JSON.stringify({ ...stage, "fps": 60 }));
        }
        writeFileSync(path.join(base, "src/model/domain/tetris/types.ts"), "export const BOARD_COLUMNS = 10;\nexport const BOARD_ROWS = 20;\n");
        writeFileSync(path.join(base, "src/ui/component/atom/Board.ts"), "export const CELL_SIZE = 24;\nexport const BOARD_PIXEL_WIDTH = BOARD_COLUMNS * CELL_SIZE;\nexport const BOARD_PIXEL_HEIGHT = BOARD_ROWS * CELL_SIZE;\n");
        return base;
    }

    it("accepts a board that fits inside a larger stage", () => {
        const base = createGameProject({ "width": 600, "height": 540 });
        try {
            expect(validateGameIntegration(base).issues).toEqual([]);
            expect(validateGameIntegration(base).ok).toContain("✅ game board (240x480) fits stage.json (600x540)");
        } finally {
            rmSync(base, { "recursive": true, "force": true });
        }
    });

    it("reports a board that exceeds the stage", () => {
        const base = createGameProject({ "width": 200, "height": 400 });
        try {
            expect(validateGameIntegration(base).issues).toContain("❌ game board (240x480) exceeds stage.json (200x400)");
        } finally {
            rmSync(base, { "recursive": true, "force": true });
        }
    });

    it("reports a missing stage file", () => {
        const base = createGameProject();
        try {
            expect(validateGameIntegration(base).issues).toContain("❌ Cannot read src/config/stage.json");
        } finally {
            rmSync(base, { "recursive": true, "force": true });
        }
    });
});

describe("validateStageJson", () => {
    it("accepts a valid stage.json", () => {
        const report = validateStageJson(
            JSON.stringify({ width: 240, height: 240, fps: 60, options: { fullScreen: true, tagId: null, bgColor: "transparent" } })
        );
        expect(report.issues).toEqual([]);
        expect(report.ok).toContain("✅ stage.json valid (240x240 @60fps)");
    });

    it("flags Flash-era top-level keys as invalid", () => {
        const report = validateStageJson(
            JSON.stringify({ width: 240, height: 240, fps: 60, scaleMode: "noScale", align: "TL" })
        );
        expect(report.issues).toHaveLength(2);
        expect(report.issues[0]).toContain("'scaleMode'");
        expect(report.issues[0]).toContain("fullScreen");
        expect(report.issues[1]).toContain("'align'");
    });

    it("flags unknown options keys", () => {
        const report = validateStageJson(
            JSON.stringify({ width: 240, height: 240, fps: 60, options: { fullScreen: true, quality: "high" } })
        );
        expect(report.issues).toHaveLength(1);
        expect(report.issues[0]).toContain("'quality'");
    });

    it("flags misplaced backgroundColor at top level", () => {
        const report = validateStageJson(
            JSON.stringify({ width: 240, height: 240, fps: 60, backgroundColor: "#000000" })
        );
        expect(report.issues).toHaveLength(1);
        expect(report.issues[0]).toContain("options.bgColor");
    });

    it("rejects invalid fps range and non-positive width", () => {
        const report = validateStageJson(
            JSON.stringify({ width: 0, height: 240, fps: 120 })
        );
        expect(report.issues.some((i) => i.includes("fps"))).toBe(true);
        expect(report.issues.some((i) => i.includes("width"))).toBe(true);
    });

    it("reports missing required fields", () => {
        const report = validateStageJson(JSON.stringify({ width: 240 }));
        expect(report.issues.some((i) => i.includes("missing required fields"))).toBe(true);
    });

    it("rejects invalid JSON", () => {
        const report = validateStageJson("{ not json");
        expect(report.issues).toContain("❌ stage.json is not valid JSON");
    });

    it("rejects non-object root", () => {
        const report = validateStageJson("[1, 2, 3]");
        expect(report.issues).toContain("❌ stage.json must be a JSON object");
    });
});
