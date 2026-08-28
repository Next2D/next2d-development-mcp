import { describe, it, expect, vi, beforeEach } from "vitest";
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

    it("registerTools registers all 13 tools", () => {
        const spy = vi.spyOn(server, "registerTool");
        registerTools(server);
        expect(spy).toHaveBeenCalledTimes(13);

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
