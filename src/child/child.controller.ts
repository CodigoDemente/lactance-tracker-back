import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UserIsSameAsLoggedGuard } from '../auth/guards/user-is-same-as-logged.guard';
import { ChildDoesNotExists } from './errors/ChildDoesNotExists';

@Controller('/parents/:parentId/childs')
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
  @UseGuards(UserIsSameAsLoggedGuard)
  async getChildrenByParentId(@Request() req: RequestData) {
    const user = req.user as JWTUser;

    const children = await this.childService.getChildrenByParentId(user.id);

    return children.map(ChildMapper.toInfrasctructure);
  }

  @Post()
  @UseGuards(UserIsSameAsLoggedGuard)
  async createChild(
    @Request() req: RequestData,
    @Body() createChildDto: CreateChildApiDto,
  ) {
    const user = req.user as JWTUser;

    const childId = await this.childService.createChild({
      ...createChildDto,
      parentId: user.id,
    });

    return { id: childId };
  }

  @Patch('/:childId')
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

  @Delete('/:childId')
  @UseGuards(HasAccessToChildGuardGuard)
  async deleteChild(@Param('childId', ParseUUIDPipe) childId: string) {
    return await this.childService.deleteChild(childId);
  }
}
