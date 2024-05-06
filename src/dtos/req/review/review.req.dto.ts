import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import sanitize from 'sanitize-html';
import { ValidateReviewRequestDto } from '../../../constant/validate.review.req.dto';

export class ReviewSaveRequestDto {
  @IsNotEmpty()
  @Transform((params) => +params.value)
  @IsInt()
  billId: number;

  @IsNotEmpty()
  @Transform((params) => +params.value)
  @IsInt()
  @Min(ValidateReviewRequestDto.STAR_MIN)
  @Max(ValidateReviewRequestDto.STAR_MAX)
  star: number;

  @IsNotEmpty()
  @Transform((params) => sanitize(params.value))
  @MinLength(ValidateReviewRequestDto.COMMENT_MIN_LENGTH)
  @MaxLength(ValidateReviewRequestDto.COMMENT_MAX_LENGTH)
  comment: string;
}
