import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { UserCollection } from './user-collection.schema';
import { User } from '../user/user.schema';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class UserCollectionService {

  constructor(    
    @InjectRepository(UserCollection)
    private readonly userCollectionRepository: EntityRepository<UserCollection>,

    private readonly cardsService: CardsService
  ) {}

  async getUserCollection(user: User): Promise<UserCollection> {
    const collection = await this.userCollectionRepository.findOne({ ownerId: user._id });
    if(!collection) {
      const newCollection = new UserCollection(user);
      await this.userCollectionRepository.persistAndFlush(newCollection);

      return newCollection;
    }

    return collection;
  }

  async getCards(user: User) {
    const collection = await this.getUserCollection(user);
    return collection?.cards ?? {};
  }

  async resetCards(user: User) {
    const collection = await this.getUserCollection(user);

    collection.cards = {};
    await this.userCollectionRepository.persistAndFlush(collection);
  }

  async addCards(user: User, cards: Record<string, number>) {
    const collection = await this.getUserCollection(user);

    Object.keys(cards).forEach(cardId => {
      if(!this.cardsService.getCardById(cardId)) return;

      if(!collection.cards[cardId]) collection.cards[cardId] = 0;
      collection.cards[cardId] += cards[cardId];
    });
    
    await this.userCollectionRepository.persistAndFlush(collection);
  }

  async removeCards(user: User, cards: Record<string, number>) {
    const collection = await this.getUserCollection(user);

    Object.keys(cards).forEach(cardId => {
      if(!collection.cards[cardId]) collection.cards[cardId] = 0;
      collection.cards[cardId] = Math.max(0, collection.cards[cardId] - cards[cardId]);

      if(collection.cards[cardId] <= 0) delete collection.cards[cardId];
    });

    await this.userCollectionRepository.persistAndFlush(collection);
  }
}
