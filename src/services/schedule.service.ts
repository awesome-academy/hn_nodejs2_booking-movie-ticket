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
import { SchedulePagination } from '../constant/pagination.constant';
import { Pagination, paginations } from '../pagination/pagination';
import { ScheduleSaveRequestDto } from '../dtos/req/schedule/schedule.save.req.dto';
import { RoomRepository } from '../repositories/room.repository';
import { Transactional } from 'typeorm-transactional';
import { ScheduleStatus } from '../enum/schedule.status.enum';

@injectable()
export class ScheduleService {
  constructor(
    @inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,

    @inject(MovieService)
    private readonly movieService: MovieService,

    @inject(TicketRepository)
    private readonly ticketRepository: TicketRepository,

    @inject(RoomRepository)
    private readonly roomRepository: RoomRepository,
  ) {}

  private makeInfoSchedulesQueryBuilderByMovidId(
    movieId: number,
  ): SelectQueryBuilder<Schedule> {
    const sq = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.schedule', 'schedule')
      .where(`schedule.movieId = ${movieId}`)
      .andWhere('schedule.active = true')
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
      .andWhere('schedule.active = true')
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
      .andWhere('schedule.active = true')
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
      .andWhere('schedule.active = true')
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

  public async getAllWithConditions(
    movieName: string = null,
    dateSearch: string = null,
    page: number,
  ) {
    let queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.movie', 'movie')
      .innerJoinAndSelect('schedule.room', 'room');

    if (movieName) {
      queryBuilder = queryBuilder.where(
        `match(movie.name) against('${movieName}' IN NATURAL LANGUAGE MODE)`,
      );
    }

    if (dateSearch) {
      queryBuilder = queryBuilder.where(
        'schedule.startDate = DATE(:dateSearch)',
        { dateSearch },
      );
    }

    const pagination: Pagination<Schedule> = await paginations<Schedule>(
      page,
      SchedulePagination,
      queryBuilder,
    );

    if (!pagination) {
      return {
        message: 'OK',
        status: StatusEnum.OK,
        data: null,
      } as AppBaseResponseDto;
    }

    const data = pagination.items
      .map((item) => {
        let { id, startDate, startTime, movie, room, active } = item;
        let { id: movieId, duration, name: movieName } = movie;
        let { id: roomId, name: roomName, totalArea, capacity } = room;

        return {
          id,
          startDate,
          startTime,
          active,
          movie: {
            id: movieId,
            duration,
            name: movieName,
          },
          room: {
            id: roomId,
            name: roomName,
            totalArea,
            capacity,
          },
        };
      })
      .sort((o1: any, o2: any) => {
        const time1 = new Date(o1.startDate + ' ' + o1.startTime).getTime();
        const time2 = new Date(o2.startDate + ' ' + o2.startTime).getTime();
        return time2 - time1;
      });

    return {
      message: 'OK',
      status: StatusEnum.OK,
      data: {
        ...pagination,
        items: data,
      },
    } as AppBaseResponseDto;
  }

  private async checkValidScheduleDto(
    dto: ScheduleSaveRequestDto,
  ): Promise<boolean> {
    const [movie, room] = await Promise.all([
      this.movieService.getMovieDetail(dto.movieId),
      this.roomRepository.findOneBy({ id: dto.roomId }),
    ]);

    if (!movie) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          movie: 'Movie not exsist',
        },
      } as ErrorApiResponseDto;
    }

    if (!room) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          room: 'Room not exsist',
        },
      } as ErrorApiResponseDto;
    }

    const startDate = dto.startDate.toISOString().split('T')[0];
    if (new Date(startDate + ' ' + dto.startTime) <= new Date()) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          time: 'Time schedule greater than now',
        },
      } as ErrorApiResponseDto;
    }

    const schedule = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.movie', 'movie')
      .where(`schedule.movieId ${dto['id'] ? '!=' : '='} :movieId`, {
        movieId: dto.movieId,
      })
      .andWhere('schedule.roomId = :roomId', { roomId: dto.roomId })
      .andWhere('schedule.active = true')
      .andWhere(
        `
        not (
          DATE_ADD(ADDTIME(schedule.startDate, schedule.startTime), INTERVAL movie.duration MINUTE) < ADDTIME(DATE(:startDate), :startTime) or
          ADDTIME(schedule.startDate, schedule.startTime) > DATE_ADD(ADDTIME(DATE(:startDate), :startTime), INTERVAL :duration MINUTE)
        )
        `,
        { startDate, startTime: dto.startTime, duration: movie.duration },
      )
      .getOne();

    if (schedule) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          schedule: 'Duplicate schedule',
        },
      } as ErrorApiResponseDto;
    }

    return true;
  }

  @Transactional()
  public async save(dto: ScheduleSaveRequestDto) {
    if (dto['id']) {
      return this.update(dto);
    }
    return this.create(dto);
  }

  private async update(dto: ScheduleSaveRequestDto) {
    const id = dto['id'];
    let schedule = await this.scheduleRepository.findOneBy({
      id,
      active: true,
    });
    if (!schedule) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          schedule: 'Schedule not exsist',
        },
      } as ErrorApiResponseDto;
    }

    if (!(await this.checkValidScheduleDto(dto))) return;
    schedule = this.scheduleRepository.create({
      id,
      movieId: dto.movieId,
      roomId: dto.roomId,
      startDate: dto.startDate,
      startTime: dto.startTime,
    });
    await this.scheduleRepository.save(schedule);

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: null,
    } as AppBaseResponseDto;
  }

  private async create(dto: ScheduleSaveRequestDto) {
    if (!(await this.checkValidScheduleDto(dto))) return;

    const schedule = this.scheduleRepository.create({
      movieId: dto.movieId,
      roomId: dto.roomId,
      startDate: dto.startDate,
      startTime: dto.startTime,
    });
    await this.scheduleRepository.save(schedule);

    return {
      status: StatusEnum.CREATED,
      message: 'OK',
      data: null,
    } as AppBaseResponseDto;
  }

  public async changeStatus(id: number, status: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['tickets'],
    });
    if (!schedule) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          schedule: 'Schedule not exsist',
        },
      } as ErrorApiResponseDto;
    }

    const timeShow = new Date(schedule.startDate + ' ' + schedule.startTime);
    console.log(timeShow >= new Date() && schedule.tickets?.length);
    if (timeShow >= new Date() && schedule.tickets?.length) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          schedule:
            'Schedule time show must be less now or number of tickets in schedule empty',
        },
      } as ErrorApiResponseDto;
    }

    switch (status) {
      case ScheduleStatus.ACTIVE:
        schedule.active = true;
        break;
      case ScheduleStatus.INACTIVE:
        schedule.active = false;
        break;
      default:
        throw {
          status: StatusEnum.BAD_REQUEST,
          message: 'Bad Request',
          errors: {
            status: 'Status schedule must be enum(ACTIVE, INACTIVE)',
          },
        } as ErrorApiResponseDto;
    }

    await this.scheduleRepository.save(schedule);

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: null,
    } as AppBaseResponseDto;
  }
}
