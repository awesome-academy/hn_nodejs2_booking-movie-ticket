import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function isFalsy(x: any) {
  return !x;
}

export function IsOptionalWithRegex(
  regex: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (isFalsy(value)) return true;
          return !!value.match(regex);
        },
        defaultMessage(args: ValidationArguments) {
          return `No match ${regex}`;
        },
      },
    });
  };
}

export function IsEqualProperty(
  otherPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEqualProperty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value === args.object[otherPropertyName];
        },
        defaultMessage(args: ValidationArguments) {
          return 'validationError.confirmPasswordNoMatch';
        },
      },
    });
  };
}

export function IsOptionalOrIntArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalOrIntArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (isFalsy(value)) {
            return true;
          }

          for (const item of value) {
            if (isNaN(item)) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be empty or array of integers`;
        },
      },
    });
  };
}

export function IsOptionalOrIntWithLimit(
  ageMinLimit: number,
  ageMaxLimit: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalOrIntWithLimit',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (isFalsy(value)) {
            return true;
          }
          if (isNaN(value)) {
            return false;
          }
          return value >= ageMinLimit && value <= ageMaxLimit;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be integer or range in (${ageMinLimit}; ${ageMaxLimit})`;
        },
      },
    });
  };
}
