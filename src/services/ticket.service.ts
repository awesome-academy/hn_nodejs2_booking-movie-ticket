import * as dotenv from 'dotenv';
dotenv.config();

import { inject, injectable } from 'tsyringe';
import { TicketRepository } from '../repositories/ticket.repository';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../enum/status.enum';
import { AppException } from '../exceptions/app.exception';
import { Ticket } from '../entities/ticket.entity';
import dayjs from 'dayjs';
import { DateFormat } from '../enum/date.format.enum';
import { Transactional } from 'typeorm-transactional';

@injectable()
export class TicketService {
  constructor(
    @inject(TicketRepository)
    private readonly ticketRepository: TicketRepository,
  ) {}

  private checkValidTimeSubmit(ticket: Ticket): boolean {
    const schedule = new Date(
      dayjs(ticket.schedule.startDate).format(DateFormat.YYYY_MM_DD) +
        ' ' +
        ticket.schedule.startTime,
    ).getTime();

    const now = new Date().getTime();

    if (now > schedule) {
      return false;
    }
    return true;
  }

  @Transactional()
  public async updateReason(ticketId: number, reasonReject: string) {
    if (
      !reasonReject ||
      reasonReject.length == 0 ||
      reasonReject.length > 255
    ) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'reasonReject length must in range (1, 255) character',
      } as AppException;
    }

    let ticket = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.schedule', 'schedule')
      .where('ticket.id = :id', { id: ticketId })
      .getOne();

    if (!ticket) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Ticket not exsist',
      } as AppException;
    }

    if (!this.checkValidTimeSubmit(ticket)) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Time reject submit expire',
      } as AppException;
    }

    ticket = this.ticketRepository.create({
      id: ticketId,
      reasonReject,
    });

    await this.ticketRepository.save(ticket);

    return {
      message: 'OK',
      status: StatusEnum.OK,
      data: reasonReject,
    } as AppBaseResponseDto;
  }
}
