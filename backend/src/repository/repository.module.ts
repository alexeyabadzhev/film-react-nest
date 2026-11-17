import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DATABASE_CONNECTION } from '../database/database.constants';
import { DatabaseModule } from '../database/database.module';
import { FilmSchema } from '../films/schemas/film.schema';
import { MongoFilmsRepository } from './films.mongo.repository';
import { FilmsRepository } from './films.repository';
import { FILM_MODEL } from './repository.constants';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: FILM_MODEL,
      inject: [DATABASE_CONNECTION],
      useFactory: (connection: Connection) =>
        connection.model('Film', FilmSchema),
    },
    {
      provide: FilmsRepository,
      useClass: MongoFilmsRepository,
    },
  ],
  exports: [FilmsRepository],
})
export class RepositoryModule {}
