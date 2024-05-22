import { inject, injectable } from 'tsyringe';
import { MovieRepository } from '../../repositories/movie.repository';
import { AppException } from '../../exceptions/app.exception';
import { StatusEnum } from '../../enum/status.enum';
import { AppBaseResponseDto } from '../../dtos/res/app.api.base.res.dto';
import { MovieStatusEnum } from '../../enum/movie.status.enum';
import { Category } from '../../entities/category.entity';

@injectable()
export class AdminManageMovieService {
  constructor(
    @inject(MovieRepository)
    private readonly movieRepository: MovieRepository,
  ) {}

  public async changeStatusMovie({ movieId, status }) {
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
      relations: {
        categories: true,
      },
    });

    if (!movie) {
      throw {
        message: 'Movie not exsists',
        status: StatusEnum.BAD_REQUEST,
      } as AppException;
    }

    movie.active = status == MovieStatusEnum.ACTIVE ? true : false;
    this.movieRepository.save(movie);

    const { createdAt, updatedAt, ...movieRest } = movie;
    movieRest.categories = movieRest.categories.map((category) => {
      const { createdAt, updatedAt, ...categoryRest } = category;
      return categoryRest;
    }) as Category[];

    return {
      message: 'OK',
      status: StatusEnum.OK,
      data: movieRest,
    } as AppBaseResponseDto;
  }
}
