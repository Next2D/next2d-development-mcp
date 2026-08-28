import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerResources, discoverResources, deriveDescription, findReferenceDirs } from "./index.js";

describe("findReferenceDirs", () => {
    it("returns only existing directories", () => {
        const dirs = findReferenceDirs(path.join(os.tmpdir(), "nonexistent-cwd"));
        for (const dir of dirs) {
            expect(fs.existsSync(dir)).toBe(true);
        }
    });
});

describe("deriveDescription", () => {
    it("joins the first H1 title and the first body line", () => {
        const content = "# Player Particles\n\nParticle system API.\n\nDetails...\n";
        expect(deriveDescription(content)).toBe("Player Particles - Particle system API.");
    });

    it("falls back to the body line when no title exists", () => {
        const content = "Just a body line.\n";
        expect(deriveDescription(content)).toBe("Just a body line.");
    });

    it("truncates long descriptions", () => {
        const content = `# T\n\n${"x".repeat(400)}\n`;
        const result = deriveDescription(content, 100);
        expect(result.length).toBeLessThanOrEqual(100);
        expect(result.endsWith("…")).toBe(true);
    });

    it("returns an empty string for empty content", () => {
        expect(deriveDescription("")).toBe("");
    });
});

describe("discoverResources", () => {
    it("discovers markdown files as next2d://specs resources", () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "n2d-refs-"));
        try {
            fs.writeFileSync(path.join(dir, "alpha.md"), "# Alpha\nAlpha content.\n");
            fs.writeFileSync(path.join(dir, "beta.md"), "# Beta\nBeta content.\n");
            fs.writeFileSync(path.join(dir, "ignore.txt"), "not markdown\n");

            const resources = discoverResources([dir]);

            expect(resources.map((r) => r.name)).toEqual(["alpha", "beta"]);
            expect(resources[0].uri).toBe("next2d://specs/alpha");
            expect(resources[0].description).toBe("Alpha - Alpha content.");
            expect(fs.existsSync(resources[0].filePath)).toBe(true);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("deduplicates by file name, earlier directories win", () => {
        const dirA = fs.mkdtempSync(path.join(os.tmpdir(), "n2d-refs-a-"));
        const dirB = fs.mkdtempSync(path.join(os.tmpdir(), "n2d-refs-b-"));
        try {
            fs.writeFileSync(path.join(dirA, "alpha.md"), "# Alpha A\nFrom A.\n");
            fs.writeFileSync(path.join(dirB, "alpha.md"), "# Alpha B\nFrom B.\n");

            const resources = discoverResources([dirA, dirB]);

            expect(resources).toHaveLength(1);
            expect(resources[0].description).toBe("Alpha A - From A.");
        } finally {
            fs.rmSync(dirA, { recursive: true, force: true });
            fs.rmSync(dirB, { recursive: true, force: true });
        }
    });
});

describe("Resource registration", () => {
    let server: McpServer;

    beforeEach(() => {
        server = new McpServer({ name: "test", version: "0.0.1" });
    });

    it("registers one resource per discovered reference plus index and architecture", () => {
        const spy = vi.spyOn(server, "registerResource");
        registerResources(server);

        const names = spy.mock.calls.map((call) => call[0]);
        const discovered = discoverResources();
        expect(names).toHaveLength(discovered.length + 2);
        expect(names).toContain("architecture-overview");
        expect(names).toContain("specs-index");
        for (const res of discovered) {
            expect(names).toContain(res.name);
        }
    });

    it("uses next2d:// URI scheme for every resource", () => {
        const spy = vi.spyOn(server, "registerResource");
        registerResources(server);
        const uris = spy.mock.calls.map((call) => call[1]);
        expect(uris.length).toBeGreaterThan(0);
        for (const uri of uris) {
            expect(String(uri)).toMatch(/^next2d:\/\//);
        }
    });

    it("serves reference file content through the resource handler", async () => {
        const spy = vi.spyOn(server, "registerResource");
        registerResources(server);

        const discovered = discoverResources();
        const target = discovered.find((res) => res.name === "player-overview") ?? discovered[0];
        if (!target) {
            expect(discovered).toHaveLength(0);
            return;
        }
        const call = spy.mock.calls.find((c) => c[0] === target.name);
        expect(call).toBeDefined();
        const handler = call![3] as unknown as (uri: URL, extra: unknown) => Promise<{ contents: Array<{ text?: string }> }>;
        const result = await handler(new URL(target.uri), {});
        const text = result.contents[0].text as string;
        expect(text).toContain("#");
    });
});
