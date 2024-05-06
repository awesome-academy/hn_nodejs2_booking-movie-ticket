import { Request, Response, NextFunction } from 'express-serve-static-core';
import { delay, inject, injectable } from 'tsyringe';
import { VNPAYService } from '../services/external/payment/vnpay.service';
import { MoMoService } from '../services/external/payment/momo.service';

@injectable()
export class PaymentResultController {
  constructor(
    @inject(delay(() => VNPAYService))
    private readonly vnpayService: VNPAYService,

    @inject(delay(() => MoMoService))
    private readonly momoService: MoMoService,
  ) {}

  public async paymentResult(req: Request, res: Response, next: NextFunction) {
    let checksum = null;
    if (JSON.stringify(req.query).includes('vnp')) {
      checksum = await this.vnpayService.verify(req.query);
    } else {
      checksum = await this.momoService.verify(req.query);
    }
    res.render('payment-result', {
      checksum,
    });
  }
}
