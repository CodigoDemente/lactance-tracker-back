import { NotFoundException } from '@nestjs/common';

export class ChildDoesNotExists extends NotFoundException {
  constructor() {
    super({
      code: 'child-does-not-exists',
      message: 'Child does not exists',
    });
  }
}
