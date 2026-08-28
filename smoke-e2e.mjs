import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const transport = new StdioClientTransport({ command: "node", args: ["dist/index.js"] });
const client = new Client({ name: "e2e-smoke", version: "0.0.0" });
await client.connect(transport);

let failures = 0;
const check = (label, cond, extra = "") => {
    if (cond) {
        console.log(`  PASS  ${label}`);
    } else {
        failures++;
        console.log(`  FAIL  ${label} ${extra}`);
    }
};
const call = async (name, args) => {
    const r = await client.callTool({ name, arguments: args });
    return (r.content?.[0]?.text ?? "") + "";
};
// Override with NEXT2D_TEST_PROJECT to point at any Next2D project
const realProject = process.env.NEXT2D_TEST_PROJECT ?? "/Users/ienaga/projects/Next2D/slime-ten-puzzle";

// 1. Listing
console.log("== Listing ==");
const tools = await client.listTools();
check("13 tools", tools.tools.length === 13, `(got ${tools.tools.length})`);
const resources = await client.listResources();
check("17 resources", resources.resources.length === 17, `(got ${resources.resources.length})`);
const prompts = await client.listPrompts();
check("4 prompts", prompts.prompts.length === 4, `(got ${prompts.prompts.length})`);

// 2. Generation tools
console.log("== Generation tools ==");
const view = await call("create_view", { name: "quest/list" });
check("create_view: QuestListView class", view.includes("class QuestListView extends View<QuestListViewModel>"));
check("create_view: Page step comes first", view.indexOf("Page component FIRST") !== -1 && view.indexOf("Page component FIRST") < view.indexOf("Create directory"));
const page = await call("create_ui_component", { name: "quest/list", level: "page" });
check("create_ui_component page: QuestListPage", page.includes("class QuestListPage extends Sprite"));
check("create_ui_component page: file in page/quest/", page.includes("src/ui/component/page/quest/QuestListPage.ts"));
check("create_ui_component page: view import first segment", page.includes("@/view/quest/QuestListViewModel"));
check("create_ui_component page: initialize(vm)", page.includes("initialize (vm: QuestListViewModel)"));
const uc = await call("create_usecase", { name: "GetQuestList", screen: "quest/list" });
check("create_usecase: execute()", uc.includes("execute("));
const repo = await call("create_repository", { name: "QuestList" });
check("create_repository: try-catch", repo.includes("try") && repo.includes("catch"));
const iface = await call("create_interface", { name: "QuestResponse", properties: [{ name: "quests", type: "IQuest[]" }] });
check("create_interface: I prefix auto-added", iface.includes("IQuestResponse"));
const route = await call("add_route", { path: "quest/list", requests: [{ type: "json", path: "{{ api.endPoint }}api/quest/list.json", name: "QuestListData" }] });
check("add_route: json entry", route.includes('"quest/list"') && route.includes("QuestListData"));
const routeHyphen = await call("add_route", { path: "play/time-attack" });
check("add_route: hyphen route -> PlayTimeAttack", routeHyphen.includes("PlayTimeAttackView") && !routeHyphen.includes("PlayTime-attack"));
const anim = await call("create_animation", { component: "QuestListPage", action: "FadeIn", screen: "quest/list" });
check("create_animation: Tween", anim.includes("Tween"));
const domain = await call("create_domain_service", { name: "QuestRule", type: "service" });
check("create_domain_service", domain.includes("QuestRule"));
const loading = await call("create_loading", { name: "CustomLoading" });
check("create_loading: start/end", loading.includes("start(") && loading.includes("end("));

// 3. Analysis tools on the real project
console.log("== Analysis on real project (slime-ten-puzzle) ==");
const analyze = await call("analyze_project", { projectPath: realProject });
check("analyze_project: finds home screen", analyze.includes("`home` → Home"));
check("analyze_project: hyphen route PlayTimeAttackSelect found", analyze.includes("PlayTimeAttackSelect") && !analyze.includes("PlayTime-attack"));
check("analyze_project: no false-positive missing views", !/play\/time-attack.*missing/.test(analyze));
const inspect = await call("inspect_screen", { projectPath: realProject, screenPath: "home" });
check("inspect_screen home: finds files", inspect.includes("HomeView") && inspect.includes("HomeViewModel"));
const plan = await call("plan_feature", { projectPath: realProject, screenPath: "quest/list", hasApi: true });
check("plan_feature: ordered steps", plan.includes("create_view") || plan.includes("create_usecase"));
const validate = await call("validate_architecture", { projectPath: realProject });
check("validate_architecture real: stage.json valid 1280x720", validate.includes("stage.json valid (1280x720 @60fps)"), validate.slice(0, 200));
check("validate_architecture real: no invalid key", !validate.includes("Invalid stage.json key"));

