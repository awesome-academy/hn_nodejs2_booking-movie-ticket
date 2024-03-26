import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Schedule } from '../entities/schedule.entity';

@injectable()
export class ScheduleRepository extends BaseRepository<Schedule> {
  constructor() {
    super(Schedule);
  }
}
