import { ConfigModule as Config } from '@nestjs/config';

export const ConfigModule = Config.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvVars: false,
  envFilePath: `.env.${process.env.NODE_ENV}`,
});
