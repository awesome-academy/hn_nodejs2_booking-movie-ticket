import { IsNotEmpty, MaxLength } from 'class-validator';
import { ValidateRegister } from '../../../constant/validate.register.constant';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import { IsOptionalWithRegex } from '../../../decoratos/custom.validators';

export class UserUpdateRequestDto {
  @IsNotEmpty()
  @MaxLength(ValidateRegister.USERNAME_MAX_LENGTH)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  username: string;

  @IsOptionalWithRegex(ValidateRegister.PHONE_REGEX)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  phone?: string;

  @IsOptionalWithRegex(ValidateRegister.ADDRESS_REGEX)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  address?: string;
}
