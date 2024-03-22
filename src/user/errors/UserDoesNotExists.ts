import { NotFoundException } from '@nestjs/common';

export class UserDoesNotExists extends NotFoundException {
  constructor() {
    super({
      code: 'user-not-exists',
      message: 'The user does not exists',
    });
  }
}
