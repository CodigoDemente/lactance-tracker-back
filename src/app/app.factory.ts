import { INestApplication, ValidationPipe } from '@nestjs/common';

export class AppFactory {
  static createApp(app: INestApplication) {
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    return app;
  }
}
