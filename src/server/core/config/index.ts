// import development from './dev';
// import local from './local';
// import production from './prod';

import { EnvParser } from '@utils/EnvParser';

// export type Config = {
//   DB_URL: string;
//   PORT: number;
// };

// var config: Config;

// switch (process.env.NODE_ENV as string) {
//   case 'production':
//     console.log("production: ", production);
//     config = production;
//     break;
//   case 'development':
//     console.log('development: ', development);
//     config = development;
//     break;
//   default:
//     console.log("local: ", local);
//     config = local;
// }

// console.log("Config: ", config);
// console.log("NODE_ENV: ", process.env.NODE_ENV);

// export default config;

export type AppConfig = {
  port: number;
  bindAddress: string;
  jwtPublicKey: string;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  nodeEnv: 'production' | 'development' | 'test';
  appEnv: 'production' | 'development' | 'staging';
  appVersion: string;
  gitCommitSha: string;
  metrics: {
    isEnabled: boolean;
  };
};

export type DBConfig = {
  db_url: string;
};

export type JobConfig = {
  processLogFilesJob: {
    periodInSeconds: number;
  };
  deleteOldUsersJob: {
    periodInSeconds: number;
  };
  sendEmailsJob: {
    cronExpression: string;
  };
};

export type AmqpConfig = {
  hostname: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  useTls: boolean;
};

export type RedisConfig = {
  host: string;
  /**
   * An integer from 0 to 15, inclusive
   */
  db: number;
  port: number;
  username?: string;
  password?: string;
  useTls: boolean;
};

export type Config = {
  db: DBConfig;
  redis: RedisConfig;
  scheduler: RedisConfig;
  amqp: AmqpConfig;
  app: AppConfig;
  jobs: JobConfig;

  // Probably Mock DB URL
  integration: {
    fakeStore: {
      url: string;
    };
  };

  // Third Party integration config
  vendors: {
    newrelic: {
      isEnabled: boolean;
      appName: string;
    };
    bugsnag: {
      isEnabled: boolean;
      apiKey?: string;
    };
  };
};

const env = new EnvParser();

export function getAppConfig(): AppConfig {
  return {
    appEnv: env.getMandatoryOneOf<AppConfig['appEnv']>('APP_ENV', [
      'staging',
      'development',
      'production',
    ]),
    appVersion: env.getMandatory('VERSION'),
    bindAddress: env.getMandatory('BIND_ADDRESS'),
    port: env.getOptionalInteger('PORT', 9999),
    logLevel: env.getMandatoryOneOf<AppConfig['logLevel']>('LOG_LEVEL', [
      'debug',
      'error',
      'fatal',
      'info',
      'silent',
      'trace',
      'warn',
    ]),
    gitCommitSha: env.getOptional('GIT_COMMIT_SHA', 'GIT_COMMIT_SHA_NOT_SET'),
    jwtPublicKey: env.getMandatory('JWT_PUBLIC_KEY').replace(/||/g, '\n'),
    metrics: {
      isEnabled: env.getOptionalBoolean(
        'MATRICES_ENABLED',
        !env.isDevelopment()
      ),
    },
    nodeEnv: env.getMandatoryOneOf<AppConfig['nodeEnv']>('NODE_ENV', [
      'test',
      'development',
      'production',
    ]),
  };
}

export function getDBConfig(): DBConfig {
  return {
    db_url: env.getMandatory('DB_URL'),
  };
}

export function getRedisConfig(): RedisConfig {
  return {
    host: env.getMandatory('REDIS_HOST'),
    db: env.getMandatoryValidatedInteger('REDIS_DB', (v) => v >= 0 && v <= 15),
    port: env.getMandatoryValidatedInteger('REDIS_PORT'),
    username: env.getOptionalNullable('REDIS_USERNAME', undefined),
    password: env.getOptionalNullable('REDIS_PASSWORD', undefined),
    useTls: env.getOptionalBoolean('REDIS_USE_TLS', true),
  };
}
export function getSchedulerRedisConfig(): RedisConfig {
  return {
    host: env.getMandatory('SCHEDULER_REDIS_HOST'),
    db: env.getMandatoryValidatedInteger(
      'SCHEDULER_REDIS_DB',
      (v) => v > 0 && v < 15
    ),
    port: env.getMandatoryValidatedInteger('SCHEDULER_REDIS_PORT'),
    username: env.getOptionalNullable('SCHEDULER_REDIS_USERNAME', undefined),
    password: env.getOptionalNullable('SCHEDULER_REDIS_PASSWORD', undefined),
    useTls: env.getOptionalBoolean('SCHEDULER_REDIS_USE_TLS', true),
  };
}

export function getAmqpConfig(): AmqpConfig {
  return {
    hostname: env.getMandatory('AMQP_HOSTNAME'),
    port: env.getMandatoryValidatedInteger('AMQP_PORT'),
    username: env.getMandatory('AMQP_USERNAME'),
    password: env.getMandatory('AMQP_PASSWORD'),
    vhost: env.getOptional('AMQP_VHOST', ''),
    useTls: env.getOptionalBoolean('AMQP_USE_TLS', true),
  };
}

export function getConfig(): Config {
  return {
    db: getDBConfig(),
    app: getAppConfig(),
    redis: getRedisConfig(),
    amqp: getAmqpConfig(),
    scheduler: getSchedulerRedisConfig(),
    integration: {
      fakeStore: {
        url: env.getMandatory('SAMPLE_FAKE_STORE_BASE_URL'),
      },
    },
    jobs: {
      deleteOldUsersJob: {
        periodInSeconds: env.getMandatoryValidatedInteger(
          'DELETE_OLD_USERS_JOB_PERIOD_IN_SECS'
        ),
      },
      processLogFilesJob: {
        periodInSeconds: env.getMandatoryValidatedInteger(
          'PROCESS_LOGS_FILES_JOB_PERIOD_IN_SECS'
        ),
      },
      sendEmailsJob: {
        cronExpression: env.getMandatory('SEND_EMAILS_JOB_CRON'),
      },
    },
    vendors: {
      newrelic: {
        isEnabled: env.getOptionalBoolean('NEW_RELIC_ENABLED', true),
        appName: env.getOptionalNullable('NEW_RELIC_APP_NAME', ''),
      },
      bugsnag: {
        isEnabled: env.getOptionalBoolean('BUGSNAG_ENABLED', true),
        apiKey: env.getOptionalNullable('BUGSNAG_KEY', undefined),
      },
    },
  };
}

export function isDevelopment(): boolean {
  return env.isDevelopment();
}
export function isProduction(): boolean {
  return env.isProduction();
}
export function isTest(): boolean {
  return env.isTest();
}
