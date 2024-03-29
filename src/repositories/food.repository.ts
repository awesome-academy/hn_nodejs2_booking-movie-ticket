import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Food } from '../entities/food.entity';

@injectable()
export class FoodRepository extends BaseRepository<Food> {
  constructor() {
    super(Food);
  }
}
