import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmsResponseDto> {
    const items = await this.filmsRepository.findAll();

    return {
      total: items.length,
      items,
    };
  }

  async findSchedule(filmId: string): Promise<ScheduleResponseDto> {
    const items = await this.filmsRepository.findSchedule(filmId);

    if (!items) {
      throw new NotFoundException('Фильм не найден');
    }

    return {
      total: items.length,
      items,
    };
  }
}
