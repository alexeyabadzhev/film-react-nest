import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ScheduleDto } from '../films/dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';
import {
  CreateOrderDto,
  OrderItemDto,
  OrderResponseDto,
  TicketDto,
} from './dto/order.dto';

interface TicketGroup {
  film: string;
  session: string;
  tickets: TicketDto[];
}

@Injectable()
export class OrderService {
  private groupTickets(tickets: TicketDto[]): Map<string, TicketGroup> {
    const groups = new Map<string, TicketGroup>();

    tickets.forEach((ticket) => {
      const key = this.getGroupKey(ticket.film, ticket.session);
      const group = groups.get(key);

      if (group) {
        group.tickets.push(ticket);
      } else {
        groups.set(key, {
          film: ticket.film,
          session: ticket.session,
          tickets: [ticket],
        });
      }
    });

    return groups;
  }

  private validateSeats(group: TicketGroup, session: ScheduleDto): void {
    const seats = this.getSeatKeys(group.tickets);

    if (new Set(seats).size !== seats.length) {
      throw new BadRequestException('В заказе есть повторяющиеся места');
    }

    group.tickets.forEach((ticket) => {
      if (ticket.row > session.rows || ticket.seat > session.seats) {
        throw new BadRequestException(
          `Место №${ticket.seat} в ряду №${ticket.row} не существует`,
        );
      }
    });

    const taken = new Set(session.taken ?? []);

    if (seats.some((seat) => taken.has(seat))) {
      throw new ConflictException('Некоторые места уже заняты');
    }
  }

  private getSeatKeys(tickets: TicketDto[]): string[] {
    return tickets.map((ticket) => `${ticket.row}:${ticket.seat}`);
  }

  private getGroupKey(film: string, session: string): string {
    return `${film}:${session}`;
  }

  constructor(private readonly filmRepository: FilmsRepository) {}

  async createOrder(order: CreateOrderDto): Promise<OrderResponseDto> {
    this.validateOrder(order);

    const groups = this.groupTickets(order.tickets);
    const sessions = new Map<string, ScheduleDto>();

    for (const group of groups.values()) {
      const session = await this.filmRepository.findSession(
        group.film,
        group.session,
      );

      if (!session) {
        throw new NotFoundException('Сеанс на фильм не найден');
      }

      this.validateSeats(group, session);
      sessions.set(this.getGroupKey(group.film, group.session), session);
    }

    for (const group of groups.values()) {
      const reserved = await this.filmRepository.reserveSeats(
        group.film,
        group.session,
        this.getSeatKeys(group.tickets),
      );

      if (!reserved) {
        throw new ConflictException('Некоторые из мест уже заняты');
      }
    }

    const items: OrderItemDto[] = order.tickets.map((ticket) => {
      const session = sessions.get(
        this.getGroupKey(ticket.film, ticket.session),
      );

      return {
        id: randomUUID(),
        film: ticket.film,
        session: ticket.session,
        daytime: session.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: session.price,
      };
    });

    return {
      total: items.length,
      items,
    };
  }

  private validateOrder(order: CreateOrderDto): void {
    if (!order || typeof order !== 'object') {
      throw new BadRequestException('Неправильный заказ');
    }

    if (typeof order.email !== 'string' || !order.email.trim()) {
      throw new BadRequestException('Введите почту');
    }

    if (typeof order.phone !== 'string' || !order.phone.trim()) {
      throw new BadRequestException('Введите телефон');
    }

    if (!Array.isArray(order.tickets) || order.tickets.length === 0) {
      throw new BadRequestException('Выберите билеты');
    }

    order.tickets.forEach((ticket) => {
      if (!ticket || typeof ticket !== 'object') {
        throw new BadRequestException('Несуществующий билет');
      }

      if (typeof ticket.film !== 'string' || !ticket.film.trim()) {
        throw new BadRequestException('Не указан фильм');
      }

      if (typeof ticket.session !== 'string' || !ticket.session.trim()) {
        throw new BadRequestException('Не указан сеанс');
      }

      if (!Number.isInteger(ticket.row) || ticket.row < 1) {
        throw new BadRequestException('Некорректный ряд');
      }

      if (!Number.isInteger(ticket.seat) || ticket.seat < 1) {
        throw new BadRequestException('Некорректное место');
      }
    });
  }
}
