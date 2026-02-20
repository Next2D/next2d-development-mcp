import { toPascalCase } from "../utils.js";

export function generateInterface(
    name: string,
    properties: Array<{ name: string; type: string }> = []
): string {
    const pascal = toPascalCase(name);
    const interfaceName = pascal.startsWith("I") ? pascal : `I${pascal}`;

    const propsStr = properties.length > 0
        ? properties.map((p) => `    ${p.name}: ${p.type};`).join("\n")
        : "    // TODO: Define properties";

    return `/**
 * @interface
 */
export interface ${interfaceName} {
${propsStr}
}
`;
}
