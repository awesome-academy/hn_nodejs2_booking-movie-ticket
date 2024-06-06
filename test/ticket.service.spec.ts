import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { container } from 'tsyringe';
import { faker } from '@faker-js/faker';
import { TicketService } from '../src/services/ticket.service';
import { TicketRepository } from '../src/repositories/ticket.repository';

let ticketService: TicketService = null;
let ticketRepository: TicketRepository = null;
let transactionManager = null;

beforeAll(async () => {
  await AppDataSource.initialize();
  ticketService = container.resolve(TicketService);
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

describe('TicketService', () => {
  describe('Test function updateReason', () => {
    it('Throw error when input include reasonReject null', async () => {
      try {
        await ticketService.updateReason(1, null);
      } catch (error) {
        expect(error.message).toEqual(
          'reasonReject length must in range (1, 255) character',
        );
      }
    });

    it('Throw error when input include reasonReject empty', async () => {
      try {
        await ticketService.updateReason(1, '');
      } catch (error) {
        expect(error.message).toEqual(
          'reasonReject length must in range (1, 255) character',
        );
      }
    });

    it('Throw error when input include reasonReject has length greater than 255 character', async () => {
      try {
        let reasonReject = '';
        for (let i = 0; i < 500; i++) {
          reasonReject += 'a';
        }
        await ticketService.updateReason(1, reasonReject);
      } catch (error) {
        expect(error.message).toEqual(
          'reasonReject length must in range (1, 255) character',
        );
      }
    });

    it('throw error when ticketId does not exist', async () => {
      try {
        await ticketService.updateReason(1000, faker.lorem.text());
      } catch (error) {
        expect(error.message).toEqual('Ticket not exsist');
      }
    });

    it('throw error when check valid time submit false', async () => {
      try {
        await ticketService.updateReason(1, faker.lorem.text());
      } catch (error) {
        expect(error.message).toEqual('Time reject submit expire');
      }
    });

    it('Update reason success when input valid', async () => {
      const reasonReject = faker.lorem.text();
      await ticketService.updateReason(29, reasonReject);

      const reasonRejectExpect = (await ticketRepository.findOneBy({ id: 29 }))
        .reasonReject;

      expect(reasonReject).toEqual(reasonRejectExpect);
    });
  });
});
