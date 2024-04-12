import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createMock } from '@golevelup/ts-jest';
import { AppModule } from '../src/app/app.module';
import { faker } from '@faker-js/faker';
import { AppFactory } from '../src/app/app.factory';
import { ConfigService } from '@nestjs/config';

describe('ChildController (e2e)', () => {
  let app: INestApplication;
  const userData = {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };
  let token: string;
  let userId: string;

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
  });

  describe('/api/v1/parents/:parentId/children (POST)', () => {
    it('should return 201 when creating a child', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData)
        .expect(201);
    });

    it('should return 400 when creating a child with an invalid name', async () => {
      const childData = {
        name: '',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData)
        .expect(400);
    });

    it('should return 401 when creating a child without logging in', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .send(childData)
        .expect(401);
    });

    it('should return 403 when creating a child for another parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .post(`/api/v1/parents/${faker.string.uuid()}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData)
        .expect(403);
    });

    it('should return 403 when creating a child for a non-existing parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .post(`/api/v1/parents/${faker.string.uuid()}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData)
        .expect(403);
    });
  });

  describe('/api/v1/parents/:parentId/children/:childId (PATCH)', () => {
    it('should return 200 when editing a child', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      const editedChildData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .patch(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(editedChildData)
        .expect(200);
    });

    it('should return 400 when editing a child with an invalid name', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      const editedChildData = {
        name: '',
      };

      await request(app.getHttpServer())
        .patch(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(editedChildData)
        .expect(400);
    });

    it('should return 401 when editing a child without logging in', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      const editedChildData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .patch(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .send(editedChildData)
        .expect(401);
    });

    it('should return 403 when editing a child for another parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      const editedChildData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .patch(
          `/api/v1/parents/${faker.string.uuid()}/children/${childResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .send(editedChildData)
        .expect(403);
    });

    it('should return 403 when editing a child the parent does not own', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      const editedChildData = {
        name: faker.person.firstName(),
      };

      // Create another user
      const anotherUser = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer()).post('/api/v1/users').send({
        email: anotherUser.email,
        username: anotherUser.username,
        password: anotherUser.password,
      });

      // Login
      const anotherLoginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: anotherUser.username,
          password: anotherUser.password,
        });

      const newToken = anotherLoginResponse.body.access_token;

      await request(app.getHttpServer())
        .patch(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .set('Authorization', `Bearer ${newToken}`)
        .send(editedChildData)
        .expect(403);
    });

    it('should return 403 when editing a child for a non-existing parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      const editedChildData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .patch(
          `/api/v1/parents/${faker.string.uuid()}/children/${childResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .send(editedChildData)
        .expect(403);
    });

    it('should return 404 when editing a non-existing child', async () => {
      const editedChildData = {
        name: faker.person.firstName(),
      };

      await request(app.getHttpServer())
        .patch(`/api/v1/parents/${userId}/children/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .send(editedChildData)
        .expect(404);
    });
  });

  describe('/api/v1/parents/:parentId/children/:childId (GET)', () => {
    it('should return 200 when getting a child', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .get(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 when getting a child without logging in', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .get(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .expect(401);
    });

    it('should return 403 when getting a child for another parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .get(
          `/api/v1/parents/${faker.string.uuid()}/children/${childResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 403 when getting a child for a non-existing parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .get(
          `/api/v1/parents/${faker.string.uuid()}/children/${childResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 when getting a non-existing child', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/parents/${userId}/children/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('/api/v1/parents/:parentId/children/:childId (DELETE)', () => {
    it('should return 200 when deleting a child', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .delete(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 when deleting a child without logging in', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .delete(`/api/v1/parents/${userId}/children/${childResponse.body.id}`)
        .expect(401);
    });

    it('should return 403 when deleting a child for another parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .delete(
          `/api/v1/parents/${faker.string.uuid()}/children/${childResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 403 when deleting a child for a non-existing parent', async () => {
      const childData = {
        name: faker.person.firstName(),
      };

      const childResponse = await request(app.getHttpServer())
        .post(`/api/v1/parents/${userId}/children`)
        .set('Authorization', `Bearer ${token}`)
        .send(childData);

      await request(app.getHttpServer())
        .delete(
          `/api/v1/parents/${faker.string.uuid()}/children/${childResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 when deleting a non-existing child', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/parents/${userId}/children/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
