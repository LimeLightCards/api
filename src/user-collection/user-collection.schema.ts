import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { User } from '../user/user.schema';

@Entity()
export class UserCollection {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  ownerId: ObjectId;

  @Property({ persist: false })
  owner: User;

  @Property()
  cards: Record<string, number> = {};

  constructor(owner: User) {
    this.ownerId = owner._id;
  }
}
