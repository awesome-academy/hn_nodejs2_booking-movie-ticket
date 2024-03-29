import { inject, injectable } from 'tsyringe';
import { catchError } from '../decoratos/catcherror.decorators';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { MovieService } from '../services/movie.service';

@injectable()
export class HomeController {
  constructor(
    @inject(MovieService)
    private readonly movieService: MovieService,
  ) {}

  @catchError()
  public async getHomeView(req: Request, res: Response, next: NextFunction) {
    const newestFilms = await this.movieService.getNewestFilms();

    const hotFilms = await this.movieService.getHotFilms();

    res.render('home', {
      newestFilms,
      hotFilms,
      activeHeader: 'home',
    });
  }
}
