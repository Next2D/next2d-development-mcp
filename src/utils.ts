import { existsSync } from "node:fs";
import * as path from "node:path";

/**
 * PascalCase に変換 (view-generator と同一の区切り: ハイフン / スラッシュ / 下線)
 * "quest/list" -> "QuestList"
 * "play/time-attack" -> "PlayTimeAttack"
 */
export function toPascalCase(str: string): string {
    return str
        .split(/[-/\\_]/)
        .filter((s) => s !== "")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
}

/**
 * camelCase に変換
 */
export function toCamelCase(str: string): string {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Candidate directories for a route's View files, in priority order.
 * Supports both layout conventions found in Next2D projects:
 *  - first segment:  src/view/play/PlayTimeAttackView.ts (template convention)
 *  - full nested:    src/view/character/select/CharacterSelectView.ts
 */
export function viewDirCandidates(route: string): string[] {
    const first = route.includes("/")
        ? route.split("/")[0].toLowerCase()
        : route.toLowerCase();
    const candidates = [first];
    if (route.includes("/")) {
        const nested = route.toLowerCase();
        if (nested !== first) {
            candidates.push(nested);
        }
    }
    return candidates;
}

/**
 * Directory that actually contains the route's View files.
 * Falls back to the template convention (first segment) when the route is new.
 */
export function viewDirForRoute(base: string, route: string): string {
    const pascal = toPascalCase(route);
    for (const dir of viewDirCandidates(route)) {
        if (existsSync(path.join(base, "src/view", dir, `${pascal}View.ts`))) {
            return dir;
        }
    }
    return viewDirCandidates(route)[0];
}
