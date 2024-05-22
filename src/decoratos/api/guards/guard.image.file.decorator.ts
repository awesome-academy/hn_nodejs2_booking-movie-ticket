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
        if (req?.file?.size > +process.env.IMAGE_FILE_SIZE) {
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

export function ImageFilesGuard() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.mapping[propertyName]?.handlers?.length) {
      return;
    }

    const isImageFiles = async function (
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        if (!Array.isArray(req?.files)) {
          const files = Object.values(req?.files).map((item) => {
            return item?.length ? item[0] : null;
          });
          const fileNames = Object.keys(req?.files);
          for (let idx in files) {
            const file = files[idx];
            if (file && file.size > +process.env.IMAGE_FILE_SIZE) {
              throw {
                status: StatusEnum.BAD_REQUEST,
                message: 'Error Validate',
                errors: {
                  [fileNames[idx]]: 'File size less than or equal 5MB',
                },
              } as ErrorApiResponseDto;
            }
            if (file && !(await checkImageType(file.buffer))) {
              throw {
                status: StatusEnum.BAD_REQUEST,
                message: 'Error Validate',
                errors: {
                  [fileNames[idx]]: 'Only accept image file!',
                },
              } as ErrorApiResponseDto;
            }
          }
        }
        next();
      } catch (error) {
        next(error);
      }
    };
    target.constructor.prototype.mapping[propertyName].handlers.push(
      isImageFiles,
    );
  };
}
