import { ConfigModule as Config } from '@nestjs/config';
import { config } from 'dotenv';

config({
  path: '.env.local',
});

export const ConfigModule = Config.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvVars: false,
  envFilePath: '.env',
});
