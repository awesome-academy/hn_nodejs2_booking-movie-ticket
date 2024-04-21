import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ValidateResetPassword } from '../../../constant/validate.reset.password.constant';
import { IsEqualProperty } from '../../../decoratos/custom.validators';
import sanitizeHtml from 'sanitize-html';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(ValidateResetPassword.PASSWORD_MIN_LENGTH)
  @MaxLength(ValidateResetPassword.PASSWORD_MAX_LENGTH)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(ValidateResetPassword.PASSWORD_MIN_LENGTH)
  @MaxLength(ValidateResetPassword.PASSWORD_MAX_LENGTH)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  newPassword: string;

  @IsEqualProperty('newPassword')
  confirmPassword: string;
}
