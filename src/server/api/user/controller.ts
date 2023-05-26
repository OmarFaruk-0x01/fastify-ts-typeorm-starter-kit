import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "./service";
import logger from "@core/logger";

export class userController {
  static async getUsers(req: FastifyRequest, reply: FastifyReply) {
    return await userService.getUsers();
  }
  static async getUser(req: FastifyRequest, reply: FastifyReply) {
    // @ts-ignore
    const id = req.params?.id as string;
    return await userService.getUser(id);
  }
}
