import express from 'express';
import { inject, injectable } from 'tsyringe';
import { AllMoviesController } from '../controllers/all.movies.controller';
import { BaseRoute } from './base.route';

@injectable()
export class AllMoviesRoute extends BaseRoute {
  constructor(
    @inject(AllMoviesController)
    private readonly allMoviesController: AllMoviesController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/all-movies',
      this.allMoviesController.getAllMovies.bind(this.allMoviesController),
    );
  }
}
