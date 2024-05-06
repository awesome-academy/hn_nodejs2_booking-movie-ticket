import { inject, injectable } from 'tsyringe';
import { BookingController } from '../controllers/booking.controller';
import { BaseRoute } from './base.route';
import * as express from 'express';
import { AuthenCheckGuard } from '../guards/authen.check.guard';

@injectable()
export class BookingRoute extends BaseRoute {
  constructor(
    @inject(BookingController)
    private readonly bookingController: BookingController,

    @inject(AuthenCheckGuard)
    private readonly authenCheckGuard: AuthenCheckGuard,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/:movieId',
      this.bookingController.getChooseScheduleUI.bind(this.bookingController),
    );
    this.router.get(
      '/choose-seat/:scheduleId',
      this.authenCheckGuard.afterAuthen.bind(this.authenCheckGuard),
      this.bookingController.getChooseSeatUI.bind(this.bookingController),
    );
  }
}
