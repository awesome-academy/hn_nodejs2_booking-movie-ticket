import express from 'express';
import { inject } from 'tsyringe';
import { BaseRoute } from './base.route';
import { AuthenRoute } from './authen.route';
import { HomeRoute } from './home.route';
import { AuthenCheckGuard } from '../guards/authen.check.guard';
import { AllMoviesRoute } from './all.movies.route';
import { MovieDetailRoute } from './movie.detail.route';
import { RestConfig } from '../decoratos/api/rest.api.decorator';
import { ReviewRestController } from '../apis/review.api.controller';
import { MovieRestController } from '../apis/movie.api.controller';

@RestConfig([ReviewRestController, MovieRestController])
export class RootRoute extends BaseRoute {
  constructor(
    @inject(AuthenCheckGuard)
    private readonly authenCheckGuard: AuthenCheckGuard,

    @inject(AuthenRoute)
    private readonly authenRoute: AuthenRoute,

    @inject(HomeRoute)
    private readonly homeRoute: HomeRoute,

    @inject(AllMoviesRoute)
    private readonly allMoviesRoute: AllMoviesRoute,

    @inject(MovieDetailRoute)
    private readonly movieDetailRoute: MovieDetailRoute,
  ) {
    super();
    this.router = express.Router();

    this.router.use(
      '/authen',
      this.authenCheckGuard.beforeAuthen,
      this.authenRoute.getRouter(),
    );
    this.router.use('/', this.homeRoute.getRouter());
    this.router.use('/', this.allMoviesRoute.getRouter());
    this.router.use('/', this.movieDetailRoute.getRouter());
  }
}
