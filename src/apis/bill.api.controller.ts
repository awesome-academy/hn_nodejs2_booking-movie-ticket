import { inject } from 'tsyringe';
import {
  GetMapping,
  Query,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { BillService } from '../services/bill.service';
import {
  SessionAuthen,
  UserFromSession,
} from '../decoratos/api/guards/guard.auth.decorator';
import { User } from '../entities/user.entity';

@RestController('/api/bill')
export class BillRestController {
  constructor(
    @inject(BillService)
    private readonly billService: BillService,
  ) {}

  @SessionAuthen()
  @GetMapping('/')
  public async getAllBillWithPaginationAndCondition(
    @UserFromSession()
    user: User,

    @Query()
    query: any,
  ) {
    return await this.billService.getAllBillWithPaginationAndConditionByUser(
      user,
      query.orderDate,
      query.orderPrice,
      +query.page,
    );
  }
}
