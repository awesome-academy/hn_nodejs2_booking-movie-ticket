import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { container } from 'tsyringe';
import { FoodService } from '../src/services/food.service';
import { FoodRepository } from '../src/repositories/food.repository';
import { faker } from '@faker-js/faker';
import { Food } from '../src/entities/food.entity';

let foodService: FoodService = null;
let foodRepository: FoodRepository = null;
let transactionManager = null;

beforeAll(async () => {
  await AppDataSource.initialize();
  foodService = container.resolve(FoodService);
  foodRepository = container.resolve(FoodRepository);
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

describe('FoodService', () => {
  describe('Test function getFoods', () => {
    it('Return all food when input empty', async () => {
      let foodsExpect: Food[] = [];
      for (let i = 0; i < 3; i++) {
        foodsExpect.push(
          foodRepository.create({
            imgurl: 'https://www.google.com.vn',
            description: faker.lorem.text(),
            price: 45000,
            quantity: 1000,
            unit: 'unit',
          }),
        );
      }
      foodsExpect = await foodRepository.save(foodsExpect);
      const foods = await foodService.getFoods();

      expect(
        JSON.stringify(
          foods.data
            .filter((item: Food, index: number) => {
              return index >= foods.data.length - 3;
            })
            .map((item: Food) => ({
              id: item.id,
              imgurl: item.imgurl,
              description: item.description,
              price: item.price,
              unit: item.unit,
            })),
        ),
      ).toBe(
        JSON.stringify(
          foodsExpect.map((item) => ({
            id: item.id,
            imgurl: item.imgurl,
            description: item.description,
            price: item.price,
            unit: item.unit,
          })),
        ),
      );

      foodRepository.delete(foodsExpect.map((item) => item.id));
    });
  });
});
