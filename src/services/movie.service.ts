import * as dotenv from 'dotenv';
dotenv.config();

import { inject, injectable } from 'tsyringe';
import { MovieRepository } from '../repositories/movie.repository';
import { Movie } from '../entities/movie.entity';
import { MoreThan, SelectQueryBuilder, Transaction } from 'typeorm';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { paginations, Pagination } from '../pagination/pagination';
import { AllMoviesPagination } from '../constant/pagination.constant';
import { ReviewRepository } from '../repositories/review.repository';
import { ObjectMapper } from '../utils/mapper';
import dayjs from 'dayjs';
import { DateFormat } from '../enum/date.format.enum';
import {
  MovieSaveRequestDto,
  MovieUpdateRequestDto,
} from '../dtos/req/movie/movie.save.req.dto';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { CategoryRepository } from '../repositories/category.repository';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../enum/status.enum';
import { AppException } from '../exceptions/app.exception';
import { Transactional } from 'typeorm-transactional';
import { ErrorApiResponseDto } from '../dtos/res/error.api.res.dto';

@injectable()
export class MovieService {
  constructor(
    @inject(MovieRepository)
    private readonly movieRepository: MovieRepository,

    @inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,

    @inject(ReviewRepository)
    private readonly reviewRepository: ReviewRepository,

    @inject(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
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

  private makeQueryBuilderMovieWithMultiCondition(
    name: string,
    categoryIds: number[],
    age: number,
    adminRequest: boolean = false,
  ): SelectQueryBuilder<Movie> {
    const queryBuilder = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndMapMany('movie.categories', 'movie.categories', 'category')
      .where('1 = 1');

    if (!adminRequest) {
      queryBuilder.andWhere('movie.active = :active', { active: true });
    }

    if (name != null) {
      // mysql FULLTEXT SEARCH
      queryBuilder.andWhere(
        'match(movie.name) against(:name IN NATURAL LANGUAGE MODE)',
        { name },
      );
    }

    if (categoryIds) {
      categoryIds.forEach((categoryId, index) => {
        const subquery = this.movieRepository
          .createQueryBuilder('movie')
          .addSelect('category.id', 'categoryId')
          .innerJoin('movie.categories', 'category')
          .getQuery();

        queryBuilder.innerJoin(
          `(${subquery})`,
          `subquery${index + 1}`,
          `subquery${index + 1}.movie_id = movie.id and subquery${index + 1}.categoryId = :categoryId`,
          {
            categoryId,
          },
        );
      });
    }

    if (age != null) {
      queryBuilder
        .andWhere('movie.ageLimit >= :age', { age })
        .orWhere('movie.ageLimit is null');
    }

    return queryBuilder;
  }

  public async getMoivesWithPagination(
    page: number,
    name: string = null,
    categoryIds: number[] = null,
    age: number = null,
    adminRequest: boolean = false,
  ): Promise<Pagination<Movie>> {
    const queryBuilder = this.makeQueryBuilderMovieWithMultiCondition(
      name,
      categoryIds,
      age,
      adminRequest,
    );
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
      .innerJoinAndMapMany('movie.categories', 'movie.categories', 'category')
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

  @Transactional()
  public async save(
    dto: MovieUpdateRequestDto | MovieSaveRequestDto,
    largeImage: Express.Multer.File = null,
    smallImage: Express.Multer.File = null,
  ) {
    if (!dto['movieId']) {
      return await this.create(dto, largeImage, smallImage);
    }
    return await this.update(
      dto as MovieUpdateRequestDto,
      largeImage,
      smallImage,
    );
  }

  private async create(
    dto: MovieSaveRequestDto,
    largeImgurl: Express.Multer.File = null,
    smallImgurl: Express.Multer.File = null,
  ) {
    if (!largeImgurl) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          largeImage: 'Large image not empty',
        },
      } as ErrorApiResponseDto;
    }

    if (!smallImgurl) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          smallImage: 'Small image not empty',
        },
      } as ErrorApiResponseDto;
    }

    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id in (:ids)', { ids: dto.categoryIds })
      .getMany();

    if (categories.length != dto.categoryIds.length) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Exsist category not exsist',
      } as AppException;
    }

    const originalLargeImageName = largeImgurl.originalname;
    const newLargeImageName = `${uuidv4()}.${originalLargeImageName.substring(originalLargeImageName.lastIndexOf('.') + 1)}`;

    const originalSmallImageName = smallImgurl.originalname;
    const newSmallImageName = `${uuidv4()}.${originalSmallImageName.substring(originalSmallImageName.lastIndexOf('.') + 1)}`;

    if (!dto.ageLimit) dto.ageLimit = null;

    const movie = this.movieRepository.create({
      ...dto,
      categories,
      largeImgurl: path.join(
        '/',
        process.env.LARGE_IMAGE_PUBLIC_PATH,
        newLargeImageName,
      ),
      smallImgurl: path.join(
        '/',
        process.env.SMALL_IMAGE_PUBLIC_PATH,
        newSmallImageName,
      ),
    });

    await Promise.all([
      this.movieRepository.save(movie),
      fs.writeFile(
        path.join(
          __dirname,
          '..',
          process.env.LARGE_IMAGE_REAL_PATH,
          newLargeImageName,
        ),
        largeImgurl.buffer,
        (err) => {},
      ),

      fs.writeFile(
        path.join(
          __dirname,
          '..',
          process.env.SMALL_IMAGE_REAL_PATH,
          newSmallImageName,
        ),
        smallImgurl.buffer,
        (err) => {},
      ),
    ]);

    return {
      status: StatusEnum.CREATED,
      message: 'Created',
      data: movie,
    } as AppBaseResponseDto;
  }

  private async update(
    dto: MovieUpdateRequestDto,
    largeImgurl: Express.Multer.File = null,
    smallImgurl: Express.Multer.File = null,
  ) {
    let movie = await this.movieRepository.findOneBy({ id: dto.movieId });
    if (!movie) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Movie not exsist',
      } as AppException;
    }

    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id in (:ids)', { ids: dto.categoryIds })
      .getMany();

    if (categories.length != dto.categoryIds.length) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Exsist category not exsist',
      } as AppException;
    }

    if (!dto['largeImgurl']) dto['largeImgurl'] = movie.largeImgurl;
    if (!dto['smallImgurl']) dto['smallImgurl'] = movie.smallImgurl;
    if (!dto.ageLimit) dto.ageLimit = null;

    movie = {
      ...movie,
      ...dto,
      categories,
    };

    if (largeImgurl) {
      const originalLargeImageName = largeImgurl.originalname;
      const newLargeImageName = `${uuidv4()}.${originalLargeImageName.substring(originalLargeImageName.lastIndexOf('.') + 1)}`;
      movie = {
        ...movie,
        largeImgurl: path.join(
          '/',
          process.env.LARGE_IMAGE_PUBLIC_PATH,
          newLargeImageName,
        ),
      };
      await Promise.all([
        fs.writeFile(
          path.join(
            __dirname,
            '..',
            process.env.LARGE_IMAGE_REAL_PATH,
            newLargeImageName,
          ),
          largeImgurl.buffer,
          (err) => {},
        ),
        fs.unlink(
          path.join(
            __dirname,
            '..',
            process.env.LARGE_IMAGE_REAL_PATH,
            dto['largeImgurl'].replace('/img/movie/large/', ''),
          ),
          (err) => {},
        ),
      ]);
    }

    if (smallImgurl) {
      const originalSmallImageName = smallImgurl.originalname;
      const newSmallImageName = `${uuidv4()}.${originalSmallImageName.substring(originalSmallImageName.lastIndexOf('.') + 1)}`;
      movie = {
        ...movie,
        smallImgurl: path.join(
          '/',
          process.env.SMALL_IMAGE_PUBLIC_PATH,
          newSmallImageName,
        ),
      };
      await Promise.all([
        fs.writeFile(
          path.join(
            __dirname,
            '..',
            process.env.SMALL_IMAGE_REAL_PATH,
            newSmallImageName,
          ),
          smallImgurl.buffer,
          (err) => {},
        ),
        fs.unlink(
          path.join(
            __dirname,
            '..',
            process.env.SMALL_IMAGE_REAL_PATH,
            dto['smallImgurl'].replace('/img/movie/small/', ''),
          ),
          (err) => {},
        ),
      ]);
    }

    await this.movieRepository.save(movie);

    return {
      status: StatusEnum.OK,
      message: 'Updated',
      data: movie,
    } as AppBaseResponseDto;
  }
}
