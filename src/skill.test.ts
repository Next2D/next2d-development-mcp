import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { PROJECT_ROOT } from "./resources/index.js";

const SKILL_DIR = path.join(
    PROJECT_ROOT,
    "next2d-development-assistant",
    "skills",
    "next2d-development-assistant"
);
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const REFS_DIR = path.join(SKILL_DIR, "references");

describe.skipIf(!fs.existsSync(SKILL_MD))("SKILL.md consistency", () => {
    it("all references/*.md links point to existing files", () => {
        const md = fs.readFileSync(SKILL_MD, "utf-8");
        const links = [...md.matchAll(/\(references\/([A-Za-z0-9-]+\.md)\)/g)].map((m) => m[1]);

        expect(links.length).toBeGreaterThan(0);
        const missing = links.filter((file) => !fs.existsSync(path.join(REFS_DIR, file)));
        expect(missing).toEqual([]);
    });

    it("every reference file is listed in SKILL.md", () => {
        const md = fs.readFileSync(SKILL_MD, "utf-8");
        const files = fs.readdirSync(REFS_DIR).filter((file) => file.endsWith(".md"));

        const missing = files.filter((file) => !md.includes(`references/${file}`));
        expect(missing).toEqual([]);
    });

    it("SKILL.md has a navigation rule to limit context load", () => {
        const md = fs.readFileSync(SKILL_MD, "utf-8");
        expect(md).toContain("Load only the single file needed");
    });
});
