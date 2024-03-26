import { Router } from 'express';

export abstract class BaseRoute {
  protected router: Router;
  protected constructor() {}

  public getRouter() {
    return this.router;
  }
}
