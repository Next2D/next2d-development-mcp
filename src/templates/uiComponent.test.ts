import { describe, it, expect } from "vitest";
import { generateUiComponent, generateContent } from "./uiComponent.js";

describe("generateUiComponent", () => {
    it("generates Atom component", () => {
        const code = generateUiComponent("Button", "atom");
        expect(code).toContain("export class ButtonAtom extends Sprite");
    });

    it("generates Molecule component", () => {
        const code = generateUiComponent("SearchBar", "molecule");
        expect(code).toContain("export class SearchBarMolecule extends Sprite");
    });

    it("generates Organism component", () => {
        const code = generateUiComponent("Header", "organism");
        expect(code).toContain("export class HeaderOrganism extends Sprite");
    });

    it("generates Page component with typed ViewModel", () => {
        const code = generateUiComponent("Home", "page");
        expect(code).toContain("export class HomePage extends Sprite");
        expect(code).toContain("import type { HomeViewModel }");
        expect(code).toContain("initialize (vm: HomeViewModel): void");
        expect(code).toContain('import { config } from "@/config/Config"');
    });

    it("page component has no any type", () => {
        const code = generateUiComponent("Home", "page");
        expect(code).not.toContain("any");
    });

    it("page component has onEnter method", () => {
        const code = generateUiComponent("Home", "page");
        expect(code).toContain("async onEnter ()");
    });

    it("page component has event binding hint with arrow function", () => {
        const code = generateUiComponent("Home", "page");
        expect(code).toContain("PointerEvent.POINTER_UP");
    });

    it("uses MovieClip as parent class", () => {
        const code = generateUiComponent("AnimButton", "atom", "MovieClip");
        expect(code).toContain("export class AnimButtonAtom extends MovieClip");
        expect(code).toContain('import { MovieClip } from "@next2d/display"');
    });

    it("uses TextField from @next2d/text (not @next2d/display)", () => {
        const code = generateUiComponent("Label", "atom", "TextField");
        expect(code).toContain("export class LabelAtom extends TextField");
        expect(code).toContain('import { TextField } from "@next2d/text"');
        expect(code).not.toContain("@next2d/display");
    });

    it("adds TODO for unknown parent classes", () => {
        const code = generateUiComponent("Custom", "atom", "ButtonAtom");
        expect(code).toContain("TODO: Adjust import path for ButtonAtom");
    });

    it("atom/molecule/organism have no initialize with any type", () => {
        const code = generateUiComponent("Button", "atom");
        expect(code).not.toContain("any");
    });

    it("imports Sprite by default", () => {
        const code = generateUiComponent("Button", "atom");
        expect(code).toContain('import { Sprite } from "@next2d/display"');
    });
});

describe("generateContent", () => {
    it("generates Content class", () => {
        const code = generateContent("HomeAnim");
        expect(code).toContain("export class HomeAnimContent extends MovieClipContent");
    });

    it("uses getter for namespace (not constructor assignment)", () => {
        const code = generateContent("HomeAnim");
        expect(code).toContain('get namespace (): string');
        expect(code).toContain('return "HomeAnimContent"');
        // Must NOT use constructor assignment
        expect(code).not.toContain("this.namespace =");
    });

    it("imports MovieClipContent from framework", () => {
        const code = generateContent("HomeAnim");
        expect(code).toContain('import { MovieClipContent } from "@next2d/framework"');
    });
});
