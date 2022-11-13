import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { CardsModule } from './cards/cards.module';
import { UserCollectionModule } from './user-collection/user-collection.module';

@Module({
  imports: [UserModule, AuthModule, DatabaseModule, ConfigModule, CardsModule, UserCollectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
