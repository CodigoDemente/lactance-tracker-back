import { APIUser } from './types/APIUser';
import { User } from './user.entity';

export class UserMapper {
  static toInfrasctructure(user: User): APIUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
