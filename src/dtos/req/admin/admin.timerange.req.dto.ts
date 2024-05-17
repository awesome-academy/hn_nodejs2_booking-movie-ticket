import { IsNotEmpty } from 'class-validator';
import {
  IsLessOrEqual,
  IsStartDateValid,
} from '../../../decoratos/custom.validators';

export class AdminTimeRangeRequestDto {
  @IsNotEmpty()
  @IsStartDateValid('endDate')
  startDate: string;

  @IsNotEmpty()
  @IsLessOrEqual(new Date().toISOString().split('T')[0])
  endDate: string;
}
