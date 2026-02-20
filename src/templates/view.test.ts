import { describe, it, expect } from "vitest";
import { generateView, generateViewModel } from "./view.js";

describe("generateView", () => {
    it("generates View class with correct name", () => {
        const code = generateView("home");
        expect(code).toContain("export class HomeView extends View<HomeViewModel>");
    });

    it("imports ViewModel type", () => {
        const code = generateView("home");
        expect(code).toContain('import type { HomeViewModel } from "./HomeViewModel"');
    });

    it("imports View from framework", () => {
        const code = generateView("home");
        expect(code).toContain('import { View } from "@next2d/framework"');
    });

    it("includes lifecycle methods", () => {
        const code = generateView("home");
        expect(code).toContain("async initialize ()");
        expect(code).toContain("async onEnter ()");
        expect(code).toContain("async onExit ()");
    });

    it("imports and instantiates Page component", () => {
        const code = generateView("home");
        expect(code).toContain('import { HomePage } from "@/ui/component/page/home/HomePage"');
        expect(code).toContain("this._homePage = new HomePage()");
        expect(code).toContain("this.addChild(this._homePage)");
    });

    it("calls page.initialize(this.vm) in initialize()", () => {
        const code = generateView("home");
        expect(code).toContain("this._homePage.initialize(this.vm)");
    });

    it("handles slash-separated name with valid variable names", () => {
        const code = generateView("quest/list");
        expect(code).toContain("export class QuestListView extends View<QuestListViewModel>");
        expect(code).toContain('import type { QuestListViewModel } from "./QuestListViewModel"');
        expect(code).toContain('import { QuestListPage } from "@/ui/component/page/quest/QuestListPage"');
        expect(code).toContain("this._questListPage = new QuestListPage()");
        expect(code).toContain("this._questListPage.initialize(this.vm)");
        // Variable name must not contain slashes
        expect(code).not.toContain("_quest/list");
    });

    it("constructor receives ViewModel", () => {
        const code = generateView("home");
        expect(code).toContain("constructor (vm: HomeViewModel)");
        expect(code).toContain("super(vm)");
    });

    it("onEnter delegates to page", () => {
        const code = generateView("home");
        expect(code).toContain("await this._homePage.onEnter()");
    });
});

describe("generateViewModel", () => {
    it("generates ViewModel class with correct name", () => {
        const code = generateViewModel("home");
        expect(code).toContain("export class HomeViewModel extends ViewModel");
    });

    it("imports ViewModel from framework with app", () => {
        const code = generateViewModel("home");
        expect(code).toContain('import { ViewModel, app } from "@next2d/framework"');
    });

    it("includes initialize method with response pattern", () => {
        const code = generateViewModel("home");
        expect(code).toContain("async initialize ()");
        expect(code).toContain("app.getResponse()");
    });

    it("handles slash-separated name", () => {
        const code = generateViewModel("quest/list");
        expect(code).toContain("export class QuestListViewModel extends ViewModel");
    });
});
