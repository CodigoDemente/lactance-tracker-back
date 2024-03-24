import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChildModule } from '../child/child.module';
import { MealModule } from '../meal/meal.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const options: Record<string, unknown> = {
          pinoHttp: {
            customProps: () => ({
              context: 'HTTP',
            }),
          },
        };

        if (configService.get('NODE_ENV') !== 'production') {
          options['pinoHttp'] = {
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            },
          };
        }

        console.log(options);

        return options;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ChildModule,
    MealModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard, // Need to use useExisting instead of useClass for overriding it in tests
    },
    JwtAuthGuard,
  ],
})
export class AppModule {}
