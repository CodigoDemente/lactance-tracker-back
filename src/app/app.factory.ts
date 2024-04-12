import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

export class AppFactory {
  static createApp(app: INestApplication) {
    app.use(helmet());
    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());

    app.setGlobalPrefix('api/v1');

    const config = new DocumentBuilder()
      .setTitle('Lactance Tracker API')
      .setDescription(
        'The API for tracking lactance of a baby or set of babies.',
      )
      .setVersion('1.0')
      .addTag('auth')
      .addTag('children')
      .addTag('meals')
      .addTag('users')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    return app;
  }
}
