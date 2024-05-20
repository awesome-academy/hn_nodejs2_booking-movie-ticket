import express from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseRoute } from './base.route';
import { AdminHomeController } from '../controllers/admin/admin.home.controller';

@injectable()
export class AdminRoute extends BaseRoute {
  constructor(
    @inject(AdminHomeController)
    private readonly adminStatisticController: AdminHomeController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/',
      this.adminStatisticController.getView.bind(this.adminStatisticController),
    );
  }
}
