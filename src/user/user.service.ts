import {
  EntityRepository,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectRepository } from '@mikro-orm/nestjs';

export class UserExistsError extends Error {
  constructor(public firebaseUId: string) {
    super();

    this.name = 'UserExistsError';
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async createFromFirebase(
    firebaseUId: string,
    name: string,
    authTime: number,
    emailHash: string
  ): Promise<User> {
    const user = new User(firebaseUId, name, authTime, emailHash);
    try {
      await this.userRepository.persistAndFlush(user);
      return user;
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        const uniqueE: UniqueConstraintViolationException & {
          keyValue?: Partial<User>;
        } = e;

        if (uniqueE.keyValue && uniqueE.keyValue.firebaseUId === firebaseUId) {
          throw new UserExistsError(firebaseUId);
        }
      }
      throw e;
    }
  }

  async findById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ id: userId });
  }

  async findByIdOrFail(userId: string): Promise<User> {
    return await this.userRepository.findOneOrFail({ id: userId });
  }

  async findByFirebaseUId(firebaseUId: string): Promise<User | null> {
    return await this.userRepository.findOne({ firebaseUId });
  }

  async update(user: User): Promise<void> {
    await this.userRepository.persistAndFlush(user);
  }
}