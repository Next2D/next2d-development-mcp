import { describe, it, expect } from "vitest";
import { generateAnimation } from "./animation.js";

describe("generateAnimation", () => {
    it("generates animation class with correct naming", () => {
        const code = generateAnimation("TopBtn", "Show");
        expect(code).toContain("export class TopBtnShowAnimation");
    });

    it("imports Tween and Easing from @next2d/ui", () => {
        const code = generateAnimation("TopBtn", "Show");
        expect(code).toContain('import { Tween, Easing, type Job } from "@next2d/ui"');
    });

    it("imports Event from @next2d/events", () => {
        const code = generateAnimation("TopBtn", "Show");
        expect(code).toContain('import { Event } from "@next2d/events"');
    });

    it("includes start method", () => {
        const code = generateAnimation("TopBtn", "Show");
        expect(code).toContain("start (): void");
    });

    it("includes callback support via Event.COMPLETE", () => {
        const code = generateAnimation("TopBtn", "Show");
        expect(code).toContain("Event.COMPLETE");
    });

    it("takes Sprite parameter and required callback", () => {
        const code = generateAnimation("TopBtn", "Show");
        expect(code).toContain("sprite: Sprite");
        expect(code).toContain("callback: () => void");
    });
});
