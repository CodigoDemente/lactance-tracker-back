import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createMock } from '@golevelup/ts-jest';
import { AppModule } from '../src/app/app.module';
import { faker } from '@faker-js/faker';
import { AppFactory } from '../src/app/app.factory';
import { ConfigService } from '@nestjs/config';

describe('UserController (e2e)', () => {
  let app: INestApplication;

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
  });

  describe('/api/v1/users (POST)', () => {
    it('should return 201 when creating a user', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);
    });

    it('should return 400 when creating a user with an existing email', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with an existing username', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with an invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with an invalid username', async () => {
      const userData = {
        email: faker.internet.email(),
        username: 'invalid username',
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with an invalid password', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: 'short',
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with a username longer than 64 characters', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.string.alpha({ length: 65 }),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 whe creating a user with a username shorter than 4 characters', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.string.alpha({ length: 3 }),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with a password shorter than 8 characters', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password({ length: 7 }),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with a password longer than 128 characters', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password({ length: 129 }),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with a missing email', async () => {
      const userData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with a missing username', async () => {
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when creating a user with a missing password', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });

    it('should be able to login after creating a user', async () => {
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userData)
        .expect(201);
    });
  });
});
