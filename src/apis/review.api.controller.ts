import { inject } from 'tsyringe';
import {
  Body,
  DeleteMapping,
  GetMapping,
  PostMapping,
  PutMapping,
  Query,
  RestController,
  Session,
} from '../decoratos/api/rest.api.decorator';
import { ReviewService } from '../services/review.service';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import {
  SessionAuthen,
  UserFromSession,
} from '../decoratos/api/guards/guard.auth.decorator';
import { ReviewSaveRequestDto } from '../dtos/req/review/review.req.dto';
import { ParseIntPipe, PipeDto } from '../decoratos/api/pipe.decorator';
import { User } from '../entities/user.entity';
import { CSRFProtection } from '../decoratos/api/guards/guard.csrf.decorator';
import { UserRole } from '../enum/user.enum';

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

  @SessionAuthen()
  @GetMapping('/one')
  public async getOneByUserIdAndMovieId(
    @UserFromSession()
    user: User,

    @Query('movieId', ParseIntPipe)
    movieId: number,

    @Query('userId')
    userId: number,
  ) {
    if (user.role == UserRole.ADMIN) {
      userId = +userId;
      return this.reviewService.getOneByUserIdAndMovieId(userId, movieId);
    }
    return this.reviewService.getOneByUserIdAndMovieId(user.id, movieId);
  }

  @SessionAuthen()
  @CSRFProtection()
  @PostMapping('/')
  public async create(
    @Body(null, PipeDto(ReviewSaveRequestDto))
    reviewSaveRequestDto: ReviewSaveRequestDto,

    @UserFromSession()
    user: User,
  ) {
    return await this.reviewService.createReview(reviewSaveRequestDto, user.id);
  }

  @SessionAuthen()
  @CSRFProtection()
  @PutMapping('/')
  public async update(
    @Body(null, PipeDto(ReviewSaveRequestDto))
    reviewSaveRequestDto: ReviewSaveRequestDto,

    @UserFromSession()
    user: User,
  ) {
    return this.reviewService.updateReview(reviewSaveRequestDto, user.id);
  }

  @SessionAuthen()
  @CSRFProtection()
  @DeleteMapping('/')
  public async delete(
    @Body('billId', ParseIntPipe)
    billId: number,

    @UserFromSession()
    user: User,
  ) {
    return this.reviewService.deleteReview(billId, user.id);
  }
}
