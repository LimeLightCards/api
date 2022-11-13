
import { ConfigService } from '@nestjs/config';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { User } from '../user/user.schema';
import { UserCollection } from '../user-collection/user-collection.schema';

export const MIKRO_ORM_CONFIG = Symbol('MIKRO_ORM_CONFIG');

function mikroOrmConfigFactory(
  configService: ConfigService,
): MikroOrmModuleOptions {
  const mongoUrl = configService.get<string>(
    'MONGODB_URI',
    'mongodb://localhost:27017',
  );

  return {
    entities: [
      User,
      UserCollection
    ],
    dbName: process.env.NODE_ENV === 'production' ? 'limelight' : 'limelighttest',
    type: 'mongo',
    ensureIndexes: true,
    clientUrl: mongoUrl,
  };
}

export const mikroOrmConfigProvider = {
  provide: MIKRO_ORM_CONFIG,
  inject: [ConfigService],
  useFactory: mikroOrmConfigFactory,
};