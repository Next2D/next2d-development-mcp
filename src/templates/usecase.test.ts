import { describe, it, expect } from "vitest";
import { generateUseCase } from "./usecase.js";

describe("generateUseCase", () => {
    it("generates UseCase class with correct name", () => {
        const code = generateUseCase("StartDrag", "home");
        expect(code).toContain("export class StartDragUseCase");
    });

    it("includes execute method", () => {
        const code = generateUseCase("StartDrag", "home");
        expect(code).toContain("execute (): void");
    });

    it("includes constructor", () => {
        const code = generateUseCase("StartDrag", "home");
        expect(code).toContain("constructor ()");
    });

    it("handles name already ending with UseCase", () => {
        const code = generateUseCase("StartDragUseCase", "home");
        expect(code).toContain("export class StartDragUseCase");
        // Should NOT produce "StartDragUseCaseUseCase"
        expect(code).not.toContain("UseCaseUseCase");
    });
});
