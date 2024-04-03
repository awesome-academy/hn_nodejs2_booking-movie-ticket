import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Bill } from './bill.entity';
import { Review } from './review.entity';
import { UserRole } from '../enum/user.enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'username', type: 'varchar', length: 255 })
  username: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'phone', type: 'varchar', length: 45, nullable: true })
  phone: string;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
  })
  role: string;

  @OneToMany(() => Bill, (bill) => bill.user)
  bills: Bill[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
