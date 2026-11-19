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
        driver: configService.get<string>('DATABASE_DRIVER') ?? 'mongodb',
        url:
          configService.get<string>('DATABASE_URL') ??
          'mongodb://127.0.0.1:27017/prac',
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
}

@Module({
  providers: [configProvider],
  exports: [CONFIG],
})
export class AppConfigModule {}
