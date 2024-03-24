import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ChildService } from '../child.service';
import { RequestData } from '../../app/types/Request.type';
import { ChildDoesNotExists } from '../errors/ChildDoesNotExists';

@Injectable()
export class HasAccessToChildGuardGuard implements CanActivate {
  constructor(private readonly childService: ChildService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as RequestData;
    const user = request.user;
    const childId = request.params.childId;
    const parentId = request.params.parentId;

    if (!user || !childId) {
      return false;
    }

    if (parentId && user.id !== parentId) {
      return false;
    }

    const child = await this.childService.getChildById(childId);

    if (!child || child.parentId !== user.id) {
      throw new ChildDoesNotExists();
    }

    return true;
  }
}
