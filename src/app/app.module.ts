import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from 'src/database/typeorm.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
