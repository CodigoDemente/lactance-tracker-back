import { faker } from '@faker-js/faker';
import { JWTUser } from '../user/types/JWTUser';

export function stubJWTUser(): JWTUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  };
}
