import { Transform, TransformFnParams } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import { IsTimeString } from '../../../decoratos/custom.validators';

export class ScheduleSaveRequestDto {
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => +params.value)
  @IsInt()
  movieId: number;

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => +params.value)
  @IsInt()
  roomId: number;

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => new Date(params.value))
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsTimeString()
  startTime: string;
}
