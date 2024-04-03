import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { UsersRegisterDto } from '../dtos/authen/authen.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { User } from '../entities/user.entity';
import { convertToArrayError } from '../utils/utils';
import { catchError } from '../decoratos/catcherror.decorators';
import { Bcrypt } from '../security/bcrypt';
import { checkImageType } from '../security/image.check';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

@injectable()
export class AuthenController {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  private async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }

  @catchError()
  public async getLoginForm(req: Request, res: Response, next: NextFunction) {
    res.render('authen/login', {
      user: { ...req.body },
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  public async postLoginForm(req: Request, res: Response, next: NextFunction) {
    const user: User = await this.findUserByEmail(req.body.email);
    if (!user || !Bcrypt.compare(req.body.password, user.password)) {
      res.render('authen/login', {
        errors: [new Error(req.t('validationError.invalidEmailOrPassword'))],
        csrfToken: req.csrfToken(),
        user: { ...req.body },
      });
      return;
    }

    req.session['user'] = user;

    res.send(
      `<h1 style="color: red;">${JSON.stringify(req.session['user'])}</h1>`,
    );
  }

  @catchError()
  public async getRegisterForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('authen/register', {
      user: null,
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  public async postRegisterForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const usersRegisterDto: UsersRegisterDto = plainToClass(
      UsersRegisterDto,
      req.body,
    );

    const validationErrors = convertToArrayError(
      await validate(usersRegisterDto),
    );

    if (req.file && !(await checkImageType(req.file.buffer))) {
      validationErrors.push(new Error(req.t('validationError.imagetype')));
    }

    const user: User = this.userRepository.create({
      ...usersRegisterDto,
      password: Bcrypt.hash(usersRegisterDto.password),
      role: 'USER',
    });

    if (await this.findUserByEmail(user.email)) {
      validationErrors.push(new Error(req.t('validationError.uniqueEmail')));
    }

    if (validationErrors.length) {
      res.render('authen/register', {
        user: usersRegisterDto,
        errors: validationErrors,
        csrfToken: req.csrfToken(),
      });
      return;
    }

    if (req.file) {
      const originalname = req.file.originalname;
      const newFilename = `${uuidv4()}.${originalname.substring(originalname.lastIndexOf('.') + 1)}`;
      user.avatar = path.join(
        '/',
        process.env.USER_IMAGE_PUBLIC_PATH,
        newFilename,
      );
      await Promise.all([
        fs.writeFile(
          path.join(
            __dirname,
            '..',
            process.env.USER_IMAGE_REAL_PATH,
            newFilename,
          ),
          req.file.buffer,
          (err) => {},
        ),
        await this.userRepository.save(user),
      ]);
    } else {
      await this.userRepository.save(user);
    }

    res.send('<h1 style="color: red;">Register Success</h1>');
  }
}
