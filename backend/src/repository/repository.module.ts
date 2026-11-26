import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from 'src/films/entities/film.entity';
import { Schedule } from 'src/films/entities/schedule.entity';
import { FilmsRepository } from './films.repository';
import { TypeOrmFilmsRepository } from './films.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Schedule])],
  providers: [
    TypeOrmFilmsRepository,
    {
      provide: FilmsRepository,
      useExisting: TypeOrmFilmsRepository,
    },
  ],
  exports: [FilmsRepository],
})
export class RepositoryModule {}
