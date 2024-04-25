import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Movie } from './movie.entity';
import { User } from './user.entity';
import { ReviewStatus } from '../enum/review.enum';

@Entity({ name: 'review' })
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'comment', type: 'text' })
  comment: string;

  @Column({ name: 'star', type: 'enum', enum: ReviewStatus })
  star: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'movie_id', type: 'int' })
  movieId: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.reviews)
  @JoinColumn({
    name: 'movie_id',
    referencedColumnName: 'id',
  })
  movie: Movie;
}
