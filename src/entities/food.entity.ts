import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchasedFood } from './purchased.food.entity';

@Entity({ name: 'food' })
export class Food extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'imagurl', type: 'varchar', length: 255 })
  imgurl: string;

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit', type: 'varchar', length: 45 })
  unit: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @OneToMany(() => PurchasedFood, (purchasedFood) => purchasedFood.food)
  purchasedFoods: PurchasedFood[];
}
