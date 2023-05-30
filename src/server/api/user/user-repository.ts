import storage from '@core/storage';
import { User } from './user-model';
import { DataSource, Repository } from 'typeorm';
import { Dependencies } from '@core/config/diConfig';

export class userRepository {
  private readonly dbUserRepo: Repository<User>;

  constructor({ typeorm }: Dependencies) {
    this.dbUserRepo = typeorm.getRepository(User);
  }

  async getUsers() {
    return this.dbUserRepo.find();
  }

  async getUser(id: string) {
    const user = await this.dbUserRepo.findOne({ where: { id } });
    return user;
  }
}
