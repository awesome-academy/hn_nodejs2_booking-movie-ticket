import * as dotenv from 'dotenv';
dotenv.config();

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

export function IsLessOrEqual(
  dateStringToCompare: string,
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
          const dateToCompare = new Date(dateStringToCompare);
          const date = new Date(value);
          if (
            dateToCompare.toDateString() == 'Invalid Date' ||
            date.toDateString() == 'Invalid Date' ||
            date > dateToCompare
          ) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be less or equal now`;
        },
      },
    });
  };
}

export function IsStartDateValid(
  endDateProperty: string,
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
          const endDate = new Date(args.object[endDateProperty]);
          const startDate = new Date(value);
          if (
            endDate.toDateString() == 'Invalid Date' ||
            startDate.toDateString() == 'Invalid Date' ||
            endDate.getTime() - startDate.getTime() < 0 ||
            endDate.getTime() - startDate.getTime() >
              +process.env.ADMIN_STATISTIC_MOVIE_TIME_LIMIT *
                24 *
                60 *
                60 *
                1000
          ) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be less or equal than endDate and time limit less or equal than ${process.env.ADMIN_STATISTIC_MOVIE_TIME_LIMIT} days`;
        },
      },
    });
  };
}

export function IsIntArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isIntArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value == undefined) {
            return false;
          }
          for (let item of value) {
            if (isNaN(+item)) return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be int array`;
        },
      },
    });
  };
}

export function IsTimeString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTimeString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const date = new Date(`2002-01-01 ${value}`);
          return date.toString() != 'Invalid Date';
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be time string valid`;
        },
      },
    });
  };
}
