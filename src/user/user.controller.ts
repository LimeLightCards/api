import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { RequestUser } from '../request-user.decorator';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService
  ) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  getMe(@RequestUser() user: User) {
    return user;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return { user: await this.userService.findById(id) };
  }

  @Get('firebase/:id')
  async getByFirebaseId(@Param('id') id: string) {
    return { user: await this.userService.findByFirebaseUId(id) };
  }
  
}
