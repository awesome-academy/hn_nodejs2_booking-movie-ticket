import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Schedule } from './schedule.entity';
import { Seat } from './seat.entity';

@Entity({ name: 'room' })
export class Room extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'capacity', type: 'int' })
  capacity: number;

  @Column({ name: 'imgurl', type: 'varchar' })
  imgurl: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'total_area', type: 'int' })
  totalArea: number;

  @OneToMany(() => Schedule, (schedule) => schedule.room)
  schedules: Schedule[];

  @OneToMany(() => Seat, (seat) => seat.room)
  seats: Seat[];
}
