import type { Routes } from '@api/index';
import * as userController from './user-controller';
// import { postCreateUser } from '../controllers/UserController';
// import { CREATE_USER_SCHEMA } from '../schemas/userSchemas';

export const getUserRoutes = (): Routes => {
  return [
    {
      method: 'GET',
      url: '/users',
      handler: userController.getUsers,
      schema: { describe: 'Get users' },
    },
    {
      method: 'GET',
      url: '/users/:id',
      handler: userController.getUser,
      schema: { describe: 'Get user' },
    },
  ];
};

export default { getUserRoutes };
