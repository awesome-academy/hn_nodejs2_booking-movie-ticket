import { inject, injectable } from 'tsyringe';
import { BillRepository } from '../repositories/bill.repository';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { PurchasedFoodRepository } from '../repositories/purchased.food.repository';
import { BillPagination } from '../constant/pagination.constant';
import { ErrorApiResponseDto } from '../dtos/res/error.api.res.dto';
import { StatusEnum } from '../enum/status.enum';
import { ObjectMapper } from '../utils/mapper';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { getPaginationParameter } from '../pagination/pagination';
import dayjs from 'dayjs';
import { DateFormat } from '../enum/date.format.enum';
import { BillRequestDto } from '../dtos/req/bill/bill.req.dto';
import { Mutex } from 'async-mutex';
import { VNPAYService } from './external/payment/vnpay.service';
import { MoMoService } from './external/payment/momo.service';
import { PayOnlineType } from '../enum/pay.online.type.enum';
import { SeatRepository } from '../repositories/seat.repository';
import { FoodRepository } from '../repositories/food.repository';
import { BillStatus } from '../enum/bill.enum';
import { v4 as uuidv4 } from 'uuid';
import { sendMail } from '../utils/sendmail';
import path from 'path';
import { UserRepository } from '../repositories/user.repository';
import { Transactional } from 'typeorm-transactional';

@injectable()
export class BillService {
  constructor(
    @inject(BillRepository)
    private readonly billRepository: BillRepository,

    @inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,

    @inject(TicketRepository)
    private readonly ticketRepository: TicketRepository,

    @inject(PurchasedFoodRepository)
    private readonly purchasedFoodRepository: PurchasedFoodRepository,

    @inject(SeatRepository)
    private readonly seatRepository: SeatRepository,

    @inject(VNPAYService)
    private readonly vnpayService: VNPAYService,

    @inject(MoMoService)
    private readonly momoService: MoMoService,

    @inject(FoodRepository)
    private readonly foodRepository: FoodRepository,

    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  private uniqueArray(array: any[]) {
    const result = [...new Set(array.map((item: any) => JSON.stringify(item)))]
      .sort((o1: any, o2: any) => JSON.parse(o1).id - JSON.parse(o2).id)
      .map((json: string) => JSON.parse(json));

    return result;
  }

  private convertToBillListItems(arr: any[]) {
    let items = [];
    for (let obj of arr) {
      const ticket = {
        id: obj['ticket'].id,
        seat: obj['seat'].name,
        type: obj['seat'].type,
        price: obj['ticket'].currentPrice,
        room: obj['room'].name,
        schedule: `${dayjs(new Date(obj['schedule'].startDate)).format(DateFormat.DD_MM_YYYY)} ${obj['schedule'].startTime}`,
        reasonReject: obj['ticket'].reasonReject,
      };

      const purchasedFood = {
        id: obj['food'].id,
        image: obj['food'].imagurl,
        unit: obj['food'].unit,
        price: obj['purchasedFood'].currentPrice,
        quantity: obj['purchasedFood'].quantity,
        description: obj['food'].description,
      };

      if (!items.length || items[items.length - 1].id != obj['bill'].id) {
        items.push({
          id: obj['bill'].id,
          totalPriceFromTicket: obj['bill'].totalPriceFromTicket,
          totalPriceFromFood: obj['bill'].totalPriceFromFood,
          status: obj['bill'].status,
          type: obj['bill'].type,
          bankCode: obj['bill'].bankCode,
          bankTranNo: obj['bill'].bankTranNo,
          payTime: dayjs(new Date(obj['bill'].payTime)).format(
            DateFormat.DD_MM_YYYY_HH_mm_ss,
          ),
          totalPrice: +obj['bill'].totalPrice,
          userId: +obj['bill'].userId,
          movie: {
            id: obj['movie'].id,
            name: obj['movie'].name,
          },
          tickets: [ticket],
          purchasedFoods: [purchasedFood],
        });
      } else {
        items[items.length - 1].tickets.push(ticket);
        items[items.length - 1].purchasedFoods.push(purchasedFood);
      }
    }

    items = items.map((item) => {
      const tickets = this.uniqueArray(item.tickets);
      const purchasedFoods = this.uniqueArray(item.purchasedFoods);
      return {
        ...item,
        tickets,
        purchasedFoods,
      };
    });

    return items;
  }

  public async getAllBillWithPaginationAndCondition(
    userId: number = null,
    orderDate: string = null,
    orderPrice: string = null,
    page: number = null,
    itemInPage: number = null,
  ) {
    const billPagination = { ...BillPagination };

    if (itemInPage) {
      billPagination.ITEM_IN_PAGE = itemInPage;
    }

    if (
      !page ||
      (orderDate != '1' && orderDate != '0') ||
      (orderPrice != '1' && orderPrice != '0')
    ) {
      throw {
        message: 'Query search invalid',
        status: StatusEnum.BAD_REQUEST,
        errors: null,
      } as ErrorApiResponseDto;
    }

    let cdt: any = this.billRepository
      .createQueryBuilder('bill')
      .addSelect(
        '(bill.totalPriceFromTicket + bill.totalPriceFromFood)',
        'totalPrice',
      )
      .groupBy('bill.id')
      .skip((page - 1) * billPagination.ITEM_IN_PAGE)
      .take(billPagination.ITEM_IN_PAGE);

    if (userId) {
      cdt.where(`bill.userId = ${userId}`);
    }

    if (orderPrice == '1') {
      cdt.orderBy('totalPrice', 'DESC');
    } else {
      cdt.orderBy('totalPrice', 'ASC');
    }

    if (orderDate == '1') {
      cdt.addOrderBy('bill.payTime', 'ASC');
    } else {
      cdt.addOrderBy('bill.payTime', 'DESC');
    }

    cdt = cdt.getQuery();

    const sq = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.movie', 'movie')
      .innerJoinAndSelect('schedule.room', 'room')
      .getQuery();

    const sq1 = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect(`(${sq})`, 'sq', 'ticket.scheduleId = sq.schedule_id')
      .innerJoinAndSelect('ticket.seat', 'seat')
      .getQuery();

    const sq2 = this.purchasedFoodRepository
      .createQueryBuilder('purchasedFood')
      .innerJoinAndSelect('purchasedFood.food', 'food')
      .getQuery();

    const rawResultPromise = this.billRepository
      .createQueryBuilder('bill')
      .addSelect('cdt.totalPrice', 'bill_totalPrice')
      .innerJoin(`(${cdt})`, 'cdt', 'bill.id = cdt.bill_id')
      .innerJoinAndSelect(`(${sq1})`, 'sq1', 'bill.id = sq1.ticket_bill_id')
      .leftJoinAndSelect(
        `(${sq2})`,
        'sq2',
        'bill.id = sq2.purchasedFood_bill_id',
      )
      .getRawMany();

    let totalRecordsPromise: any = this.billRepository
      .createQueryBuilder('bill')
      .addSelect('distinct bill.id');

    if (userId) {
      totalRecordsPromise.where(`bill.userId = ${userId}`);
    }
    totalRecordsPromise = totalRecordsPromise.getCount();

    const [rawResult, totalRecords] = await Promise.all([
      rawResultPromise,
      totalRecordsPromise,
    ]);

    const arr = ObjectMapper.mapToEntitiesFromRawResults(rawResult, [
      'bill',
      'ticket',
      'schedule',
      'movie',
      'room',
      'seat',
      'purchasedFood',
      'food',
    ]);

    const paginationParameter = getPaginationParameter(
      totalRecords,
      page,
      billPagination,
    );

    const items = this.convertToBillListItems(arr);
    const data = {
      ...paginationParameter,
      items,
    };

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: !arr?.length ? null : data,
    } as AppBaseResponseDto;
  }

