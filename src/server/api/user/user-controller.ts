import { FastifyReply, FastifyRequest } from 'fastify';

export const getUsers = async (req: FastifyRequest, res: FastifyReply) => {
  const { userService } = req.diScope.cradle;

  return await userService.getUsers();
};

export const getUser = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  const { id } = req.params;
  const { userService } = req.diScope.cradle;
  return await userService.getUser(id);
};
