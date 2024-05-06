import 'reflect-metadata';
import { ClassConstructor } from '../../declare/class.constructor';
import { ExecutionContext } from './param.custom.decorator';
import { container } from 'tsyringe';

export abstract class Interceptor {
  abstract before(data: unknown, ctx: ExecutionContext): void;

  abstract after(data: unknown, ctx: ExecutionContext): void;
}

export function UseInterceptors(...interceptor: ClassConstructor[]) {
  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.interceptors) {
      target.constructor.prototype.interceptors = {};
    }

    if (!target.constructor.prototype.interceptors[methodName]) {
      target.constructor.prototype.interceptors[methodName] = [];
    }
    target.constructor.prototype.interceptors[methodName].push(
      ...interceptor.map((item) => {
        return container.resolve(item);
      }),
    );
  };
}