  private isSeatKeeping(
    seatIds: number[],
    scheduleId: number,
    keepSeats: any,
  ): boolean {
    for (let seatId of seatIds) {
      if (keepSeats[scheduleId]?.[seatId]) {
        return true;
      }
    }
    return false;
  }

  public async transactionToPaymentExternal(
    billRequestDto: BillRequestDto,
    keepSeats: any,
  ) {
    const { scheduleId, foodIds, payType, quantities, seatIds } =
      billRequestDto;
    const schedule = await this.scheduleRepository.findOneBy({
      id: billRequestDto.scheduleId,
    });
    const timeShow = new Date(
      dayjs(schedule.startDate).format(DateFormat.YYYY_MM_DD) +
        ' ' +
        schedule.startTime,
    ).getTime();

    const now = new Date().getTime();
    const scheduleAddTime = +process.env.SCHEDULE_ADD_TIME;
    if (now + scheduleAddTime > timeShow) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          time: 'TIME BLOCK',
        },
      } as ErrorApiResponseDto;
    }

    if (this.isSeatKeeping(seatIds, scheduleId, keepSeats)) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          seatKeeping: 'SEAT IS KEEPING',
        },
      } as ErrorApiResponseDto;
    }

    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.seatId in (:ids)', { ids: seatIds })
      .andWhere('ticket.scheduleId = :scheduleId', { scheduleId })
      .getMany();

    if (tickets.length) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Bad Request',
        errors: {
          seatChoosed: 'SEAT IS CHOOSED',
        },
      } as ErrorApiResponseDto;
    }

    // semaphore flag to sync common resources
    const mutex = new Mutex();
    const release = await mutex.acquire();
    try {
      keepSeats[scheduleId] = {};
      for (let seatId of seatIds) {
        keepSeats[scheduleId][seatId] = true;
      }
    } finally {
      release();
    }

    const [rawResult, foods] = await Promise.all([
      this.seatRepository
        .createQueryBuilder('seat')
        .select('sum(seat.price) as totalPriceFromTicket')
        .where('seat.id in (:ids)', { ids: seatIds })
        .getRawOne(),

      this.foodRepository
        .createQueryBuilder('food')
        .where('food.id in (:ids)', { ids: foodIds })
        .getMany(),
    ]);

    const { totalPriceFromTicket } = rawResult;

    let totalPriceFromFood = 0;
    for (let i = 0; i < foods?.length; i++) {
      const food = foods[i];
      totalPriceFromFood += food.price * quantities[i];
    }

    billRequestDto['totalPriceFromTicket'] = +totalPriceFromTicket;
    billRequestDto['totalPriceFromFood'] = +totalPriceFromFood;

    switch (payType) {
      case PayOnlineType.VNPAY:
        return this.vnpayService.transaction(
          billRequestDto,
          billRequestDto['ipAddr'],
          'vi',
        );
      case PayOnlineType.MOMO:
        return this.momoService.transaction(billRequestDto);
      default:
        return this.vnpayService.transaction(
          billRequestDto,
          billRequestDto['ipAddr'],
          'vi',
        );
    }
  }

  @Transactional()
  public async saveNewBill(
    userId: number,
    externalRequestDto: any,
    paymentOnlineType: PayOnlineType,
    status: BillStatus,
    billRequestDto: any,
  ) {
    const {
      foodIds,
      quantities,
      scheduleId,
      seatIds,
      totalPriceFromTicket,
      totalPriceFromFood,
    } = billRequestDto;

    let payTime = null;
    let bankCode = 'SGB';
    let bankTranNo = null;
    switch (paymentOnlineType) {
      case PayOnlineType.VNPAY:
        payTime = dayjs(
          externalRequestDto.vnp_PayDate,
          DateFormat.YYYYMMDDHHmmss,
        ).toDate();
        bankCode = externalRequestDto.vnp_BankCode;
        bankTranNo = `${bankCode}${externalRequestDto.vnp_PayDate}`;
        break;
      case PayOnlineType.MOMO:
        payTime = new Date(+externalRequestDto.responseTime);
        bankCode = 'SGB';
        bankTranNo = `${bankCode}${dayjs(payTime).format(DateFormat.YYYYMMDDHHmmss)}`;
        break;
      default:
        break;
    }

    const paymentOnlineCode = uuidv4();

    let bill = this.billRepository.create({
      totalPriceFromTicket,
      totalPriceFromFood,
      status,
      type: paymentOnlineType,
      bankCode,
      payTime: dayjs(payTime).format(DateFormat.YYYY_MM_DD_HH_mm_ss),
      userId,
      bankTranNo,
      paymentOnlineCode,
    });

    await this.billRepository.save(bill);
    bill = await this.billRepository.findOneBy({ paymentOnlineCode });

    const [seats, foods, user, schedule] = await Promise.all([
      this.seatRepository
        .createQueryBuilder('seat')
        .where('seat.id in (:ids)', { ids: seatIds })
        .getMany(),

      this.foodRepository
        .createQueryBuilder('food')
        .where('food.id in (:ids)', { ids: foodIds })
        .getMany(),

      this.userRepository.findOneBy({ id: userId }),

      this.scheduleRepository
        .createQueryBuilder('schedule')
        .innerJoinAndSelect('schedule.movie', 'movie')
        .innerJoinAndSelect('schedule.room', 'room')
        .where('schedule.id = :scheduleId', { scheduleId })
        .getOne(),
    ]);

    const tickets = this.ticketRepository.create(
      seats.map((seat) => {
        return {
          currentPrice: seat.price,
          billId: bill.id,
          scheduleId,
          seatId: seat.id,
        };
      }),
    );

    const purchasedFoods = this.purchasedFoodRepository.create(
      foods.map((food, index) => {
        return {
          currentPrice: food.price,
          foodId: food.id,
          billId: bill.id,
          quantity: quantities[index],
        };
      }),
    );

    let dateShow: any = new Date(
      dayjs(schedule.startDate).format(DateFormat.YYYY_MM_DD) +
        ' ' +
        schedule.startTime,
    );
    const day = `${dateShow.getDay() == 0 ? 'CN' : 'T' + (dateShow.getDay() + 1)}`;
    dateShow = `${day} ${dayjs(dateShow).format(DateFormat.YYYY_MM_DD_HH_mm_ss)}`;

    await Promise.all([
      this.ticketRepository.save(tickets),
      this.purchasedFoodRepository.save(purchasedFoods),
      sendMail({
        email: user.email,
        subject: 'Thank for booking',
        context: {
          seats,
          foods,
          user,
          schedule,
          quantities,
          totalPriceFromTicket,
          totalPriceFromFood,
          dateShow,
        },
        templatePath: path.join(
          __dirname,
          '..',
          'views/mail/mail.thankfor.booking.ejs',
        ),
      }),
    ]);
  }
}
