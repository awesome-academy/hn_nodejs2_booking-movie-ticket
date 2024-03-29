import express from 'express';
import { inject, injectable } from 'tsyringe';
import { AuthenController } from '../controllers/authen.controller';
import { BaseRoute } from './base.route';

@injectable()
export class AuthenRoute extends BaseRoute {
  constructor(
    @inject(AuthenController)
    private readonly authenController: AuthenController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/login',
      this.authenController.getLoginForm.bind(this.authenController),
    );

    this.router.get(
      '/register',
      this.authenController.getRegisterForm.bind(this.authenController),
    );
  }
}
