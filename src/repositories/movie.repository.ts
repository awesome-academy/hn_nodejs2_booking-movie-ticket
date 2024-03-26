import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Movie } from '../entities/movie.entity';

@injectable()
export class MovieRepository extends BaseRepository<Movie> {
  constructor() {
    super(Movie);
  }
}
