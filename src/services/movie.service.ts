import { inject, injectable } from 'tsyringe';
import { MovieRepository } from '../repositories/movie.repository';
import { Movie } from '../entities/movie.entity';
import { MoreThan, SelectQueryBuilder } from 'typeorm';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { paginations, Pagination } from '../pagination/pagination';
import { AllMoviesPagination } from '../constant/pagination.constant';
import { ReviewRepository } from '../repositories/review.repository';
import { ObjectMapper } from '../utils/mapper';
import dayjs from 'dayjs';
import { DateFormat } from '../enum/date.format.enum';

@injectable()
export class MovieService {
  constructor(
    @inject(MovieRepository)
    private readonly movieRepository: MovieRepository,

    @inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,

    @inject(ReviewRepository)
    private readonly reviewRepository: ReviewRepository,
  ) {}

  public async getNewestFilms(): Promise<Movie[]> {
    const newestFilms = await this.movieRepository.find({
      where: {
        startDateShowing: MoreThan(new Date()),
      },
      order: { id: 'ASC' },
    });
    return newestFilms;
  }

  public async getHotFilms(): Promise<Movie[]> {
    const subquery = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.tickets', 'ticket')
      .getQuery();

    const hotFilms = await this.movieRepository
      .createQueryBuilder('movie')
      .addSelect('count(subquery.schedule_id) as quantity_of_ticket')
      .innerJoin(`(${subquery})`, 'subquery')
      .where('subquery.schedule_movie_id = movie.id')
      .andWhere(
        'DATE(NOW()) between movie.startDateShowing and movie.endDateShowing',
      )
      .groupBy('subquery.schedule_id')
      .orderBy('quantity_of_ticket', 'DESC')
      .addOrderBy('movie.id', 'ASC')
      .offset(0)
      .limit(6)
      .getMany();

    return hotFilms;
  }

  public async getMoivesWithPagination(
    page: number,
  ): Promise<Pagination<Movie>> {
    const queryBuilder = this.movieRepository.createQueryBuilder('movie');
    const pagination: Pagination<Movie> = await paginations<Movie>(
      page,
      AllMoviesPagination,
      queryBuilder,
    );
    return pagination;
  }

  private mapMovieWithStatisticStar(id: number): SelectQueryBuilder<Movie> {
    const stars = [1, 2, 3, 4, 5];
    const queryBuilder = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndMapMany('movie.categories', 'movie.categories', 'category')
      .where('movie.id = :id', { id });

    stars.forEach((item) => {
      const subquery = this.movieRepository
        .createQueryBuilder('movie')
        .select('movie.id', 'id')
        .addSelect('count(*)', `star${item}`)
        .innerJoin('movie.reviews', 'review')
        .where('movie.id = :id', { id })
        .andWhere(`review.star = ${item}`)
        .getQuery();

      queryBuilder
        .addSelect(`subquery${item}.star${item}`, `movie_star${item}`)
        .leftJoin(
          `(${subquery})`,
          `subquery${item}`,
          `subquery${item}.id = movie.id`,
        );
    });

    return queryBuilder;
  }

  public async getMovieDetail(id: number): Promise<Movie> {
    if (!id) {
      return null;
    }

    const queryBuilder = this.mapMovieWithStatisticStar(id);
    const rawResult = await queryBuilder.getRawMany();
    const movie: any = ObjectMapper.mapRawToEntity<Movie>(
      rawResult,
      'movie',
      ['category'],
      ['categories'],
    );

    let totalReview = 0;
    let totalStar = 0;
    [1, 2, 3, 4, 5].forEach((item) => {
      totalReview += +movie[`star${item}`];
      totalStar += +movie[`star${item}`] * item;
    });

    const categories: string = movie.categories.reduce(
      (prev: string, curr: any, index: number) => {
        if (index < movie.categories.length - 1) {
          return `${prev} ${curr.name},`;
        }
        return `${prev} ${curr.name}`;
      },
      '',
    );

    const now = new Date();
    return {
      ...movie,
      releaseDate: dayjs(movie.releaseDate).format(DateFormat.DD_MM_YYYY),
      startDateShowing: dayjs(movie.startDateShowing).format(
        DateFormat.DD_MM_YYYY,
      ),
      categories,
      status:
        now >= new Date(movie.startDateShowing) &&
        now <= new Date(movie.endDateShowing)
          ? 'active'
          : 'inactive',
      averageStar:
        totalReview == 0 ? null : (totalStar / totalReview).toFixed(1),
      totalReview,
      totalStar,
    } as unknown as Movie;
  }
}
