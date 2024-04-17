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

@injectable()
export class ReviewService {
  constructor(
    @inject(ReviewRepository)
    private readonly reviewRepository: ReviewRepository,
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
      status: 200,
      data,
    } as AppBaseResponseDto;
  }
}
