import { toPascalCase } from "../utils.js";

export type AtomicLevel = "atom" | "molecule" | "organism" | "page";

export function generateUiComponent(
    name: string,
    level: AtomicLevel,
    parentClass: string = "Sprite",
    screen: string = ""
): string {
    const pascal = toPascalCase(name);
    const suffix = level.charAt(0).toUpperCase() + level.slice(1);

    const importDisplay = parentClass === "Sprite"
        ? "import { Sprite } from \"@next2d/display\";"
        : parentClass === "MovieClip"
            ? "import { MovieClip } from \"@next2d/display\";"
            : parentClass === "Shape"
                ? "import { Shape } from \"@next2d/display\";"
                : parentClass === "TextField"
                    ? "import { TextField } from \"@next2d/text\";"
                    : `// TODO: Adjust import path for ${parentClass}\nimport { ${parentClass} } from "@next2d/display";`;

    // Page components receive typed ViewModel and use config for positioning
    if (level === "page") {
        const screenDir = screen || name.toLowerCase();
        return `import type { ${pascal}ViewModel } from "@/view/${screenDir}/${pascal}ViewModel";
import { config } from "@/config/Config";
${importDisplay}

/**
 * @description ${pascal}画面のページ
 *              ${pascal} Screen Page
 *
 * @class
 * @extends {${parentClass}}
 */
export class ${pascal}Page extends ${parentClass} {

    /**
     * @description 初期起動関数
     *              Initializer function
     *
     * @param  {${pascal}ViewModel} vm
     * @return {void}
     * @method
     * @public
     */
    initialize (vm: ${pascal}ViewModel): void
    {
        // TODO: Create child components and set positions using config.stage.width/height
        // TODO: Bind events to ViewModel methods via arrow functions:
        // component.addEventListener(PointerEvent.POINTER_UP, async (): Promise<void> => {
        //     await vm.onClickSomething();
        // });
    }

    /**
     * @description ページ表示時の処理
     *              Processing when the page is displayed
     *
     * @return {Promise<void>}
     * @method
     * @public
     */
    async onEnter (): Promise<void>
    {
        // TODO: Start entry animations
    }
}
`;
    }

    return `${importDisplay}

/**
 * @class
 * @extends {${parentClass}}
 */
export class ${pascal}${suffix} extends ${parentClass} {

    /**
     * @constructor
     * @public
     */
    constructor ()
    {
        super();
    }
}
`;
}

export function generateContent(name: string): string {
    const pascal = toPascalCase(name);
    return `import { MovieClipContent } from "@next2d/framework";

/**
 * @see file/sample.n2d
 *
 * @class
 * @extends {MovieClipContent}
 */
export class ${pascal}Content extends MovieClipContent {

    /**
     * @description Animation Toolのシンボル名を返す
     *              Returns the Animation Tool symbol name
     *
     * @return {string}
     * @readonly
     */
    get namespace (): string
    {
        return "${pascal}Content";
    }
}
`;
}
