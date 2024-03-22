import { Child } from '../child/child.entity';

export function stubChild(id?: string): Child {
  const child = new Child();
  child.id = id || '1';
  child.name = 'John';
  child.parentId = '1';
  child.createdAt = new Date();
  child.updatedAt = new Date();

  return child;
}
