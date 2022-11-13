import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { UserCollection } from './user-collection.schema';
import { User } from '../user/user.schema';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class UserCollectionService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly cardsService: CardsService
  ) {}

  getCards(user: User) {
    return user.collection?.cards ?? {};
  }

  async resetCards(user: User) {
    if(!user.collection) user.collection = new UserCollection();

    user.collection.cards = {};
    await this.userRepository.persistAndFlush(user);
  }

  async addCards(user: User, cards: Record<string, number>) {
    if(!user.collection) user.collection = new UserCollection();

    Object.keys(cards).forEach(cardId => {
      if(!this.cardsService.getCardById(cardId)) return;

      if(!user.collection.cards[cardId]) user.collection.cards[cardId] = 0;
      user.collection.cards[cardId] += cards[cardId];
    });
    
    await this.userRepository.persistAndFlush(user);
  }

  async removeCards(user: User, cards: Record<string, number>) {
    if(!user.collection) user.collection = new UserCollection();

    Object.keys(cards).forEach(cardId => {
      if(!user.collection.cards[cardId]) user.collection.cards[cardId] = 0;
      user.collection.cards[cardId] = Math.max(0, user.collection.cards[cardId] - cards[cardId]);

      if(user.collection.cards[cardId] <= 0) delete user.collection.cards[cardId];
    });

    await this.userRepository.persistAndFlush(user);
  }
}
