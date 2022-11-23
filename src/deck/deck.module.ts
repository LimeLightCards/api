import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { DeckController } from './deck.controller';
import { Deck, DeckRevision } from './deck.schema';
import { DeckService } from './deck.service';

@Module({
  controllers: [DeckController],
  imports: [UserModule, CardsModule, SharedModule, SearchModule, MikroOrmModule.forFeature([Deck, DeckRevision])],
  providers: [DeckService]
})
export class DeckModule {}
