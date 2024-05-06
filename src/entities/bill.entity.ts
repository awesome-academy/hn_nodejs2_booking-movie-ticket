import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PurchasedFood } from './purchased.food.entity';
import { Ticket } from './ticket.entity';
import { BillStatus, BillType } from '../enum/bill.enum';

@Entity({ name: 'bill' })
export class Bill extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'total_price_from_ticket', type: 'int' })
  totalPriceFromTicket: number;

  @Column({ name: 'total_price_from_food', type: 'int' })
  totalPriceFromFood: number;

  @Column({ name: 'status', type: 'enum', enum: BillStatus })
  status: string;

  @Column({ name: 'type', type: 'enum', enum: BillType })
  type: string;

  @Column({ name: 'bank_code', type: 'varchar', length: 255 })
  bankCode: string;

  @Column({ name: 'bank_tran_no', type: 'varchar', length: 255 })
  bankTranNo: string;

  @Column({ name: 'pay_time', type: 'datetime' })
  payTime: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({
    name: 'payment_online_code',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  paymentOnlineCode: string;

  @ManyToOne(() => User, (user) => user.bills)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @OneToMany(() => PurchasedFood, (purchasedFood) => purchasedFood.bill)
  purchasedFoods: PurchasedFood[];

  @OneToMany(() => Ticket, (ticket) => ticket.bill)
  tickets: Ticket[];
}
