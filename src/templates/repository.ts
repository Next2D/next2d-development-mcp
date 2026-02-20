import { toPascalCase } from "../utils.js";

export function generateRepository(name: string, methodName: string = "get"): string {
    const pascal = toPascalCase(name);
    return `import type { I${pascal}Response } from "@/interface/I${pascal}Response";
import { config } from "@/config/Config";

/**
 * @class
 */
export class ${pascal}Repository {

    /**
     * @return {Promise<I${pascal}Response>}
     * @method
     * @static
     * @public
     */
    static async ${methodName} (): Promise<I${pascal}Response>
    {
        try {

            const response = await fetch(
                \`\${config.api.endPoint}api/${name.toLowerCase()}.json\`
            );

            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }

            return await response.json() as I${pascal}Response;

        } catch (error) {

            console.error("Failed to fetch:", error);
            throw error;

        }
    }
}
`;
}
