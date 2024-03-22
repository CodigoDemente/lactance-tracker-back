import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';
import { CryptoModule } from '../crypto/crypto.module';

describe('AuthService', () => {
  let service: AuthService;
  let user: User;
  const password = faker.internet.password();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CryptoModule,
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '60s' },
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        UserModule,
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    const userService = module.get<UserService>(UserService);

    user = await userService.create({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate a user', async () => {
    const result = await service.validateUser(user.username, password);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
  });

  it('should not validate a user', async () => {
    const result = await service.validateUser(user.username, 'wrong password');

    expect(result).toBeNull();
  });

  it('should not validate a user that does not exist', async () => {
    const result = await service.validateUser('unknown user', 'wrong password');

    expect(result).toBeNull();
  });

  it('should login a user', async () => {
    const result = await service.login({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    expect(result.access_token).toBeDefined();
  });

  it('should login a user regardless of the existence of the user', async () => {
    const result = await service.login({
      id: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
    });

    expect(result.access_token).toBeDefined();
  });
});
