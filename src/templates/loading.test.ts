import { describe, it, expect } from "vitest";
import { generateLoading } from "./loading.js";

describe("generateLoading", () => {
    it("generates Loading class with start and end methods", () => {
        const code = generateLoading();
        expect(code).toContain("export class Loading");
        expect(code).toContain("start (): void");
        expect(code).toContain("end (): void");
    });

    it("uses stage.addChild in start()", () => {
        const code = generateLoading();
        expect(code).toContain("stage.addChild(this._shape)");
    });

    it("uses shape.remove in end()", () => {
        const code = generateLoading();
        expect(code).toContain("this._shape.remove()");
    });

    it("imports Shape and stage from @next2d/display", () => {
        const code = generateLoading();
        expect(code).toContain('import { Shape, stage } from "@next2d/display"');
    });

    it("accepts custom class name", () => {
        const code = generateLoading("CustomLoader");
        expect(code).toContain("export class CustomLoader");
    });

    it("has constructor that initializes shape", () => {
        const code = generateLoading();
        expect(code).toContain("this._shape = new Shape()");
    });
});
