import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createMock } from '@golevelup/ts-jest';
import { AppModule } from '../src/app/app.module';
import { faker } from '@faker-js/faker';
import { AppFactory } from '../src/app/app.factory';
import { ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const userData = {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };

  beforeAll(async () => {
    const mockConfigService = createMock<ConfigService>();

    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'DATABASE') {
        return ':memory:';
      }

      return process.env[key];
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    app = AppFactory.createApp(moduleFixture.createNestApplication());
    await app.init();

    // Create a user
    await request(app.getHttpServer()).post('/api/v1/users').send({
      email: userData.email,
      username: userData.username,
      password: userData.password,
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should return 201 when login a valid user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userData)
        .expect(201);
    });

    it('should return an access toke when login a valid user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should return 401 when login an invalid user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(401);
    });
  });
});
