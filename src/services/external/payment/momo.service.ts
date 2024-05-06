import * as dotenv from 'dotenv';
dotenv.config();

import { delay, inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { StatusEnum } from '../../../enum/status.enum';
import { AppBaseResponseDto } from '../../../dtos/res/app.api.base.res.dto';
import { PaymentExternalService } from './payment.external.service';
import { ErrorApiResponseDto } from '../../../dtos/res/error.api.res.dto';
import { PaymentExternalResponseDto } from '../../../dtos/res/external/payment.external.response.dto';
import { BillRepository } from '../../../repositories/bill.repository';
import { BillService } from '../../bill.service';
import { PayOnlineType } from '../../../enum/pay.online.type.enum';
import { BillStatus } from '../../../enum/bill.enum';
import querystring from 'qs';
import sortObject from 'sort-object';

@injectable()
export class MoMoService implements PaymentExternalService {
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

    const userId = +externalRequestDto['orderInfo'];

    await this.billService.saveNewBill(
      userId,
      externalRequestDto,
      PayOnlineType.MOMO,
      BillStatus.SUCCESS,
      billRequestDto,
    );

    return {
      RspCode: 0,
      Message: 'OK',
    } as PaymentExternalResponseDto;
  }

  public async transaction(dto: any) {
    const partnerCode = process.env.momo_PartnerCode;
    const accessKey = process.env.momo_AccessKey;
    const secretKey = process.env.momo_SecretKey;

    const orderInfo = dto['userId'];
    const orderId = partnerCode + new Date().getTime();
    const redirectUrl = process.env.momo_RedirectUrl;
    const ipnUrl = `${process.env.momo_IpnUrl}/api/bill/momo-ipn`;
    const requestType = process.env.momo_RequestType;
    const requestId = orderId;
    const extraData = '';
    const lang = 'vi';

    const paymentMomoUrl = process.env.momo_PaymentMomoUrl;

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      `${dto.totalPriceFromTicket + dto.totalPriceFromFood}` +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    //signature
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: process.env.momo_PartnerName,
      storeId: process.env.momo_StoreId,
      requestId: requestId,
      amount: dto.totalPriceFromTicket + dto.totalPriceFromFood,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      extraData: extraData,
      signature: signature,
    });

    const response = await fetch(paymentMomoUrl, {
      method: 'POST',
      body: requestBody,
      headers: { 'Content-Type': 'application/json' },
    });
    const result: any = await response.json();
    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: { redirect: result.payUrl },
    } as AppBaseResponseDto;
  }

  public async verify(returnParams: any): Promise<number> {
    let momoParams = returnParams;

    if (+momoParams['resultCode'] != 0) {
      return 2;
    }

    const accessKey = process.env.momo_AccessKey;
    const secretKey = process.env.momo_SecretKey;

    const signature = momoParams['signature'];
    delete momoParams['signature'];
    delete momoParams['paymentOption'];

    const rawSignature =
      `accessKey=${accessKey}&` +
      querystring.stringify(sortObject(momoParams), {
        encode: false,
      });

    const signed = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature === signed) {
      return 1;
    }
    return 0;
  }
}
