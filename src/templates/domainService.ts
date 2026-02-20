import { toPascalCase } from "../utils.js";

/**
 * Domain service template (functional style)
 */
export function generateDomainService(
    featureName: string,
    actionName: string
): string {
    const feature = toPascalCase(featureName);
    const action = toPascalCase(actionName);

    return `/**
 * @description ${feature}の${action}サービス
 *              ${action} service for ${feature}
 *
 * @param  {unknown} param
 * @return {void}
 */
export const execute = (param: unknown): void =>
{
    // TODO: Implement domain business logic
};
`;
}

/**
 * Domain callback template (for gotoView.callback)
 */
export function generateDomainCallback(name: string): string {
    const pascal = toPascalCase(name);

    return `import { app } from "@next2d/framework";
import { Shape, stage } from "@next2d/display";

/**
 * @description ${pascal}コールバック (gotoView完了後に実行)
 *              ${pascal} callback (executed after gotoView completes)
 *
 * @class
 */
export class ${pascal} {

    /**
     * @description コールバック実行
     *              Execute callback
     *
     * @return {void}
     * @method
     * @public
     */
    execute (): void
    {
        const context = app.getContext();
        const view = context.view;
        if (!view) return;

        // TODO: Implement callback logic
    }
}
`;
}
