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
