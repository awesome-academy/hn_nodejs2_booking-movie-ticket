import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { inject, injectable } from 'tsyringe';
import { AuthenController } from '../controllers/authen.controller';
import { BaseRoute } from './base.route';
import { csrfProtection } from '../security/csrf.protection.middleware';
import multer from 'multer';

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
      csrfProtection,
      this.authenController.getLoginForm.bind(this.authenController),
    );
    this.router.post(
      '/login',
      csrfProtection,
      this.authenController.postLoginForm.bind(this.authenController),
    );

    this.router.get(
      '/register',
      csrfProtection,
      this.authenController.getRegisterForm.bind(this.authenController),
    );
    this.router.post(
      '/register',
      multer({
        limits: { fileSize: 5 * 1024 * 1024 },
      }).single('avatar'),
      csrfProtection,
      this.authenController.postRegisterForm.bind(this.authenController),
    );
  }
}
