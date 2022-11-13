import { Embeddable, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Embeddable()
export class UserCollection {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  cards: Record<string, number> = {};
}
