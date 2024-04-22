import { injectable } from 'tsyringe';
import { Category } from '../entities/category.entity';
import { BaseRepository } from './base.repository';

@injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }
}
