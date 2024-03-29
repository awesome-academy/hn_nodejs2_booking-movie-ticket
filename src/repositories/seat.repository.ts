import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Seat } from '../entities/seat.entity';

@injectable()
export class SeatRepository extends BaseRepository<Seat> {
  constructor() {
    super(Seat);
  }
}
