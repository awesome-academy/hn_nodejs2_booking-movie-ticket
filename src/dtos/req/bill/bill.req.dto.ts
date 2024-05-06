import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import {
  IsLengthEqualsOtherPropertyAndValueInRange,
  IsOptionalOrIntArray,
} from '../../../decoratos/custom.validators';
import { ValidateBillRequestDto } from '../../../constant/validate.bill.req.dto';
import { PayOnlineType } from '../../../enum/pay.online.type.enum';

export class BillRequestDto {
  @IsNotEmpty()
  @Transform((params) => +params.value)
  @IsInt()
  scheduleId: number;

  @IsNotEmpty()
  @Transform((params) => {
    if (Array.isArray(params.value)) {
      return params.value.map((item: string) => +item);
    }
    return [+params.value];
  })
  seatIds: number[];

  @Transform((params) => {
    if (Array.isArray(params.value)) {
      return params.value.map((item: string) => +item);
    }
    return [+params.value];
  })
  @IsOptionalOrIntArray()
  foodIds: number[];

  @Transform((params) => {
    if (Array.isArray(params.value)) {
      return params.value.map((item: string) => +item);
    }
    return [+params.value];
  })
  @IsOptionalOrIntArray()
  @IsLengthEqualsOtherPropertyAndValueInRange({
    otherPropertyName: 'foodIds',
    min: ValidateBillRequestDto.MIN_VALUE_QUANTITY,
    max: ValidateBillRequestDto.MAX_VALUE_QUANTITY,
  })
  quantities: number[];

  @IsNotEmpty()
  @IsEnum(PayOnlineType)
  payType: string;
}
