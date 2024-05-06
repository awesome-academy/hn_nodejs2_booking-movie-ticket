import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';

@injectable()
export class BookingController {
  constructor() {}

  public async getChooseScheduleUI(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('choose-schedule');
  }

  public async getChooseSeatUI(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('choose-seat');
  }
}
