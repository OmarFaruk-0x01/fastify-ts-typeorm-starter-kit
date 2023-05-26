import development from './dev';
import local from './local';
import production from './prod';

export type Config = {
  DB_URL: string;
  PORT: number;
};

var config: Config;

switch (process.env.NODE_ENV as string) {
  case 'production':
    console.log("production: ", production);
    config = production;
    break;
  case 'development':
    console.log('development: ', development);
    config = development;
    break;
  default:
    console.log("local: ", local);
    config = local;
}

console.log("Config: ", config);
console.log("NODE_ENV: ", process.env.NODE_ENV);


export default config;
