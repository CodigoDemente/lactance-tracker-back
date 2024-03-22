import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ChildService } from '../child.service';
import { RequestData } from '../../app/types/Request.type';

@Injectable()
export class HasAccessToChildGuardGuard implements CanActivate {
  constructor(private readonly childService: ChildService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as RequestData;
    const user = request.user;
    const childId = request.params.childId;

    const child = await this.childService.getChildById(childId);

    return child?.parentId === user.id;
  }
}
