import { Request, Response, NextFunction } from 'express-serve-static-core';
import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { catchError } from '../decoratos/catcherror.decorators';
import { Base64URL } from './base64url';
import { Sha256 } from './sha256';
import * as dotenv from 'dotenv';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';
import { User } from '../entities/user.entity';
dotenv.config();

@injectable()
export class VerifyResetPassword {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  @catchError()
  public async verify(req: Request, res: Response, next: NextFunction) {
    const token: any = req.params.token;
    if (!token) {
      throw new AppException('Forbidden', StatusEnum.FORBIDDEN);
    }

    let [email, timer, signature] = token.split('.');

    const dateFromToken = new Date(+Base64URL.urlDecode(timer));
    if (dateFromToken.toString() == 'Invalid Date') {
      throw new AppException('Forbidden', StatusEnum.FORBIDDEN);
    }
    if (
      new Date().getTime() - dateFromToken.getTime() >
      +process.env.FORGOT_PASSWORD_LINK_EXPIRED
    ) {
      throw new AppException('Link Expired', StatusEnum.FORBIDDEN);
    }

    const correctSignature = Sha256.hash(
      `${email}.${timer}${Base64URL.urlEncode(process.env.FORGOT_PASSWORD_SECRET)}`,
    );
    if (signature !== correctSignature) {
      throw new AppException('Forbidden', StatusEnum.FORBIDDEN);
    }

    email = Base64URL.urlDecode(email);
    const user: User = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new AppException('Forbidden', StatusEnum.FORBIDDEN);
    }
    next();
  }
}
