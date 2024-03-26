import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppFactory } from './app/app.factory';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = AppFactory.createApp(
    await NestFactory.create(AppModule, {
      bufferLogs: true,
    }),
  );

  const configService = app.get(ConfigService);

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
