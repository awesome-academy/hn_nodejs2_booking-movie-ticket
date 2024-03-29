import { genSaltSync, hashSync, compareSync } from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

export class Bcrypt {
  private static salt: string = genSaltSync(
    +process.env.USER_PASSWORD_SALT_ROUND,
  );

  public static hash(password: string): string {
    return hashSync(password, this.salt);
  }

  public static compare(plainPassword: string, hashPassword: string): boolean {
    return compareSync(plainPassword, hashPassword);
  }
}
