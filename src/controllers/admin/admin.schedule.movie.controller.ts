import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { MovieRepository } from '../../repositories/movie.repository';
import { RoomRepository } from '../../repositories/room.repository';

@injectable()
export class AdminScheduleMovieController {
  constructor(
    @inject(MovieRepository)
    private readonly movieRepository: MovieRepository,

    @inject(RoomRepository)
    private readonly roomRepository: RoomRepository,
  ) {}

  public async getScheduleMovieView(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [movies, rooms] = await Promise.all([
      this.movieRepository.find({
        where: { active: true },
      }),
      this.roomRepository.find(),
    ]);
    res.render('admin/admin-schedule-movie', {
      active: 'manage-schedule',
      csrfToken: req.csrfToken(),
      movies,
      rooms,
    });
  }
}
