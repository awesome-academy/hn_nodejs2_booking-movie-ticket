import { inject } from 'tsyringe';
import { AdminAuth } from '../decoratos/api/guards/guard.admin.auth.decorator';
import { CSRFProtection } from '../decoratos/api/guards/guard.csrf.decorator';
import { ParseIntPipe } from '../decoratos/api/pipe.decorator';
import {
  PutMapping,
  Body,
  RestController,
  Req,
} from '../decoratos/api/rest.api.decorator';
import { TicketService } from '../services/ticket.service';

@RestController('/api/ticket')
export class TicketRestController {
  constructor(
    @inject(TicketService)
    private readonly ticketService: TicketService,
  ) {}

  // @AdminAuth()
  // @CSRFProtection()
  @PutMapping('/update-reason')
  public async updateReason(
    @Body('ticketId', ParseIntPipe)
    ticketId: number,

    @Body('reasonReject')
    reasonReject: string,
  ) {
    return this.ticketService.updateReason(ticketId, reasonReject);
  }
}
