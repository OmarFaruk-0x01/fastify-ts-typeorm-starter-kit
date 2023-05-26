import type { FastifyInstance } from "fastify";
import { userController } from "./controller";

function getRouter() {
  return async (fastify: FastifyInstance, opts: any, done: Function) => {
    fastify.get("/", userController.getUsers);
    fastify.get("/:id", userController.getUser);

    done();
  };
}

export default { getRouter };
