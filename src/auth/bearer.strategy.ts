import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService, UserResult } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<UserResult> {
    const result = await this.authService.validateUserByToken(token);
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }
}
