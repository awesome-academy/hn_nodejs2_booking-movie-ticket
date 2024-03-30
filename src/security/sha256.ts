import crypto from 'crypto';

export class Sha256 {
  public static hash(input: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }
}
