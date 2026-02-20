import { describe, it, expect } from "vitest";
import { toPascalCase, toCamelCase } from "./utils.js";

describe("toPascalCase", () => {
    it("converts simple name", () => {
        expect(toPascalCase("home")).toBe("Home");
    });

    it("converts slash-separated name", () => {
        expect(toPascalCase("quest/list")).toBe("QuestList");
    });

    it("converts backslash-separated name", () => {
        expect(toPascalCase("quest\\detail")).toBe("QuestDetail");
    });

    it("handles already PascalCase", () => {
        expect(toPascalCase("Home")).toBe("Home");
    });

    it("handles multi-segment path", () => {
        expect(toPascalCase("user/profile/edit")).toBe("UserProfileEdit");
    });
});

describe("toCamelCase", () => {
    it("converts simple name", () => {
        expect(toCamelCase("home")).toBe("home");
    });

    it("converts slash-separated name", () => {
        expect(toCamelCase("quest/list")).toBe("questList");
    });

    it("handles already camelCase", () => {
        expect(toCamelCase("home")).toBe("home");
    });

    it("lowercases first char of PascalCase input", () => {
        expect(toCamelCase("Home")).toBe("home");
    });
});
