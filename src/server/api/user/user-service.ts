import { Dependencies } from '@core/config/diConfig';
import { userRepository } from './user-repository';
import { GetUserResp, GetUsersResp } from './user-dto';

export class userService {
  private readonly userRepo: userRepository;
  constructor({ userRepository }: Dependencies) {
    this.userRepo = userRepository;
  }

  async getUsers() {
    const users = await this.userRepo.getUsers();
    const resp: GetUsersResp = {
      users: users,
      message: 'users fetched',
      status: 200,
    };

    return resp;
  }
  async getUser(id: string) {
    const user = await this.userRepo.getUser(id);
    const resp: GetUserResp = {
      user: user,
      message: 'users fetched',
      status: 200,
    };

    return resp;
  }
}
