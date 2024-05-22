import { Request, Response, NextFunction } from 'express-serve-static-core';
import { injectable } from 'tsyringe';

@injectable()
export class AdminHomeController {
  constructor() {}

  public async getView(req: Request, res: Response, next: NextFunction) {
    res.render('admin/admin-home', { active: 'home' });
  }
}
