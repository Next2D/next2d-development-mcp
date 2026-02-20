import { toPascalCase, toCamelCase } from "../utils.js";

export function generateView(name: string): string {
    const pascal = toPascalCase(name);
    const camel = toCamelCase(name);
    // Screen directory is the first segment for slash-separated routes (e.g. "quest/list" → "quest")
    const screenDir = name.includes("/") ? name.split("/")[0].toLowerCase() : name.toLowerCase();
    return `import type { ${pascal}ViewModel } from "./${pascal}ViewModel";
import { View } from "@next2d/framework";
import { ${pascal}Page } from "@/ui/component/page/${screenDir}/${pascal}Page";

/**
 * @class
 * @extends {View}
 */
export class ${pascal}View extends View<${pascal}ViewModel> {

    /**
     * @private
     * @readonly
     */
    private readonly _${camel}Page: ${pascal}Page;

    /**
     * @param {${pascal}ViewModel} vm
     * @constructor
     * @public
     */
    constructor (vm: ${pascal}ViewModel)
    {
        super(vm);

        this._${camel}Page = new ${pascal}Page();
        this.addChild(this._${camel}Page);
    }

    /**
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async initialize (): Promise<void>
    {
        this._${camel}Page.initialize(this.vm);
    }

    /**
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async onEnter (): Promise<void>
    {
        await this._${camel}Page.onEnter();
    }

    /**
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async onExit (): Promise<void>
    {
        return void 0;
    }
}
`;
}

export function generateViewModel(name: string): string {
    const pascal = toPascalCase(name);
    return `import { ViewModel, app } from "@next2d/framework";

/**
 * @class
 * @extends {ViewModel}
 */
export class ${pascal}ViewModel extends ViewModel {

    /**
     * @constructor
     * @public
     */
    constructor ()
    {
        super();
        // TODO: Initialize UseCases
        // this.yourUseCase = new YourUseCase();
    }

    /**
     * @description ViewModelの初期化 (Viewのinitialize()より前に呼ばれる)
     *              Initialize ViewModel (called before View's initialize())
     *
     * @return {Promise<void>}
     * @method
     * @override
     * @public
     */
    async initialize (): Promise<void>
    {
        // routing.json の requests で取得したデータを受け取る
        // const response = app.getResponse();
        // if (response.has("YourData")) {
        //     this.data = response.get("YourData") as IYourResponse;
        // }
    }
}
`;
}
