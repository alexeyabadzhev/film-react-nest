import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { Film, FilmSession } from '../films/schemas/film.schema';

export const convertToFilmDto = (film: Film): FilmDto => {
  return {
    id: film.id,
    rating: film.rating,
    director: film.director,
    tags: film.tags ?? [],
    title: film.title,
    about: film.about,
    description: film.description,
    image: film.image,
    cover: film.cover,
  };
};

export const convertToScheduleDto = (session: FilmSession): ScheduleDto => {
  return {
    id: session.id,
    daytime: session.daytime,
    hall: session.hall,
    rows: session.rows,
    seats: session.seats,
    price: session.price,
    taken: session.taken ?? [],
  };
};
