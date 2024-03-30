import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IsOptionalWithRegex } from '../../decoratos/custom.validators';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import { ValidateRegister } from '../../constant/validate.register.constant';

export class UsersRegisterDto {
  @IsNotEmpty()
  @MaxLength(ValidateRegister.USERNAME_MAX_LENGTH)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  email: string;

  @IsNotEmpty()
  @MinLength(ValidateRegister.PASSWORD_MIN_LENGTH)
  @MaxLength(ValidateRegister.PASSWORD_MAX_LENGTH)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  password: string;

  @IsOptionalWithRegex(ValidateRegister.PHONE_REGEX)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  phone?: string;

  @IsOptionalWithRegex(ValidateRegister.ADDRESS_REGEX)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  address?: string;
}
