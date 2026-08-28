import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { toPascalCase, toCamelCase, viewDirCandidates, viewDirForRoute } from "./utils.js";

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

    it("converts hyphen-separated segments (view-generator convention)", () => {
        expect(toPascalCase("play/time-attack")).toBe("PlayTimeAttack");
        expect(toPascalCase("play/time-attack-select")).toBe("PlayTimeAttackSelect");
    });

    it("converts underscore-separated segments", () => {
        expect(toPascalCase("user_profile")).toBe("UserProfile");
    });

    it("ignores empty segments from consecutive separators", () => {
        expect(toPascalCase("play/-time-attack")).toBe("PlayTimeAttack");
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

    it("converts hyphen-separated name", () => {
        expect(toCamelCase("time-attack")).toBe("timeAttack");
    });
});

describe("viewDirCandidates", () => {
    it("single-segment route has one candidate", () => {
        expect(viewDirCandidates("home")).toEqual(["home"]);
    });

    it("slash route has first segment and full nested candidates", () => {
        expect(viewDirCandidates("character/select")).toEqual(["character", "character/select"]);
    });
});

describe("viewDirForRoute", () => {
    let tmp: string;

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), "n2d-viewdir-"));
    });

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("prefers the directory that actually contains the View file (nested layout)", () => {
        fs.mkdirSync(path.join(tmp, "src/view/character/select"), { recursive: true });
        fs.writeFileSync(path.join(tmp, "src/view/character/select/CharacterSelectView.ts"), "");
        expect(viewDirForRoute(tmp, "character/select")).toBe("character/select");
    });

    it("supports the first-segment layout", () => {
        fs.mkdirSync(path.join(tmp, "src/view/play"), { recursive: true });
        fs.writeFileSync(path.join(tmp, "src/view/play/PlayTimeAttackView.ts"), "");
        expect(viewDirForRoute(tmp, "play/time-attack")).toBe("play");
    });

    it("falls back to the first segment for a new route", () => {
        expect(viewDirForRoute(tmp, "quest/list")).toBe("quest");
    });
});
