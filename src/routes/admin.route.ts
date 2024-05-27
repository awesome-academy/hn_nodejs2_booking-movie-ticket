import express from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseRoute } from './base.route';
import { AdminHomeController } from '../controllers/admin/admin.home.controller';
import { AdminManageMovieController } from '../controllers/admin/admin.manage-movie.controller';
import { csrfProtection } from '../security/csrf.protection.middleware';

@injectable()
export class AdminRoute extends BaseRoute {
  constructor(
    @inject(AdminHomeController)
    private readonly adminStatisticController: AdminHomeController,

    @inject(AdminManageMovieController)
    private readonly adminMangeMovieController: AdminManageMovieController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/',
      this.adminStatisticController.getView.bind(this.adminStatisticController),
    );
    this.router.get(
      '/manage-movie',
      csrfProtection,
      this.adminMangeMovieController.getAdminManageMoiveView.bind(
        this.adminMangeMovieController,
      ),
    );
    this.router.get(
      '/manage-ticket',
      csrfProtection,
      this.adminMangeMovieController.getAdminManageTicketView.bind(
        this.adminMangeMovieController,
      ),
    );
  }
}
