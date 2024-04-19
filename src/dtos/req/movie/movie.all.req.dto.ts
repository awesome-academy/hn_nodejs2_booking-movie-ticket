import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import {
  IsOptionalOrIntWithLimit,
  IsOptionalOrIntArray,
} from '../../../decoratos/custom.validators';
import { ValidateAllMoviesRequestDto } from '../../../constant/validate.constant.allmovies.req.dto';

export class AllMoviesRequestDto {
  @Transform((params) => +params.value)
  @IsInt()
  page: number;

  @IsOptional()
  name: string;

  @Transform((params) =>
    Array.isArray(params.value)
      ? params.value.map((item) => +item)
      : !params.value
        ? null
        : [+params.value],
  )
  @IsOptionalOrIntArray()
  categoryIds: number[];

  @Transform((params) => (!params.value ? null : +params.value))
  @IsOptionalOrIntWithLimit(
    ValidateAllMoviesRequestDto.AGE_MIN,
    ValidateAllMoviesRequestDto.AGE_MAX,
  )
  age: number;
}
