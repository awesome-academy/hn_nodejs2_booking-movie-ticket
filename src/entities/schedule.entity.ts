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

@Entity({ name: 'shedule' })
export class Schedule extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'movie_id', type: 'int' })
  movieId: number;

  @Column({ name: 'room_id', type: 'int' })
  roomId: number;

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
