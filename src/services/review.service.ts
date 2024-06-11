import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { inject, injectable } from 'tsyringe';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewPagination } from '../constant/pagination.constant';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { Pagination, paginations } from '../pagination/pagination';
import { ReviewResponseDto } from '../dtos/res/review/review.response.dto';
import { Review } from '../entities/review.entity';
import dayjs from 'dayjs';
import { DateFormat } from '../enum/date.format.enum';
import { UserConstant } from '../constant/user.constant';
import { SelectQueryBuilder } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { ReviewSaveRequestDto } from '../dtos/req/review/review.req.dto';
import { BillRepository } from '../repositories/bill.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { ObjectMapper } from '../utils/mapper';
import { ErrorApiResponseDto } from '../dtos/res/error.api.res.dto';

@injectable()
export class ReviewService {
  constructor(
    @inject(ReviewRepository)
    private readonly reviewRepository: ReviewRepository,

    @inject(BillRepository)
    private readonly billRepository: BillRepository,

    @inject(TicketRepository)
    private readonly ticketRepository: TicketRepository,
  ) {}

  private makeQueryBuilderFilterConditionMovieReview(
    movieId: number,
    star: number,
    criteriaStar: boolean,
    criteriaDate: boolean,
    userId: number,
  ): SelectQueryBuilder<Review> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.user', 'user', 'user.id = review.userId')
      .where('review.movieId = :movieId', { movieId });

    if (star >= 1 && star <= 5) {
      queryBuilder.andWhere('review.star = :star', { star });
    }

    if (criteriaStar) {
      queryBuilder
        .orderBy('review.star', 'DESC')
        .addOrderBy('review.updatedAt', 'DESC');
    }

    if (criteriaDate) {
      queryBuilder
        .orderBy('review.updatedAt', 'DESC')
        .addOrderBy('review.star', 'DESC');
    }

    if (userId) {
      queryBuilder.andWhere('review.userId = :userId', { userId });
    }

    return queryBuilder;
  }

  public async findAllByStarWithPagination(
    movieId: number,
    star: number,
    page: number,
    criteriaStar: boolean = true,
    criteriaDate: boolean = false,
    userId?: number,
  ): Promise<AppBaseResponseDto> {
    if (!movieId) {
      throw new AppException('Invalid movieId', StatusEnum.BAD_REQUEST);
    }
    if (isNaN(star) || star < 0 || star > 5) {
      throw new AppException('Invalid star', StatusEnum.BAD_REQUEST);
    }
    if (!page) {
      throw new AppException('Invalid page', StatusEnum.BAD_REQUEST);
    }

    const queryBuilder = this.makeQueryBuilderFilterConditionMovieReview(
      movieId,
      star,
      criteriaStar,
      criteriaDate,
      userId,
    );
    const pagination: Pagination<Review> = await paginations(
      page,
      ReviewPagination,
      queryBuilder,
    );
    const data = pagination
      ? {
          ...pagination,
          items: pagination.items.map((review: Review) => {
            const reviewResponseDto: ReviewResponseDto = {
              username: review.user.username,
              avatar: review.user.avatar
                ? review.user.avatar
                : UserConstant.NO_AVATAR,
              star: review.star,
              comment: review.comment,
              updatedAt: dayjs(review.updatedAt).format(
                DateFormat.DD_MM_YYYY_HH_mm_ss,
              ),
            };
            return reviewResponseDto;
          }),
        }
      : null;
    return {
      message: 'OK',
      status: StatusEnum.OK,
      data,
    } as AppBaseResponseDto;
  }

  public async getOneByUserIdAndMovieId(userId: number, movieId: number) {
    const review = await this.reviewRepository.findOneBy({
      userId,
      movieId,
    });

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: review
        ? {
            id: review.id,
            star: review.star,
            comment: review.comment,
            updatedAt: dayjs(review.updatedAt).format(
              DateFormat.DD_MM_YYYY_HH_mm_ss,
            ),
          }
        : null,
    } as AppBaseResponseDto;
  }

  private mapToBillEnity(obj: any) {
    let [bill, ticket, schedule, user] = [
      'bill',
      'ticket',
      'schedule',
      'user',
    ].map((prefix) => {
      let res = {};
      Object.keys(obj).forEach((key) => {
        if (key.startsWith(prefix)) {
          ObjectMapper.transformPropertyName(res, obj[key], key);
        }
      });
      return res;
    });
    bill = {
      ...bill,
      ticket,
      schedule,
      user,
    };

    return bill;
  }

  public async checkBillValidAndTimeValid(billId: number, userId: number) {
    const sq = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.schedule', 'schedule')
      .where(`ticket.billId = ${billId}`)
      .skip(0)
      .take(1)
      .getQuery();

    const rawResult = await this.billRepository
      .createQueryBuilder('bill')
      .innerJoinAndSelect(`(${sq})`, 'sq', 'bill.id = sq.ticket_bill_id')
      .innerJoinAndSelect('bill.user', 'user')
      .where('bill.id = :billId', { billId })
      .getRawOne();

    if (!rawResult) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          bill: 'Not Found',
        },
      } as ErrorApiResponseDto;
    }

    const bill = this.mapToBillEnity(rawResult);
    if (bill['user']?.id != userId) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          bill: 'Not Match Current User',
        },
      } as ErrorApiResponseDto;
    }

    const now = new Date().getTime();
    const schedule = new Date(
      dayjs(bill['schedule'].startDate).format(DateFormat.YYYY_MM_DD) +
        ' ' +
        bill['schedule'].startTime,
    ).getTime();

    if (now < schedule || now > schedule + +process.env.REVIEW_LIMIT_TIME) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          time: 'Time review not accepted',
        },
      } as ErrorApiResponseDto;
    }

    return bill;
  }

  @Transactional()
  public async createReview(
    reviewSaveRequestDto: ReviewSaveRequestDto,
    userId: number,
  ) {
    const bill: any = await this.checkBillValidAndTimeValid(
      reviewSaveRequestDto.billId,
      userId,
    );

    const newReview = this.reviewRepository.create({
      ...reviewSaveRequestDto,
      userId: bill.user.id,
      movieId: bill.schedule.movieId,
    });

    await this.reviewRepository.save(newReview);

    return {
      status: StatusEnum.CREATED,
      message: 'CREATED',
      data: null,
    } as AppBaseResponseDto;
  }

  @Transactional()
  public async updateReview(
    reviewSaveRequestDto: ReviewSaveRequestDto,
    userId: number,
  ) {
    const bill: any = await this.checkBillValidAndTimeValid(
      reviewSaveRequestDto.billId,
      userId,
    );
    const review = this.reviewRepository.create({
      ...reviewSaveRequestDto,
      userId: bill.user.id,
      movieId: bill.schedule.movieId,
    });
    await this.reviewRepository.update(
      {
        userId: review.userId,
        movieId: review.movieId,
      },
      {
        star: review.star,
        comment: review.comment,
      },
    );

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: null,
    } as AppBaseResponseDto;
  }

  @Transactional()
  public async deleteReview(billId: number, userId: number) {
    const bill: any = await this.checkBillValidAndTimeValid(billId, userId);
    const review = this.reviewRepository.create({
      userId: bill.user.id,
      movieId: bill.schedule.movieId,
    });
    await this.reviewRepository.delete({
      userId: review.userId,
      movieId: review.movieId,
    });
    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: null,
    } as AppBaseResponseDto;
  }
}
