import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
    PROJECT_ROOT,
    deriveDescription,
    defaultTargetDir,
    discoverResources,
    type DiscoveredResource
} from "./resources/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CLI_COMMANDS = ["add-resource", "list-resources"];

export interface AddResourceOptions {
    source: string;
    name?: string;
    description?: string;
    category?: string;
    target?: string;
    skill?: string;
    readme?: string;
    force?: boolean;
    updateSkill?: boolean;
    updateReadme?: boolean;
}

export function defaultSkillPath(): string {
    return path.join(
        PROJECT_ROOT,
        "next2d-development-assistant",
        "skills",
        "next2d-development-assistant",
        "SKILL.md"
    );
}

export function defaultReadmePath(): string {
    return path.join(PROJECT_ROOT, "README.md");
}

interface ParsedArgs {
    positional: string[];
    flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
    const positional: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--force" || arg === "--no-skill" || arg === "--no-readme") {
            flags[arg.slice(2)] = true;
            continue;
        }
        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const value = argv[i + 1];
            if (value === undefined || value.startsWith("--")) {
                flags[key] = true;
            } else {
                flags[key] = value;
                i++;
            }
            continue;
        }
        positional.push(arg);
    }

    return { positional, flags };
}

function asString(value: string | boolean | undefined): string | undefined {
    return typeof value === "string" ? value : undefined;
}

/**
 * Escape characters that would break the generated markdown
 * (table cells and bullet lines in SKILL.md / README).
 */
export function escapeMarkdown(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/\|/g, "\\|")
        .replace(/[\r\n]+/g, " ")
        .trim();
}

export async function runCli(argv: string[]): Promise<number> {
    const [command, ...rest] = argv;

    switch (command) {
        case "add-resource":
            return addResourceFromArgs(rest);
        case "list-resources":
            return listResources();
        case "help":
        case "--help":
        case "-h":
            printHelp();
            return 0;
        default:
            console.error(command !== undefined ? `Unknown command: ${command}` : "");
            printHelp();
            return 1;
    }
}

function addResourceFromArgs(argv: string[]): number {
    const { positional, flags } = parseArgs(argv);
    const source = positional[0];

    if (!source) {
        console.error("Usage: next2d-development-mcp add-resource <file.md> [options]");
        printAddResourceHelp();
        return 1;
    }

    return addResource({
        source,
        "name": asString(flags.name),
        "description": asString(flags.description),
        "category": asString(flags.category) ?? "specs",
        "target": asString(flags.target),
        "skill": asString(flags.skill),
        "readme": asString(flags.readme),
        "force": flags.force === true,
        "updateSkill": flags.noSkill !== true,
        "updateReadme": flags.noReadme !== true
    });
}

