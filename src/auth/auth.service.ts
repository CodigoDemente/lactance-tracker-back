import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserMapper } from '../user/user.mapper';
import { APIUser } from '../user/types/APIUser';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUser(username: string, pass: string): Promise<APIUser | null> {
    const user = await this.userService.findByUsername(username);

    if (
      user &&
      (await this.cryptoService.compareStringWithHash(pass, user.password))
    ) {
      return UserMapper.toInfrasctructure(user);
    }

    return null;
  }

  async login(user: APIUser) {
    const payload = {
      username: user.username,
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
