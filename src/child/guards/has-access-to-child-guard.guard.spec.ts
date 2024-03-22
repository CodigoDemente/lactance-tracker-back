import { Repository } from 'typeorm';
import { ChildService } from '../child.service';
import { HasAccessToChildGuardGuard } from './has-access-to-child-guard.guard';
import { Child } from '../child.entity';
import { UserService } from '../../user/user.service';

describe('HasAccessToChildGuardGuard', () => {
  const childService = new ChildService(
    {} as Repository<Child>,
    {} as UserService,
  );

  it('should be defined', () => {
    expect(new HasAccessToChildGuardGuard(childService)).toBeDefined();
  });

  it('should return true if user in request has access to child', () => {
    const guard = new HasAccessToChildGuardGuard(childService);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: '1',
          },
          params: {
            childId: '1',
          },
        }),
      }),
    };

    jest.spyOn(childService, 'getChildById').mockResolvedValueOnce({
      parentId: '1',
    } as unknown as Child);

    expect(guard.canActivate(context as any)).resolves.toBe(true);
  });

  it('should return false if user in request does not have access to child', () => {
    const guard = new HasAccessToChildGuardGuard(childService);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: '1',
          },
          params: {
            childId: '1',
          },
        }),
      }),
    };

    jest.spyOn(childService, 'getChildById').mockResolvedValueOnce({
      parent: {
        id: '2',
      },
    } as unknown as Child);

    expect(guard.canActivate(context as any)).resolves.toBe(false);
  });

  it('should return false if child does not exist', () => {
    const guard = new HasAccessToChildGuardGuard(childService);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: '1',
          },
          params: {
            childId: '1',
          },
        }),
      }),
    };

    jest.spyOn(childService, 'getChildById').mockResolvedValueOnce(null);

    expect(guard.canActivate(context as any)).resolves.toBe(false);
  });
});
