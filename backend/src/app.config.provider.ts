import { Provider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export const configProvider: Provider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AppConfig => ({
    database: {
      driver: configService.get<string>('DATABASE_DRIVER') ?? 'mongodb',
      url:
        configService.get<string>('DATABASE_URL') ??
        'mongodb://127.0.0.1:27017/prac',
    },
  }),
};

export interface AppConfig {
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
