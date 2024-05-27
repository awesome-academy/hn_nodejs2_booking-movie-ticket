import * as dotenv from 'dotenv';
dotenv.config();

import { delay, inject } from 'tsyringe';
import {
  Body,
  GetMapping,
  PostMapping,
  Query,
  Req,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { BillService } from '../services/bill.service';
import {
  SessionAuthen,
  UserFromSession,
} from '../decoratos/api/guards/guard.auth.decorator';
import { User } from '../entities/user.entity';
import { Request } from 'express';
import { VNPAYService } from '../services/external/payment/vnpay.service';
import { BillRequestDto } from '../dtos/req/bill/bill.req.dto';
import { MoMoService } from '../services/external/payment/momo.service';
import { PipeDto } from '../decoratos/api/pipe.decorator';
import session from 'express-session';
import { UserRole } from '../enum/user.enum';

@RestController('/api/bill')
export class BillRestController {
  constructor(
    @inject(delay(() => BillService))
    private readonly billService: BillService,

    @inject(delay(() => VNPAYService))
    private readonly vnpayService: VNPAYService,

    @inject(delay(() => MoMoService))
    private readonly momoService: MoMoService,
  ) {}

  @SessionAuthen()
  @GetMapping('/')
  public async getAllBillWithPaginationAndCondition(
    @UserFromSession()
    user: User,

    @Query()
    query: any,
  ) {
    if (user.role == UserRole.ADMIN) {
      return await this.billService.getAllBillWithPaginationAndCondition(
        null,
        query.orderDate,
        query.orderPrice,
        +query.page,
        +query.itemInPage,
      );
    }
    return await this.billService.getAllBillWithPaginationAndCondition(
      user.id,
      query.orderDate,
      query.orderPrice,
      +query.page,
      +query.itemInPage,
    );
  }

  @SessionAuthen()
  @PostMapping('/')
  public async payment(
    @Body(null, PipeDto(BillRequestDto))
    billRequestDto: BillRequestDto,

    @UserFromSession()
    user: User,

    @Req()
    req: Request,
  ) {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      '127.0.0.1';

    billRequestDto['ipAddr'] = ipAddr;
    billRequestDto['userId'] = user.id;

    req.app.locals.billRequestDto[user.id] = billRequestDto;

    return await this.billService.transactionToPaymentExternal(
      billRequestDto,
      req.app.locals.keepingSeats,
    );
  }

  @GetMapping('/vnpay-ipn')
  public async ipnVNPAYCallBack(
    @Query()
    querySearch: any,

    @Req()
    req: Request,
  ) {
    const billRequestDto =
      req.app.locals.billRequestDto[querySearch['vnp_OrderInfo']];

    delete req.app.locals.billRequestDto[querySearch['vnp_OrderInfo']];

    for (let seatId of billRequestDto.seatIds) {
      delete req.app.locals.keepingSeats[billRequestDto.scheduleId]?.[seatId];
    }
    delete req.app.locals.keepingSeats[billRequestDto.scheduleId];

    const result = await this.vnpayService.ipnProcess(
      querySearch,
      billRequestDto,
    );
    return result;
  }

  @PostMapping('/momo-ipn')
  public async ipnMomoCallBack(
    @Body()
    body: any,

    @Req()
    req: Request,
  ) {
    const billRequestDto = req.app.locals.billRequestDto[body['orderInfo']];

    delete req.app.locals.billRequestDto[body['orderInfo']];

    for (let seatId of billRequestDto.seatIds) {
      delete req.app.locals.keepingSeats[billRequestDto.scheduleId]?.[seatId];
    }
    delete req.app.locals.keepingSeats[billRequestDto.scheduleId];

    const result = await this.momoService.ipnProcess(body, billRequestDto);
    return result;
  }
}
