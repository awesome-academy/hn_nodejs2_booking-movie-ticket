import { inject } from 'tsyringe';
import {
  Body,
  CSRFToken,
  File,
  GetMapping,
  PutMapping,
  RestController,
  Session,
} from '../decoratos/api/rest.api.decorator';
import { UserService } from '../services/user.service';
import {
  SessionAuthen,
  UserFromSession,
} from '../decoratos/api/guards/guard.auth.decorator';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../enum/status.enum';
import { User } from '../entities/user.entity';
import { MultiPart } from '../decoratos/api/multipart.decorator';
import { CSRFProtection } from '../decoratos/api/guards/guard.csrf.decorator';
import { UserUpdateRequestDto } from '../dtos/req/user/user.update.req.dto';
import { PipeDto } from '../decoratos/api/pipe.decorator';
import session from 'express-session';
import { ChangePasswordDto } from '../dtos/req/user/change.password.dto';
import { Bcrypt } from '../security/bcrypt';
import { ErrorApiResponseDto } from '../dtos/res/error.api.res.dto';
import { ImageFileGuard } from '../decoratos/api/guards/guard.image.file.decorator';

@RestController('/api/user')
export class UserRestController {
  constructor(
    @inject(UserService)
    private readonly userService: UserService,
  ) {}

  @SessionAuthen()
  @CSRFProtection()
  @GetMapping('/')
  public async getInfoUser(
    @UserFromSession() user: User,
    @CSRFToken() csrfToken: string,
  ) {
    user = await this.userService.getUserById(user.id);
    return {
      message: 'OK',
      status: StatusEnum.OK,
      data: {
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        csrfToken: csrfToken,
      },
    } as AppBaseResponseDto;
  }

  @SessionAuthen()
  @MultiPart({
    fieldname: 'avatar',
    single: true,
  })
  @CSRFProtection()
  @ImageFileGuard()
  @PutMapping('/')
  public async updateInfoUser(
    @Session()
    session: session.Session & Partial<session.SessionData>,

    @UserFromSession()
    user: User,

    @Body(null, PipeDto(UserUpdateRequestDto))
    userUpdateRequestDto: UserUpdateRequestDto,

    @File() file: Express.Multer.File,
  ) {
    userUpdateRequestDto['id'] = user.id;
    userUpdateRequestDto['email'] = user.email;
    userUpdateRequestDto['avatar'] = user.avatar;

    const userTemp: any = await this.userService.save(
      userUpdateRequestDto,
      file,
    );
    user = {
      ...user,
      username: userTemp.username ?? user.username,
      phone: userTemp.phone ?? user.phone,
      address: userTemp.address ?? user.address,
      avatar: userTemp.avatar ?? user.avatar,
    };
    session['user'] = user;

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: {
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
      },
    } as AppBaseResponseDto;
  }

  @SessionAuthen()
  @CSRFProtection()
  @PutMapping('/change-password')
  public async changePassword(
    @Session()
    session: session.Session & Partial<session.SessionData>,

    @UserFromSession()
    user: User,

    @Body(null, PipeDto(ChangePasswordDto))
    changePasswordDto: ChangePasswordDto,
  ) {
    if (!Bcrypt.compare(changePasswordDto.oldPassword, user.password)) {
      throw {
        status: StatusEnum.BAD_REQUEST,
        message: 'Error validate',
        errors: {
          oldPassword: 'Old password not match',
        },
      } as ErrorApiResponseDto;
    }

    changePasswordDto['id'] = user.id;
    const userTemp: any = this.userService.save(changePasswordDto);

    user = {
      ...user,
      password: userTemp.password,
    };

    session['user'] = user;

    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: null,
    } as AppBaseResponseDto;
  }
}
