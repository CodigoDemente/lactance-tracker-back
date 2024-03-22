import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

@Injectable()
export class CryptoService {
  private SALT_ROUNDS = 10;

  async hashString(password: string): Promise<string> {
    const hashed = await hash(password, this.SALT_ROUNDS);

    return hashed;
  }

  async compareStringWithHash(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return compare(password, hash);
  }
}
