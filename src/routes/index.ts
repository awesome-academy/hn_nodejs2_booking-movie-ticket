import express from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseRoute } from './base.route';
import { AuthenRoute } from './authen.route';

@injectable()
export class RootRoute extends BaseRoute {
  constructor(
    @inject(AuthenRoute)
    private readonly authenRoute: AuthenRoute,
  ) {
    super();
    this.router = express.Router();

    this.router.use('/authen', this.authenRoute.getRouter());
  }
}
