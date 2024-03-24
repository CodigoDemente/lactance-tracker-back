import { Meal } from './meal.entity';
import { APIMeal } from './types/APIMeal';

export class MealMapper {
  static toInfrastructure(meal: Meal): APIMeal {
    return {
      id: meal.id,
      type: meal.type,
      childId: meal.childId,
      date: meal.date.toISO(),
    };
  }
}
