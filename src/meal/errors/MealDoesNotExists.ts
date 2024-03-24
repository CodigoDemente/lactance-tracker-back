import { NotFoundException } from '@nestjs/common';

export class MealDoesNotExists extends NotFoundException {
  constructor() {
    super({
      message: 'Meal does not exists',
      code: 'meal-does-not-exists',
    });
  }
}
