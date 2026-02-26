import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./index.js";

describe("Prompt registration", () => {
    let server: McpServer;

    beforeEach(() => {
        server = new McpServer({ name: "test", version: "0.0.1" });
    });

    it("registers 4 prompts without error", () => {
        const spy = vi.spyOn(server, "registerPrompt");
        registerPrompts(server);
        expect(spy).toHaveBeenCalledTimes(4);
    });

    it("registers expected prompt names", () => {
        const spy = vi.spyOn(server, "registerPrompt");
        registerPrompts(server);
        const names = spy.mock.calls.map((call) => call[0]);
        expect(names).toContain("new-screen");
        expect(names).toContain("architecture-guide");
        expect(names).toContain("debug-help");
        expect(names).toContain("orchestrate");
    });
});
