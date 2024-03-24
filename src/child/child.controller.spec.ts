import { Test, TestingModule } from '@nestjs/testing';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Child } from './child.entity';
import { UserService } from '../user/user.service';
import { stubChild } from '../mocks/child.mock';
import { ChildDoesNotExists } from './errors/ChildDoesNotExists';
import { stubJWTUser } from '../mocks/user.mock';

describe('ChildController', () => {
  let controller: ChildController;
  let service: ChildService;
  const mockJWTUser = stubJWTUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildController],
      providers: [
        ChildService,
        {
          provide: getRepositoryToken(Child),
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ChildController>(ChildController);
    service = module.get<ChildService>(ChildService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new child', async () => {
    const createChildSpy = jest
      .spyOn(service, 'createChild')
      .mockResolvedValueOnce('');

    await controller.createChild(
      {
        user: mockJWTUser,
        params: {},
      },
      {
        name: 'John',
      },
    );

    expect(createChildSpy).toHaveBeenCalledWith({
      parentId: mockJWTUser.id,
      name: 'John',
    });
  });

  it('should return the id of the created child', async () => {
    jest.spyOn(service, 'createChild').mockResolvedValueOnce('1');

    const childId = await controller.createChild(
      {
        user: mockJWTUser,
        params: {},
      },
      {
        name: 'John',
      },
    );

    expect(childId).toEqual({ id: '1' });
  });

  it('should get a child by id', async () => {
    const getChildByIdSpy = jest
      .spyOn(service, 'getChildById')
      .mockResolvedValueOnce({} as Child);

    await controller.getChildById('1');

    expect(getChildByIdSpy).toHaveBeenCalledWith('1');
  });

  it('should return child in correct format', async () => {
    const child = stubChild();

    jest.spyOn(service, 'getChildById').mockResolvedValueOnce(child);

    const returnedChild = await controller.getChildById('1');

    expect(returnedChild).toEqual({
      id: child.id,
      name: child.name,
      parentId: child.parentId,
    });
  });

  it('should get children by parent id', async () => {
    const getChildrenByParentIdSpy = jest
      .spyOn(service, 'getChildrenByParentId')
      .mockResolvedValueOnce([stubChild()]);

    await controller.getChildrenByParentId({
      user: mockJWTUser,
      params: {},
    });

    expect(getChildrenByParentIdSpy).toHaveBeenCalledWith(mockJWTUser.id);
  });

  it('should throw error if child does not exist', async () => {
    jest.spyOn(service, 'getChildById').mockResolvedValueOnce(null);

    await expect(controller.getChildById('1')).rejects.toThrow(
      ChildDoesNotExists,
    );
  });

  it('should return children in correct format', async () => {
    const children = [stubChild()];

    jest
      .spyOn(service, 'getChildrenByParentId')
      .mockResolvedValueOnce(children);

    const returnedChildren = await controller.getChildrenByParentId({
      user: mockJWTUser,
      params: {},
    });

    expect(returnedChildren).toEqual(
      children.map((child) => ({
        id: child.id,
        name: child.name,
        parentId: child.parentId,
      })),
    );
  });

  it('should edit a child', async () => {
    const editChildSpy = jest
      .spyOn(service, 'editChild')
      .mockResolvedValueOnce();

    await controller.editChild('1', {
      name: 'John',
    });

    expect(editChildSpy).toHaveBeenCalledWith({
      id: '1',
      name: 'John',
    });
  });

  it('should delete a child', async () => {
    const deleteChildSpy = jest
      .spyOn(service, 'deleteChild')
      .mockResolvedValueOnce();

    await controller.deleteChild('1');

    expect(deleteChildSpy).toHaveBeenCalledWith('1');
  });
});
