import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.lm.registerMcpServerDefinitionProvider("next2d-development-mcp", {
            provideMcpServerDefinitions(): vscode.McpServerDefinition[] {
                const serverPath = context.asAbsolutePath("dist/index.js");
                return [
                    new vscode.McpStdioServerDefinition(
                        "Next2D Development MCP",
                        process.execPath,
                        [serverPath]
                    )
                ];
            },
            resolveMcpServerDefinition(
                server: vscode.McpServerDefinition
            ): vscode.McpServerDefinition {
                return server;
            }
        })
    );
}

export function deactivate(): void {}
