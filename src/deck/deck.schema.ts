import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { User } from '../user/user.schema';

export type DeckId = Deck['_id'];

type DeckRevisionCards = Record<string, number>;

@Entity()
export class Deck {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  authorId: ObjectId;

  @Property({ persist: false })
  author: User;

  @Property({ nullable: true })
  parentId?: ObjectId;

  @Property({ nullable: true })
  parentRevision?: string;

  @Property({ persist: false })
  parent?: Deck;

  @Property({ persist: false })
  revisions: DeckRevision[];

  @Property()
  createdAt: number;

  @Property()
  updatedAt: number;

  @Property()
  isDeleted: boolean;

  @Property()
  isPrivate: boolean;

  @Property()
  expansions: string[];

  @Property()
  name: string;

  @Property()
  description: string;

  @Property()
  cards: DeckRevisionCards;

  @Property()
  cardNames: string[];

  constructor(
    author: User,
    parent: Deck,
    parentRevision: string,
    isPrivate: boolean,
    expansions: string[],
    name: string,
    description: string,
    cards: DeckRevisionCards,
    cardNames: string[]
  ) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();

    this.isDeleted = false;

    this.authorId = author._id;
    this.parentId = parent?._id;
    this.parentRevision = parentRevision;

    this.isPrivate = isPrivate || false;
    this.expansions = expansions;
    this.name = name;
    this.description = description;
    
    this.cards = cards;
    this.cardNames = cardNames;
  }
}

@Entity()
export class DeckRevision {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  deckId: ObjectId;

  @Property({ persist: false })
  deck: Deck;

  @Property()
  originalCreatedAt: number;

  @Property()
  cards: DeckRevisionCards;

  constructor(
    deck: Deck,
    originalCreatedAt: number,
    cards: DeckRevisionCards
  ) {
    this.deckId = deck._id;
    this.originalCreatedAt = originalCreatedAt;
    this.cards = cards;
  }
}
