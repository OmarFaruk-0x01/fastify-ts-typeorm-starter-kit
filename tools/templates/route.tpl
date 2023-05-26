/**
 * @module {{resource.name}} router
 *
 * @description
 * All routing for this resource/api should be defined here.
 * This route then gets added to the base api routing.
 */
import type { FastifyInstance } from "fastify";
import { {{resource.name}}Controller } from "./controller";

function getRouter() {
  return async (fastify: FastifyInstance, opts: any, done: Function) => {
    fastify.get("/", {{resource.name}}Controller.get);
    fastify.post("/", {{resource.name}}Controller.add);
    fastify.delete("/:id", {{resource.name}}Controller.remove);

    done();
  };
}

export default { getRouter };
