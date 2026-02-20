import { toPascalCase } from "../utils.js";

export function generateUseCase(name: string, _screenName: string): string {
    const pascal = toPascalCase(name);
    const className = pascal.endsWith("UseCase") ? pascal : `${pascal}UseCase`;
    return `/**
 * @class
 */
export class ${className} {

    /**
     * @constructor
     * @public
     */
    constructor ()
    {
        // TODO: Inject dependencies
    }

    /**
     * @return {void}
     * @method
     * @public
     */
    execute (): void
    {
        // TODO: Implement business logic
    }
}
`;
}
