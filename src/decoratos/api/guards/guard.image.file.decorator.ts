import { Request, Response, NextFunction } from 'express';
import { checkImageType } from '../../../security/image.check';
import { StatusEnum } from '../../../enum/status.enum';
import { ErrorApiResponseDto } from '../../../dtos/res/error.api.res.dto';

export function ImageFileGuard() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.mapping[propertyName]?.handlers?.length) {
      return;
    }

    const isImageFile = async function (
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        if (!req.file || (await checkImageType(req.file.buffer))) {
          next();
          return;
        }
        throw {
          status: StatusEnum.BAD_REQUEST,
          message: 'Error Validate',
          errors: { isImageFile: 'Only accept image file!' },
        } as ErrorApiResponseDto;
      } catch (error) {
        next(error);
      }
    };
    target.constructor.prototype.mapping[propertyName].handlers.push(
      isImageFile,
    );
  };
}
