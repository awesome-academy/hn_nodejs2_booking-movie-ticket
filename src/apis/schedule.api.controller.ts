import * as dotenv from 'dotenv';
dotenv.config();

import { inject } from 'tsyringe';
import {
  GetMapping,
  Param,
  Query,
  Req,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { ScheduleService } from '../services/schedule.service';
import { ParseIntPipe } from '../decoratos/api/pipe.decorator';
import { UseInterceptors } from '../decoratos/api/interceptor.decorator';
import { TimmerInterceptor } from '../decoratos/api/interceptors/timmer.interceptor';
import { SessionAuthen } from '../decoratos/api/guards/guard.auth.decorator';
import { Request } from 'express';

@RestController('/api/schedule')
export class ScheduleRestController {
  constructor(
    @inject(ScheduleService)
    private readonly scheduleService: ScheduleService,
  ) {}

  @GetMapping('')
  public async getSchedules(
    @Query('movieId', ParseIntPipe)
    movieId: number,
  ) {
    return await this.scheduleService.getSchedules(movieId);
  }

  @SessionAuthen()
  @UseInterceptors(TimmerInterceptor)
  @GetMapping('/:id')
  public async getScheduleDetail(
    @Param('id', ParseIntPipe)
    id: number,

    @Req()
    req: Request,
  ) {
    return await this.scheduleService.getScheduleDetail(
      id,
      req.app.locals.keepingSeats,
    );
  }
}
