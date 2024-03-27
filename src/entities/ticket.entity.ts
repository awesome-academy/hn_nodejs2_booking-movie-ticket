import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bill } from './bill.entity';
import { Seat } from './seat.entity';
import { Schedule } from './schedule.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'ticket' })
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'current_price', type: 'int' })
  currentPrice: number;

  @Column({ name: 'bill_id', type: 'int' })
  billId: number;

  @Column({ name: 'seat_id', type: 'int' })
  seatId: number;

  @Column({ name: 'schedule_id', type: 'int' })
  scheduleId: number;

  @ManyToOne(() => Bill, (bill) => bill.tickets)
  @JoinColumn({
    name: 'bill_id',
    referencedColumnName: 'id',
  })
  bill: Bill;

  @ManyToOne(() => Seat, (seat) => seat.tickets)
  @JoinColumn({
    name: 'seat_id',
    referencedColumnName: 'id',
  })
  seat: Seat;

  @ManyToOne(() => Schedule, (schedule) => schedule.tickets)
  @JoinColumn({
    name: 'schedule_id',
    referencedColumnName: 'id',
  })
  schedule: Schedule;
}
