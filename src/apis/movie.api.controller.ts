import { inject } from 'tsyringe';
import {
  GetMapping,
  Query,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { MovieService } from '../services/movie.service';
import { AllMoviesRequestDto } from '../dtos/req/movie/movie.all.req.dto';
import { PipeDto } from '../decoratos/api/pipe.decorator';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../enum/status.enum';

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
  ) {
    const pagination = await this.movieService.getMoivesWithPagination(
      allMoviesRequestDto.page,
      allMoviesRequestDto.name,
      allMoviesRequestDto.categoryIds,
      allMoviesRequestDto.age,
    );
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
}
