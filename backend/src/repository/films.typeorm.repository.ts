import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { FilmsRepository } from './films.repository';

@Injectable()
export class TypeOrmFilmsRepository implements FilmsRepository {
  private findSessionForUpdate(
    manager: EntityManager,
    filmId: string,
    sessionId: string,
  ): Promise<Schedule | null> {
    return manager
      .createQueryBuilder(Schedule, 'schedule')
      .where('schedule.id = :sessionId', { sessionId })
      .andWhere('schedule."filmId" = :filmId', { filmId })
      .setLock('pessimistic_write')
      .getOne();
  }

  constructor(
    @InjectRepository(Film) private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();

    return films.map((film) =>
      plainToInstance(FilmDto, film, { excludeExtraneousValues: true }),
    );
  }

  async findSchedule(filmId: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmRepository
      .createQueryBuilder('film')
      .leftJoinAndSelect('film.schedule', 'schedule')
      .where('film.id = :filmId', { filmId })
      .orderBy('schedule.daytime', 'ASC')
      .getOne();

    if (!film) {
      return null;
    }

    return (film.schedule ?? []).map((session) =>
      plainToInstance(ScheduleDto, session, { excludeExtraneousValues: true }),
    );
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null> {
    const session = await this.scheduleRepository.findOne({
      where: { id: sessionId, film: { id: filmId } },
    });

    return session
      ? plainToInstance(ScheduleDto, session, { excludeExtraneousValues: true })
      : null;
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const session = await this.findSessionForUpdate(
        manager,
        filmId,
        sessionId,
      );

      if (!session) {
        return false;
      }

      const taken = session.taken ?? [];

      if (seats.some((seat) => taken.includes(seat))) {
        return false;
      }

      session.taken = [...taken, ...seats];
      await manager.save(session);

      return true;
    });
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const session = await this.findSessionForUpdate(
        manager,
        filmId,
        sessionId,
      );

      if (!session) {
        return;
      }

      session.taken = (session.taken ?? []).filter(
        (seat) => !seats.includes(seat),
      );

      await manager.save(session);
    });
  }
}
