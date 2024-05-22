import {
  IsDate,
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ValidateConstantMovieSaveRequestDto } from '../../../constant/validate.constant.movie-save.req.dto';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsIntArray } from '../../../decoratos/custom.validators';

const Validate = ValidateConstantMovieSaveRequestDto;

export class MovieSaveRequestDto {
  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_100)
  name: string;

  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_100)
  direction: string;

  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_100)
  actors: string;

  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_100)
  trailerurl: string;

  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_100)
  language: string;

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => {
    if (!Array.isArray(params.value)) {
      return [+params.value];
    }
    return params.value.map((item) => +item);
  })
  @IsIntArray()
  categoryIds: number[];

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => +params.value)
  @IsInt()
  @Min(Validate.MIN_NUMBER_VALUE_60)
  @Max(Validate.MAX_NUMBER_VAULE_180)
  duration: number;

  @Transform((params: TransformFnParams) => +params.value)
  @ValidateIf((object, value) => {
    return !!+value;
  })
  @IsInt()
  @Min(Validate.MIN_NUMBER_VALUE_13)
  @Max(Validate.MAX_NUMBER_VALUE_18)
  ageLimit: number;

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => new Date(params.value))
  @IsDate()
  releaseDate: Date;

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => new Date(params.value))
  @IsDate()
  startDateShowing: Date;

  @IsNotEmpty()
  @Transform((params: TransformFnParams) => new Date(params.value))
  @IsDate()
  endDateShowing: Date;

  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_255)
  shortDescription: string;

  @IsNotEmpty()
  @MinLength(Validate.MIN_LENGTH_STRING)
  @MaxLength(Validate.MAX_LENGTH_STRING_500)
  longDescription: string;
}

export class MovieUpdateRequestDto extends MovieSaveRequestDto {
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => +params.value)
  @IsInt()
  movieId: number;
}
