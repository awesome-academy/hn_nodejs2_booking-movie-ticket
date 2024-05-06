import { inject, injectable } from 'tsyringe';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { ErrorApiResponseDto } from '../dtos/res/error.api.res.dto';
import { StatusEnum } from '../enum/status.enum';
import { Schedule } from '../entities/schedule.entity';
import { SelectQueryBuilder } from 'typeorm';
import { ObjectMapper } from '../utils/mapper';
import { MovieService } from './movie.service';
import dayjs from 'dayjs';
import { DateFormat } from '../enum/date.format.enum';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { SeatStatus } from '../enum/seat.status.enum';

@injectable()
export class ScheduleService {
  constructor(
    @inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,

    @inject(MovieService)
    private readonly movieService: MovieService,

    @inject(TicketRepository)
    private readonly ticketRepository: TicketRepository,
  ) {}

  private makeInfoSchedulesQueryBuilderByMovidId(
    movieId: number,
  ): SelectQueryBuilder<Schedule> {
    const sq = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.schedule', 'schedule')
      .where(`schedule.movieId = ${movieId}`)
      .andWhere(
        `cast(concat(schedule.startDate, ' ', schedule.startTime) as datetime) >= ADDTIME(NOW(), "${process.env.SCHEDULE_ADD_TIME_SQL}")`,
      )
      .getQuery();

    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.room', 'room')
      .innerJoinAndSelect('seat', 'seat', 'seat.room_id = room.id')
      .leftJoinAndSelect(`(${sq})`, 'sq', 'seat.id = sq.ticket_seat_id')
      .where('schedule.movieId = :movieId', { movieId })
      .andWhere(
        `cast(concat(schedule.startDate, ' ', schedule.startTime) as datetime) >= ADDTIME(NOW(), "${process.env.SCHEDULE_ADD_TIME_SQL}")`,
      );
  }

  private convertToSchedules(rawResult: any[]) {
    const schedules = [];
    const entities = ObjectMapper.mapToEntitiesFromRawResults(rawResult, [
      'schedule',
      'room',
      'ticket',
    ]);
    const countEmptySeat = {};
    entities.forEach((entity) => {
      const schedule = entity['schedule'];
      const room = entity['room'];
      const ticket = entity['ticket'];
      countEmptySeat[room.id] =
        ticket.id == null
          ? countEmptySeat[room.id]
            ? countEmptySeat[room.id] + 1
            : 1
          : countEmptySeat[room.id];
      if (
        !schedules.length ||
        schedules[schedules.length - 1].id != schedule.id
      ) {
        const date = schedule.startDate;
        const day = date.getDay() == 0 ? 'CN' : `T${date.getDay() + 1}`;
        schedules.push({
          id: schedule.id,
          schedule: `${day} ${dayjs(new Date(schedule.startDate)).format(DateFormat.DD_MM_YYYY)} ${schedule.startTime}`,
          roomId: room.id,
          roomName: room.name,
        });
      }
    });
    return schedules.map((schedule) => {
      return {
        ...schedule,
        emptySeat: countEmptySeat[schedule.roomId]
          ? countEmptySeat[schedule.roomId]
          : 0,
      };
    });
  }

  public async getSchedules(movieId: number) {
    const movie: any = await this.movieService.getMovieDetail(movieId);

    if (!movie) {
      throw {
        status: StatusEnum.NOT_FOUND,
        message: 'Not Found',
        errors: {
          movie: 'Not found movie',
        },
      } as ErrorApiResponseDto;
    }

    const queryBuilder = this.makeInfoSchedulesQueryBuilderByMovidId(movieId);
    const rawResult = await queryBuilder.getRawMany();
    const schedules = this.convertToSchedules(rawResult);

    const data = {
      id: movie.id,
      name: movie.name,
      smallImgurl: movie.smallImgurl,
      categories: movie.categories.trim(),
      ageLimit: movie.ageLimit,
      shortDescription: movie.shortDescription,
      duration: movie.duration,
      schedules,
    };

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data,
    } as AppBaseResponseDto;
  }

  private makeSheduleDetailQueryBuiler(
    id: number,
  ): SelectQueryBuilder<Schedule> {
    const sq = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.schedule', 'schedule')
      .where(`schedule.id = ${id}`)
      .andWhere(
        `cast(concat(schedule.startDate, ' ', schedule.startTime) as datetime) >= ADDTIME(NOW(), "${process.env.SCHEDULE_ADD_TIME_SQL}")`,
      )
      .getQuery();

    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.room', 'room')
      .innerJoinAndSelect('seat', 'seat', 'seat.room_id = room.id')
      .leftJoinAndSelect(`(${sq})`, 'sq', 'seat.id = sq.ticket_seat_id')
      .where('schedule.id = :id', { id })
      .andWhere(
        `cast(concat(schedule.startDate, ' ', schedule.startTime) as datetime) >= ADDTIME(NOW(), "${process.env.SCHEDULE_ADD_TIME_SQL}")`,
      );
  }

  private async convertToSchedule(rawResults: any[], keepingSeats: any) {
    const entities = ObjectMapper.mapToEntitiesFromRawResults(rawResults, [
      'schedule',
      'seat',
      'room',
      'ticket',
    ]);

    let res = {};
    const seats = [];
    let movieId = 0;
    entities.forEach((entity, index) => {
      const schedule = entity['schedule'];
      const room = entity['room'];
      const ticket = entity['ticket'];
      const seat = entity['seat'];
      if (index == 0) {
        movieId = schedule.movieId;
        const date = schedule.startDate;
        const day = date.getDay() == 0 ? 'CN' : `T${date.getDay() + 1}`;
        res = {
          id: schedule.id,
          schedule: `${day} ${dayjs(new Date(schedule.startDate)).format(DateFormat.DD_MM_YYYY)} ${schedule.startTime}`,
          room: {
            id: room.id,
            name: room.name,
          },
        };
      }
      if (!seats.length || seats[seats.length - 1].id != seat.id) {
        seats.push({
          id: seat.id,
          name: seat.name,
          type: seat.type,
          status: ticket.id
            ? SeatStatus.BOOKED
            : keepingSeats[schedule.id]?.[seat.id]
              ? SeatStatus.KEEPING
              : SeatStatus.UNBOOKED,
          price: seat.price,
        });
      }
    });

    const movie: any = await this.movieService.getMovieDetail(movieId);

    return {
      ...res,
      movie: {
        id: movie.id,
        name: movie.name,
        categories: movie.categories.trim(),
        duration: movie.duration,
        smallImgurl: movie.smallImgurl,
        ageLimit: movie.ageLimit,
      },
      seats,
    };
  }

  public async getScheduleDetail(id: number, keepingSeats: any) {
    const queryBuilder = this.makeSheduleDetailQueryBuiler(id);
    const rawResults = await queryBuilder.getRawMany();
    const schedule = await this.convertToSchedule(rawResults, keepingSeats);
    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: schedule,
    } as AppBaseResponseDto;
  }
}
