import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from 'src/database/typeorm.module';

@Module({
  imports: [TypeOrmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