// 4. Broken stage.json detection (temp project)
console.log("== Broken stage.json detection ==");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "n2d-broken-"));
fs.mkdirSync(path.join(tmp, "src/config"), { recursive: true });
fs.mkdirSync(path.join(tmp, "src/view"), { recursive: true });
for (const d of ["interface", "model/application", "model/domain", "model/infrastructure/repository", "ui/animation", "ui/component/atom", "ui/component/molecule", "ui/component/page", "ui/content"]) {
    fs.mkdirSync(path.join(tmp, "src", d), { recursive: true });
}
fs.writeFileSync(path.join(tmp, "src/config/stage.json"), JSON.stringify({ width: 240, height: 240, fps: 60, scaleMode: "noScale", align: "TL", options: { fullScreen: true, quality: "high" } }));
fs.writeFileSync(path.join(tmp, "src/config/config.json"), "{}");
fs.writeFileSync(path.join(tmp, "src/config/routing.json"), JSON.stringify({ home: { requests: [] } }));
fs.writeFileSync(path.join(tmp, "src/config/Config.ts"), "");
fs.writeFileSync(path.join(tmp, "src/Packages.ts"), "");
fs.writeFileSync(path.join(tmp, "src/index.ts"), "");
const broken = await call("validate_architecture", { projectPath: tmp });
check("detects scaleMode", broken.includes("'scaleMode'") && broken.includes("fullScreen"));
check("detects align", broken.includes("'align'"));
check("detects options.quality", broken.includes("'quality'"));
fs.rmSync(tmp, { recursive: true, force: true });

// 5. Nested-layout project support (view/{a}/{b}/ when used by the project)
console.log("== Nested view layout support ==");
const nestedProject = "/Users/ienaga/projects/Next2D/the-last-scope";
if (fs.existsSync(path.join(nestedProject, "src/view/versus/lobby"))) {
    const na = await call("analyze_project", { projectPath: nestedProject });
    const nMissing = na.split("\n").filter((l) => l.includes("missing: View"));
    check("analyze_project: no false missing on nested project", nMissing.length === 0, nMissing.join(" | "));
    const ni = await call("inspect_screen", { projectPath: nestedProject, screenPath: "versus/lobby" });
    check("inspect_screen: finds nested VersusLobbyView", ni.includes("VersusLobbyView.ts"));
    const np = await call("plan_feature", { projectPath: nestedProject, screenPath: "versus/lobby", hasApi: true });
    check("plan_feature: marks existing nested files", np.includes("✅"));
} else {
    console.log("  SKIP  (the-last-scope not present)");
}

// 6. Resources
console.log("== Resources ==");
const idx = await client.readResource({ uri: "next2d://specs" });
const idxText = idx.contents[0].text;
check("index lists player-shape", idxText.includes("next2d://specs/player-shape"));
check("index lists 15 references", idxText.includes("15 reference resource(s)"));
const shape = await client.readResource({ uri: "next2d://specs/player-shape" });
check("player-shape: Image recommended", shape.contents[0].text.includes("Imageの読み込み（推奨）"));
const fw = await client.readResource({ uri: "next2d://specs/framework-specs" });
check("framework-specs: stage.json whitelist warning", fw.contents[0].text.includes("Flash Player の派生ではありません"));
const arch = await client.readResource({ uri: "next2d://architecture" });
check("architecture: stage.json warning", arch.contents[0].text.includes("NOT supported"));

// 7. Prompts
console.log("== Prompts ==");
const orch = await client.getPrompt({ name: "orchestrate", arguments: { task: "クエスト一覧を追加", screenPath: "quest/list", mode: "create" } });
check("orchestrate: workflow phases", orch.messages.some((m) => m.content?.text?.includes("analyze_project")));
const ns = await client.getPrompt({ name: "new-screen", arguments: { screenName: "settings" } });
check("new-screen: steps", ns.messages.some((m) => m.content?.text?.includes("routing.json")));

await client.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
