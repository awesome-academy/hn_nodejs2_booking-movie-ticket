import { ValidationError } from 'class-validator';

export function convertToArrayError(validationErrors: ValidationError[]) {
  return validationErrors.map(({ constraints }) => {
    let message = '';
    Object.values(constraints).forEach((value) => (message += `${value} `));
    return Error(message);
  });
}
