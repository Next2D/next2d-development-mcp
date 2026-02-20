import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerResources } from "./index.js";

describe("Resource registration", () => {
    let server: McpServer;

    beforeEach(() => {
        server = new McpServer({ name: "test", version: "0.0.1" });
    });

    it("registers 4 resources without error", () => {
        const spy = vi.spyOn(server, "registerResource");
        registerResources(server);
        expect(spy).toHaveBeenCalledTimes(4);
    });

    it("registers expected resource names", () => {
        const spy = vi.spyOn(server, "registerResource");
        registerResources(server);
        const names = spy.mock.calls.map((call) => call[0]);
        expect(names).toContain("player-specs");
        expect(names).toContain("framework-specs");
        expect(names).toContain("develop-specs");
        expect(names).toContain("architecture-overview");
    });

    it("uses next2d:// URI scheme", () => {
        const spy = vi.spyOn(server, "registerResource");
        registerResources(server);
        const uris = spy.mock.calls.map((call) => call[1]);
        for (const uri of uris) {
            expect(String(uri)).toMatch(/^next2d:\/\//);
        }
    });
});
