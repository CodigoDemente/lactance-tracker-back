import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { faker } from '@faker-js/faker';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: CryptoService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    controller = moduleRef.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return an object with an access_token property', async () => {
      const user = {
        id: faker.string.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
      };

      jest
        .spyOn(service, 'login')
        .mockResolvedValue({ access_token: faker.string.uuid() });

      const result = await controller.login({ user });

      expect(result).toHaveProperty('access_token');
    });
  });
});
