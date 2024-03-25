import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import { UserService } from './user.service';
import { JWTUser } from './types/JWTUser';
import { SkipJwt } from '../decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SkipJwt()
  @Post('users')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @SkipJwt()
  @HttpCode(HttpStatus.OK)
  @Get('users/username/:username')
  async usernameExists(@Param('username') username: string) {
    if (!(await this.userService.usernameExists(username))) {
      throw new NotFoundException();
    }
  }

  @SkipJwt()
  @HttpCode(HttpStatus.OK)
  @Get('users/email/:email')
  async emailExists(@Param('email') email: string) {
    if (!(await this.userService.emailExists(email))) {
      throw new NotFoundException();
    }
  }

  @Get('profile')
  async getProfile(@Request() req: { user: JWTUser }) {
    return req.user;
  }
}
