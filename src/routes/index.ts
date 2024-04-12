import express from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseRoute } from './base.route';
import { AuthenRoute } from './authen.route';
import { HomeRoute } from './home.route';
import { AuthenCheckGuard } from '../guards/authen.check.guard';
import { AllMoviesController } from '../controllers/all.movies.controller';

@injectable()
export class RootRoute extends BaseRoute {
  constructor(
    @inject(AuthenCheckGuard)
    private readonly authenCheckGuard: AuthenCheckGuard,

    @inject(AuthenRoute)
    private readonly authenRoute: AuthenRoute,

    @inject(HomeRoute)
    private readonly homeRoute: HomeRoute,

    @inject(AllMoviesController)
    private readonly allMoviesController: AllMoviesController,
  ) {
    super();
    this.router = express.Router();

    this.router.use(
      '/authen',
      this.authenCheckGuard.beforeAuthen,
      this.authenRoute.getRouter(),
    );
    this.router.use('/', this.homeRoute.getRouter());

    this.router.get(
      '/all-movies',
      this.allMoviesController.getAllMovies.bind(this.allMoviesController),
    );
  }
}
