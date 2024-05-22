import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { MovieStatusEnum } from '../../../enum/movie.status.enum';
import { Transform, TransformFnParams } from 'class-transformer';

export class AdminManageMovieChangeStatusMovieRequestDto {
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => +params.value)
  @IsInt()
  movieId: number;

  @IsNotEmpty()
  @IsEnum(MovieStatusEnum)
  status: string;
}
