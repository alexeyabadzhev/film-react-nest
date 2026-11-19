import { Expose, Transform } from 'class-transformer';

export class FilmDto {
  @Expose() id: string;
  @Expose() rating: number;
  @Expose() director: string;
  @Expose()
  @Transform(({ value }) => value ?? [])
  tags: string[];
  @Expose() title: string;
  @Expose() about: string;
  @Expose() description: string;
  @Expose() image: string;
  @Expose() cover: string;
}

export class ScheduleDto {
  @Expose() id: string;
  @Expose() daytime: string;
  @Expose() hall: number;
  @Expose() rows: number;
  @Expose() seats: number;
  @Expose() price: number;
  @Expose()
  @Transform(({ value }) => value ?? [])
  taken: string[];
}

export class FilmsResponseDto {
  total: number;
  items: FilmDto[];
}

export class ScheduleResponseDto {
  total: number;
  items: ScheduleDto[];
}
