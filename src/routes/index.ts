import express from 'express';
import { injectable } from 'tsyringe';
import { BaseRoute } from './base.route';

@injectable()
export class RootRoute extends BaseRoute {
  constructor() {
    super();
    this.router = express.Router();
  }
}
