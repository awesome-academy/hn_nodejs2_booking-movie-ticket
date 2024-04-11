import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Food } from './food.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'purchased_food' })
export class PurchasedFood extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'current_price', type: 'int' })
  currentPrice: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'food_id', type: 'int' })
  foodId: number;

  @Column({ name: 'bill_id', type: 'int' })
  billId: number;

  @ManyToOne(() => Food, (food) => food.purchasedFoods)
  @JoinColumn({
    name: 'food_id',
    referencedColumnName: 'id',
  })
  food: Food;

  @ManyToOne(() => Bill, (bill) => bill.purchasedFoods)
  @JoinColumn({
    name: 'bill_id',
    referencedColumnName: 'id',
  })
  bill: Bill;
}
