import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { Request, Response, NextFunction } from 'express-serve-static-core';

@injectable()
export class AuthenController {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async getLoginForm(req: Request, res: Response, next: NextFunction) {
    res.render('authen/login');
  }

  public async getRegisterForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('authen/register');
  }
}