export function addResource(opts: AddResourceOptions): number {
    const source = path.resolve(opts.source);
    if (!source.endsWith(".md") || !fs.existsSync(source)) {
        console.error(`Error: source markdown file not found: ${source}`);
        return 1;
    }

    const name = opts.name ?? path.basename(source, ".md");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
        console.error("Error: --name must be lowercase alphanumeric with optional hyphens (e.g. player-particles)");
        return 1;
    }

    const category = opts.category ?? "specs";
    if (!/^[a-z0-9][a-z0-9-]*$/.test(category)) {
        console.error("Error: --category must be lowercase alphanumeric with optional hyphens (e.g. specs)");
        return 1;
    }
    const targetDir = path.resolve(opts.target ?? defaultTargetDir());
    const dest = path.join(targetDir, `${name}.md`);
    const content = fs.readFileSync(source, "utf-8");
    // Sanitize once at the entry of the data flow: the description comes from
    // CLI arguments (untrusted) and is embedded into markdown below.
    const description = escapeMarkdown((opts.description ?? deriveDescription(content)).trim()) || name;
    const skillPath = path.resolve(opts.skill ?? defaultSkillPath());
    const readmePath = path.resolve(opts.readme ?? defaultReadmePath());

    if (fs.existsSync(dest) && !opts.force) {
        console.error(`Error: ${dest} already exists. Use --force to overwrite.`);
        return 1;
    }
    if (opts.updateSkill !== false && opts.skill && !fs.existsSync(skillPath)) {
        console.error(`Error: SKILL.md not found: ${skillPath}`);
        return 1;
    }
    if (opts.updateReadme !== false && opts.readme && !fs.existsSync(readmePath)) {
        console.error(`Error: README not found: ${readmePath}`);
        return 1;
    }

    fs.mkdirSync(targetDir, { "recursive": true });
    fs.copyFileSync(source, dest);
    console.log(`Added reference file: ${dest}`);

    const updatedFiles: string[] = [];

    if (opts.updateSkill !== false) {
        if (fs.existsSync(skillPath)) {
            if (updateSkillFile(skillPath, name, description)) {
                updatedFiles.push(skillPath);
                console.log(`Updated SKILL.md references: ${skillPath}`);
            }
        } else {
            console.log("SKILL.md not found (not in the assistant repo?), skipped.");
        }
    }

    if (opts.updateReadme !== false) {
        if (fs.existsSync(readmePath)) {
            if (updateReadmeFile(readmePath, name, description, category)) {
                updatedFiles.push(readmePath);
                console.log(`Updated README: ${readmePath}`);
            }
        } else {
            console.log("README.md not found, skipped.");
        }
    }

    console.log("");
    console.log(`Resource URI:  next2d://${category}/${name}`);
    console.log(`Description:   ${description}`);

    if (fs.existsSync(defaultSkillPath())) {
        console.log("");
        console.log("Next steps:");
        console.log("  npm run build   # copies references into dist/");
        console.log("  npm publish     # release the new resource");
    }

    if (updatedFiles.length === 0) {
        console.log("");
        console.log("Note: no documentation files were updated.");
    }

    return 0;
}

export function listResources(): number {
    const resources = discoverResources();

    console.log("Available Next2D resources:\n");
    const printEntry = (res: DiscoveredResource | { uri: string; description: string }): void => {
        console.log(`  ${res.uri}`);
        console.log(`      ${res.description}`);
    };

    for (const res of resources) {
        printEntry(res);
    }
    printEntry({
        "uri": "next2d://specs",
        "description": "Index of all reference resources"
    });
    printEntry({
        "uri": "next2d://architecture",
        "description": "Next2D architecture overview"
    });

    console.log(`\nTotal: ${resources.length + 2} resources`);
    return 0;
}

/**
 * Insert or replace a reference bullet in the "## References" section of SKILL.md.
 * Section selection: player-prefixed -> "Player API" section,
 * framework/develop prefixed -> "Framework" section,
 * anything else -> "Other Resources" section (created if absent).
 */
function updateSkillFile(skillPath: string, name: string, description: string): boolean {
    const md = fs.readFileSync(skillPath, "utf-8");
    const lines = md.split("\n");

    const startIdx = lines.findIndex((line) => /^##\s+References\b/.test(line.trim()));
    if (startIdx === -1) {
        console.log("No '## References' section in SKILL.md, skipped.");
        return false;
    }
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
        if (/^##\s+/.test(lines[i].trim())) {
            endIdx = i;
            break;
        }
    }

    // Replace an existing entry for the same file
    const bullet = `- **[${name}.md](references/${name}.md)** - ${description}`;
    const existingIdx = lines.findIndex(
        (line) => line.trim().startsWith(`- **[${name}.md](references/${name}.md)**`)
    );
    if (existingIdx !== -1) {
        lines[existingIdx] = bullet;
        fs.writeFileSync(skillPath, lines.join("\n"));
        return true;
    }

    const isPlayer = name.startsWith("player");
    const isFramework = name.startsWith("framework") || name.startsWith("develop");

    // Find the target "### " subsection
    let sectionIdx = -1;
    for (let i = startIdx + 1; i < endIdx; i++) {
        const heading = lines[i].trim();
        if (!heading.startsWith("### ")) {
            continue;
        }
        if (isPlayer && /player/i.test(heading)) {
            sectionIdx = i;
            break;
        }
        if (isFramework && /framework/i.test(heading)) {
            sectionIdx = i;
            break;
        }
        if (!isPlayer && !isFramework && /other/i.test(heading)) {
            sectionIdx = i;
            break;
        }
    }

    if (sectionIdx !== -1) {
        // Append after the last bullet of that subsection
        let lastBullet = -1;
        for (let i = sectionIdx + 1; i < endIdx; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
                break;
            }
            if (trimmed.startsWith("- ")) {
                lastBullet = i;
            }
        }
        let insertIdx: number;
        if (lastBullet !== -1) {
            insertIdx = lastBullet + 1;
        } else {
            insertIdx = sectionIdx + 1;
            if (lines[insertIdx].trim() === "") {
                insertIdx++;
            }
        }
        lines.splice(insertIdx, 0, bullet);
    } else {
        // Create "### Other Resources" at the end of the References section
        let insertAt = endIdx;
        while (insertAt > startIdx + 1 && lines[insertAt - 1].trim() === "") {
            insertAt--;
        }
        lines.splice(insertAt, 0, "", "### Other Resources", "", bullet, "");
    }

    fs.writeFileSync(skillPath, lines.join("\n"));
    return true;
}

