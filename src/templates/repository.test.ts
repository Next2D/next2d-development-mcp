import { describe, it, expect } from "vitest";
import { generateRepository } from "./repository.js";

describe("generateRepository", () => {
    it("generates Repository class with correct name", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("export class HomeTextRepository");
    });

    it("uses default method name 'get'", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("static async get ()");
    });

    it("uses custom method name", () => {
        const code = generateRepository("HomeText", "fetchAll");
        expect(code).toContain("static async fetchAll ()");
    });

    it("includes try-catch block", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("try {");
        expect(code).toContain("} catch (error)");
    });

    it("uses config for endpoint", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("config.api.endPoint");
    });

    it("imports config", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain('import { config } from "@/config/Config"');
    });

    it("returns typed interface instead of unknown", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("Promise<IHomeTextResponse>");
        expect(code).toContain('import type { IHomeTextResponse }');
        expect(code).not.toContain("Promise<unknown>");
    });

    it("uses .json extension in API path for mock compatibility", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("api/hometext.json");
    });

    it("casts response to typed interface", () => {
        const code = generateRepository("HomeText");
        expect(code).toContain("as IHomeTextResponse");
    });
});
