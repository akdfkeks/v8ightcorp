import { ConfigService } from '@nestjs/config';
import { TypeOrmModule as TypeOrm } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { join } from 'path';

const path = process.env.NODE_ENV == 'prod' ? 'dist' : 'src';

export const TypeOrmModule = TypeOrm.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'mysql',
    host: config.get('MYSQL_HOST'),
    port: +config.get('MYSQL_PORT'),
    username: config.get('MYSQL_USERNAME'),
    password: config.get('MYSQL_PASSWORD'),
    database: config.get('MYSQL_DATABASE'),
    entities: [join(__dirname, `/model/*.entity{.ts,.js}`)],
    synchronize: false,
  }),
});
