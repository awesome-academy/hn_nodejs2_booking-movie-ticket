import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { PurchasedFood } from '../entities/purchased.food.entity';

@injectable()
export class PurchasedFoodRepository extends BaseRepository<PurchasedFood> {
  constructor() {
    super(PurchasedFood);
  }
}
