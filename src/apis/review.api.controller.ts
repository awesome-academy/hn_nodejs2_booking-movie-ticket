import { inject } from 'tsyringe';
import {
  GetMapping,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { Request, Response, NextFunction } from 'express';
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
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<AppBaseResponseDto> {
    const movieId = +req.query.movieId;
    const page = +req.query.page;
    const star = +req.query.star;
    const starGreat =
      +req.query.starGreat == 1 || +req.query.starGreat == 0
        ? !!+req.query.starGreat
        : true;
    const dateEarly =
      +req.query.dateEarly == 1 || +req.query.dateEarly == 0
        ? !!+req.query.dateEarly
        : false;
    const ofUser = req.query.ofUser;
    const result = await this.reviewService.findAllByStarWithPagination(
      movieId,
      star,
      page,
      starGreat,
      dateEarly,
      req.session['user']?.id
        ? ofUser == '1'
          ? req.session['user'].id
          : null
        : null,
    );
    return result;
  }
}
