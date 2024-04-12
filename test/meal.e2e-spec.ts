import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createMock } from '@golevelup/ts-jest';
import { AppModule } from '../src/app/app.module';
import { faker } from '@faker-js/faker';
import { AppFactory } from '../src/app/app.factory';
import { ConfigService } from '@nestjs/config';

describe('MealController (e2e)', () => {
  let app: INestApplication;
  const userData = {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };
  let token: string;
  let userId: string;
  let childId: string;

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

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: userData.username,
        password: userData.password,
      });

    token = loginResponse.body.access_token;

    const userProfile = await request(app.getHttpServer())
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`);

    userId = userProfile.body.id;

    // Create a child
    const childResponse = await request(app.getHttpServer())
      .post(`/api/v1/parents/${userId}/children`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'child-name',
      });

    childId = childResponse.body.id;
  });

  describe('/api/v1/children/:childId/meals (POST)', () => {
    it('should create a meal', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        })
        .expect(201);
    });

    it('should return id of the created meal', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      expect(response.body).toHaveProperty('id');
    });

    it('should create a meal with date', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
          date: '2022-01-01T00:00:00.000Z',
        })
        .expect(201);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .send({
          type: 'breast',
        })
        .expect(401);
    });

    it('should return 400 when type is not provided', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when type is not valid', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid',
        })
        .expect(400);
    });

    it('should return 404 when child does not exist', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/children/invalid/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        })
        .expect(404);
    });

    it('should return 404 when user does not have access to the child', async () => {
      const newUserData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      // Create a new user
      await request(app.getHttpServer()).post('/api/v1/users').send({
        email: newUserData.email,
        username: newUserData.username,
        password: newUserData.password,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: newUserData.username,
          password: newUserData.password,
        });

      const newToken = loginResponse.body.access_token;

      return request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          type: 'breast',
        })
        .expect(404);
    });
  });

  describe('/api/v1/children/:childId/meals/:mealId (GET)', () => {
    it('should return a meal', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 when not authenticated', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals/${mealId}`)
        .expect(401);
    });

    it('should return bad request when id is not an uuid', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals/invalid`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should return 404 when meal does not exist', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/children/${childId}/meals/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 when child does not exist', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/children/invalid/meals/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 when user does not have access to the child', async () => {
      const newUserData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      // Create a new user
      await request(app.getHttpServer()).post('/api/v1/users').send({
        email: newUserData.email,
        username: newUserData.username,
        password: newUserData.password,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: newUserData.username,
          password: newUserData.password,
        });

      const newToken = loginResponse.body.access_token;

      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${newToken}`)
        .expect(404);
    });
  });

  describe('/api/v1/children/:childId/meals (GET)', () => {
    it('should return meals for a child', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should edit date of a meal', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2022-01-01T00:00:00.000Z',
        })
        .expect(200);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals`)
        .expect(401);
    });

    it('should return 404 when child does not exist', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/children/00000000-0000-0000-0000-000000000000/meals`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 when user does not have access to the child', async () => {
      const newUserData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      // Create a new user
      await request(app.getHttpServer()).post('/api/v1/users').send({
        email: newUserData.email,
        username: newUserData.username,
        password: newUserData.password,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: newUserData.username,
          password: newUserData.password,
        });

      const newToken = loginResponse.body.access_token;

      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${newToken}`)
        .expect(404);
    });

    it('should return meals for a child in descending order', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bottle',
        });

      const mealId = mealResponse.body.id;

      const mealsResponse = await request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`);

      expect(mealsResponse.body[0].id).toBe(mealId);
    });
  });

  describe('/api/v1/children/:childId/meals/:mealId (PATCH)', () => {
    it('should edit a meal', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bottle',
        })
        .expect(200);
    });

    it('should return 401 when not authenticated', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${mealId}`)
        .send({
          type: 'bottle',
        })
        .expect(401);
    });

    it('should return 400 when type is not valid', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid',
        })
        .expect(400);
    });

    it('should return 404 when child does not exist', () => {
      return request(app.getHttpServer())
        .patch(
          `/api/v1/children/${faker.string.uuid()}/meals/${faker.string.uuid()}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 when user does not have access to the child', async () => {
      const newUserData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      // Create a new user
      await request(app.getHttpServer()).post('/api/v1/users').send({
        email: newUserData.email,
        username: newUserData.username,
        password: newUserData.password,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: newUserData.username,
          password: newUserData.password,
        });

      const newToken = loginResponse.body.access_token;

      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          type: 'bottle',
        })
        .expect(404);
    });

    it('should return 404 when meal does not exist', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bottle',
        })
        .expect(404);
    });

    it('should return 400 when neither type nor date is provided', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });
  });

  describe('/api/v1/children/:childId/meals/:mealId (DELETE)', () => {
    it('should delete a meal', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 when not authenticated', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}/meals/${mealId}`)
        .expect(401);
    });

    it('should return 404 when child does not exist', () => {
      return request(app.getHttpServer())
        .delete(
          `/api/v1/children/${faker.string.uuid()}/meals/${faker.string.uuid()}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 when user does not have access to the child', async () => {
      const newUserData = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      // Create a new user
      await request(app.getHttpServer()).post('/api/v1/users').send({
        email: newUserData.email,
        username: newUserData.username,
        password: newUserData.password,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: newUserData.username,
          password: newUserData.password,
        });

      const newToken = loginResponse.body.access_token;

      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${newToken}`)
        .expect(404);
    });

    it('should return 404 when meal does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}/meals/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 400 when id is not an uuid', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}/meals/invalid`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should return 404 when getting a meal after deleting it', async () => {
      const mealResponse = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/meals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'breast',
        });

      const mealId = mealResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`);

      return request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/meals/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
