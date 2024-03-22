import { BadRequestException } from '@nestjs/common';

export class UserAlereadyExists extends BadRequestException {
  constructor() {
    super({
      code: 'user-already-exists',
      message: 'User already exists',
    });
  }
}
