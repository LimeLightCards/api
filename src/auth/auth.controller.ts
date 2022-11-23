import { Controller, Put, UseGuards, Headers, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { RequestUser } from '../request-user.decorator';
import { TextCleanerService } from '../shared/text-cleaner.service';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {

  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly textCleanerService: TextCleanerService
  ) {}

  // dummy function that we can call for reasons
  @Put('user')
  @UseGuards(BearerAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  createUser() {}

  @Put('user/name')
  @UseGuards(BearerAuthGuard)
  async updateUserName(@Headers() headers: Headers, @RequestUser() user: User) {
    const decodedToken = await this.authService.decodeToken(headers['authorization'].split('Bearer ')[1]);
    const userRef = await this.userService.findById(user.id);
    userRef.displayName = this.textCleanerService.cleanString(decodedToken.name);

    await this.userService.update(userRef);
  }
}
