import express from 'express';
import { injectable, inject } from 'tsyringe';
import { BaseRoute } from './base.route';
import { MovieDetailController } from '../controllers/movie.detail.controller';

@injectable()
export class MovieDetailRoute extends BaseRoute {
  constructor(
    @inject(MovieDetailController)
    private readonly movieDetailController: MovieDetailController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/movie-details/:id',
      this.movieDetailController.getMovieDeatil.bind(
        this.movieDetailController,
      ),
    );
  }
}
