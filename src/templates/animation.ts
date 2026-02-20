import { toPascalCase } from "../utils.js";

/**
 * Animation class template
 * Naming: {Component}{Action}Animation.ts
 */
export function generateAnimation(
    componentName: string,
    actionName: string
): string {
    const component = toPascalCase(componentName);
    const action = toPascalCase(actionName);
    const className = `${component}${action}Animation`;

    return `import type { Sprite } from "@next2d/display";
import { Tween, Easing, type Job } from "@next2d/ui";
import { Event } from "@next2d/events";

/**
 * @description ${component}の${action}アニメーション
 *              ${action} animation for ${component}
 *
 * @class
 */
export class ${className} {

    private readonly _job: Job;

    /**
     * @param  {Sprite} sprite - アニメーション対象
     * @param  {() => void} callback - 完了時コールバック
     * @constructor
     * @public
     */
    constructor (
        sprite: Sprite,
        callback: () => void
    ) {
        // 初期状態設定
        sprite.alpha = 0;

        // Tween設定: (対象, 開始値, 終了値, 秒数, 遅延秒数, イージング)
        this._job = Tween.add(sprite,
            { "alpha": 0 },
            { "alpha": 1 },
            0.5, 0, Easing.outQuad
        );

        this._job.addEventListener(Event.COMPLETE, (): void =>
        {
            callback();
        });
    }

    /**
     * @description アニメーション開始
     *              Start animation
     *
     * @return {void}
     * @method
     * @public
     */
    start (): void
    {
        this._job.start();
    }
}
`;
}
