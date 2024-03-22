import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './user.dto';
import { UserAlereadyExists } from './errors/UserAlreadyExists';
import { CryptoModule } from '../crypto/crypto.module';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        CryptoModule,
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const user = await service.create(newUser);

    expect(user).toBeDefined();
    expect(user.username).toBe(newUser.username);
    expect(user.email).toBe(newUser.email);
  });

  it('should create a user with hashed password', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const user = await service.create(newUser);

    expect(user).toBeDefined();
    expect(user.password).not.toBe(newUser.password);
  });

  it('should not create a user if it already exists', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await service.create(newUser);

    try {
      await service.create(newUser);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(UserAlereadyExists);
    }
  });

  it('should find a user by id', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const user = await service.create(newUser);

    const foundUser = await service.findById(user.id);

    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(user.id);
  });

  it('should find a user by username', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const user = await service.create(newUser);

    const foundUser = await service.findByUsername(user.username);

    expect(foundUser).toBeDefined();
    expect(foundUser?.username).toBe(user.username);
  });

  it('should return false if username does not exist', async () => {
    const username = faker.internet.userName();

    const foundUserName = await service.usernameExists(username);

    expect(foundUserName).toBeFalsy();
  });

  it('should return true if username exists', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await service.create(newUser);

    const foundUserName = await service.usernameExists(newUser.username);

    expect(foundUserName).toBeTruthy();
  });

  it('should return false if email does not exist', async () => {
    const email = faker.internet.email();

    const foundEmail = await service.emailExists(email);

    expect(foundEmail).toBeFalsy();
  });

  it('should return true if email exists', async () => {
    const newUser: CreateUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await service.create(newUser);

    const foundEmail = await service.emailExists(newUser.email);

    expect(foundEmail).toBeTruthy();
  });
});
