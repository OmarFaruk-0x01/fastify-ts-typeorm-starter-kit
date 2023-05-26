import type { Config } from "@config";
import bootstrap from "@core/bootstrapper";
import logger from "@core/logger";
import storage from "@core/storage";
import api from "./api";

async function start(config: Config) {
  const server = bootstrap.init();
  // Establish connection to db
  await storage.connect(config);
  logger.debug("[*] Storage Connected");

  // Register all API routes with `/api` prefix
  server.register(api.getRouter(), { prefix: "/api" });

  await server.listen({ port: config?.PORT });
  logger.debug("[*] Server Started");
}

export default { start };
