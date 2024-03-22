import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { UserService } from '../user/user.service';
import { CryptoService } from '../crypto/crypto.service';
import { UserController } from './user.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CryptoService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    controller = moduleRef.get<UserController>(UserController);
  });

  describe('create', () => {
    it('should return a user', async () => {
      const createUserDto = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(createUserDto as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(createUserDto);
    });
  });

  describe('usernameExists', () => {
    it('should throw a NotFoundException', async () => {
      const username = faker.internet.userName();

      jest.spyOn(service, 'usernameExists').mockResolvedValue(false);

      await expect(controller.usernameExists(username)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not throw a NotFoundException', async () => {
      const username = faker.internet.userName();

      jest.spyOn(service, 'usernameExists').mockResolvedValue(true);

      await expect(controller.usernameExists(username)).resolves.not.toThrow();
    });
  });

  describe('emailExists', () => {
    it('should throw a NotFoundException', async () => {
      const email = faker.internet.email();

      jest.spyOn(service, 'emailExists').mockResolvedValue(false);

      await expect(controller.emailExists(email)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not throw a NotFoundException', async () => {
      const email = faker.internet.email();

      jest.spyOn(service, 'emailExists').mockResolvedValue(true);

      await expect(controller.emailExists(email)).resolves.not.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return a user', async () => {
      const user = {
        id: faker.string.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const req = { user };

      const result = await controller.getProfile(req as any);

      expect(result).toEqual(user);
    });
  });
});
