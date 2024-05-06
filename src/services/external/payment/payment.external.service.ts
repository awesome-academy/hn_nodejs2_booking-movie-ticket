import { AppBaseResponseDto } from '../../../dtos/res/app.api.base.res.dto';
import { PaymentExternalResponseDto } from '../../../dtos/res/external/payment.external.response.dto';
import { BillRepository } from '../../../repositories/bill.repository';

export abstract class PaymentExternalService {
  abstract transaction(
    dto: any,
    ipAddr?: string | string[],
    language?: string,
  ): Promise<AppBaseResponseDto>;

  abstract ipnProcess(
    externalRequestDto: any,
    billRequestDto: BillRepository,
  ): Promise<PaymentExternalResponseDto>;

  abstract verify(returnParams: any): Promise<number>;
}
