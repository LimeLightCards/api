import { Controller, Post, Get, Delete, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { RequestUser } from '../request-user.decorator';
import { User } from '../user/user.schema';
import { UserCollectionService } from './user-collection.service';

@Controller('collection')
export class UserCollectionController {

  constructor(private readonly userCollectionService: UserCollectionService) {}

  @Get()
  @UseGuards(BearerAuthGuard)
  async getCards(@RequestUser() user: User) {
    return { collection: await this.userCollectionService.getCards(user) };
  }

  @Delete()
  @UseGuards(BearerAuthGuard)
  resetCollection(@RequestUser() user: User) {
    return this.userCollectionService.resetCards(user);
  }

  @Post('add-cards')
  @UseGuards(BearerAuthGuard)
  addCards(@RequestUser() user: User, @Body() body: any) {
    if(!body || !body.cards || Object.keys(body.cards).length === 0) {
      throw new BadRequestException('Missing cards');
    }

    return this.userCollectionService.addCards(user, body.cards);
  }

  @Post('remove-cards')
  @UseGuards(BearerAuthGuard)
  removeCards(@RequestUser() user: User, @Body() body) {
    if(!body || !body.cards || Object.keys(body.cards).length === 0) {
      throw new BadRequestException('Missing cards');
    }

    return this.userCollectionService.removeCards(user, body.cards);
  }

}
