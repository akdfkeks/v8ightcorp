import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(ConfigService)));
  await app.listen(3000);
}
bootstrap();
