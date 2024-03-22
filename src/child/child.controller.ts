import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateChildApiDto } from './child.dto';
import { ChildService } from './child.service';
import { JWTUser } from '../user/types/JWTUser';
import type { RequestData } from '../app/types/Request.type';
import { HasAccessToChildGuardGuard } from './guards/has-access-to-child-guard.guard';
import { ChildMapper } from './child.mapper';
import { ChildDoesNotExists } from './errors/ChildDoesNotExists';

@Controller('child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Get('/:childId')
  @UseGuards(HasAccessToChildGuardGuard)
  async getChildById(@Param('childId') childId: string) {
    const child = await this.childService.getChildById(childId);

    if (!child) {
      throw new ChildDoesNotExists();
    }

    return ChildMapper.toInfrasctructure(child);
  }

  @Get()
  async getChildrenByParentId(@Request() req: RequestData) {
    const user = req.user as JWTUser;

    const children = await this.childService.getChildrenByParentId(user.id);

    return children.map(ChildMapper.toInfrasctructure);
  }

  @Post()
  async createChild(
    @Request() req: RequestData,
    @Body() createChildDto: CreateChildApiDto,
  ) {
    const user = req.user as JWTUser;

    return await this.childService.createChild({
      ...createChildDto,
      parentId: user.id,
    });
  }

  @Post('/:childId')
  @UseGuards(HasAccessToChildGuardGuard)
  async editChild(
    @Param('childId') childId: string,
    @Body() editChildDto: CreateChildApiDto,
  ) {
    return await this.childService.editChild({
      id: childId,
      name: editChildDto.name,
    });
  }
}
