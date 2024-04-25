import { Request, Response, NextFunction } from 'express-serve-static-core';
import { inject, injectable } from 'tsyringe';
import { catchError } from '../decoratos/catcherror.decorators';

@injectable()
export class AuthenCheckGuard {
  private readonly pageRequireLogins = ['/personal-info', '/history-order'];

  constructor() {}

  private isPageRequireLogin(path: string): boolean {
    for (let item of this.pageRequireLogins) {
      if (path.lastIndexOf(item) > -1) {
        return true;
      }
    }
    return false;
  }

  @catchError()
  public async afterAuthen(req: Request, res: Response, next: NextFunction) {
    if (!req.session['user']) {
      req.session['originalUrl'] = this.isPageRequireLogin(req.originalUrl)
        ? req.originalUrl
        : null;
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
    if (
      req.url.includes('logout') &&
      this.isPageRequireLogin(req.cookies.currentPath)
    ) {
      req['logoutRedirectHome'] = true;
    }
    next();
  }
}
