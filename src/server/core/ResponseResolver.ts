export type ResponseResolverParams = {
  status: number;
  message: string;
};
export class ResponseResolver {
  status: number;
  message: string;
  constructor({ message, status }: ResponseResolverParams) {
    this.message = message;
    this.status = status;
  }
}
