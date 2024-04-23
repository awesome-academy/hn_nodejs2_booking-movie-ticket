import { Request, Response, NextFunction } from 'express';
import { ParamDecoratorCallBack } from '../../declare/param.decorator.callback';

export interface ExecutionContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

export function createParamDecorator(callback: ParamDecoratorCallBack) {
  return function (...args: any[]) {
    return function (target: any, methodName: string, parameterIndex: number) {
      if (!target.constructor.prototype.controllerMethodParams) {
        target.constructor.prototype.controllerMethodParams = {};
      }

      if (!target.constructor.prototype.controllerMethodParams[methodName]) {
        target.constructor.prototype.controllerMethodParams[methodName] = {};
      }

      target.constructor.prototype.controllerMethodParams[methodName][
        parameterIndex
      ] = {
        callback,
        callbackArgs: { data: args, excutionContext: null },
      };
    };
  };
}
