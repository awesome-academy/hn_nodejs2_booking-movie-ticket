import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Ticket } from '../entities/ticket.entity';

@injectable()
export class TicketRepository extends BaseRepository<Ticket> {
  constructor() {
    super(Ticket);
  }
}
