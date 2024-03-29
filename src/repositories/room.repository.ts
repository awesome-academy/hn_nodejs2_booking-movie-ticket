import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Room } from '../entities/room.entity';

@injectable()
export class RoomRepository extends BaseRepository<Room> {
  constructor() {
    super(Room);
  }
}
