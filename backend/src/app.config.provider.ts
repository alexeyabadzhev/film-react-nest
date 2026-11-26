import { Provider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export const configProvider: Provider = {
  provide: CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AppConfig => {
    const port = Number(configService.get<string>('PORT') ?? '3000');

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Некорректный порт');
    }

    return {
      port,
      database: {
        driver: configService.get<string>('DATABASE_DRIVER') ?? 'postgres',
        url:
          configService.get<string>('DATABASE_URL') ??
          'postgres://127.0.0.1:5432/films',
        username: configService.get<string>('DATABASE_USERNAME') ?? 'films',
        password: configService.get<string>('DATABASE_PASSWORD') ?? '12345678',
        databasename: configService.get<string>('DATABASE_NAME') ?? 'films',
      },
    };
  },
};

export interface AppConfig {
  port: number;
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
  username: string;
  password: string;
  databasename: string;
}

@Module({
  providers: [configProvider],
  exports: [CONFIG],
})
export class AppConfigModule {}
