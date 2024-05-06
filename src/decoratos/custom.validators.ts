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
      name: 'isOptionalWithRegex',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (isFalsy(value)) return true;
          return !!value.match(regex);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no match ${regex}`;
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
            if (!item) {
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
          if (!value) {
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

export function IsLengthEqualsOtherPropertyAndValueInRange(
  option: { otherPropertyName: string; min: number; max: number },
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isLengthEqualsOtherProperty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { otherPropertyName, min, max } = option;

          if (
            value == undefined &&
            args?.object?.[otherPropertyName] == undefined
          ) {
            return true;
          }

          if (value?.length != args?.object?.[otherPropertyName]?.length) {
            return false;
          }

          if (value?.length == args?.object?.[otherPropertyName]?.length) {
            for (let item of value) {
              if (item < min || item > max) {
                return false;
              }
            }
          }

          if (!value || !args?.object?.[otherPropertyName]) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} length must be equals ${option.otherPropertyName} length and value item in range(${option.min}, ${option.max})`;
        },
      },
    });
  };
}
