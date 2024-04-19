import { plainToClass } from 'class-transformer';
import { ClassConstructor } from '../../declare/class.constructor';
import { validate, ValidationError } from 'class-validator';
import { ErrorApiResponseDto } from '../../dtos/res/error.api.res.dto';
import { StatusEnum } from '../../enum/status.enum';

export function PipeDto<T extends ClassConstructor>(constructorDto: T) {
  return async function (obj: any) {
    const dto = plainToClass(constructorDto, obj);
    const validationErrors: ValidationError[] = await validate(dto);
    let errors = {};
    validationErrors?.forEach(({ property, constraints }) => {
      errors = { ...errors, [property]: Object.values(constraints)[0] };
    });
    if (validationErrors.length) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Error Validate',
        errors,
      } as ErrorApiResponseDto;
    }
    return dto;
  };
}
