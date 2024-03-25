import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealAPIDto, EditMealAPIDto } from './meal.dto';
import { MealMapper } from './meal.mapper';
import { MealDoesNotExists } from './errors/MealDoesNotExists';
import { HasAccessToChildGuardGuard } from '../child/guards/has-access-to-child-guard.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('/childs/:childId/meals')
@ApiTags('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('/:mealId')
  @UseGuards(HasAccessToChildGuardGuard)
  async getMealById(@Param('mealId', ParseUUIDPipe) mealId: string) {
    const meal = await this.mealService.getMealById(mealId);

    if (!meal) {
      throw new MealDoesNotExists();
    }

    return MealMapper.toInfrastructure(meal);
  }

  @Get()
  @UseGuards(HasAccessToChildGuardGuard)
  async getMealsForChild(@Param('childId', ParseUUIDPipe) childId: string) {
    const meals = await this.mealService.getMealsForChild(childId);

    return meals.map(MealMapper.toInfrastructure);
  }

  @Post()
  @UseGuards(HasAccessToChildGuardGuard)
  async addMeal(
    @Param('childId') childId: string,
    @Body() createMealDto: CreateMealAPIDto,
  ) {
    const mealId = await this.mealService.addMeal({
      ...createMealDto,
      childId,
    });

    return { id: mealId };
  }

  @Patch('/:mealId')
  @UseGuards(HasAccessToChildGuardGuard)
  async editMeal(
    @Param('mealId', ParseUUIDPipe) mealId: string,
    @Body() createMealDto: EditMealAPIDto,
  ) {
    if (createMealDto.type || createMealDto.date) {
      return await this.mealService.editMeal({
        id: mealId,
        date: createMealDto.date,
        type: createMealDto.type,
      });
    } else {
      throw new BadRequestException({
        code: 'empty-payload',
        message: 'Either type or date must be provided to edit meal',
      });
    }
  }

  @Delete('/:mealId')
  @UseGuards(HasAccessToChildGuardGuard)
  async deleteMeal(@Param('mealId', ParseUUIDPipe) mealId: string) {
    const meal = await this.mealService.getMealById(mealId);

    if (!meal) {
      throw new MealDoesNotExists();
    }

    await this.mealService.deleteMeal(mealId);
  }
}
