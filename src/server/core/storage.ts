import { Config } from '@core/config';
import { join } from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const source = new DataSource({
  type: 'postgres',
  entities: [join(__dirname, '../api/**/*-model.ts')],
  synchronize: true,
  logging: false,
});

function connect(config: Config) {
  source.setOptions({ url: config.db.db_url });
  return source.initialize();
}

export default { connect, dbSource: source };
