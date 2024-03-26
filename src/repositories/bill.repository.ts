import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Bill } from '../entities/bill.entity';

@injectable()
export class BillRepository extends BaseRepository<Bill> {
  constructor() {
    super(Bill);
  }
}
