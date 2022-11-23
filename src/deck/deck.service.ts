import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { Deck, DeckRevision } from './deck.schema';
import { User, UserId } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { TextCleanerService } from '../shared/text-cleaner.service';
import { CardsService } from '../cards/cards.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class DeckService {

  constructor(
    @InjectRepository(Deck)
    private readonly deckRepository: EntityRepository<Deck>,
    
    @InjectRepository(DeckRevision)
    private readonly deckRevisionRepository: EntityRepository<DeckRevision>,

    private readonly searchService: SearchService,
    private readonly cardsService: CardsService,
    private readonly userService: UserService,
    private readonly textCleanerService: TextCleanerService
  ) {}

  doesUserOwnDeck(user: User, deck: Deck): boolean {
    return user.id === deck.authorId.toString();
  }

  cleanDeck(deck: Deck): void {
    deck.name = this.textCleanerService.cleanString(deck.name);
    deck.description = this.textCleanerService.cleanString(deck.description);
  }

  getSetsForDeck(deck: Deck): string[] {
    const sets = new Set<string>();

    Object.keys(deck.cards).forEach(cardCode => {
      const card = this.cardsService.getCardById(cardCode);
      if(!card) return;

      sets.add(card.expansion);
    });

    return Array.from(sets);
  }

  getCardNamesForDeck(deck: Deck): string[] {
    const cards = new Set<string>();

    Object.keys(deck.cards).forEach(cardCode => {
      const card = this.cardsService.getCardById(cardCode);
      if(!card) return;

      cards.add(card.name);

    });

    return Array.from(cards);
  }
  
  async addEditOrReviseDeck(deck: Deck, user: User, fromDeck?: Deck): Promise<Deck | undefined> {

    // if we have a deck, we're revising it
    if(deck.id) {
      const oldDeck = await this.deckRepository.findOne({ id: deck.id });
      if(!oldDeck) throw new NotFoundException('Deck id not found');

      // deleted decks can't be edited
      if(oldDeck.isDeleted) throw new UnauthorizedException('Deck id not found');

      // users can only edit their own decks
      if(!this.doesUserOwnDeck(user, oldDeck)) throw new UnauthorizedException('Deck is not yours');

      // update deck
      oldDeck.updatedAt = Date.now();
      oldDeck.name = deck.name;
      oldDeck.description = deck.description;
      oldDeck.cards = deck.cards;
      oldDeck.isPrivate = deck.isPrivate;

      // we check for card differences between new and old, and if any exist, we submit a new revision
      const oldCardsJson = JSON.stringify(oldDeck.cards);
      const newCardsJson = JSON.stringify(deck.cards);

      if(oldCardsJson !== newCardsJson) {
        const revision = new DeckRevision(oldDeck, oldDeck.updatedAt, oldDeck.cards);
        await this.deckRevisionRepository.persistAndFlush(revision);
      }

      oldDeck.expansions = this.getSetsForDeck(oldDeck);
      oldDeck.cardNames = this.getCardNamesForDeck(oldDeck);

      this.cleanDeck(oldDeck);

      await this.deckRepository.persistAndFlush(oldDeck);
    
      return oldDeck;
    }

    const expansions = this.getSetsForDeck(deck);
    const cardNames = this.getCardNamesForDeck(deck);

    // otherwise, create a new deck
    const deckEntity = new Deck(user, fromDeck, '', deck.isPrivate, expansions, deck.name, deck.description, deck.cards, cardNames);
    this.cleanDeck(deckEntity);

    await this.deckRepository.persistAndFlush(deckEntity);

    return deckEntity;
  }

  async remixDeck(user: User, deckId: string, deckRevisionId: string, newDeck: Deck): Promise<Deck | undefined> {
    delete newDeck.id;
    delete newDeck._id;

    const parentDeck = await this.findById(deckId, false);
    if(!parentDeck) throw new NotFoundException('Deck id not found');
    
    const expansions = this.getSetsForDeck(newDeck);
    const cardNames = this.getCardNamesForDeck(newDeck);
    
    const deckEntity = new Deck(user, parentDeck, deckRevisionId, newDeck.isPrivate, expansions, newDeck.name, newDeck.description, newDeck.cards, cardNames);
    this.cleanDeck(deckEntity);

    await this.deckRepository.persistAndFlush(deckEntity);

    return deckEntity;
  }

  async removeDeck(user: User, deckId: string): Promise<Deck | undefined> {
    const deck = await this.deckRepository.findOne({ id: deckId });
    if(!deck) throw new NotFoundException('Deck id not found');

    // users can only delete their own decks
    if(!this.doesUserOwnDeck(user, deck)) throw new UnauthorizedException('Deck is not yours');
    
    deck.isDeleted = true;
    await this.deckRepository.persistAndFlush(deck);

    return deck;
  }

  async findById(deckId: string, allowPrivate = false, user: User = undefined): Promise<Deck | null> {
    const deck = await this.deckRepository.findOne({ isDeleted: { $ne: true }, id: deckId });

    // non-existent decks can't come back
    if(!deck) throw new NotFoundException('Deck id not found');

    // we just disallow private decks in normal contexts
    if(!allowPrivate && deck.isPrivate) throw new NotFoundException('Deck id not found');

    const author = await this.userService.findById(deck.authorId.toString());

    // if the deck is private, only the author can see it
    if(allowPrivate && deck.isPrivate && !this.doesUserOwnDeck(user, deck)) throw new NotFoundException('Deck id not found');

    const revisions = await this.deckRevisionRepository.find({ deckId: deck._id });

    deck.author = { displayName: author.displayName, id: author.id, firebaseUId: author.firebaseUId, emailHash: author.emailHash } as User;
    deck.revisions = revisions.reverse();

    if(deck.parentId) {
      const parent = await this.deckRepository.findOne({ _id: deck.parentId });

      // we don't need to bail on this one if we don't find one
      if(parent) {
        deck.parent = { name: parent.name, id: parent.id } as Deck;
      }
    }

    return deck;
  }

  async getDecksByUserId(userId: UserId) {
    const decks = await this.deckRepository.find({ authorId: userId });
    return decks;
  }

  async getDeckStatsForCard(cardCode: string): Promise<any> {
    const card = this.cardsService.getCardById(cardCode);
    const decksWithCount = await this.deckRepository.count({ 
      isDeleted: { $ne: true }, 
      isPrivate: { $ne: true }, 
      [`cards.${cardCode}`]: { $gt: 0 } 
    });

    const decksWithoutCount = await this.deckRepository.count({ 
      isDeleted: { $ne: true }, 
      isPrivate: { $ne: true }, 
      expansions: card.expansion 
    });

    const decksWith = await this.deckRepository.find(
      { 
        isDeleted: { $ne: true }, 
        isPrivate: { $ne: true }, 
        [`cards.${cardCode}`]: { $gt: 0 } 
      }, 
      { limit: 4 }
    );

    const decksWithAuthors = await Promise.all(decksWith.map(async deck => {

      const author = await this.userService.findById(deck.authorId.toString());
      return { ...deck, id: deck._id, author: { displayName: author.displayName, id: author.id, firebaseUId: author.firebaseUId, emailHash: author.emailHash } as User };
    }));
    
    return { decksWithCount, decksWithoutCount, decks: decksWithAuthors };
  }

  async search(query: string, page: number, sort = '', sortBy = 'asc', searcher = '') {
    return this.searchService.search(query, page, sort, sortBy, searcher);
  }

}
