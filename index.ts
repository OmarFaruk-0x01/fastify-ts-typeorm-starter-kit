require("module-alias/register");
import config from "@config";
import logger from "@core/logger";
import server from "@server";

async function main() {
  try {
    await server.start(config);
  } catch (err) {
    // TODO: Implement auto shutdown connections.
    logger.error(err);
    process.exit(-1);
  }
}

main();
