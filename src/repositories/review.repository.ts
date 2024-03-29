import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Review } from '../entities/review.entity';

@injectable()
export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super(Review);
  }
}
