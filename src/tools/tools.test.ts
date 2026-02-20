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
import { registerTools } from "./index.js";

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

    it("registerTools registers all 10 tools", () => {
        const spy = vi.spyOn(server, "registerTool");
        registerTools(server);
        expect(spy).toHaveBeenCalledTimes(10);

        const toolNames = spy.mock.calls.map((call) => call[0]);
        expect(toolNames).toContain("create_view");
        expect(toolNames).toContain("create_usecase");
        expect(toolNames).toContain("create_repository");
        expect(toolNames).toContain("create_ui_component");
        expect(toolNames).toContain("add_route");
        expect(toolNames).toContain("create_interface");
        expect(toolNames).toContain("validate_architecture");
        expect(toolNames).toContain("create_animation");
        expect(toolNames).toContain("create_domain_service");
        expect(toolNames).toContain("create_loading");
    });
});
