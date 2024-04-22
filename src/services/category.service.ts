import { inject, injectable } from 'tsyringe';
import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../entities/category.entity';

@injectable()
export class CategoryService {
  constructor(
    @inject(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }
}
