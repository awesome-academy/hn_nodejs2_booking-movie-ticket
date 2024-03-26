import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { User } from '../entities/user.entity';

@injectable()
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }
}
