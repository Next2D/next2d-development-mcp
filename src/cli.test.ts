import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { addResource, runCli } from "./cli.js";

function makeSkillFixture(): string {
    return [
        "# Next2D Development Assistant",
        "",
        "## References",
        "",
        "### Next2D Player API（用途別に分割）",
        "",
        "- **[player-overview.md](references/player-overview.md)** - Player概要",
        "",
        "### Next2D Framework / 開発仕様",
        "",
        "- **[framework-specs.md](references/framework-specs.md)** - Framework reference",
        "",
        "## Build Commands",
        "",
        "| `npm start` | dev server |"
    ].join("\n");
}

function makeReadmeFixture(): string {
    return [
        "# Test README",
        "",
        "## Resources",
        "",
        "| Resource | URI | Description |",
        "|---|---|---|",
        "| Framework Specs | `next2d://specs/framework-specs` | Framework |",
        "",
        "## Prompts"
    ].join("\n");
}

describe("addResource", () => {
    let tmp: string;
    let refs: string;
    let skillPath: string;
    let readmePath: string;
    let sourcePath: string;

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), "n2d-cli-"));
        refs = path.join(tmp, "references");
        skillPath = path.join(tmp, "SKILL.md");
        readmePath = path.join(tmp, "README.md");
        sourcePath = path.join(tmp, "sprite.md");
        fs.writeFileSync(sourcePath, "# Sprite\n\nSprite is a dynamic container.\n");
        fs.writeFileSync(skillPath, makeSkillFixture());
        fs.writeFileSync(readmePath, makeReadmeFixture());
    });

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("copies the file and updates SKILL.md and README", () => {
        const code = addResource({ source: sourcePath, target: refs, skill: skillPath, readme: readmePath });

        expect(code).toBe(0);
        expect(fs.existsSync(path.join(refs, "sprite.md"))).toBe(true);
        expect(fs.readFileSync(path.join(refs, "sprite.md"), "utf-8")).toContain("# Sprite");

        const skill = fs.readFileSync(skillPath, "utf-8");
        expect(skill).toContain("- **[sprite.md](references/sprite.md)** - Sprite - Sprite is a dynamic container.");
        expect(skill).toContain("### Other Resources");

        const readme = fs.readFileSync(readmePath, "utf-8");
        expect(readme).toContain("| Sprite | `next2d://specs/sprite` | Sprite - Sprite is a dynamic container. |");
    });

    it("places player* resources in the Player API section", () => {
        const code = addResource({
            source: sourcePath,
            name: "player-sprite",
            description: "Sprite API",
            target: refs,
            skill: skillPath,
            readme: readmePath
        });

        expect(code).toBe(0);
        const skill = fs.readFileSync(skillPath, "utf-8");
        const playerSection = skill.indexOf("### Next2D Player API");
        const frameworkSection = skill.indexOf("### Next2D Framework");
        const bulletIdx = skill.indexOf("- **[player-sprite.md](references/player-sprite.md)**");
        expect(playerSection).toBeLessThan(bulletIdx);
        expect(bulletIdx).toBeLessThan(frameworkSection);
        expect(skill).toContain("- **[player-sprite.md](references/player-sprite.md)** - Sprite API");
    });

    it("fails without --force when the target file exists", () => {
        expect(addResource({ source: sourcePath, target: refs, skill: skillPath, readme: readmePath })).toBe(0);
        const second = addResource({ source: sourcePath, target: refs, skill: skillPath, readme: readmePath });
        expect(second).toBe(1);
    });

    it("replaces the existing SKILL.md bullet instead of duplicating it", () => {
        addResource({ source: sourcePath, target: refs, skill: skillPath, readme: readmePath });
        addResource({ source: sourcePath, name: "sprite", target: refs, skill: skillPath, readme: readmePath, force: true });

        const skill = fs.readFileSync(skillPath, "utf-8");
        const occurrences = skill.split("- **[sprite.md](references/sprite.md)**").length - 1;
        expect(occurrences).toBe(1);
    });

    it("rejects invalid resource names", () => {
        const code = addResource({ source: sourcePath, name: "Bad Name", target: refs, skill: skillPath, readme: readmePath });
        expect(code).toBe(1);
    });

    it("rejects a missing source file", () => {
        const code = addResource({ source: path.join(tmp, "nope.md"), target: refs, skill: skillPath, readme: readmePath });
        expect(code).toBe(1);
    });

    it("appends new rows to the first table even when the section contains more tables", () => {
        const readme = [
            "# Test README",
            "",
            "## Resources",
            "",
            "| Resource | URI | Description |",
            "|---|---|---|",
            "| Framework Specs | `next2d://specs/framework-specs` | Framework |",
            "",
            "### Options",
            "",
            "| Option | Description |",
            "|---|---|",
            "| `--force` | overwrite |",
            "",
            "## Prompts"
        ].join("\n");
        fs.writeFileSync(readmePath, readme);

        const code = addResource({ source: sourcePath, target: refs, skill: skillPath, readme: readmePath });

        expect(code).toBe(0);
        const updated = fs.readFileSync(readmePath, "utf-8");
        const mainTableIdx = updated.indexOf("| Framework Specs");
        const newRowIdx = updated.indexOf("| Sprite | `next2d://specs/sprite`");
        const optionsIdx = updated.indexOf("| `--force`");
        expect(newRowIdx).toBeGreaterThan(mainTableIdx);
        expect(newRowIdx).toBeLessThan(optionsIdx);
    });

    it("rejects an explicitly given missing SKILL.md path", () => {
        const code = addResource({
            source: sourcePath,
            target: refs,
            skill: path.join(tmp, "missing.md"),
            readme: readmePath
        });
        expect(code).toBe(1);
        expect(fs.existsSync(path.join(refs, "sprite.md"))).toBe(false);
    });
});

describe("runCli", () => {
    it("returns 0 for help", () => {
        expect(runCli(["help"])).resolves.toBe(0);
    });

    it("returns 1 for an unknown command", () => {
        expect(runCli(["bogus"])).resolves.toBe(1);
    });

    it("returns 1 for add-resource without a file argument", () => {
        expect(runCli(["add-resource"])).resolves.toBe(1);
    });
});
