import { Buffer } from 'buffer';

export class Base64URL {
  public static urlEncode(data: string): string {
    return Buffer.from(data, 'utf-8').toString('base64url');
  }

  public static urlDecode(encodeString: string): string {
    return Buffer.from(encodeString, 'base64url').toString('utf-8');
  }
}
