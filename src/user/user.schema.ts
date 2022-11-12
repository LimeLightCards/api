import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export type UserId = User['_id'];

@Entity()
export class User {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ hidden: true })
  @Unique()
  firebaseUId: string;

  @Property({ hidden: true })
  authTime: number;

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
  }
}
