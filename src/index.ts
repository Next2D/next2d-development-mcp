#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { runCli } from "./cli.js";

const command = process.argv[2];

if (command !== undefined) {
    process.exit(await runCli(process.argv.slice(2)));
}

const server = new McpServer({
    "name": "next2d-development-mcp",
    "version": "1.6.0"
});

registerTools(server);
registerResources(server);
registerPrompts(server);

const transport = new StdioServerTransport();
await server.connect(transport);
