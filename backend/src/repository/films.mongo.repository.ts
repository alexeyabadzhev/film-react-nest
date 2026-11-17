import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { Film } from '../films/schemas/film.schema';
import { convertToFilmDto, convertToScheduleDto } from './films.mapper';
import { FilmsRepository } from './films.repository';
import { FILM_MODEL } from './repository.constants';

@Injectable()
export class MongoFilmsRepository implements FilmsRepository {
  constructor(@Inject(FILM_MODEL) private readonly filmModel: Model<Film>) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel
      .find({}, { _id: 0, schedule: 0 })
      .lean<Film[]>()
      .exec();

    return films.map(convertToFilmDto);
  }

  async findSchedule(filmId: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmModel
      .findOne({ id: filmId }, { _id: 0, schedule: 1 })
      .lean<Film>()
      .exec();

    if (!film) {
      return null;
    }

    return (film.schedule ?? []).map(convertToScheduleDto);
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null> {
    const film = await this.filmModel
      .findOne(
        {
          id: filmId,
          'schedule.id': sessionId,
        },
        {
          _id: 0,
          'schedule.$': 1,
        },
      )
      .lean<Film>()
      .exec();

    const session = film?.schedule?.[0];

    return session ? convertToScheduleDto(session) : null;
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: {
                $nin: seats,
              },
            },
          },
        },
        {
          $addToSet: {
            'schedule.$.taken': {
              $each: seats,
            },
          },
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
