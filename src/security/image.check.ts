import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';
import { ImageBytesHeader } from '../constant/image.header';

export async function checkImageType(buffer: Buffer): Promise<boolean> {
  try {
    const firstFourBytes = buffer.toString('hex', 0, 4);
    if (Object.values(ImageBytesHeader).includes(firstFourBytes)) {
      return true;
    }
    return false;
  } catch (err) {
    throw new AppException(err.message, StatusEnum.INTERNAL_ERROR);
  }
}
