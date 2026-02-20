import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerCreateView } from "./createView.js";
import { registerCreateUseCase } from "./createUseCase.js";
import { registerCreateRepository } from "./createRepository.js";
import { registerCreateUiComponent } from "./createUiComponent.js";
import { registerAddRoute } from "./addRoute.js";
import { registerCreateInterface } from "./createInterface.js";
import { registerValidateArchitecture } from "./validateArchitecture.js";
import { registerCreateAnimation } from "./createAnimation.js";
import { registerCreateDomainService } from "./createDomainService.js";
import { registerCreateLoading } from "./createLoading.js";

export { z };

export function registerTools(server: McpServer): void {
    registerCreateView(server);
    registerCreateUseCase(server);
    registerCreateRepository(server);
    registerCreateUiComponent(server);
    registerAddRoute(server);
    registerCreateInterface(server);
    registerValidateArchitecture(server);
    registerCreateAnimation(server);
    registerCreateDomainService(server);
    registerCreateLoading(server);
}
