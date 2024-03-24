import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestData } from '../../app/types/Request.type';

@Injectable()
export class UserIsSameAsLoggedGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as RequestData;
    const user = request.user;
    const parentId = request.params.parentId;

    if (!user || !parentId) {
      return false;
    }

    return user.id === parentId;
  }
}
