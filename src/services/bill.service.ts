import { inject, injectable } from 'tsyringe';
import { BillRepository } from '../repositories/bill.repository';
import { User } from '../entities/user.entity';
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
      };

      const purchasedFood = {
        id: obj['food'].id,
        image: obj['food'].image,
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

  public async getAllBillWithPaginationAndConditionByUser(
    user: User,
    orderDate: string = null,
    orderPrice: string = null,
    page: number = null,
  ) {
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
      .where(`bill.userId = ${user.id}`)
      .groupBy('bill.id')
      .skip((page - 1) * BillPagination.ITEM_IN_PAGE)
      .take(BillPagination.ITEM_IN_PAGE);

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

    const [rawResult, totalRecords] = await Promise.all([
      this.billRepository
        .createQueryBuilder('bill')
        .addSelect('cdt.totalPrice', 'bill_totalPrice')
        .innerJoin(`(${cdt})`, 'cdt', 'bill.id = cdt.bill_id')
        .innerJoinAndSelect(`(${sq1})`, 'sq1', 'bill.id = sq1.ticket_bill_id')
        .leftJoinAndSelect(
          `(${sq2})`,
          'sq2',
          'bill.id = sq2.purchasedFood_bill_id',
        )
        .getRawMany(),

      this.billRepository
        .createQueryBuilder('bill')
        .addSelect('distinct bill.id')
        .where(`bill.userId = ${user.id}`)
        .getCount(),
    ]);

    const arr = rawResult.map((rawObj) => {
      let entities = {};
      [
        'bill',
        'ticket',
        'schedule',
        'movie',
        'room',
        'seat',
        'purchasedFood',
        'food',
      ].forEach((prefix) => {
        let obj = {};
        Object.keys(rawObj).forEach((key) => {
          if (key.startsWith(prefix)) {
            obj = { ...obj, [key]: rawObj[key] };
          }
        });
        entities = { ...entities, [prefix]: ObjectMapper.mapper(obj) };
      });
      return entities;
    });

    const paginationParameter = getPaginationParameter(
      totalRecords,
      page,
      BillPagination,
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
}
