/**
 * @module {{resource.name}} controller
 *
 * @description
 * The controller layer. Instead of directly writing any
 * business logics here, please use service(s).
 *
 * The basic controller is written as CRUD controller, but
 * you can write it any way to support your api endpoint.
 * For example, for a checkout API, the CRUD will not make
 * sense but a `checkout` function will.
 */
import type { FastifyReply, FastifyRequest } from "fastify";

export class {{resource.name}}Controller {
  static async get(req: FastifyRequest, reply: FastifyReply) {
  }
  static async add(req: FastifyRequest, reply: FastifyReply) {
  }
  static async remove(req: FastifyRequest, reply: FastifyReply) {
  }
}
