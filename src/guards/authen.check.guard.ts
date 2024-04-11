import { Request, Response, NextFunction } from 'express-serve-static-core';
import { inject, injectable } from 'tsyringe';
import { catchError } from '../decoratos/catcherror.decorators';

@injectable()
export class AuthenCheckGuard {
  constructor() {}

  @catchError()
  public async afterAuthen(req: Request, res: Response, next: NextFunction) {
    if (!req.session['user']) {
      res.redirect('/authen/login');
      return;
    }
    next();
  }

  @catchError()
  public async beforeAuthen(req: Request, res: Response, next: NextFunction) {
    if (req.session['user'] && !req.url.includes('logout')) {
      res.redirect('/');
      return;
    }
    next();
  }
}
