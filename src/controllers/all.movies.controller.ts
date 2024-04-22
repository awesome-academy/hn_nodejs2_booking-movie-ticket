import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { catchError } from '../decoratos/catcherror.decorators';
import { MovieService } from '../services/movie.service';
import { CategoryService } from '../services/category.service';

@injectable()
export class AllMoviesController {
  constructor(
    @inject(MovieService)
    private readonly movieService: MovieService,

    @inject(CategoryService)
    private readonly categoryService: CategoryService,
  ) {}

  @catchError()
  public async getAllMovies(req: Request, res: Response, next: NextFunction) {
    const page = req.query.page == undefined ? 1 : +req.query.page;

    const pagination = await this.movieService.getMoivesWithPagination(page);

    if (pagination == null) {
      res.render('no.data.ejs');
      return;
    }

    const categories = await this.categoryService.getAllCategories();

    res.render('allmovies', {
      ...pagination,
      movies: pagination.items,
      categories,
      activeHeader: 'allMovies',
    });
  }
}
