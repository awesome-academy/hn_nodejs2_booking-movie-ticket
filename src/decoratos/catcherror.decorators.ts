import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';

export function catchError() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        await originalMethod.call(this, ...args);
      } catch (error) {
        console.log(error);
        const next = args[2];
        if (typeof next === 'function')
          next(
            !(error instanceof AppException)
              ? new AppException(
                  `Internal Server Error:\n${error.stack}`,
                  StatusEnum.INTERNAL_ERROR,
                )
              : error,
          );
        else throw error;
      }
    };
  };
}
