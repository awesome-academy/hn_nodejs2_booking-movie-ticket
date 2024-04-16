import { inject, injectable } from 'tsyringe';
import { MovieService } from '../services/movie.service';
import { Request, Response, NextFunction } from 'express';
import { Movie } from '../entities/movie.entity';

@injectable()
export class MovieDetailController {
  constructor(
    @inject(MovieService)
    private readonly movieService: MovieService,
  ) {}

  public async getMovieDeatil(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;
    const movie: Movie = await this.movieService.getMovieDetail(id);
    console.log('>>>movie:', movie);
    res.render('movie-detail', {
      movie,
    });
  }
}
