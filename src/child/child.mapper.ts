import { Child } from './child.entity';
import { APIChild } from './types/APIChild';

export class ChildMapper {
  static toInfrasctructure(child: Child): APIChild {
    return {
      id: child.id,
      name: child.name,
      parentId: child.parentId,
    };
  }
}
