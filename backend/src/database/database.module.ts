import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';
import { DATABASE_CONNECTION } from './database.constants';

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
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Connection> => {
        const url =
          configService.get<string>('DATABASE_URL') ??
          'mongodb://127.0.0.1:27017/prac';

        return createConnection(url).asPromise();
      },
    },
    DatabaseService,
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
