import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Meal } from './meal.entity';
import { ChildService } from '../child/child.service';
import { DateTime } from 'luxon';
import { stubMeal } from '../mocks/meal.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MealDoesNotExists } from './errors/MealDoesNotExists';
import { ChildDoesNotExists } from '../child/errors/ChildDoesNotExists';

describe('MealController', () => {
  let controller: MealController;
  let service: MealService;
  const meal = stubMeal();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        MealService,
        {
          provide: getRepositoryToken(Meal),
          useValue: {},
        },
        {
          provide: ChildService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MealController>(MealController);
    service = module.get<MealService>(MealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a meal without requiring a date', async () => {
    const addMealSpy = jest
      .spyOn(service, 'addMeal')
      .mockResolvedValueOnce('1');

    await controller.addMeal('child-id', {
      type: 'breast',
    });

    expect(addMealSpy).toHaveBeenCalledWith({
      type: 'breast',
      childId: 'child-id',
    });
  });

  it('should create a meal with a date', async () => {
    const date = DateTime.utc();

    const addMealSpy = jest
      .spyOn(service, 'addMeal')
      .mockResolvedValueOnce('1');

    await controller.addMeal('child-id', {
      type: 'bottle',
      date,
    });

    expect(addMealSpy).toHaveBeenCalledWith({
      type: 'bottle',
      childId: 'child-id',
      date,
    });
  });

  it('should get a meal by id', async () => {
    const getMealByIdSpy = jest
      .spyOn(service, 'getMealById')
      .mockResolvedValueOnce(meal);

    await controller.getMealById('1');

    expect(getMealByIdSpy).toHaveBeenCalledWith('1');
  });

  it('should return meal in correct format', async () => {
    jest.spyOn(service, 'getMealById').mockResolvedValueOnce(meal);

    const returnedMeal = await controller.getMealById('1');

    expect(returnedMeal).toEqual({
      id: meal.id,
      type: meal.type,
      size: meal.size,
      date: meal.date.toISO(),
      childId: meal.childId,
    });
  });

  it('should return not found error if meal does not exists', () => {
    jest.spyOn(service, 'getMealById').mockResolvedValueOnce(null);

    return expect(controller.getMealById('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should edit a meal', async () => {
    const editMealSpy = jest.spyOn(service, 'editMeal').mockResolvedValueOnce();

    await controller.editMeal('1', {
      type: 'bottle',
    });

    expect(editMealSpy).toHaveBeenCalledWith({
      id: '1',
      type: 'bottle',
    });
  });

  it('should edit a meal with a date', async () => {
    const date = DateTime.utc();

    const editMealSpy = jest.spyOn(service, 'editMeal').mockResolvedValueOnce();

    await controller.editMeal('1', {
      date,
    });

    expect(editMealSpy).toHaveBeenCalledWith({
      id: '1',
      date,
    });
  });

  it('should edit meal with size', async () => {
    const editMealSpy = jest.spyOn(service, 'editMeal').mockResolvedValueOnce();

    await controller.editMeal('1', {
      size: 's',
    });

    expect(editMealSpy).toHaveBeenCalledWith({
      id: '1',
      size: 's',
    });
  });

  it('should throw bad request exception if no data is provided', async () => {
    return expect(controller.editMeal('1', {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return not found error if meal does not exists when editing', () => {
    jest
      .spyOn(service, 'getMealById')
      .mockRejectedValueOnce(new MealDoesNotExists());

    return expect(
      controller.editMeal('1', {
        type: 'bottle',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete a meal', async () => {
    jest.spyOn(service, 'getMealById').mockResolvedValueOnce(meal);

    const deleteMealSpy = jest
      .spyOn(service, 'deleteMeal')
      .mockResolvedValueOnce();

    await controller.deleteMeal('1');

    expect(deleteMealSpy).toHaveBeenCalledWith('1');
  });

  it('should return not found error if meal does not exists when deleting', () => {
    jest.spyOn(service, 'getMealById').mockResolvedValue(null);

    return expect(controller.deleteMeal('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get all meals for a child', async () => {
    const getMealsForChildSpy = jest
      .spyOn(service, 'getMealsForChild')
      .mockResolvedValueOnce([meal]);

    await controller.getMealsForChild('1');

    expect(getMealsForChildSpy).toHaveBeenCalledWith('1');
  });

  it('should return meals in correct format', async () => {
    jest.spyOn(service, 'getMealsForChild').mockResolvedValueOnce([meal]);

    const meals = await controller.getMealsForChild('1');

    expect(meals).toEqual([
      {
        id: meal.id,
        type: meal.type,
        date: meal.date.toISO(),
        childId: meal.childId,
        size: meal.size,
      },
    ]);
  });

  it('should return empty array if no meals are found', async () => {
    jest.spyOn(service, 'getMealsForChild').mockResolvedValueOnce([]);

    const meals = await controller.getMealsForChild('1');

    expect(meals).toEqual([]);
  });

  it('should return not found error if child does not exists when getting meals', () => {
    jest
      .spyOn(service, 'getMealsForChild')
      .mockRejectedValueOnce(new ChildDoesNotExists());

    return expect(controller.getMealsForChild('1')).rejects.toThrow(
      ChildDoesNotExists,
    );
  });
});
