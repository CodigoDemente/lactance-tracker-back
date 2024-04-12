import { Test, TestingModule } from '@nestjs/testing';
import { ChildService } from './child.service';
import { faker } from '@faker-js/faker';
import { UserDoesNotExists } from '../user/errors/UserDoesNotExists';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './child.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChildDoesNotExists } from './errors/ChildDoesNotExists';

describe('ChildService', () => {
  let service: ChildService;
  let parent: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Child]),
        UserModule,
      ],
      providers: [ChildService],
    }).compile();

    service = module.get<ChildService>(ChildService);

    const userService = module.get<UserService>(UserService);

    parent = await userService.create({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new child', async () => {
    const name = faker.person.firstName();

    const child = await service.createChild({
      parentId: parent.id,
      name,
    });

    expect(child).toBeDefined();
  });

  it('should return the created child id', async () => {
    const name = faker.person.firstName();

    const childId = await service.createChild({
      parentId: parent.id,
      name,
    });

    expect(childId).toBeDefined();
  });

  it('should not create a child without a parent', () => {
    const name = faker.person.firstName();

    return expect(
      service.createChild({
        parentId: '',
        name,
      }),
    ).rejects.toThrow(UserDoesNotExists);
  });

  it('should return a child by id', async () => {
    const name = faker.person.firstName();

    const childId = await service.createChild({
      parentId: parent.id,
      name,
    });

    const foundChild = await service.getChildById(childId);

    expect(foundChild?.id).toBe(childId);
  });

  it('should return null if child does not exist', async () => {
    const id = faker.string.uuid();

    const foundChild = await service.getChildById(id);

    expect(foundChild).toBeNull();
  });

  it('should create a new child with the correct parent id', async () => {
    const name = faker.person.firstName();

    const childId = await service.createChild({
      parentId: parent.id,
      name,
    });

    const createdChild = await service.getChildById(childId);

    expect(createdChild?.parentId).toBe(parent.id);
  });

  it('should not create a child whith parent that does not exist', () => {
    const name = faker.person.firstName();

    return expect(
      service.createChild({
        parentId: faker.string.uuid(),
        name,
      }),
    ).rejects.toThrow(UserDoesNotExists);
  });

  it('should create a new child with a unique id', async () => {
    const name = faker.person.firstName();

    const child1Id = await service.createChild({
      parentId: parent.id,
      name,
    });
    const child2Id = await service.createChild({
      parentId: parent.id,
      name,
    });

    expect(child1Id).not.toBe(child2Id);
  });

  it("should edit a child's name", async () => {
    const name = faker.person.firstName();
    const newName = faker.person.firstName();

    const childId = await service.createChild({
      parentId: parent.id,
      name,
    });

    await service.editChild({
      id: childId,
      name: newName,
    });

    const foundChild = await service.getChildById(childId);

    expect(foundChild?.name).toBe(newName);
  });

  it('should throw an error if child does not exist', async () => {
    const id = faker.string.uuid();
    const name = faker.person.firstName();

    expect(
      service.editChild({
        id,
        name,
      }),
    ).rejects.toThrow(ChildDoesNotExists);
  });

  it('should not update the child if it does not exist', async () => {
    const id = faker.string.uuid();
    const name = faker.person.firstName();

    try {
      await service.editChild({
        id,
        name,
      });
    } catch (error) {}

    const foundChild = await service.getChildById(id);

    expect(foundChild).toBeNull();
  });

  it('should return list of children in the correct format', async () => {
    const name = faker.person.firstName();

    await service.createChild({
      parentId: parent.id,
      name,
    });

    const children = await service.getChildrenByParentId(parent.id);

    expect(children).toMatchObject({
      page: expect.any(Number),
      total: expect.any(Number),
      items: expect.arrayContaining([
        {
          id: expect.any(String),
          name: expect.any(String),
          parentId: expect.any(String),
        },
      ]),
    });
  });

  it('should get all children of a parent', async () => {
    const name = faker.person.firstName();

    const child1Id = await service.createChild({
      parentId: parent.id,
      name,
    });

    const child2Id = await service.createChild({
      parentId: parent.id,
      name,
    });

    const children = (await service.getChildrenByParentId(parent.id)).items.map(
      (c) => c.id,
    );

    expect(children).toContainEqual(child1Id);
    expect(children).toContainEqual(child2Id);
  });

  it('should not return children of a parent that does not exist', async () => {
    const name = faker.person.firstName();

    await service.createChild({
      parentId: parent.id,
      name,
    });

    const children = await service.getChildrenByParentId(faker.string.uuid());

    expect(children.items).toHaveLength(0);
  });

  it('should delete a child', async () => {
    const name = faker.person.firstName();

    const childId = await service.createChild({
      parentId: parent.id,
      name,
    });

    await service.deleteChild(childId);

    const foundChild = await service.getChildById(childId);

    expect(foundChild).toBeNull();
  });

  it('should not delete a child that does not exist', async () => {
    const id = faker.string.uuid();

    try {
      await service.deleteChild(id);
    } catch (error) {}

    const foundChild = await service.getChildById(id);

    expect(foundChild).toBeNull();
  });
});
