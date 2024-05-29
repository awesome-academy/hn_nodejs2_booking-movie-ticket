import * as dotenv from 'dotenv';
dotenv.config();

import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { UsersRegisterDto } from '../dtos/authen/register.dto';
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
import { sendMail } from '../utils/sendmail';
import { Transactional } from 'typeorm-transactional';
import { ForgotPasswordDto } from '../dtos/authen/forgot.password';
import { Base64URL } from '../security/base64url';
import { Sha256 } from '../security/sha256';
import { ResetPasswordDto } from '../dtos/authen/reset.password.dto';
import { UserRole } from '../enum/user.enum';

@injectable()
export class AuthenController {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  @catchError()
  public async getLoginForm(req: Request, res: Response, next: NextFunction) {
    res.render('authen/login', {
      user: null,
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  public async postLoginForm(req: Request, res: Response, next: NextFunction) {
    const user: User = await this.userRepository.findOneBy({
      email: req.body.email,
    });
    if (!user) {
      res.render('authen/login', {
        errors: [new Error(req.t('validationError.invalidEmailOrPassword'))],
        csrfToken: req.csrfToken(),
        user: { ...req.body },
      });
      return;
    }

    if (!Bcrypt.compare(req.body.password, user.password)) {
      res.render('authen/login', {
        errors: [new Error(req.t('validationError.passwordInCorrect'))],
        csrfToken: req.csrfToken(),
        user: { ...req.body },
      });
      return;
    }
    req.session['user'] = user;

    if (user.role == UserRole.ADMIN) {
      res.redirect('/admin');
      return;
    }

    res.redirect(
      req.session['originalUrl']
        ? req.session['originalUrl']
        : req.cookies.currentPath
          ? req.cookies.currentPath
          : '/',
    );
    delete req.session['originalUrl'];
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
  @Transactional()
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

    if (
      await this.userRepository.findOneBy({
        email: req.body.email,
      })
    ) {
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
        this.userRepository.save(user),
        sendMail({
          email: user.email,
          subject: 'Thank for register account in MAMCINEMA',
          templatePath: path.join(
            __dirname,
            '..',
            'views/mail/mail.thankfor.register.ejs',
          ),
          context: {
            email: user.email,
            username: user.username,
            password: usersRegisterDto.password,
            phone: user.phone || 'None',
            address: user.address || 'None',
          },
        }),
      ]);
    } else {
      await this.userRepository.save(user);
    }

    req.session['user'] = user;
    res.redirect('/');
  }

  @catchError()
  public async getForgotPasswordForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('authen/forgot-password', {
      email: null,
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  public async postForgotPasswordForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const forgotPasswordDto = plainToClass(ForgotPasswordDto, req.body);
    const validationErrors = convertToArrayError(
      await validate(forgotPasswordDto),
    );

    const userExists = await this.userRepository.exists({
      where: { email: forgotPasswordDto.email },
    });

    if (!userExists) {
      validationErrors.push(new Error(req.t('validationError.emailNotExists')));
    }

    if (validationErrors.length) {
      res.render('authen/forgot-password', {
        email: forgotPasswordDto.email,
        errors: validationErrors,
        csrfToken: req.csrfToken(),
      });
      return;
    }

    const timer = new Date().getTime().toString();
    const header = `${Base64URL.urlEncode(forgotPasswordDto.email)}.${Base64URL.urlEncode(timer)}`;
    const signature = Sha256.hash(
      `${header}${Base64URL.urlEncode(process.env.FORGOT_PASSWORD_SECRET)}`,
    );
    const token = `${header}.${signature}`;
    const url = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/authen/reset-password/${token}`;
    await sendMail({
      email: forgotPasswordDto.email,
      subject: 'Reset your password',
      context: { email: forgotPasswordDto.email, url },
      templatePath: path.join(
        __dirname,
        '..',
        'views/mail/mail.reset.password.ejs',
      ),
    });

    req.app.locals.resetPasswordToken[forgotPasswordDto.email] = token;

    res.render('authen/forgot-password', {
      email: forgotPasswordDto.email,
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  public async getResetPasswordForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('authen/reset-password', {
      dto: null,
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  @Transactional()
  public async putResetPasswordForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const resetPasswordDto = plainToClass(ResetPasswordDto, req.body);
    const validationErrors = convertToArrayError(
      await validate(resetPasswordDto),
    ).map((item) => {
      const key = 'validationError.confirmPasswordNoMatch';
      return { message: req.t(key) };
    });

    if (validationErrors.length) {
      res.render('authen/reset-password', {
        dto: resetPasswordDto,
        errors: validationErrors,
        csrfToken: req.csrfToken(),
      });
      return;
    }

    const token: any = req.params.token;
    let [email, ...rest] = token.split('.');
    email = Base64URL.urlDecode(email);

    await this.userRepository.update(
      { email: email },
      {
        password: Bcrypt.hash(resetPasswordDto.password),
      },
    );

    delete req.app.locals.resetPasswordToken[email];

    res.render('authen/reset-password', {
      dto: resetPasswordDto,
      errors: null,
      csrfToken: req.csrfToken(),
    });
  }

  @catchError()
  public async logout(req: Request, res: Response, next: NextFunction) {
    delete req.session['user'];
    res.redirect(
      req['logoutRedirectHome']
        ? '/'
        : req.cookies.currentPath
          ? req.cookies.currentPath
          : '/',
    );
  }
}
