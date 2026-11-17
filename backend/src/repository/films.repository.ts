import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export abstract class FilmsRepository {
  abstract findAll(): Promise<FilmDto[]>;

  abstract findSchedule(filmId: string): Promise<ScheduleDto[] | null>;

  abstract findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null>;

  abstract reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean>;
}
