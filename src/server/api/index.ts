import { FastifyInstance } from "fastify";
import user from "./user";

function getRouter() {
  return async (fastify: FastifyInstance, opts: any, done: Function) => {
    // Register all module's router with their prefix
    fastify.register(user.router, { prefix: user.config.prefix });

    done();
  };
}

export default { getRouter };
