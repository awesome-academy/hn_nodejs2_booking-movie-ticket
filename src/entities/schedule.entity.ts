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
import { Movie } from './movie.entity';
import { Ticket } from './ticket.entity';

@Entity({ name: 'schedule' })
export class Schedule extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: String;

  @Column({ name: 'movie_id', type: 'int' })
  movieId: number;

  @Column({ name: 'room_id', type: 'int' })
  roomId: number;

  @Column({ name: 'active', type: 'boolean' })
  active: boolean;

  @ManyToOne(() => Movie, (movie) => movie.schedules)
  @JoinColumn({
    name: 'movie_id',
    referencedColumnName: 'id',
  })
  movie: Movie;

  @ManyToOne(() => Room, (room) => room.schedules)
  @JoinColumn({
    name: 'room_id',
    referencedColumnName: 'id',
  })
  room: Room;

  @OneToMany(() => Ticket, (ticket) => ticket.schedule)
  tickets: Ticket[];
}
