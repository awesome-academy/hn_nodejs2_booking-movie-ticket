import 'reflect-metadata';
import { UserUpdateRequestDto } from '../src/dtos/req/user/user.update.req.dto';
import { User } from '../src/entities/user.entity';
import { UserRepository } from '../src/repositories/user.repository';
import { UserService } from '../src/services/user.service';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import { container } from 'tsyringe';
import { AppDataSource } from '../src/config/database';
import { ChangePasswordDto } from '../src/dtos/req/user/change.password.dto';
import { Bcrypt } from '../src/security/bcrypt';

describe('UserService', () => {
  let userRepository: UserRepository = null;
  let userService: UserService = null;

  beforeAll(async () => {
    await AppDataSource.initialize();
    userRepository = container.resolve(UserRepository);
    userService = container.resolve(UserService);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('Return user updated info when input include UserUpdateRequestDto and File is not null', async () => {
    const username = faker.person.fullName();
    const address = `${faker.location.city()} ${faker.location.country()}`;
    const phone = `0${faker.string.numeric({ length: { min: 9, max: 9 } })}`;

    const userUpdateRequestDto: UserUpdateRequestDto =
      new UserUpdateRequestDto();
    userUpdateRequestDto.username = username;
    userUpdateRequestDto.address = address;
    userUpdateRequestDto.phone = phone;

    userUpdateRequestDto['id'] = 1;
    userUpdateRequestDto['email'] = 'nam@gmail.com';
    userUpdateRequestDto['avatar'] =
      '/img/user/3f790696-ab4d-4491-9ba8-6f0ffc6914ec.jpg';

    const filePath =
      '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
    const buffer = fs.readFileSync(filePath);
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: path.basename(filePath),
      encoding: '7bit',
      mimetype: 'image/jpeg', // or the appropriate mime type
      size: buffer.length,
      buffer,
      destination: '',
      filename: '',
      path: '',
      stream: fs.createReadStream(filePath),
    };

    await userService.save(userUpdateRequestDto, file);
    const user: User = await userRepository.findOneBy({ id: 1 });
    expect(
      JSON.stringify({
        username: user.username,
        address: user.address,
        phone: user.phone,
      }),
    ).toEqual(
      JSON.stringify({
        username,
        address,
        phone,
      }),
    );
  });

  it('Return user updated info when input include UserUpdateRequestDto and File null', async () => {
    const username = faker.person.fullName();
    const address = `${faker.location.city()} ${faker.location.country()}`;
    const phone = `0${faker.string.numeric({ length: { min: 9, max: 9 } })}`;

    const userUpdateRequestDto: UserUpdateRequestDto =
      new UserUpdateRequestDto();
    userUpdateRequestDto.username = username;
    userUpdateRequestDto.address = address;
    userUpdateRequestDto.phone = phone;

    userUpdateRequestDto['id'] = 1;
    userUpdateRequestDto['email'] = 'nam@gmail.com';
    userUpdateRequestDto['avatar'] =
      '/img/user/3f790696-ab4d-4491-9ba8-6f0ffc6914ec.jpg';

    await userService.save(userUpdateRequestDto, null);
    const user: User = await userRepository.findOneBy({ id: 1 });
    expect(
      JSON.stringify({
        username: user.username,
        address: user.address,
        phone: user.phone,
      }),
    ).toEqual(
      JSON.stringify({
        username,
        address,
        phone,
      }),
    );
  });

  it('Return user updated password when input include ChangePasswordDto', async () => {
    const username = faker.person.fullName();
    const address = `${faker.location.city()} ${faker.location.country()}`;
    const phone = `0${faker.string.numeric({ length: { min: 9, max: 9 } })}`;

    const changePasswordDto: ChangePasswordDto = new ChangePasswordDto();

    changePasswordDto['id'] = 1;
    changePasswordDto.newPassword = 'Test1234@';
    changePasswordDto.oldPassword = '12345678';
    changePasswordDto.confirmPassword = 'Test1234@';

    await userService.save(changePasswordDto, null);
    const user: User = await userRepository.findOneBy({ id: 1 });
    expect(
      Bcrypt.compare(changePasswordDto.newPassword, user.password),
    ).toEqual(true);
  });

  it('Return user entity instance when input include userId', async () => {
    const user = await userService.getUserById(1);
    const userExcepted = await userRepository.findOneBy({ id: 1 });
    expect(JSON.stringify(user)).toEqual(JSON.stringify(userExcepted));
  });
});
