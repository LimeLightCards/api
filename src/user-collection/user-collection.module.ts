import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { UserCollectionController } from './user-collection.controller';
import { UserCollection } from './user-collection.schema';
import { UserCollectionService } from './user-collection.service';

@Module({
  controllers: [UserCollectionController],
  imports: [CardsModule, MikroOrmModule.forFeature([UserCollection])],
  providers: [UserCollectionService]
})
export class UserCollectionModule {}
