import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import sanitizeHtml from 'sanitize-html';
import { IsEqualProperty } from '../../decoratos/custom.validators';
import { ValidateResetPassword } from '../../constant/validate.reset.password.constant';

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(ValidateResetPassword.PASSWORD_MIN_LENGTH)
  @MaxLength(ValidateResetPassword.PASSWORD_MAX_LENGTH)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  password: string;

  @IsEqualProperty('password')
  confirmPassword: string;
}
