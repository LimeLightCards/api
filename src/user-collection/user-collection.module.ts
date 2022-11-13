import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { User } from '../user/user.schema';
import { UserCollectionController } from './user-collection.controller';
import { UserCollectionService } from './user-collection.service';

@Module({
  controllers: [UserCollectionController],
  imports: [CardsModule, MikroOrmModule.forFeature([User])],
  providers: [UserCollectionService]
})
export class UserCollectionModule {}
