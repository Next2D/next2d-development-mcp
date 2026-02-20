import { toPascalCase } from "../utils.js";

/**
 * Loading class template (for config.json loading.callback)
 */
export function generateLoading(name: string = "Loading"): string {
    const pascal = toPascalCase(name);

    return `import { Shape, stage } from "@next2d/display";

/**
 * @description ローディング画面
 *              Loading Screen
 *
 * @class
 */
export class ${pascal} {

    /**
     * @type {Shape}
     * @private
     * @readonly
     */
    private readonly _shape: Shape;

    /**
     * @constructor
     * @public
     */
    constructor ()
    {
        this._shape = new Shape();
        // TODO: Initialize loading display (e.g. spinner, progress bar)
    }

    /**
     * @description ローディング開始時に呼ばれる
     *              Called when loading starts
     *
     * @return {void}
     * @method
     * @public
     */
    start (): void
    {
        stage.addChild(this._shape);
    }

    /**
     * @description ローディング終了時に呼ばれる
     *              Called when loading ends
     *
     * @return {void}
     * @method
     * @public
     */
    end (): void
    {
        this._shape.remove();
    }
}
`;
}
