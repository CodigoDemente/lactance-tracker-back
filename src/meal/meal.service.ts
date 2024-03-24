import { Injectable } from '@nestjs/common';
import { CreateMealDto, EditMealDto } from './meal.dto';
import { Meal } from './meal.entity';
import { DateTime } from 'luxon';
import { ChildService } from '../child/child.service';
import { ChildDoesNotExists } from '../child/errors/ChildDoesNotExists';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealDoesNotExists } from './errors/MealDoesNotExists';

@Injectable()
export class MealService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    private readonly childService: ChildService,
  ) {}

  async addMeal(mealDto: CreateMealDto): Promise<string> {
    const child = await this.childService.getChildById(mealDto.childId);

    if (!child) {
      throw new ChildDoesNotExists();
    }

    const meal = new Meal();

    meal.type = mealDto.type;
    meal.child = Promise.resolve(child);
    meal.date = mealDto.date || DateTime.utc();

    await this.mealRepository.insert(meal);

    return meal.id;
  }

  async getMealById(id: string): Promise<Meal | null> {
    return await this.mealRepository.findOneBy({ id });
  }

  async getMealsForChild(childId: string): Promise<Meal[]> {
    const child = await this.childService.getChildById(childId);

    if (!child) {
      throw new ChildDoesNotExists();
    }

    return await this.mealRepository.find({
      where: {
        child: {
          id: child.id,
        },
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async editMeal(editMealDto: EditMealDto): Promise<void> {
    const meal = await this.getMealById(editMealDto.id);

    if (!meal) {
      throw new MealDoesNotExists();
    }

    const newEntity: Partial<Meal> = {};

    if (editMealDto.type) {
      newEntity['type'] = editMealDto.type;
    }

    if (editMealDto.date) {
      newEntity['date'] = editMealDto.date;
    }

    await this.mealRepository.update(meal.id, newEntity);
  }

  async deleteMeal(id: string): Promise<void> {
    await this.mealRepository.delete(id);
  }
}
