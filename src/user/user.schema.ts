import { Entity, Embedded, PrimaryKey, Property, Unique, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { UserCollection } from '../user-collection/user-collection.schema';

export type UserId = User['_id'];

@Entity()
export class User {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property({ hidden: true })
  @Unique()
  firebaseUId: string;

  @Property({ hidden: true })
  authTime: number;

  @Property()
  createdAt: number;

  @Property()
  displayName: string;

  @Embedded({ entity: () => UserCollection, object: true })
  collection: UserCollection = new UserCollection();

  constructor(
    firebaseUId: string,
    displayName: string,
    authTime: number
  ) {
    this.firebaseUId = firebaseUId;
    this.displayName = displayName;
    this.authTime = authTime;
    this.createdAt = Date.now();
  }
}
