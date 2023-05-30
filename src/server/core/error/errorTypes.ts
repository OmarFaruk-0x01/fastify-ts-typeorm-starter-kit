export type ErrorDetails = Record<string, unknown>;
export type InternalErrorParams<T = ErrorDetails> = {
  message: string;
  errorCode: string;
  details?: T;
};

export class InternalError<T> extends Error {
  details: T | undefined;
  errorCode: string;
  constructor(params: InternalErrorParams<T>) {
    super(params.message);
    this.name = 'InternalError';
    this.details = params.details;
    this.errorCode = params.errorCode;
  }
}

export class PublicNonRecoverableError extends Error {
  details;
  errorCode;
  httpStatusCode;
  constructor(params: InternalErrorParams & { httpStatusCode: number }) {
    super(params.message);
    this.name = 'PublicNonRecoverableError';
    this.details = params.details;
    this.errorCode = params.errorCode;
    this.httpStatusCode = params.httpStatusCode ?? 500;
  }
}
