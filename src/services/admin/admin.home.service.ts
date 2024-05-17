import * as dotenv from 'dotenv';
dotenv.config();

import { inject, injectable } from 'tsyringe';
import { MovieRepository } from '../../repositories/movie.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { BillRepository } from '../../repositories/bill.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppBaseResponseDto } from '../../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../../enum/status.enum';
import { ObjectMapper } from '../../utils/mapper';

@injectable()
export class AdminHomeService {
  constructor(
    @inject(MovieRepository)
    private readonly movieRepository: MovieRepository,

    @inject(TicketRepository)
    private readonly ticketRepository: TicketRepository,

    @inject(BillRepository)
    private readonly billRepository: BillRepository,

    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async getAdminHomeInfo() {
    let month = new Date().getMonth();
    month = month == 0 ? 11 : month;

    const revenueQueryBuilder = this.billRepository
      .createQueryBuilder('bill')
      .select(
        'SUM(bill.totalPriceFromTicket + bill.totalPriceFromFood) as revenue',
      )
      .where('bill.payTime <= DATE(NOW()) and MONTH(bill.payTime) = :month', {
        month,
      });

    let [movieCount, ticketCount, revenue, userCount] = await Promise.all([
      this.movieRepository.count(),
      this.ticketRepository.count(),
      revenueQueryBuilder.getRawOne(),
      this.userRepository.count(),
    ]);

    revenue = +revenue.revenue;

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: {
        movieCount,
        ticketCount,
        revenue,
        userCount,
      },
    } as AppBaseResponseDto;
  }

  public async getAdminRevenueInTimeRange(timeRange: any) {
    const { startDate, endDate } = timeRange;
    const sq = this.ticketRepository
      .createQueryBuilder('ticket')
      .select('distinct bill.id as bill_id')
      .addSelect([
        'bill.pay_time',
        'bill.total_price_from_ticket',
        'bill.total_price_from_food',
        'schedule.movie_id as id',
        'ticket.id as ticket_id',
      ])
      .innerJoin('ticket.schedule', 'schedule')
      .innerJoin('ticket.bill', 'bill')
      .getQuery();

    const statisticMovieLimit = +process.env.ADMIN_STATISTIC_MOVIE_LIMIT;
    const sq1 = this.billRepository
      .createQueryBuilder('bill')
      .select(
        'sq.id, sum(sq.total_price_from_ticket + sq.total_price_from_food) as revenue',
      )
      .innerJoin(`(${sq})`, 'sq', 'sq.bill_id = bill.id')
      .where(
        `sq.pay_time >= DATE("${startDate}") and sq.pay_time <= DATE("${endDate}")`,
      )
      .groupBy('sq.id')
      .orderBy('revenue', 'DESC')
      .addOrderBy('sq.id', 'ASC')
      .offset(0)
      .limit(statisticMovieLimit)
      .getQuery();

    let movies = await this.movieRepository
      .createQueryBuilder('movie')
      .addSelect('sq1.revenue')
      .innerJoin(`(${sq1})`, 'sq1', 'movie.id = sq1.id')
      .getRawMany();

    movies = movies
      .map((item) => {
        return ObjectMapper.mapper(item);
      })
      .map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          revenue: +item.revenue,
        };
      });
    return {
      message: 'OK',
      status: StatusEnum.OK,
      data: movies,
    } as AppBaseResponseDto;
  }
}
