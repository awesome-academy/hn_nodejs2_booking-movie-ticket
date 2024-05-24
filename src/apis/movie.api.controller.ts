import { inject } from 'tsyringe';
import {
  Body,
  Files,
  GetMapping,
  PostMapping,
  PutMapping,
  Query,
  RestController,
  Session,
} from '../decoratos/api/rest.api.decorator';
import { MovieService } from '../services/movie.service';
import { AllMoviesRequestDto } from '../dtos/req/movie/movie.all.req.dto';
import { PipeDto } from '../decoratos/api/pipe.decorator';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../enum/status.enum';
import session from 'express-session';
import { UserRole } from '../enum/user.enum';
import { Category } from '../entities/category.entity';
import { MultiPart, MultiParts } from '../decoratos/api/multipart.decorator';
import { CSRFProtection } from '../decoratos/api/guards/guard.csrf.decorator';
import { ImageFilesGuard } from '../decoratos/api/guards/guard.image.file.decorator';
import { AdminAuth } from '../decoratos/api/guards/guard.admin.auth.decorator';
import {
  MovieSaveRequestDto,
  MovieUpdateRequestDto,
} from '../dtos/req/movie/movie.save.req.dto';

@RestController('/api/movie')
export class MovieRestController {
  constructor(
    @inject(MovieService)
    private readonly movieService: MovieService,
  ) {}

  @GetMapping('/')
  public async getAllMoviesWithPagination(
    @Query(null, PipeDto(AllMoviesRequestDto))
    allMoviesRequestDto: AllMoviesRequestDto,

    @Session()
    session: session.Session & Partial<session.SessionData>,
  ) {
    const adminRequest =
      session?.['user']?.role == UserRole.ADMIN ? true : false;

    const pagination = await this.movieService.getMoivesWithPagination(
      allMoviesRequestDto.page,
      allMoviesRequestDto.name,
      allMoviesRequestDto.categoryIds,
      allMoviesRequestDto.age,
      adminRequest,
    );
    if (session?.['user']?.role == UserRole.ADMIN) {
      return {
        message: 'OK',
        status: StatusEnum.OK,
        data: pagination
          ? {
              ...pagination,
              items: pagination.items.map((item) => {
                const { createdAt, updatedAt, ...rest } = item;
                rest.categories = rest.categories.map((category) => {
                  const { createdAt, updatedAt, ...categoryRest } = category;
                  return categoryRest as Category;
                });
                return rest;
              }),
            }
          : null,
      } as AppBaseResponseDto;
    }
    return {
      message: 'OK',
      status: StatusEnum.OK,
      data: pagination
        ? {
            ...pagination,
            items: pagination.items.map((item) => {
              return {
                id: item.id,
                name: item.name,
                smallImgurl: item.smallImgurl,
                shortDescription: item.shortDescription,
              };
            }),
          }
        : null,
    } as AppBaseResponseDto;
  }

  @AdminAuth()
  @MultiParts({
    fields: [
      { name: 'largeImgurl', maxCount: 1 },
      { name: 'smallImgurl', maxCount: 1 },
    ],
  })
  @CSRFProtection()
  @ImageFilesGuard()
  @PostMapping('/')
  public async create(
    @Body(null, PipeDto(MovieSaveRequestDto))
    movieSaveRequestDto: MovieSaveRequestDto,

    @Files('largeImgurl')
    largeImgurl: Express.Multer.File,

    @Files('smallImgurl')
    smallImgurl: Express.Multer.File,
  ) {
    return this.movieService.save(
      movieSaveRequestDto,
      largeImgurl?.[0],
      smallImgurl?.[0],
    );
  }

  @AdminAuth()
  @MultiParts({
    fields: [
      { name: 'largeImgurl', maxCount: 1 },
      { name: 'smallImgurl', maxCount: 1 },
    ],
  })
  @CSRFProtection()
  @ImageFilesGuard()
  @PutMapping('/')
  public async update(
    @Body(null, PipeDto(MovieUpdateRequestDto))
    movieUpdateRequestDto: MovieUpdateRequestDto,

    @Files('largeImgurl')
    largeImgurl: Express.Multer.File,

    @Files('smallImgurl')
    smallImgurl: Express.Multer.File,
  ) {
    return this.movieService.save(
      movieUpdateRequestDto,
      largeImgurl?.[0],
      smallImgurl?.[0],
    );
  }
}
