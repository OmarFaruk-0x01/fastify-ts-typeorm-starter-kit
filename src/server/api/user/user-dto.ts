import { ResponseResolver } from '@core/ResponseResolver';
import { User } from './user-model';

export interface GetUserReqURI {
  id: string;
}

export interface GetUserResp extends ResponseResolver {
  user: Omit<User, '...'> | null
}

export interface CreateUserReqBody {
  name: string;
}

export interface CreateUserResp extends ResponseResolver {}

export interface GetUsersReqQuery {
  page?: number;
  size?: number;
}

export interface GetUsersResp extends ResponseResolver {
  users: Partial<User>[]
}
