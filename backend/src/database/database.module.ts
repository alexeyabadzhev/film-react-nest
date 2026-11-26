import { Global, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig, AppConfigModule, CONFIG } from '../app.config.provider';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';

function getOrmOptions(config: AppConfig): TypeOrmModuleOptions {
  const { driver, url, username, password, databasename } = config.database;

  if (driver !== 'postgres') {
    throw new Error('Invalid database driver');
  }

  const DBUrl = new URL(url);

  return {
    type: 'postgres',
    host: DBUrl.hostname,
    port: Number(DBUrl.port),
    database: databasename,
    username: username,
    password: password,
    entities: [Film, Schedule],
    synchronize: false,
  };
}
@Global()
@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [CONFIG],
      useFactory: getOrmOptions,
    }),
  ],
})
export class DatabaseModule {}
