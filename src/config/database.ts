import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { AppEnvironmentConfig } from '../enum/app.environment.config.enum';
dotenv.config();

console.log(
  process.env.DB_HOST,
  +process.env.DB_PORT,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_NAME,
);

let dataBaseConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: 'all',
  logger: 'advanced-console',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
};

switch (process.env.NODE_ENV) {
  case AppEnvironmentConfig.DEV:
    dataBaseConfig = {
      ...dataBaseConfig,
      logging: 'all',
      logger: 'advanced-console',
    };
    break;
  case AppEnvironmentConfig.PRODUCTION:
    dataBaseConfig = {
      ...dataBaseConfig,
      logging: false,
      logger: 'file',
      host: '',
      port: +'',
      username: '',
      password: '',
      database: '',
    };
    break;
  default:
    break;
}

export const AppDataSource = new DataSource(dataBaseConfig);
