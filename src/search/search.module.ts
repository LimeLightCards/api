import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Deck } from '../deck/deck.schema';
import { UserModule } from '../user/user.module';
import { SearchService } from './search.service';

@Module({
  providers: [SearchService],
  imports: [UserModule, MikroOrmModule.forFeature([Deck])],
  exports: [SearchService]
})
export class SearchModule {}
