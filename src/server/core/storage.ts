import { Config } from "@config";
import { join } from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";

const source = new DataSource({
  type: "postgres",
  // host: "localhost",
  // port: 5432,
  // username: "postgres",
  // password: "123123",
  // database: "test",
  entities: [join(__dirname, "../api/**/model.ts")],
  synchronize: true,
  logging: false,
});

function connect(config: Config) {
  source.setOptions({ url: config.DB_URL });
  return source.initialize();
}

export default { connect, dbSource: source };
