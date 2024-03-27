import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Room } from './room.entity';
import { Ticket } from './ticket.entity';
import { SeatType } from '../enum/seat.enum';

@Entity({ name: 'seat' })
export class Seat extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 45 })
  name: string;

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'type', type: 'enum', enum: SeatType })
  type: string;

  @Column({ name: 'room_id', type: 'int' })
  roomId: number;

  @ManyToOne(() => Room, (room) => room.seats)
  @JoinColumn({
    name: 'room_id',
    referencedColumnName: 'id',
  })
  room: Room;

  @OneToMany(() => Ticket, (ticket) => ticket.seat)
  tickets: Ticket[];
}
