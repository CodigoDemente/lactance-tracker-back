import { Test, TestingModule } from '@nestjs/testing';
import { MealService } from './meal.service';
import { DateTime } from 'luxon';
import { ChildModule } from '../child/child.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from '../child/child.entity';
import { ChildService } from '../child/child.service';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';
import { ChildDoesNotExists } from '../child/errors/ChildDoesNotExists';
import { Meal } from './meal.entity';
import { MealDoesNotExists } from './errors/MealDoesNotExists';

describe('MealService', () => {
  let service: MealService;
  let child: Child;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Meal, Child, User]),
        UserModule,
        ChildModule,
      ],
      providers: [MealService],
    }).compile();

    service = module.get<MealService>(MealService);
    const childService = module.get<ChildService>(ChildService);
    const userService = module.get<UserService>(UserService);

    const user = await userService.create({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    const childId = await childService.createChild({
      parentId: user.id,
      name: faker.person.firstName(),
    });

    child = (await childService.getChildById(childId)) as Child;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a meal without requiring a date', async () => {
    const mealId = await service.addMeal({
      type: 'breast',
      childId: child.id,
    });

    expect(mealId).toBeDefined();
  });

  it('should return the id of the created meal', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    expect(mealId).toBeDefined();
  });

  it('should get a meal by id', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const foundMeal = await service.getMealById(mealId);

    expect(foundMeal?.id).toEqual(mealId);
  });

  it('should create a meal with a date', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date: DateTime.fromISO('2021-01-01').toUTC(),
    });

    expect(mealId).toBeDefined();
  });

  it('should create a meal with supplied type', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    expect(meal?.type).toBe('bottle');
  });

  it('should create a meal with supplied childId', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    expect(meal?.childId).toBe(child.id);
  });

  it('should create a meal with the date supplied', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date: DateTime.fromISO('2021-01-01').toUTC(),
    });

    const meal = await service.getMealById(mealId);

    expect(meal?.date).toEqual(DateTime.fromISO('2021-01-01').toUTC());
  });

  it('should create a meal with the current date if no date is supplied', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    expect(meal?.date).toEqual(DateTime.utc().startOf('minute'));
  });

  it('should create a meal with minute precision for the date', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    expect(meal?.date.get('second')).toBe(0);
  });

  it('should create a meal with the date with minute precision if supplied', async () => {
    const date = DateTime.fromISO('2021-01-01T12:34:56').toUTC();

    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date,
    });

    const meal = await service.getMealById(mealId);

    expect(meal?.date).toEqual(date.startOf('minute'));
  });

  it('should create meals with unique ids', async () => {
    const meal1Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal2Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    expect(meal1Id).not.toEqual(meal2Id);
  });

  it('should throw an error if child does not exists', () => {
    return expect(
      service.addMeal({
        type: 'bottle',
        childId: faker.string.uuid(),
      }),
    ).rejects.toThrow(ChildDoesNotExists);
  });

  it('should get a meal by id', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const foundMeal = await service.getMealById(mealId);

    expect(foundMeal?.id).toEqual(mealId);
  });

  it('should return null if meal does not exists', async () => {
    const foundMeal = await service.getMealById(faker.string.uuid());

    expect(foundMeal).toBeNull();
  });

  it('should return all meals for a child', async () => {
    const meal1Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal2Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meals = (await service.getMealsForChild(child.id)).map(
      (meal) => meal.id,
    );

    expect(meals).toContainEqual(meal1Id);
    expect(meals).toContainEqual(meal2Id);
  });

  it('should throw error if child does not exists', async () => {
    await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    return expect(
      service.getMealsForChild(faker.string.uuid()),
    ).rejects.toThrow(ChildDoesNotExists);
  });

  it('should return meals for a child in inverse chronological order', async () => {
    const meal1Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date: DateTime.fromISO('2021-01-01T12:00:00').toUTC(),
    });

    const meal2Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date: DateTime.fromISO('2021-01-01T12:30:00').toUTC(),
    });

    const meal3Id = await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date: DateTime.fromISO('2021-01-01T12:15:00').toUTC(),
    });

    const meals = await service.getMealsForChild(child.id);

    expect(meals[0].id).toEqual(meal2Id);
    expect(meals[1].id).toEqual(meal3Id);
    expect(meals[2].id).toEqual(meal1Id);
  });

  it('should return meals for a child with minute precision', async () => {
    await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meals = await service.getMealsForChild(child.id);

    expect(meals[0].date.get('second')).toBe(0);
  });

  it('should return meals for a child with the date with minute precision', async () => {
    const date = DateTime.fromISO('2021-01-01T12:34:56').toUTC();

    await service.addMeal({
      type: 'bottle',
      childId: child.id,
      date,
    });

    const meals = await service.getMealsForChild(child.id);

    expect(meals[0].date).toEqual(date.startOf('minute'));
  });

  it('should edit a meal type', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    await service.editMeal({
      id: mealId,
      type: 'breast',
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.type).toBe('breast');
  });

  it('should throw an error if meal does not exists', () => {
    return expect(
      service.editMeal({
        id: faker.string.uuid(),
        type: 'bottle',
      }),
    ).rejects.toThrow(MealDoesNotExists);
  });

  it('should edit a meal date', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    await service.editMeal({
      id: mealId,
      type: 'bottle',
      date: DateTime.fromISO('2021-01-01').toUTC(),
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.date).toEqual(DateTime.fromISO('2021-01-01').toUTC());
  });

  it('should keep minute precision when editing a meal date', async () => {
    const newDate = DateTime.fromISO('2021-01-01T12:34:56').toUTC();
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    await service.editMeal({
      id: mealId,
      date: newDate,
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.date).toEqual(newDate.startOf('minute'));
  });

  it('should not change the date if not supplied', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    await service.editMeal({
      id: mealId,
      type: 'bottle',
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.date).toEqual(meal?.date);
  });

  it('should not change the type if not supplied', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    await service.editMeal({
      id: mealId,
      date: DateTime.fromISO('2021-01-01').toUTC(),
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.type).toEqual(meal?.type);
  });

  it('should not change the meal if no changes are supplied', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    const meal = await service.getMealById(mealId);

    await service.editMeal({
      id: mealId,
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.type).toEqual(meal?.type);
    expect(editedMeal?.date).toEqual(meal?.date);
  });

  it('should edit a meal size', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    await service.editMeal({
      id: mealId,
      type: 'bottle',
      size: 's',
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.size).toBe('s');
  });

  it('should not change the size if not supplied', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    await service.editMeal({
      id: mealId,
      size: 's',
    });

    const meal = await service.getMealById(mealId);

    await service.editMeal({
      id: mealId,
      type: 'bottle',
      date: DateTime.fromISO('2021-01-01').toUTC(),
    });

    const editedMeal = await service.getMealById(mealId);

    expect(editedMeal?.size).toEqual(meal?.size);
  });

  it('should delete a meal', async () => {
    const mealId = await service.addMeal({
      type: 'bottle',
      childId: child.id,
    });

    await service.deleteMeal(mealId);

    const foundMeal = await service.getMealById(mealId);

    expect(foundMeal).toBeNull();
  });

  it('should not throw an error if meal does not exists', () => {
    return expect(
      service.deleteMeal(faker.string.uuid()),
    ).resolves.not.toThrow();
  });
});
