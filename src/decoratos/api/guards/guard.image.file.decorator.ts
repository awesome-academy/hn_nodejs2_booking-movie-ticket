import * as dotenv from 'dotenv';
dotenv.config();

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
        if (req.file.size > +process.env.IMAGE_FILE_SIZE) {
          throw {
            status: StatusEnum.BAD_REQUEST,
            message: 'Error Validate',
            errors: { isImageFileSize: 'File size less than or equal 5MB' },
          } as ErrorApiResponseDto;
        }

        if (!req.file || (await checkImageType(req.file.buffer))) {
          next();
          return;
        }

        throw {
          status: StatusEnum.BAD_REQUEST,
          message: 'Error Validate',
          errors: { isImageFileType: 'Only accept image file!' },
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
