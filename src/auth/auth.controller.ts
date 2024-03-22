import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { APIUser } from '../user/types/APIUser';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SkipJwt } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipJwt()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: APIUser }) {
    return await this.authService.login(req.user);
  }
}
