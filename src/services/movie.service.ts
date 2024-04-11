import { inject, injectable } from 'tsyringe';
import { MovieRepository } from '../repositories/movie.repository';
import { Movie } from '../entities/movie.entity';
import { MoreThan } from 'typeorm';
import { ScheduleRepository } from '../repositories/schedule.repository';

@injectable()
export class MovieService {
  constructor(
    @inject(MovieRepository)
    private readonly movieRepository: MovieRepository,

    @inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,
  ) {}

  public async getNewestFilms(): Promise<Movie[]> {
    const newestFilms = await this.movieRepository.find({
      where: {
        startDateShowing: MoreThan(new Date()),
      },
      order: { id: 'ASC' },
    });
    return newestFilms;
  }

  public async getHotFilms(): Promise<Movie[]> {
    const subquery = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.tickets', 'ticket')
      .getQuery();

    const hotFilms = await this.movieRepository
      .createQueryBuilder('movie')
      .addSelect('count(subquery.schedule_id) as quantity_of_ticket')
      .innerJoin(`(${subquery})`, 'subquery')
      .where('subquery.schedule_movie_id = movie.id')
      .groupBy('subquery.schedule_id')
      .orderBy('quantity_of_ticket', 'DESC')
      .addOrderBy('movie.id', 'ASC')
      .offset(0)
      .limit(6)
      .getMany();

    return hotFilms;
  }
}
