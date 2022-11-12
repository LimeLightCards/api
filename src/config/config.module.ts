import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { mikroOrmConfigProvider } from './mikro-orm-config';

const environment = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        `.env.${environment}.local`,
        `.env.${environment}`,
        '.env.local',
        '.env',
      ],
    }),
  ],
  providers: [mikroOrmConfigProvider],
  exports: [mikroOrmConfigProvider],
})
export class ConfigModule {}