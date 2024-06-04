import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { MovieRepository } from '../src/repositories/movie.repository';
import { MovieService } from '../src/services/movie.service';
import { container } from 'tsyringe';
import {
  MovieSaveRequestDto,
  MovieUpdateRequestDto,
} from '../src/dtos/req/movie/movie.save.req.dto';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { DateFormat } from '../src/enum/date.format.enum';
import * as fs from 'fs';
import * as path from 'path';
import { ScheduleRepository } from '../src/repositories/schedule.repository';
import { TicketRepository } from '../src/repositories/ticket.repository';
import { AppException } from '../src/exceptions/app.exception';

let movieService: MovieService = null;
let movieRepository: MovieRepository = null;
let scheduleRepository: ScheduleRepository = null;
let ticketRepository: TicketRepository = null;
let transactionManager = null;

beforeAll(async () => {
  await AppDataSource.initialize();
  movieService = container.resolve(MovieService);
  movieRepository = container.resolve(MovieRepository);
  scheduleRepository = container.resolve(ScheduleRepository);
  ticketRepository = container.resolve(TicketRepository);
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

describe('MovieService', () => {
  describe('Test function getNewestFilms', () => {
    it('Return new movies when input empty', async () => {
      const newMoviesExpect = movieRepository.create(
        [1, 2, 3].map((item, index) => {
          return {
            active: true,
            actors: 'Nam actors',
            ageLimit: 13,
            categories: [{ id: 1 }, { id: 2 }, { id: 3 }],
            direction: 'Nam direction',
            duration: 60,
            endDateShowing: new Date('2024-06-29'),
            language: 'Tiếng Việt',
            largeImgurl:
              'https://file.hstatic.net/1000159991/file/doremon-min_d7fba7f7f60a41a0af6e67dcaeb75634_grande.jpg',
            longDescription: faker.lorem.text(),
            name: `Hello World ${index}`,
            trailerurl: 'https://www.youtube.com',
            smallImgurl:
              'https://file.hstatic.net/1000159991/file/doremon-min_d7fba7f7f60a41a0af6e67dcaeb75634_grande.jpg',
            shortDescription: faker.lorem.text(),
            startDateShowing: new Date(
              new Date().getTime() + 24 * 60 * 60 * 1000,
            ),
            releaseDate: new Date('2024-01-29'),
          };
        }),
      );

      const newMoviesExpectIds = (
        await movieRepository.insert(newMoviesExpect)
      ).identifiers.map((item) => item.id);

      const newMovies = await movieService.getNewestFilms();
      expect(
        JSON.stringify(
          newMovies
            .filter((item, index) => {
              return index >= newMovies.length - 3;
            })
            .map((item) => item.id),
        ),
      ).toEqual(JSON.stringify(newMoviesExpectIds));

      await movieRepository.delete(newMoviesExpectIds);
    });
  });

  describe('Test function getHotFilms', () => {
    it('Return hot movies when input empty', async () => {
      let hotFilmsExpect: any = movieRepository.create(
        [1, 2, 3].map((item, index) => {
          return {
            active: true,
            actors: 'Nam actors',
            ageLimit: 13,
            categories: [{ id: 1 }, { id: 2 }, { id: 3 }],
            direction: 'Nam direction',
            duration: 60,
            endDateShowing: new Date('2024-06-29'),
            language: 'Tiếng Việt',
            largeImgurl:
              'https://file.hstatic.net/1000159991/file/doremon-min_d7fba7f7f60a41a0af6e67dcaeb75634_grande.jpg',
            longDescription: faker.lorem.text(),
            name: `Hello World ${index}`,
            trailerurl: 'https://www.youtube.com',
            smallImgurl:
              'https://file.hstatic.net/1000159991/file/doremon-min_d7fba7f7f60a41a0af6e67dcaeb75634_grande.jpg',
            shortDescription: faker.lorem.text(),
            startDateShowing: new Date(
              new Date().getTime() - 3 * 24 * 60 * 60 * 1000,
            ),
            releaseDate: new Date('2024-01-29'),
          };
        }),
      );

      hotFilmsExpect = await movieRepository.insert(hotFilmsExpect);

      let schedules: any = scheduleRepository.create(
        [1, 2, 3].map((item, index) => {
          return {
            startDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
            startTime: '22:30:30',
            roomId: item,
            movieId: hotFilmsExpect.identifiers[index].id,
            active: true,
          };
        }),
      );

      schedules = await scheduleRepository.insert(schedules);

      let tickets: any = [];
      schedules.identifiers.forEach((item: any) => {
        for (let i = 0; i < 50; i++) {
          tickets.push(
            ticketRepository.create({
              billId: 1,
              currentPrice: 45000,
              reasonReject: null,
              scheduleId: item.id,
              seatId: 10,
            }),
          );
        }
      });

      tickets = await ticketRepository.insert(tickets);

      const hotFilmsExpectIds = hotFilmsExpect.identifiers.map(
        (item: any) => item.id,
      );

      const hotFilms = await movieService.getHotFilms();
      expect(
        JSON.stringify(
          hotFilms
            .filter((item, index) => {
              if (index < 3) return item;
            })
            .map((item) => item.id),
        ),
      ).toEqual(JSON.stringify(hotFilmsExpectIds));

      await ticketRepository.delete(
        tickets.identifiers.map((item: any) => item.id),
      );
      await scheduleRepository.delete(
        schedules.identifiers.map((item: any) => item.id),
      );
      await movieRepository.delete(hotFilmsExpectIds);
    });
  });

  describe('Test function getMovieDetail', () => {
    it('Return movie detail when input movieId is null', async () => {
      const movie = await movieService.getMovieDetail(null);
      expect(movie).toBe(null);
    });

    it('Return movie detail when input movieId is 13', async () => {
      const movie: any = await movieService.getMovieDetail(13);
      expect(movie.categories.trim()).toEqual('Phim tài liệu');
    });
  });

  describe('Test function save', () => {
    it('Return updated when input include MovieUpdateRequestDto valid and no largeImage, smallImage', async () => {
      const movieUpdateRequestDto = new MovieUpdateRequestDto();
      movieUpdateRequestDto['movieId'] = 11;
      movieUpdateRequestDto.name = 'Hello World Nam Nam';
      movieUpdateRequestDto.direction = 'Nam Nam Nam';
      movieUpdateRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieUpdateRequestDto.trailerurl = 'https://www.youtube.com';
      movieUpdateRequestDto.language = 'Tiếng Việt';
      movieUpdateRequestDto.categoryIds = [1, 2, 3, 4];
      movieUpdateRequestDto.duration = 60;
      movieUpdateRequestDto.ageLimit = 13;
      movieUpdateRequestDto.releaseDate = new Date('2024-06-15');
      movieUpdateRequestDto.startDateShowing = new Date('2024-06-29');
      movieUpdateRequestDto.endDateShowing = new Date('2024-07-29');
      movieUpdateRequestDto.shortDescription = faker.lorem.text();
      movieUpdateRequestDto.longDescription = faker.lorem.text();

      await movieService.save(movieUpdateRequestDto);

      // @ts-ignore
      movieUpdateRequestDto.releaseDate = '2024-06-15';
      // @ts-ignore
      movieUpdateRequestDto.startDateShowing = '2024-06-29';
      // @ts-ignore
      movieUpdateRequestDto.endDateShowing = '2024-07-29';

      const movie = await movieRepository.findOne({
        where: { id: 11 },
        relations: ['categories'],
      });

      expect(JSON.stringify(movieUpdateRequestDto)).toEqual(
        JSON.stringify({
          movieId: movie.id,
          name: movie.name,
          direction: movie.direction,
          actors: movie.actors,
          trailerurl: movie.trailerurl,
          language: movie.language,
          categoryIds: movie.categories.map((item) => item.id),
          duration: movie.duration,
          ageLimit: movie.ageLimit,
          releaseDate: dayjs(movie.releaseDate).format(DateFormat.YYYY_MM_DD),
          startDateShowing: dayjs(movie.startDateShowing).format(
            DateFormat.YYYY_MM_DD,
          ),
          endDateShowing: dayjs(movie.endDateShowing).format(
            DateFormat.YYYY_MM_DD,
          ),
          shortDescription: movie.shortDescription,
          longDescription: movie.longDescription,
          largeImgurl: movie.largeImgurl,
          smallImgurl: movie.smallImgurl,
        }),
      );
    });

    it('Return updated when input include MovieUpdateRequestDto valid and has largeImage, smallImage', async () => {
      const movieUpdateRequestDto = new MovieUpdateRequestDto();
      movieUpdateRequestDto['movieId'] = 11;
      movieUpdateRequestDto.name = 'Hello World Nam Nam';
      movieUpdateRequestDto.direction = 'Nam Nam Nam';
      movieUpdateRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieUpdateRequestDto.trailerurl = 'https://www.youtube.com';
      movieUpdateRequestDto.language = 'Tiếng Việt';
      movieUpdateRequestDto.categoryIds = [1, 2, 3, 4];
      movieUpdateRequestDto.duration = 60;
      movieUpdateRequestDto.ageLimit = 13;
      movieUpdateRequestDto.releaseDate = new Date('2024-06-15');
      movieUpdateRequestDto.startDateShowing = new Date('2024-06-29');
      movieUpdateRequestDto.endDateShowing = new Date('2024-07-29');
      movieUpdateRequestDto.shortDescription = faker.lorem.text();
      movieUpdateRequestDto.longDescription = faker.lorem.text();

      const filePath =
        '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
      const buffer = fs.readFileSync(filePath);
      const largeImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };
      const smallImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };

      await movieService.save(movieUpdateRequestDto, largeImage, smallImage);

      // @ts-ignore
      movieUpdateRequestDto.releaseDate = '2024-06-15';
      // @ts-ignore
      movieUpdateRequestDto.startDateShowing = '2024-06-29';
      // @ts-ignore
      movieUpdateRequestDto.endDateShowing = '2024-07-29';

      const movie = await movieRepository.findOne({
        where: { id: 11 },
        relations: ['categories'],
      });

      delete movieUpdateRequestDto['largeImgurl'];
      delete movieUpdateRequestDto['smallImgurl'];

      expect(JSON.stringify(movieUpdateRequestDto)).toEqual(
        JSON.stringify({
          movieId: movie.id,
          name: movie.name,
          direction: movie.direction,
          actors: movie.actors,
          trailerurl: movie.trailerurl,
          language: movie.language,
          categoryIds: movie.categories.map((item) => item.id),
          duration: movie.duration,
          ageLimit: movie.ageLimit,
          releaseDate: dayjs(movie.releaseDate).format(DateFormat.YYYY_MM_DD),
          startDateShowing: dayjs(movie.startDateShowing).format(
            DateFormat.YYYY_MM_DD,
          ),
          endDateShowing: dayjs(movie.endDateShowing).format(
            DateFormat.YYYY_MM_DD,
          ),
          shortDescription: movie.shortDescription,
          longDescription: movie.longDescription,
        }),
      );
    });

    it('Throw error update when input include MovieUpdateRequestDto has movie does not exist', async () => {
      const movieUpdateRequestDto = new MovieUpdateRequestDto();
      movieUpdateRequestDto['movieId'] = 1000;
      movieUpdateRequestDto.name = 'Hello World Nam Nam';
      movieUpdateRequestDto.direction = 'Nam Nam Nam';
      movieUpdateRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieUpdateRequestDto.trailerurl = 'https://www.youtube.com';
      movieUpdateRequestDto.language = 'Tiếng Việt';
      movieUpdateRequestDto.categoryIds = [1, 2, 3, 4];
      movieUpdateRequestDto.duration = 60;
      movieUpdateRequestDto.ageLimit = 13;
      movieUpdateRequestDto.releaseDate = new Date('2024-06-15');
      movieUpdateRequestDto.startDateShowing = new Date('2024-06-29');
      movieUpdateRequestDto.endDateShowing = new Date('2024-07-29');
      movieUpdateRequestDto.shortDescription = faker.lorem.text();
      movieUpdateRequestDto.longDescription = faker.lorem.text();

      try {
        await movieService.save(movieUpdateRequestDto);
      } catch (error) {
        expect(error.message).toBe('Movie not exsist');
      }
    });

    it('Throw error update when input include MovieUpdateRequestDto has categories do not exist', async () => {
      const movieUpdateRequestDto = new MovieUpdateRequestDto();
      movieUpdateRequestDto['movieId'] = 11;
      movieUpdateRequestDto.name = 'Hello World Nam Nam';
      movieUpdateRequestDto.direction = 'Nam Nam Nam';
      movieUpdateRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieUpdateRequestDto.trailerurl = 'https://www.youtube.com';
      movieUpdateRequestDto.language = 'Tiếng Việt';
      movieUpdateRequestDto.categoryIds = [1000, 2000, 3000, 4000];
      movieUpdateRequestDto.duration = 60;
      movieUpdateRequestDto.ageLimit = 13;
      movieUpdateRequestDto.releaseDate = new Date('2024-06-15');
      movieUpdateRequestDto.startDateShowing = new Date('2024-06-29');
      movieUpdateRequestDto.endDateShowing = new Date('2024-07-29');
      movieUpdateRequestDto.shortDescription = faker.lorem.text();
      movieUpdateRequestDto.longDescription = faker.lorem.text();

      try {
        await movieService.save(movieUpdateRequestDto);
      } catch (error) {
        expect(error.message).toBe('Exsist category not exsist');
      }
    });

    it('Return created when input include MovieSaveRequestDto and largeImage, smallImage', async () => {
      const movieSaveRequestDto = new MovieSaveRequestDto();
      movieSaveRequestDto.name = 'New Movie';
      movieSaveRequestDto.direction = 'Nam Nam Nam';
      movieSaveRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieSaveRequestDto.trailerurl = 'https://www.youtube.com';
      movieSaveRequestDto.language = 'Tiếng Việt';
      movieSaveRequestDto.categoryIds = [1];
      movieSaveRequestDto.duration = 60;
      movieSaveRequestDto.ageLimit = 13;
      movieSaveRequestDto.releaseDate = new Date('2024-04-15');
      movieSaveRequestDto.startDateShowing = new Date('2024-05-29');
      movieSaveRequestDto.endDateShowing = new Date('2024-07-29');
      movieSaveRequestDto.shortDescription = faker.lorem.text();
      movieSaveRequestDto.longDescription = faker.lorem.text();

      const filePath =
        '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
      const buffer = fs.readFileSync(filePath);
      const largeImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };
      const smallImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };

      await movieService.save(movieSaveRequestDto, largeImage, smallImage);

      // @ts-ignore
      movieSaveRequestDto.releaseDate = '2024-04-15';
      // @ts-ignore
      movieSaveRequestDto.startDateShowing = '2024-05-29';
      // @ts-ignore
      movieSaveRequestDto.endDateShowing = '2024-07-29';

      const movie = await movieRepository
        .createQueryBuilder('movie')
        .innerJoinAndSelect('movie.categories', 'categories')
        .orderBy('movie.id', 'DESC')
        .getOne();

      expect(JSON.stringify(movieSaveRequestDto)).toEqual(
        JSON.stringify({
          name: movie.name,
          direction: movie.direction,
          actors: movie.actors,
          trailerurl: movie.trailerurl,
          language: movie.language,
          categoryIds: movie.categories.map((item) => item.id),
          duration: movie.duration,
          ageLimit: movie.ageLimit,
          releaseDate: dayjs(movie.releaseDate).format(DateFormat.YYYY_MM_DD),
          startDateShowing: dayjs(movie.startDateShowing).format(
            DateFormat.YYYY_MM_DD,
          ),
          endDateShowing: dayjs(movie.endDateShowing).format(
            DateFormat.YYYY_MM_DD,
          ),
          shortDescription: movie.shortDescription,
          longDescription: movie.longDescription,
        }),
      );

      await AppDataSource.query(
        'delete from category_movie where category_movie.moive_id = ?',
        [movie.id],
      );

      await movieRepository.delete(movie.id);
    });

    it('Throw error create when input include MovieSaveRequestDto has categories do not exist', async () => {
      const movieSaveRequestDto = new MovieSaveRequestDto();
      movieSaveRequestDto.name = 'Hello World Nam Nam';
      movieSaveRequestDto.direction = 'Nam Nam Nam';
      movieSaveRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieSaveRequestDto.trailerurl = 'https://www.youtube.com';
      movieSaveRequestDto.language = 'Tiếng Việt';
      movieSaveRequestDto.categoryIds = [1000, 2000, 3000, 4000];
      movieSaveRequestDto.duration = 60;
      movieSaveRequestDto.ageLimit = 13;
      movieSaveRequestDto.releaseDate = new Date('2024-06-15');
      movieSaveRequestDto.startDateShowing = new Date('2024-06-29');
      movieSaveRequestDto.endDateShowing = new Date('2024-07-29');
      movieSaveRequestDto.shortDescription = faker.lorem.text();
      movieSaveRequestDto.longDescription = faker.lorem.text();

      const filePath =
        '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
      const buffer = fs.readFileSync(filePath);
      const largeImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };
      const smallImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };

      try {
        await movieService.save(movieSaveRequestDto, largeImage, smallImage);
      } catch (error) {
        expect(error.message).toBe('Exsist category not exsist');
      }
    });

    it('Throw error create when input include MovieSaveRequestDto has smallImage empty', async () => {
      const movieSaveRequestDto = new MovieSaveRequestDto();
      movieSaveRequestDto.name = 'New Movie';
      movieSaveRequestDto.direction = 'Nam Nam Nam';
      movieSaveRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieSaveRequestDto.trailerurl = 'https://www.youtube.com';
      movieSaveRequestDto.language = 'Tiếng Việt';
      movieSaveRequestDto.categoryIds = [1000, 2000, 3000];
      movieSaveRequestDto.duration = 60;
      movieSaveRequestDto.ageLimit = 13;
      movieSaveRequestDto.releaseDate = new Date('2024-04-15');
      movieSaveRequestDto.startDateShowing = new Date('2024-05-29');
      movieSaveRequestDto.endDateShowing = new Date('2024-07-29');
      movieSaveRequestDto.shortDescription = faker.lorem.text();
      movieSaveRequestDto.longDescription = faker.lorem.text();

      const filePath =
        '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
      const buffer = fs.readFileSync(filePath);
      const largeImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };

      try {
        await movieService.save(movieSaveRequestDto, largeImage, null);
      } catch (error) {
        expect(error.errors.smallImage).toBe('Small image not empty');
      }
    });

    it('Throw error create when input include MovieSaveRequestDto has largeImage empty', async () => {
      const movieSaveRequestDto = new MovieSaveRequestDto();
      movieSaveRequestDto.name = 'New Movie';
      movieSaveRequestDto.direction = 'Nam Nam Nam';
      movieSaveRequestDto.actors = 'Nam1, Nam2, Nam3';
      movieSaveRequestDto.trailerurl = 'https://www.youtube.com';
      movieSaveRequestDto.language = 'Tiếng Việt';
      movieSaveRequestDto.categoryIds = [1000, 2000, 3000];
      movieSaveRequestDto.duration = 60;
      movieSaveRequestDto.ageLimit = 13;
      movieSaveRequestDto.releaseDate = new Date('2024-04-15');
      movieSaveRequestDto.startDateShowing = new Date('2024-05-29');
      movieSaveRequestDto.endDateShowing = new Date('2024-07-29');
      movieSaveRequestDto.shortDescription = faker.lorem.text();
      movieSaveRequestDto.longDescription = faker.lorem.text();

      const filePath =
        '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
      const buffer = fs.readFileSync(filePath);
      const smallImage: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'image/jpeg', // or the appropriate mime type
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: fs.createReadStream(filePath),
      };

      try {
        await movieService.save(movieSaveRequestDto, null, smallImage);
      } catch (error) {
        expect(error.errors.largeImage).toBe('Large image not empty');
      }
    });
  });

  describe('Test function getMoivesWithPagination', () => {
    it('Return moives with multicondition when input page=1; name="Venom"; categoriIds=[2, 3, 4, 5]; age=13; adminRequest=null', async () => {
      const movies = await movieService.getMoivesWithPagination(
        1,
        'Venom',
        [2, 3, 4, 5],
        13,
        null,
      );
      expect(
        JSON.stringify(
          movies.items.map((item) => ({
            name: item.name.substring(item.name.indexOf('Venom'), 5),
            cateogries: item.categories.map((category) => category.id),
            age: item.ageLimit,
            active: item.active,
          })),
        ),
      ).toEqual(
        JSON.stringify(
          movies.items.map((item) => ({
            name: 'Venom',
            cateogries: [2, 3, 4, 5],
            age: 13,
            active: true,
          })),
        ),
      );
    });

    it('Return moives with multicondition when input page=1; name="Venome"; categoryIds=[1, 2, 3, 4, 5]; age=13; adminRequest=null', async () => {
      const movies = await movieService.getMoivesWithPagination(
        1,
        'Venome',
        [1, 2, 3, 4, 5],
        13,
        null,
      );
      expect(movies).toBe(null);
    });

    it('Return moives with multicondition when input page=1; name=null; categoryIds=null; age=13; adminRequest=true', async () => {
      const movies = await movieService.getMoivesWithPagination(
        1,
        null,
        null,
        13,
        true,
      );
      expect(
        JSON.stringify(
          movies.items.map((item) => ({
            ageLimitCheck:
              item.ageLimit == null || item.ageLimit >= 13 ? true : false,
          })),
        ),
      ).toEqual(
        JSON.stringify(
          movies.items.map((item) => ({
            ageLimitCheck: true,
          })),
        ),
      );
    });
  });
});
