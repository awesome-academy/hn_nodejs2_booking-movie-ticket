import * as dotenv from 'dotenv';
dotenv.config();

import { inject } from 'tsyringe';
import {
  Body,
  GetMapping,
  Param,
  PostMapping,
  PutMapping,
  Query,
  Req,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { ScheduleService } from '../services/schedule.service';
import { ParseIntPipe, PipeDto } from '../decoratos/api/pipe.decorator';
import { UseInterceptors } from '../decoratos/api/interceptor.decorator';
import { TimmerInterceptor } from '../decoratos/api/interceptors/timmer.interceptor';
import { SessionAuthen } from '../decoratos/api/guards/guard.auth.decorator';
import { Request } from 'express';
import { AdminAuth } from '../decoratos/api/guards/guard.admin.auth.decorator';
import { CSRFProtection } from '../decoratos/api/guards/guard.csrf.decorator';
import { ScheduleSaveRequestDto } from '../dtos/req/schedule/schedule.save.req.dto';

@RestController('/api/schedule')
export class ScheduleRestController {
  constructor(
    @inject(ScheduleService)
    private readonly scheduleService: ScheduleService,
  ) {}

  @AdminAuth()
  @GetMapping('/all')
  public async getAllWithConditions(
    @Query('movieName')
    movieName: string,

    @Query('dateSearch')
    dateSearch: string,

    @Query('page', ParseIntPipe)
    page: number,
  ) {
    return await this.scheduleService.getAllWithConditions(
      movieName,
      dateSearch,
      page,
    );
  }

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

  @AdminAuth()
  @CSRFProtection()
  @PutMapping('/:id')
  public async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body(null, PipeDto(ScheduleSaveRequestDto))
    dto: ScheduleSaveRequestDto,
  ) {
    dto['id'] = id;
    return this.scheduleService.save(dto);
  }

  @AdminAuth()
  @CSRFProtection()
  @PostMapping('/')
  public async create(
    @Body(null, PipeDto(ScheduleSaveRequestDto))
    dto: ScheduleSaveRequestDto,
  ) {
    return this.scheduleService.save(dto);
  }

  @AdminAuth()
  @CSRFProtection()
  @PutMapping('/change-status/:id')
  public async changeStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Body('status')
    status: string,
  ) {
    return await this.scheduleService.changeStatus(id, status);
  }
}