/**
 * Insert or replace a resource row in the "## Resources" markdown table of README.md.
 */
function updateReadmeFile(readmePath: string, name: string, description: string, category: string): boolean {
    const md = fs.readFileSync(readmePath, "utf-8");
    const lines = md.split("\n");

    const startIdx = lines.findIndex((line) => /^##\s+Resources\b/.test(line.trim()));
    if (startIdx === -1) {
        console.log("No '## Resources' section in README, skipped.");
        return false;
    }
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
        if (/^##\s+/.test(lines[i].trim())) {
            endIdx = i;
            break;
        }
    }

    const uri = `next2d://${category}/${name}`;
    const title = name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    const row = `| ${title} | \`${uri}\` | ${description} |`;

    // Replace an existing row with the same URI
    for (let i = startIdx; i < endIdx; i++) {
        if (lines[i].includes(`\`${uri}\``)) {
            lines[i] = row;
            fs.writeFileSync(readmePath, lines.join("\n"));
            return true;
        }
    }

    // Append after the last row of the FIRST table in the section
    // (the section may contain additional tables, e.g. CLI options)
    let firstTableRow = -1;
    for (let i = startIdx; i < endIdx; i++) {
        if (/^\s*\|/.test(lines[i])) {
            firstTableRow = i;
            break;
        }
    }
    if (firstTableRow === -1) {
        console.log("No resources table found in README '## Resources' section, skipped.");
        return false;
    }
    let lastTableRow = firstTableRow;
    while (lastTableRow + 1 < endIdx && /^\s*\|/.test(lines[lastTableRow + 1])) {
        lastTableRow++;
    }

    lines.splice(lastTableRow + 1, 0, row);
    fs.writeFileSync(readmePath, lines.join("\n"));
    return true;
}

function printAddResourceHelp(): void {
    console.log(`
add-resource <file.md> [options]

Copy a markdown reference file into the references directory and register it
as an MCP resource (auto-discovered at server startup). Also updates the
SKILL.md references list and the README resources table.

Options:
  --name <name>         Resource name (default: file name without .md)
  --description <text>  Resource description (default: derived from the file)
  --category <prefix>   URI prefix (default: "specs" -> next2d://specs/<name>)
  --target <dir>        Destination directory (default: auto-detected references dir)
  --skill <path>        SKILL.md to update (default: auto-detected)
  --readme <path>       README.md to update (default: auto-detected)
  --force               Overwrite an existing reference file
  --no-skill            Do not update SKILL.md
  --no-readme           Do not update README
`);
}

function printHelp(): void {
    console.log(`
next2d-development-mcp - CLI commands

Run without arguments to start the MCP server (stdio).

Commands:
  add-resource <file.md> [options]  Add a new reference resource
  list-resources                    List all resources that will be registered
  help                              Show this help

Examples:
  npx next2d-development-mcp add-resource ./docs/particles.md --name player-particles
  npx next2d-development-mcp add-resource ./docs/guide.md --description "Authoring guide" --force
  npm run add-resource -- ./docs/particles.md
  npm run list-resources
`);
    printAddResourceHelp();
}
