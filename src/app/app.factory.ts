import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

export class AppFactory {
  static createApp(app: INestApplication) {
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());

    return app;
  }
}
