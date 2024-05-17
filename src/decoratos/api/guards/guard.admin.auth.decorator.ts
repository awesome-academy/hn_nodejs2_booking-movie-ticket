import { Request, Response, NextFunction } from 'express';
import { StatusEnum } from '../../../enum/status.enum';
import { AppException } from '../../../exceptions/app.exception';
import { UserRole } from '../../../enum/user.enum';

export function AdminAuth() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.mapping[propertyName]?.handlers?.length) {
      return;
    }

    const adminAuth = async function (
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const user = req.session['user'];
      if (!user || user.role != UserRole.ADMIN) {
        res
          .status(StatusEnum.UN_AUTHORIZED)
          .json(new AppException('Unauthorized', StatusEnum.UN_AUTHORIZED));
        return;
      }
      next();
    };

    target.constructor.prototype.mapping[propertyName].handlers.push(adminAuth);
  };
}
