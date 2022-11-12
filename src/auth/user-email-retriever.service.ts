import { Inject, Injectable } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class UserEmailRetrieverService {
  constructor(
    @Inject('FIREBASE_ADMIN_AUTH') private readonly firebaseAuth: Auth,
  ) {}

  async getUserEmailFromFirebaseUId(
    firebaseUId: string,
  ): Promise<string | null> {
    const firebaseUser = await this.firebaseAuth.getUser(firebaseUId);

    if (!firebaseUser.email) return null;

    return firebaseUser.email;
  }
}
