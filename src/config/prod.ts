import { Config } from "@config";

const prodConfig: Config = {
  DB_URL: 'postgres://postgres:123123@localhost:5432/test',
  PORT: 9999,
};

export default prodConfig;
