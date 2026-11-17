import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';
import { DATABASE_CONNECTION } from './database.constants';
import { AppConfig, AppConfigModule, CONFIG } from '../app.config.provider';

@Injectable()
class DatabaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.connection.close();
    this.logger.log('Соединение с базой данных закрыто');
  }
}

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [CONFIG],
      useFactory: async (config: AppConfig): Promise<Connection> => {
        const { driver, url } = config.database;
        
        if (driver !== 'mongodb') {
          throw new Error('База данных не поддерживается');
        }

        return createConnection(url).asPromise();
      },
    },
    DatabaseService,
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
