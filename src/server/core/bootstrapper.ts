import type http from 'http';
import type pino from 'pino';
import Fastify, { type FastifyInstance } from 'fastify';

import {
  getAmqpConfig,
  getConfig,
  isDevelopment,
  isProduction,
  isTest,
} from './config';
import { resolveLoggerConfiguration } from './logger';
import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import fastifyGracefulShutdown from 'fastify-graceful-shutdown';
import fastifyNoIcon from 'fastify-no-icon';
import { fastifyAuth } from '@fastify/auth';
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { fastifySchedule } from '@fastify/schedule';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { Secret, fastifyJwt } from '@fastify/jwt';
import { errorHandler } from './error/errorHandler';
import { getRoutes } from '@api/index';
import {
  ZodTypeProvider,
  createJsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { DependencyOverrides, registerDependencies } from './config/diConfig';
import { AwilixContainer } from 'awilix';
import type { DataSource } from 'typeorm';

const GRACEFUL_SHUTDOWN_TIMEOUT_IN_MSECS = 5000;

export type ConfigOverrides = {
  diContainer?: AwilixContainer;
  dbSource?: DataSource;
  jwtKeys?: {
    public: Secret;
    private: Secret;
  };
  amqpEnabled?: boolean;
  jobsEnabled?: boolean;
  healthchecksEnabled?: boolean;
  monitoringEnabled?: boolean;
};

async function getServer(
  configOverrides: ConfigOverrides = {},
  dependencyOverrides: DependencyOverrides = {}
): Promise<
  FastifyInstance<
    http.Server,
    http.IncomingMessage,
    http.ServerResponse,
    pino.Logger
  >
> {
  const config = getConfig();
  const appCnf = config.app;
  const loggerCnf = resolveLoggerConfiguration(appCnf);
  const enableRequestLogging = ['debug', 'trace'].includes(appCnf.logLevel);
  const server = Fastify<
    http.Server,
    http.IncomingMessage,
    http.ServerResponse,
    pino.Logger
  >({ logger: loggerCnf, disableRequestLogging: !enableRequestLogging });

  // Set `Zod` as primary Validator for Fastify
  server.setValidatorCompiler(validatorCompiler);

  // Set `Zod Serializer` as primary Serializer for Fastify
  server.setSerializerCompiler(serializerCompiler);

  // In production this should ideally be handled outside of application, e. g.
  // on nginx or kubernetes level, but for local development it is convenient
  // to have these headers set by application.
  // If this service is never called from the browser, this entire block can be removed.
  if (isDevelopment()) {
    await server.register(fastifyCors, {
      origin: '*',
      credentials: true,
      methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Accept',
        'Content-Type',
        'Authorization',
      ],
      exposedHeaders: [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
      ],
    });
  }

  // @fastify/helmet.
  // It is designed to enhance the security of your web applications by setting various HTTP headers that help protect against common security vulnerabilities.
  await server.register(
    fastifyHelmet,
    isDevelopment()
      ? {
          contentSecurityPolicy: false,
        }
      : {}
  );

  // fastifyGracefulShutdown
  // It allows your Fastify server to handle the termination process smoothly, ensuring that active connections are properly closed before shutting down the server.
  if (!isDevelopment()) {
    await server.register(fastifyGracefulShutdown, {
      resetHandlersOnInit: true,
      timeout: GRACEFUL_SHUTDOWN_TIMEOUT_IN_MSECS,
    });
  }

  // This is a simple plugin for Fastify to deal with annoying /favicon.ico requests. Under normal operation Fastify will throw an error because a route isn't registered to handle the request. This plugin merely gives it one.
  await server.register(fastifyNoIcon);

  await server.register(fastifyAuth);

  // Implement Open API Docs
  await server.register(fastifySwagger, {
    transform: createJsonSchemaTransform({
      skipList: [
        '/documentation/',
        '/documentation/initOAuth',
        '/documentation/json',
        '/documentation/uiConfig',
        '/documentation/yaml',
        '/documentation/*',
        '/documentation/static/*',
        '*',
      ],
    }),
    openapi: {
      info: {
        title: 'SampleApi',
        description: 'Sample backend service',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${
            appCnf.bindAddress === '0.0.0.0' ? 'localhost' : appCnf.bindAddress
          }:${appCnf.port}`,
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });
  await server.register(fastifySwaggerUi);

  await server.register(fastifyAwilixPlugin, { disposeOnClose: true });

  await server.register(fastifySchedule);

  await server.register(fastifyJwt, {
    secret: {
      private: '-', // Private key blank, as this service won't create JWT tokens, only verify them
      public: appCnf.jwtPublicKey,
    },
  });

  // TODO: Implement JWT Token Custom Plugin to verify token
  // await server.register(jwtTokenPlugin, {
  //   skipList: new Set([
  //     '/login',
  //     '/access-token',
  //     '/refresh-token',
  //     '/documentation',
  //     '/documentation/json',
  //     '/documentation/static/*',
  //     '/documentation/static/index.html',
  //     '/documentation/static/swagger-initializer.js',
  //     '/health',
  //     '/metrics',
  //   ]),
  // });

  // Set Custom Error handler plugin for handling errors in a consistent way
  server.setErrorHandler(errorHandler);

  // TODO: Implement RabbitMQ Implementation and Verify Connection
  // const isAmqpEnabled = isProduction();
  // const amqpConfig = getAmqpConfig();
  // const amqpConnection = isAmqpEnabled
  //   ? await resolveAmqpConnection(amqpConfig)
  //   : undefined;

  // Implement Dependency Inject
  registerDependencies(
    diContainer,
    {
      app: server,
      // amqpConnection: amqpConnection,
      logger: server.log,
    },
    dependencyOverrides
  );

  // TODO: Implement Health Check
  // if (configOverrides.healthchecksEnabled !== false) {
  //   await server.register(customHealthCheck, {
  //     path: '/health',
  //     logLevel: 'warn',
  //     info: {
  //       env: appCnf.nodeEnv,
  //       app_version: appCnf.appVersion,
  //       git_commit_sha: appCnf.gitCommitSha,
  //     },
  //     schema: false,
  //     exposeFailure: false,
  //   });
  //   await server.register(publicHealthcheckPlugin, {
  //     healthChecks: [dbHealthCheck, redisHealthCheck],
  //     responsePayload: {
  //       version: appCnf.appVersion,
  //       gitCommitSha: appCnf.gitCommitSha,
  //       status: 'OK',
  //     },
  //   });
  // }
  // await server.register(requestContextProviderPlugin);

  // TODO: Implement Vendor-specific plugins
  // if (configOverrides.monitoringEnabled) {
  //   await server.register(metricsPlugin, {
  //     bindAddress: appCnf.bindAddress,
  //     errorObjectResolver: resolveGlobalErrorLogObject,
  //     loggerOptions: loggerConfig,
  //     disablePrometheusRequestLogging: true,
  //   });
  // }
  // await server.register(newrelicTransactionManagerPlugin, {
  //   isEnabled: config.vendors.newrelic.isEnabled,
  // });
  // await server.register(bugsnagPlugin, {
  //   isEnabled: config.vendors.bugsnag.isEnabled,
  //   bugsnag: {
  //     apiKey: config.vendors.bugsnag.apiKey ?? '',
  //     releaseStage: appCnf.appEnv,
  //     appVersion: appCnf.appVersion,
  //   },
  // });
  // await server.register(prismaOtelTracingPlugin, {
  //   isEnabled: config.vendors.newrelic.isEnabled,
  //   samplingRatio: isProduction() ? 0.1 : 1.0,
  //   serviceName: config.vendors.newrelic.appName,
  //   useBatchSpans: isProduction(),
  // });

  // Register All Routes after all plugin registered
  server.after(() => {
    const { routes } = getRoutes();
    routes.forEach((route) =>
      server.withTypeProvider<ZodTypeProvider>().route(route)
    );

    // Graceful shutdown hook
    if (!isDevelopment()) {
      server.gracefulShutdown((signal, next) => {
        server.log.info('Starting graceful shutdown');
        next();
      });
    }

    // TODO: Implement Background Jobs Scheduler, RabbitMQ Consumer, and Health Checks
    // // Register background jobs
    // if (configOverrides.jobsEnabled !== false && !isTest()) {
    //   server.log.info('Start registering background jobs');
    //   registerJobs(app);
    //   server.log.info('Background jobs registered');
    // } else {
    //   server.log.info('Skip registering background jobs');
    // }

    // if (isAmqpEnabled) {
    //   // This is needed to ensure it gets initialized
    //   server.diContainer.cradle.amqpConnectionDisposer;

    //   const consumers = getConsumers(server.diContainer.cradle);
    //   for (const consumer of consumers) {
    //     void consumer.consume();
    //   }

    //   const publishers = getPublishers(server.diContainer.cradle);
    //   for (const publisher of publishers) {
    //     void publisher.init();
    //   }
    // }

    // if (configOverrides.healthchecksEnabled !== false) {
    //   registerHealthChecks(app);
    // }
  });

  try {
    await server.ready();
    // TODO: Check health checks
    // if (!isTest() && configOverrides.healthchecksEnabled !== false) {
    //   await runAllHealthchecks(app);
    // }
  } catch (err) {
    server.log.error('Error while initializing app: ', err);
    throw err;
  }

  return server;
}

export default { getServer };
