import { Entity, PrimaryKey, Property, Index, Unique, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export type UserId = User['_id'];

@Entity()
export class User {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property({ hidden: true })
  @Index()
  @Unique()
  firebaseUId: string;

  @Property({ hidden: true })
  authTime: number;

  @Property()
  createdAt: number;

  @Property()
  displayName: string;

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
