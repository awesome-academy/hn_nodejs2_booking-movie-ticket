import { injectable } from 'tsyringe';
import { catchError } from '../decoratos/catcherror.decorators';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../enum/user.enum';

@injectable()
export class AdminCheckGuard {
  constructor() {}

  @catchError()
  public async afterAuthen(req: Request, res: Response, next: NextFunction) {
    const user = req.session['user'];
    if (!user || user.role != UserRole.ADMIN) {
      req.session['originalUrl'] = req.originalUrl.includes('admin')
        ? req.originalUrl
        : null;
      res.redirect('/authen/login');
      return;
    }
    next();
  }
}
