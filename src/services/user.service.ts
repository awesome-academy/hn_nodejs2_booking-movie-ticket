import * as dotenv from 'dotenv';
dotenv.config();

import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { UserUpdateRequestDto } from '../dtos/req/user/user.update.req.dto';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Transactional } from 'typeorm-transactional';
import { ChangePasswordDto } from '../dtos/req/user/change.password.dto';
import { Bcrypt } from '../security/bcrypt';
import { User } from '../entities/user.entity';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async getUserById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  @Transactional()
  public async save(
    dto: UserUpdateRequestDto | ChangePasswordDto,
    file: Express.Multer.File = null,
  ) {
    if (dto instanceof UserUpdateRequestDto && file) {
      const originalname = file.originalname;
      const newFilename = `${uuidv4()}.${originalname.substring(originalname.lastIndexOf('.') + 1)}`;

      const user = this.userRepository.create({
        ...dto,
        avatar: path.join('/', process.env.USER_IMAGE_PUBLIC_PATH, newFilename),
      });
      await Promise.all([
        this.userRepository.save(user),
        fs.writeFile(
          path.join(
            __dirname,
            '..',
            process.env.USER_IMAGE_REAL_PATH,
            newFilename,
          ),
          file.buffer,
          (err) => {},
        ),
        fs.unlink(
          path.join(
            __dirname,
            '..',
            process.env.USER_IMAGE_REAL_PATH,
            dto['avatar'].replace('/img/user/', ''),
          ),
          (err) => {},
        ),
      ]);
      return user;
    }

    if (dto instanceof UserUpdateRequestDto && !file) {
      const user = this.userRepository.create({
        ...dto,
      });
      await this.userRepository.save(user);
      return user;
    }

    const user = this.userRepository.create({
      id: dto['id'],
      password: Bcrypt.hash(dto['newPassword']),
    });
    await this.userRepository.save(user);
    return user;
  }
}
