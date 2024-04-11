import express from 'express';
import { inject, injectable } from 'tsyringe';
import { HomeController } from '../controllers/home.controller';
import { BaseRoute } from './base.route';

@injectable()
export class HomeRoute extends BaseRoute {
  constructor(
    @inject(HomeController)
    private readonly homeController: HomeController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '',
      this.homeController.getHomeView.bind(this.homeController),
    );
  }
}
