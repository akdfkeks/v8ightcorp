import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: `.env.${process.env.NODE_ENV == 'prod' ? 'prod' : 'local'}` });

const connOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: +process.env.MYSQL_PORT!,
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  entities: [join(__dirname, `/model/*.entity{.ts,.js}`)],
  migrations: [join(__dirname, `/migration/*{.ts,.js}`)],
  migrationsTableName: 'migration',
  migrationsTransactionMode: 'all',
};

export default new DataSource(connOptions);
