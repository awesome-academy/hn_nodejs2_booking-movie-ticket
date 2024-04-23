import { Request, Response, NextFunction } from 'express';
import { AppException } from '../../../exceptions/app.exception';
import { StatusEnum } from '../../../enum/status.enum';
import {
  createParamDecorator,
  ExecutionContext,
} from '../param.custom.decorator';

export function SessionAuthen() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.mapping[propertyName]?.handlers?.length) {
      return;
    }

    const isAuthenWithSession = async function (
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const user = req.session['user'];
      if (!user) {
        res
          .status(StatusEnum.UN_AUTHORIZED)
          .json(new AppException('Unauthorized', StatusEnum.UN_AUTHORIZED));
        return;
      }
      next();
    };

    target.constructor.prototype.mapping[propertyName].handlers.push(
      isAuthenWithSession,
    );
  };
}

export const UserFromSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const session = ctx.req.session;
    return session['user'];
  },
);
