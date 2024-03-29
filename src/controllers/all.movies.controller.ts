import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { catchError } from '../decoratos/catcherror.decorators';
import { AppException } from '../exceptions/app.exception';
import { MovieService } from '../services/movie.service';

@injectable()
export class AllMoviesController {
  constructor(
    @inject(MovieService)
    private readonly movieService: MovieService,
  ) {}

  @catchError()
  public async getAllMovies(req: Request, res: Response, next: NextFunction) {
    const page = req.query.page == undefined ? 1 : +req.query.page;

    const pagination = await this.movieService.getMoivesWithPagination(page);

    if (pagination == null) {
      res.render('no.data.ejs');
      return;
    }

    res.render('allmovies', {
      ...pagination,
      movies: pagination.items,
      activeHeader: 'allMovies',
    });
  }
}
