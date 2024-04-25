import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';

@injectable()
export class HistoryOrderController {
  constructor() {}

  public async getUIHistoryOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('history-order', {
      activeHeader: 'historyOrder',
      csrfToken: req.csrfToken(),
    });
  }
}
