import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';

@injectable()
export class PersonalInfoController {
  constructor() {}

  public async getUIPersonInfo(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('personal-info', {
      activeHeader: 'personalInfo',
    });
  }
}
