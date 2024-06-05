import 'reflect-metadata';
import { container } from 'tsyringe';
import { AppDataSource } from '../src/config/database';
import { ReviewRepository } from '../src/repositories/review.repository';
import { ReviewService } from '../src/services/review.service';
import { ReviewSaveRequestDto } from '../src/dtos/req/review/review.req.dto';
import { faker } from '@faker-js/faker';

let reviewService: ReviewService = null;
let reviewRepository: ReviewRepository = null;
let transactionManager = null;

beforeAll(async () => {
  await AppDataSource.initialize();
  reviewService = container.resolve(ReviewService);
  reviewRepository = container.resolve(ReviewRepository);
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

describe('Review Service', () => {
  describe('Test function findAllByStarWithPagination', () => {
    it('Return reviews when input include movieId, star, page, criteriaStar, criteriaDate', async () => {
      const response = await reviewService.findAllByStarWithPagination(
        11,
        4,
        1,
        true,
        true,
        9,
      );
      expect(
        JSON.stringify(response?.data?.items.map((item: any) => item.star)),
      ).toEqual(JSON.stringify(response?.data?.items.map((item: any) => 4)));
    });

    it('Throw error when movieId invalid integer format', async () => {
      try {
        await reviewService.findAllByStarWithPagination(
          NaN,
          4,
          1,
          true,
          true,
          9,
        );
      } catch (error) {
        expect(error.message).toEqual('Invalid movieId');
      }
    });

    it('Throw error when movieId invalid page', async () => {
      try {
        await reviewService.findAllByStarWithPagination(
          11,
          4,
          NaN,
          true,
          true,
          9,
        );
      } catch (error) {
        expect(error.message).toEqual('Invalid page');
      }
    });

    it('Throw error when movieId invalid page', async () => {
      try {
        await reviewService.findAllByStarWithPagination(
          11,
          NaN,
          1,
          true,
          true,
          9,
        );
      } catch (error) {
        expect(error.message).toEqual('Invalid star');
      }
    });
  });

  describe('Test function getOneByUserIdAndMovieId', () => {
    it('Return review when input include userId and movieId', async () => {
      const response = await reviewService.getOneByUserIdAndMovieId(9, 11);
      expect(response.data).toBeTruthy();
    });

    it('Return null when input include userId and movieId does not exist', async () => {
      const response = await reviewService.getOneByUserIdAndMovieId(9, 101);
      expect(response.data).toBeNull();
    });

    it('Return null when input include userId does not exist and movieId', async () => {
      const response = await reviewService.getOneByUserIdAndMovieId(900, 11);
      expect(response.data).toBeNull();
    });
  });

  describe('Test function createReview', () => {
    it('Throw error when billId does not exist', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1000;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1);
      } catch (error) {
        expect(error.errors.bill).toEqual('Not Found');
      }
    });

    it('Throw error when not match current user', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1000);
      } catch (error) {
        expect(error.errors.bill).toEqual('Not Match Current User');
      }
    });

    it('Throw error when time review not accepted', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1);
      } catch (error) {
        expect(error.errors.time).toEqual('Time review not accepted');
      }
    });

    it('Created review success when ReviewSaveRequestDto and userId valid', async () => {
      const reviewSaveRequestDto: ReviewSaveRequestDto =
        new ReviewSaveRequestDto();
      reviewSaveRequestDto.billId = 11;
      reviewSaveRequestDto.comment = faker.lorem.text();
      reviewSaveRequestDto.star = 4;
      await reviewService.createReview(reviewSaveRequestDto, 3);
      const reviewExpect = await reviewRepository
        .createQueryBuilder('review')
        .orderBy('review.id', 'DESC')
        .getOne();

      expect(
        JSON.stringify({
          comment: reviewSaveRequestDto.comment,
          star: reviewSaveRequestDto.star,
        }),
      ).toEqual(
        JSON.stringify({
          comment: reviewExpect.comment,
          star: reviewExpect.star,
        }),
      );
    });
  });

  describe('Test function updateReview', () => {
    it('Throw error when billId does not exist', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1000;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1);
      } catch (error) {
        expect(error.errors.bill).toEqual('Not Found');
      }
    });

    it('Throw error when not match current user', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1000);
      } catch (error) {
        expect(error.errors.bill).toEqual('Not Match Current User');
      }
    });

    it('Throw error when time review not accepted', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1);
      } catch (error) {
        expect(error.errors.time).toEqual('Time review not accepted');
      }
    });

    it('Updated review success when ReviewSaveRequestDto and userId valid', async () => {
      const reviewSaveRequestDto: ReviewSaveRequestDto =
        new ReviewSaveRequestDto();
      reviewSaveRequestDto.billId = 11;
      reviewSaveRequestDto.comment = faker.lorem.text();
      reviewSaveRequestDto.star = 4;

      await reviewService.updateReview(reviewSaveRequestDto, 3);

      const reviewExpect = await reviewRepository
        .createQueryBuilder('review')
        .where('review.userId = :userId', { userId: 3 })
        .andWhere('review.movieId = :movieId', { movieId: 9 })
        .getOne();

      expect(
        JSON.stringify({
          comment: reviewSaveRequestDto.comment,
          star: reviewSaveRequestDto.star,
        }),
      ).toEqual(
        JSON.stringify({
          comment: reviewExpect.comment,
          star: reviewExpect.star,
        }),
      );
    });
  });

  describe('Test function deleteReview', () => {
    it('Throw error when billId does not exist', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1000;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1);
      } catch (error) {
        expect(error.errors.bill).toEqual('Not Found');
      }
    });

    it('Throw error when not match current user', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1000);
      } catch (error) {
        expect(error.errors.bill).toEqual('Not Match Current User');
      }
    });

    it('Throw error when time review not accepted', async () => {
      try {
        const reviewSaveRequestDto: ReviewSaveRequestDto =
          new ReviewSaveRequestDto();
        reviewSaveRequestDto.billId = 1;
        reviewSaveRequestDto.comment = faker.lorem.text();
        reviewSaveRequestDto.star = 4;
        await reviewService.createReview(reviewSaveRequestDto, 1);
      } catch (error) {
        expect(error.errors.time).toEqual('Time review not accepted');
      }
    });

    it('Deleted review success when ReviewSaveRequestDto and userId valid', async () => {
      await reviewService.deleteReview(11, 3);

      const review = await reviewRepository
        .createQueryBuilder('review')
        .where('review.userId = :userId', { userId: 3 })
        .andWhere('review.movieId = :movieId', { movieId: 9 })
        .getOne();

      expect(review).toBeNull();
    });
  });
});
