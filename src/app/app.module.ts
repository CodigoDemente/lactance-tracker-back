import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChildModule } from '../child/child.module';
import { MealModule } from '../meal/meal.module';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      skipIf: () => process.env?.NODE_ENV !== 'production',
      throttlers: [
        {
          ttl: 1000,
          limit: 10,
        },
      ],
    }),
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

        return options;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const type: 'postgres' | 'sqlite' =
          configService.get('DATABASE_TYPE') || 'sqlite';

        if (type === 'postgres') {
          return {
            type,
            host: configService.get('DATABASE_HOST'),
            port: configService.get('DATABASE_PORT'),
            username: configService.get('DATABASE_USER'),
            password: configService.get('DATABASE_PASSWORD'),
            database: configService.get('DATABASE'),
            autoLoadEntities: true,
            synchronize: true,
          };
        } else {
          return {
            type,
            database: configService.get('DATABASE'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }
      },
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
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
