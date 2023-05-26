import { userRepository } from "./repository";

export class userService {
  constructor() {}

  static async getUsers() {
    const users = await userRepository.findUsers();
    return users;
  }
  static async getUser(id: string) {
    const user = await userRepository.findUser(id);
    return user;
  }
}
