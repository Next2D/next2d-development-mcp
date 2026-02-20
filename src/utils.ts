/**
 * PascalCase に変換 (スラッシュ区切りも対応)
 * "quest/list" -> "QuestList"
 */
export function toPascalCase(str: string): string {
    return str
        .split(/[\\/]/)
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
