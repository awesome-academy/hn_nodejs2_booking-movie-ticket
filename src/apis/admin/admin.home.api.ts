import { inject } from 'tsyringe';
import { AdminHomeService } from '../../services/admin/admin.home.service';
import {
  GetMapping,
  Query,
  RestController,
} from '../../decoratos/api/rest.api.decorator';
import { AdminAuth } from '../../decoratos/api/guards/guard.admin.auth.decorator';
import { AdminTimeRangeRequestDto } from '../../dtos/req/admin/admin.timerange.req.dto';
import { PipeDto } from '../../decoratos/api/pipe.decorator';

@RestController('/api/admin')
export class AdminHomeRestController {
  constructor(
    @inject(AdminHomeService)
    private readonly adminHomeService: AdminHomeService,
  ) {}

  @AdminAuth()
  @GetMapping('/')
  public async getAdminHomeInfo() {
    return this.adminHomeService.getAdminHomeInfo();
  }

  @AdminAuth()
  @GetMapping('/statistic-revenue')
  public async getAdminRevenueInTimeRange(
    @Query(null, PipeDto(AdminTimeRangeRequestDto)) timeRange: any,
  ) {
    return this.adminHomeService.getAdminRevenueInTimeRange(timeRange);
  }
}
