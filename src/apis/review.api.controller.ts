import { inject } from 'tsyringe';
import {
  GetMapping,
  Query,
  RestController,
  Session,
} from '../decoratos/api/rest.api.decorator';
import { ReviewService } from '../services/review.service';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';

@RestController('/api/review')
export class ReviewRestController {
  constructor(
    @inject(ReviewService)
    private readonly reviewService: ReviewService,
  ) {}

  @GetMapping('/')
  public async findAllByStarWithPagination(
    @Query() querySearch: any,
    @Session() session: any,
  ): Promise<AppBaseResponseDto> {
    const movieId = +querySearch.movieId;
    const page = +querySearch.page;
    const star = +querySearch.star;
    const starGreat =
      +querySearch.starGreat == 1 || +querySearch.starGreat == 0
        ? !!+querySearch.starGreat
        : true;
    const dateEarly =
      +querySearch.dateEarly == 1 || +querySearch.dateEarly == 0
        ? !!+querySearch.dateEarly
        : false;
    const ofUser = querySearch.ofUser;
    const result = await this.reviewService.findAllByStarWithPagination(
      movieId,
      star,
      page,
      starGreat,
      dateEarly,
      session['user']?.id ? (ofUser == '1' ? session['user'].id : null) : null,
    );
    return result;
  }
}
