import type { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import type { AwilixContainer, Resolver } from 'awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { P, pino } from 'pino';
import { Config, getConfig } from '.';
import { userRepository } from '@api/user/user-repository';
import { userService } from '@api/user/user-service';
import { JWT } from '@fastify/jwt';
import { DataSource } from 'typeorm';
import storage from '@core/storage';

export type ExternalDependencies = {
  app?: FastifyInstance;
  logger?: P.Logger;
  dbSource?: DataSource;
  //   amqpConnection?: Connection;
};
export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON };

export type DependencyOverrides = Partial<DiConfig>;

export function registerDependencies(
  diContainer: AwilixContainer,
  dependencies: ExternalDependencies = {},
  dependencyOverrides: DependencyOverrides = {}
): void {
  const diConfig: DiConfig = {
    jwt: asFunction(() => {
      return dependencies.app?.jwt;
    }, SINGLETON_CONFIG),
    logger: asFunction(() => dependencies.logger ?? pino(), SINGLETON_CONFIG),

    redis: asFunction(
      ({ config }: Dependencies) => {
        const redisConfig = config.redis;

        // return new Redis({
        //   host: redisConfig.host,
        //   db: redisConfig.db,
        //   port: redisConfig.port,
        //   username: redisConfig.username,
        //   password: redisConfig.password,
        //   tls: redisConfig.useTls ? {} : undefined,
        // });
      },
      {
        // dispose: (redis) => {
        //   return new Promise((resolve, reject) => {
        //     void redis.quit((err, result) => {
        //       if (err) {
        //         return reject(err);
        //       }
        //       return resolve(result);
        //     });
        //   });
        // },
        // lifetime: Lifetime.SINGLETON,
      }
    ),

    typeorm: asFunction((_) => {
      return null;
    }),
    // prisma: asFunction(
    //   ({ config }: Dependencies) => {
    //     return new PrismaClient({
    //       datasources: {
    //         db: {
    //           url: config.db.databaseUrl,
    //         },
    //       },
    //     });
    //   },
    //   {
    //     dispose: (prisma) => {
    //       return prisma.$disconnect();
    //     },
    //     lifetime: Lifetime.SINGLETON,
    //   }
    // ),

    // amqpConnection: asFunction(
    //   () => {
    //     if (!dependencies.amqpConnection) {
    //       throw new InternalError({
    //         message: 'amqp connection is a mandatory dependency',
    //         errorCode: 'MISSING_DEPENDENCY',
    //       });
    //     }
    //     return dependencies.amqpConnection;
    //   },
    //   {
    //     lifetime: Lifetime.SINGLETON,
    //   }
    // ),
    // consumerErrorResolver: asFunction(() => {
    //   return new ConsumerErrorResolver();
    // }),
    // amqpConnectionDisposer: asClass(AmqpConnectionDisposer, {
    //   dispose: (rabbitMqDisposer) => {
    //     return rabbitMqDisposer.close();
    //   },
    //   lifetime: Lifetime.SINGLETON,
    // }),

    config: asFunction(() => {
      return getConfig();
    }, SINGLETON_CONFIG),

    userRepository: asClass(userRepository, SINGLETON_CONFIG),
    userService: asClass(userService, SINGLETON_CONFIG),
    // userCache: asClass(UserCache, SINGLETON_CONFIG),
    // urlCache: asClass(UrlCache, SINGLETON_CONFIG),
    // configStore: asClass(ConfigStore, SINGLETON_CONFIG),

    // permissionsService: asClass(PermissionsService, SINGLETON_CONFIG),
    // permissionConsumer: asClass(PermissionConsumer, SINGLETON_CONFIG),
    // permissionPublisher: asClass(PermissionPublisher, SINGLETON_CONFIG),

    // processLogFilesJob: asClass(ProcessLogFilesJob, SINGLETON_CONFIG),
    // deleteOldUsersJob: asClass(DeleteOldUsersJob, SINGLETON_CONFIG),
    // sendEmailsJob: asClass(SendEmailsJob, SINGLETON_CONFIG),

    // vendor-specific dependencies
    // newRelicBackgroundTransactionManager: asFunction(() => {
    //   return dependencies.app?.newrelicTransactionManager;
    // }, SINGLETON_CONFIG),
    // errorReporter: asFunction(() => {
    //   return {
    //     report: (report) => reportErrorToBugsnag(report),
    //   } satisfies ErrorReporter;
    // }),

    // fakeStoreApiClient: asClass(FakeStoreApiClient, SINGLETON_CONFIG),
  };
  diContainer.register(diConfig);

  for (const [dependencyKey, dependencyValue] of Object.entries(
    dependencyOverrides
  )) {
    diContainer.register(dependencyKey, dependencyValue);
  }
}

type DiConfig = Record<keyof Dependencies, Resolver<unknown>>;

export interface Dependencies {
  jwt: JWT;
  config: Config;
  logger: FastifyLoggerInstance & P.Logger;

  redis: any; //Redis;

  typeorm: DataSource;
  //   prisma: PrismaClient;

  //   amqpConnection: Connection;

  //   deleteOldUsersJob: DeleteOldUsersJob;
  //   processLogFilesJob: ProcessLogFilesJob;
  //   sendEmailsJob: SendEmailsJob;

  userRepository: userRepository;
  userService: userService;
  //   userCache: UserCache;
  //   urlCache: UrlCache;
  //   configStore: ConfigStore;

  //   permissionsService: PermissionsService;

  // vendor-specific dependencies
  //   newRelicBackgroundTransactionManager: NewRelicTransactionManager;

  //   errorReporter: ErrorReporter;
  //   consumerErrorResolver: ErrorResolver;
  //   permissionConsumer: PermissionConsumer;
  //   permissionPublisher: PermissionPublisher;
  //   amqpConnectionDisposer: AmqpConnectionDisposer;

  //   fakeStoreApiClient: FakeStoreApiClient;
}

declare module '@fastify/awilix' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Cradle extends Dependencies {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface RequestCradle extends Dependencies {}
}
