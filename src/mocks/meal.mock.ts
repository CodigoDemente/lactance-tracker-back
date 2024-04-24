import { DateTime } from 'luxon';
import { Meal } from '../meal/meal.entity';

export function stubMeal(id?: string): Meal {
  const meal = new Meal();
  meal.id = id || '1';
  meal.type = 'bottle';
  meal.childId = '1';
  meal.size = 's';
  meal.date = DateTime.utc();
  meal.createdAt = DateTime.utc();
  meal.updatedAt = DateTime.utc();

  return meal;
}
