import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { ChildModule } from '../child/child.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './meal.entity';
import { MealController } from './meal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Meal]), ChildModule],
  providers: [MealService],
  controllers: [MealController],
})
export class MealModule {}
