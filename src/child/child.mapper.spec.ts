import { Child } from './child.entity';
import { ChildMapper } from './child.mapper';

describe('ChildMapper', () => {
  it('should map a child to an APIChild', () => {
    const child = {
      id: '1',
      name: 'John',
      parentId: '1',
    } as Child;

    const mappedChild = ChildMapper.toInfrasctructure(child);

    expect(mappedChild).toEqual({
      id: '1',
      name: 'John',
      parentId: '1',
    });
  });
});
