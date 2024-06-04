import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { container } from 'tsyringe';
import { CategoryService } from '../src/services/category.service';
import { CategoryRepository } from '../src/repositories/category.repository';
import { faker } from '@faker-js/faker';
import { Category } from '../src/entities/category.entity';

let categoryService: CategoryService = null;
let categoryRepository: CategoryRepository = null;
let transactionManager = null;

beforeAll(async () => {
  await AppDataSource.initialize();
  categoryService = container.resolve(CategoryService);
  categoryRepository = container.resolve(CategoryRepository);
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.startTransaction();
  transactionManager = queryRunner.manager;
});

afterEach(async () => {
  if (transactionManager) {
    await transactionManager.queryRunner.rollbackTransaction();
    await transactionManager.queryRunner.release();
  }
});

describe('CategoryService', () => {
  describe('Test function getAllCategories', () => {
    it('Return all category when input empty', async () => {
      let categoriesExpect: Category[] = [];
      for (let i = 0; i < 5; i++) {
        categoriesExpect.push(
          categoryRepository.create({
            name: faker.person.fullName(),
          }),
        );
      }

      categoriesExpect = await categoryRepository.save(categoriesExpect);
      const categories = await categoryService.getAllCategories();

      expect(
        JSON.stringify(
          categories
            .filter((item, index) => {
              return index >= categories.length - 5;
            })
            .map((item) => ({
              id: item.id,
              name: item.name,
            })),
        ),
      ).toBe(
        JSON.stringify(
          categoriesExpect.map((item) => ({
            id: item.id,
            name: item.name,
          })),
        ),
      );

      categoryRepository.delete(categoriesExpect.map((item) => item.id));
    });
  });
});
