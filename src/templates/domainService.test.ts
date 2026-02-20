import { describe, it, expect } from "vitest";
import { generateDomainService, generateDomainCallback } from "./domainService.js";

describe("generateDomainService", () => {
    it("generates functional-style service with execute export", () => {
        const code = generateDomainService("Background", "Draw");
        expect(code).toContain("export const execute =");
    });

    it("uses correct parameter types", () => {
        const code = generateDomainService("Background", "Draw");
        expect(code).toContain("(param: unknown): void");
    });
});

describe("generateDomainCallback", () => {
    it("generates callback class with execute method", () => {
        const code = generateDomainCallback("Background");
        expect(code).toContain("export class Background");
        expect(code).toContain("execute (): void");
    });

    it("imports app from framework", () => {
        const code = generateDomainCallback("Background");
        expect(code).toContain('import { app } from "@next2d/framework"');
    });

    it("imports display objects for stage manipulation", () => {
        const code = generateDomainCallback("Background");
        expect(code).toContain('import { Shape, stage } from "@next2d/display"');
    });

    it("accesses context.view", () => {
        const code = generateDomainCallback("Background");
        expect(code).toContain("app.getContext()");
        expect(code).toContain("context.view");
    });
});
