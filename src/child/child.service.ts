import { Injectable } from '@nestjs/common';
import { Child } from './child.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChildDto, EditChildDto } from './child.dto';
import { UserService } from '../user/user.service';
import { UserDoesNotExists } from '../user/errors/UserDoesNotExists';
import { ChildDoesNotExists } from './errors/ChildDoesNotExists';

@Injectable()
export class ChildService {
  constructor(
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
    private readonly userService: UserService,
  ) {}

  async createChild(createChildDto: CreateChildDto): Promise<string> {
    const parent = await this.userService.findById(createChildDto.parentId);

    if (!parent) {
      throw new UserDoesNotExists();
    }

    const child = new Child();
    child.name = createChildDto.name;
    child.parent = Promise.resolve(parent);

    await this.childRepository.insert(child);

    return child.id;
  }

  async getChildById(id: string): Promise<Child | null> {
    return this.childRepository.findOneBy({ id });
  }

  async editChild(editChildDto: EditChildDto): Promise<void> {
    const child = await this.childRepository.findOneBy({ id: editChildDto.id });

    if (!child) {
      throw new ChildDoesNotExists();
    }

    await this.childRepository.update(child.id, { name: editChildDto.name });
  }

  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    return this.childRepository.findBy({
      parent: {
        id: parentId,
      },
    });
  }

  async deleteChild(id: string): Promise<void> {
    await this.childRepository.delete(id);
  }
}
