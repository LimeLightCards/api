import { Controller, Get, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { RequestUser } from '../request-user.decorator';
import { User } from './user.schema';

@Controller('user')
export class UserController {

  @Get('me')
  @UseGuards(BearerAuthGuard)
  getMe(@RequestUser() user: User) {
    return user;
  }
}
