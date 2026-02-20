import { describe, it, expect } from "vitest";
import { generateInterface } from "./interfaceFile.js";

describe("generateInterface", () => {
    it("generates interface with I prefix", () => {
        const code = generateInterface("Draggable");
        expect(code).toContain("export interface IDraggable");
    });

    it("does not double-prefix if already starts with I", () => {
        const code = generateInterface("IDraggable");
        expect(code).toContain("export interface IDraggable");
        expect(code).not.toContain("IIDraggable");
    });

    it("generates properties", () => {
        const code = generateInterface("UserData", [
            { name: "id", type: "number" },
            { name: "name", type: "string" },
        ]);
        expect(code).toContain("id: number;");
        expect(code).toContain("name: string;");
    });

    it("generates TODO comment when no properties", () => {
        const code = generateInterface("Empty");
        expect(code).toContain("// TODO: Define properties");
    });

    it("handles slash-separated name", () => {
        const code = generateInterface("home/text");
        expect(code).toContain("export interface IHomeText");
    });
});
