import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Review } from './review.entity';
import { Schedule } from './schedule.entity';
import { Category } from './category.entity';

@Entity({ name: 'movie' })
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'direction', type: 'varchar', length: 500 })
  direction: string;

  @Column({ name: 'actors', type: 'varchar', length: 500 })
  actors: string;

  @Column({ name: 'duration', type: 'int' })
  duration: number;

  @Column({ name: 'start_date_showing', type: 'date' })
  startDateShowing: Date;

  @Column({ name: 'end_date_showing', type: 'date' })
  endDateShowing: Date;

  @Column({ name: 'age_limit', type: 'int', nullable: true })
  ageLimit: number;

  @Column({
    name: 'large_imgurl',
    type: 'varchar',
    length: 255,
  })
  largeImgurl: string;

  @Column({
    name: 'small_imgurl',
    type: 'varchar',
    length: 255,
  })
  smallImgurl: string;

  @Column({ name: 'long_description', type: 'text' })
  longDescription: string;

  @Column({ name: 'short_description', type: 'text' })
  shortDescription: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'release_date', type: 'date' })
  releaseDate: Date;

  @Column({ name: 'trailerurl', type: 'varchar', length: 255 })
  trailerurl: string;

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: string;

  @OneToMany(() => Review, (review) => review.movie)
  reviews: Review[];

  @OneToMany(() => Schedule, (schedule) => schedule.movie)
  schedules: Schedule[];

  @ManyToMany(() => Category, (category) => category.movies)
  categories: Category[];
}
