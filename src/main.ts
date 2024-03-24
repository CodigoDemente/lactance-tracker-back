import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppFactory } from './app/app.factory';

async function bootstrap() {
  const app = AppFactory.createApp(await NestFactory.create(AppModule));

  await app.listen(3000);
}
bootstrap();
