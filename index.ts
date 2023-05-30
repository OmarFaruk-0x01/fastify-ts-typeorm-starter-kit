require('module-alias/register');
import bootstrapper from '@core/bootstrapper';
import { name } from './package.json';
import { getConfig } from '@core/config';
import {
  executeAndHandleGlobalErrors,
  globalLogger,
  resolveGlobalErrorLogObject,
} from '@core/error/globalErrorHandler';
import storage from '@core/storage';
import { asFunction } from 'awilix';

async function main() {
  globalLogger.info('Starting app....');
  const config = executeAndHandleGlobalErrors(getConfig);
  const dataSource = await storage.connect(config);

  // Database Source Overrides DependencyInjection
  const server = await bootstrapper.getServer(
    {},
    {
      typeorm: asFunction(() => dataSource),
    }
  );
  try {
    await server.listen({
      port: config.app.port,
      host: config.app.bindAddress,
      listenTextResolver(address) {
        return `${name} listening at ${address}`;
      },
    });
  } catch (err) {
    // TODO: Implement auto shutdown connections.
    server.log.error(resolveGlobalErrorLogObject(err));
    process.exit(-1);
  }
}

main();
