import storage from "@core/storage";
import { User } from "./model";

export class userRepository {
  static async findUsers() {
    return await storage.dbSource.getRepository(User).find();
  }
  static async findUser(id: string) {
    return await storage.dbSource.getRepository(User).find({ where: { id } });
  }
}
