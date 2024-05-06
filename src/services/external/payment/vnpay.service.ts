import * as dotenv from 'dotenv';
dotenv.config();

import { delay, inject, injectable } from 'tsyringe';
import querystring from 'qs';
import sortObject from 'sort-object';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { AppBaseResponseDto } from '../../../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../../../enum/status.enum';
import { ErrorApiResponseDto } from '../../../dtos/res/error.api.res.dto';
import { PaymentExternalService } from './payment.external.service';
import { PaymentExternalResponseDto } from '../../../dtos/res/external/payment.external.response.dto';
import { BillRepository } from '../../../repositories/bill.repository';
import { PayOnlineType } from '../../../enum/pay.online.type.enum';
import { BillStatus } from '../../../enum/bill.enum';
import { BillService } from '../../bill.service';

@injectable()
export class VNPAYService implements PaymentExternalService {
  constructor(
    @inject(delay(() => BillService))
    private readonly billService: BillService,
  ) {}

  public async ipnProcess(
    externalRequestDto: any,
    billRequestDto: BillRepository,
  ): Promise<PaymentExternalResponseDto> {
    const checksum = await this.verify(externalRequestDto);
    if (checksum == 0) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          checksum: 'Checksum faile',
        },
      } as ErrorApiResponseDto;
    }

    if (checksum == 2) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Errors',
        errors: {
          code: 97,
        },
      } as ErrorApiResponseDto;
    }

    const userId = +externalRequestDto['vnp_OrderInfo'];

    await this.billService.saveNewBill(
      userId,
      externalRequestDto,
      PayOnlineType.VNPAY,
      BillStatus.SUCCESS,
      billRequestDto,
    );

    return {
      RspCode: '00',
      Message: 'OK',
    } as PaymentExternalResponseDto;
  }

  public async transaction(
    dto: any,
    ipAddr?: string | string[],
    language?: string,
  ) {
    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    const returnUrl = process.env.vnp_ReturnUrl;

    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');
    const orderId = dayjs(date).format('HHmmss');
    const bankCode = '';
    const orderInfo = dto['userId'];
    const orderType = process.env.vnp_OrderType;
    const locale = language ? language : 'vn';

    const currCode = 'VND';
    let vnpParams = {};
    vnpParams['vnp_Version'] = process.env.vnp_Version;
    vnpParams['vnp_Command'] = process.env.vnp_Command;
    vnpParams['vnp_TmnCode'] = tmnCode;

    vnpParams['vnp_Locale'] = locale;
    vnpParams['vnp_CurrCode'] = currCode;
    vnpParams['vnp_TxnRef'] = orderId;
    vnpParams['vnp_OrderInfo'] = orderInfo;
    vnpParams['vnp_OrderType'] = orderType;
    vnpParams['vnp_Amount'] =
      (dto.totalPriceFromTicket + dto.totalPriceFromFood) * 100;
    vnpParams['vnp_ReturnUrl'] = returnUrl;
    vnpParams['vnp_IpAddr'] = ipAddr;
    vnpParams['vnp_CreateDate'] = createDate;
    if (bankCode) {
      vnpParams['vnp_BankCode'] = bankCode;
    }

    vnpParams = sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: true });

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnpParams, { encode: true });

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: { redirect: vnpUrl },
    } as AppBaseResponseDto;
  }

  public async verify(returnParams: any): Promise<number> {
    let vnpParams = returnParams;

    if (+returnParams['vnp_ResponseCode'] != 0) {
      return 2;
    }

    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    vnpParams = sortObject(vnpParams);

    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;

    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      return 1;
    }
    return 0;
  }
}
