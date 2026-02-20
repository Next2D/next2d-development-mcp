import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerAddRoute(server: McpServer): void {
    server.registerTool(
        "add_route",
        {
            "description":
                "Generate a route entry for routing.json. " +
                "Supports request types: json, content, custom, cluster. " +
                "The route key becomes the URL path and determines the View class name (CamelCase).",
            "inputSchema": {
                "path": z.string().describe(
                    "Route path (e.g. 'home', 'quest/list'). " +
                    "Becomes URL path and View class name in CamelCase."
                ),
                "requests": z
                    .array(
                        z.object({
                            "type": z
                                .enum(["json", "content", "custom", "cluster"])
                                .describe("Request type"),
                            "path": z.string().optional().describe(
                                "URL path. Use {{var}} for config variables (e.g. '{{ api.endPoint }}path/to/api')"
                            ),
                            "name": z.string().optional().describe(
                                "Response key name for app.getResponse().get(name)"
                            ),
                            "cache": z.boolean().optional().describe(
                                "Cache the response (persists across screen transitions)"
                            ),
                            "class": z.string().optional().describe(
                                "Class path for custom type (e.g. 'infrastructure.repository.UserRepository')"
                            ),
                            "access": z
                                .enum(["public", "static"])
                                .optional()
                                .describe("Method access type for custom requests (default: 'public')"),
                            "method": z.string().optional().describe(
                                "Method name for custom type"
                            ),
                            "callback": z
                                .union([z.string(), z.array(z.string())])
                                .optional()
                                .describe("Callback class(es) after request completes")
                        })
                    )
                    .optional()
                    .default([])
                    .describe("Array of request configurations"),
                "isPrivate": z.boolean().optional().default(false).describe(
                    "If true, direct URL access redirects to TopView"
                )
            }
        },
        async ({ path, requests, isPrivate }) => {
            const routeEntry: Record<string, unknown> = {};
            if (isPrivate) { routeEntry.private = true }
            if (requests.length > 0) {
                routeEntry.requests = requests.map((r) => {
                    const req: Record<string, unknown> = { "type": r.type };
                    if (r.path) { req.path = r.path }
                    if (r.name) { req.name = r.name }
                    if (r.cache !== undefined) { req.cache = r.cache }
                    if (r.class) { req.class = r.class }
                    if (r.access) { req.access = r.access }
                    if (r.method) { req.method = r.method }
                    if (r.callback) { req.callback = r.callback }
                    return req;
                });
            } else {
                routeEntry.requests = [];
            }

            const json = JSON.stringify({ [path]: routeEntry }, null, 4);

            const pascal = path
                .split(/[\\/]/)
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join("");

            const screenDir = path.includes("/") ? path.split("/")[0].toLowerCase() : path.toLowerCase();

            return {
                "content": [
                    {
                        "type": "text",
                        "text": [
                            `## Route Entry for: ${path}`,
                            "",
                            "### Add to src/config/routing.json",
                            "```json",
                            json,
                            "```",
                            "",
                            `### This will map to: ${pascal}View / ${pascal}ViewModel`,
                            `### URL: /${path}`,
                            "",
                            "### After adding the route:",
                            "1. Run `npm run generate` to auto-generate View/ViewModel",
                            "2. Or manually create:",
                            `   - src/view/${screenDir}/${pascal}View.ts`,
                            `   - src/view/${screenDir}/${pascal}ViewModel.ts`
                        ].join("\n")
                    }
                ]
            };
        }
    );
}
