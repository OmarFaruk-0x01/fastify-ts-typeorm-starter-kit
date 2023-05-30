import { InternalError } from "@core/error/errorTypes";

type EnvType = typeof process.env;

type EnvValueValidator<T> = (value: T) => boolean;

const CONFIG_ERROR_CODE = 'CONFIGURATION_ERROR';

export class EnvParser {
  private env: EnvType;

  constructor(envOverride?: EnvType) {
    this.env = envOverride ?? { ...process.env };
  }

  updateEnv() {
    this.env = { ...process.env } as EnvType;
  }

  getMandatory(param: string): string {
    const value = this.env[param];
    if (value === undefined || value === '') {
      throw new InternalError<string>({
        message: `Missing mandatory configuration parameter: ${param}`,
        errorCode: CONFIG_ERROR_CODE,
      });
    }
    return value;
  }

  getMandatoryOneOf<T>(param: string, supportedValues: T[]): T {
    const value = this.env[param];
    if (value === undefined || value === '') {
      throw new InternalError<T>({
        message: `Missing mandatory configuration parameter: ${param}`,
        errorCode: CONFIG_ERROR_CODE,
      });
    }

    if (!supportedValues.includes(value as T)) {
      throw new InternalError<T>({
        message: `Configuration parameter ${param} must be one of: ${supportedValues.join(
          ', '
        )}`,
        errorCode: CONFIG_ERROR_CODE,
      });
    }

    return value as T;
  }

  getMandatoryValidatedInteger(
    param: string,
    validator: EnvValueValidator<number> = (v) => true,
    errorMessage?: string
  ): number {
    const rawValue = this.getMandatory(param);
    const value = validateNumber(
      parseInt(rawValue),
      `Configuration parameter ${param} must be a valid integer`
    );
    if (!validator(value)) {
      throw new InternalError({
        errorCode: CONFIG_ERROR_CODE,
        message:
          errorMessage || `Configuration parameter ${param} validation failed`,
      });
    }
    return value;
  }

  getOptionalNullable<T extends string | null | undefined>(
    param: string,
    defaultValue: T
  ): T | string {
    const value = this.env[param];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return value as T | string;
  }

  getOptional(param: string, defaultValue: string): string {
    const value = this.env[param];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  }

  getOptionalInteger(param: string, defaultValue: number): number {
    const rawValue = this.env[param];
    if (rawValue === undefined || rawValue === '') {
      return defaultValue;
    }
    return validateNumber(
      parseInt(rawValue),
      `Configuration parameter ${param} must be a valid integer`
    );
  }

  getOptionalValidated(
    param: string,
    defaultValue: string,
    validator: EnvValueValidator<string>,
    errorMessage?: string
  ): string {
    const value = this.env[param];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    if (!validator(value)) {
      throw new InternalError({
        errorCode: CONFIG_ERROR_CODE,
        message:
          errorMessage || `Configuration parameter ${param} validation failed`,
      });
    }
    return value;
  }

  getOptionalTransformed(
    param: string,
    defaultValue: string,
    transformer: (value: string) => string
  ): string {
    const value = this.env[param];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return transformer(value);
  }

  getMandatoryTransformed(
    param: string,
    transformer: (value: string) => string
  ): string {
    const value = this.getMandatory(param);
    return transformer(value);
  }

  getOptionalBoolean(param: string, defaultValue: boolean): boolean {
    const rawValue = this.env[param];
    if (rawValue === undefined || rawValue === '') {
      return defaultValue;
    }
    return rawValue.toLowerCase() === 'true';
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}

function validateNumber(obj: number, errorMessage: string): number {
  if (!Number.isFinite(obj)) {
    throw new InternalError<number>({
      message: errorMessage,
      errorCode: CONFIG_ERROR_CODE,
    });
  }
  return obj;
}
