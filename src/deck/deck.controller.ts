import { Body, Controller, Delete, Get, Param, Put, UseGuards, Query } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { RequestUser } from '../request-user.decorator';
import { User } from '../user/user.schema';
import { Deck } from './deck.schema';
import { DeckService } from './deck.service';

@Controller('deck')
export class DeckController {

  constructor(
    private readonly deckService: DeckService
  ) {}

  @Get('all')
  async getAllDecks() {
    return { decks: [] };
  }

  @Get('search')
  async searchDecks(@Query('q') query: string, @Query('page') page: number, @Query('sort') sort: string, @Query('sortBy') sortBy: string) {
    const { decks, pagination } = await this.deckService.search(query, +page, sort, sortBy);
    return { decks, pagination };
  }

  @Get('mine')
  @UseGuards(BearerAuthGuard)
  async getAllMyDecks(@RequestUser() user: User) {
    return { decks: await this.deckService.getDecksByUserId(user._id) };
  }

  @Get('mine/:id')
  @UseGuards(BearerAuthGuard)
  async getOneOfMyDecks(@RequestUser() user: User, @Param('id') deckId: string) {
    return { deck: await this.deckService.findById(deckId, true, user) };
  }

  @Put()
  @UseGuards(BearerAuthGuard)
  async reviseDeck(@RequestUser() user: User, @Body('deck') deck: Deck) {
    return { deck: await this.deckService.addEditOrReviseDeck(deck, user) };
  }

  @Get('with/:cardId')
  async getDeckStatsForCard(@Param('cardId') cardId: string) {
    return { stats: await this.deckService.getDeckStatsForCard(cardId) };
  }

  @Get(':id')
  async getSpecificDeck(@Param('id') deckId: string) {
    return { deck: await this.deckService.findById(deckId, false) };
  }

  @Delete(':id/revise')
  @UseGuards(BearerAuthGuard)
  async deleteDeck(@RequestUser() user: User, @Param('id') deckId: string) {
    return { deck: await this.deckService.removeDeck(user, deckId) };
  }

  @Put(':id/remix/:revisionId')
  @UseGuards(BearerAuthGuard)
  async remixDeck(
    @RequestUser() user: User, 
    @Param('id') deckId: string, 
    @Param('revisionId') revisionId: string, 
    @Body('deck') deck: Deck
  ) {
    return { deck: await this.deckService.remixDeck(user, deckId, revisionId, deck) };
  }

}
