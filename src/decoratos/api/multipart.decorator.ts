import multer from 'multer';

export interface FileOptions {
  single: boolean;
  fieldname: string;
  maxCount?: number;
}

export function MultiPart(fileOptions: FileOptions, options?: multer.Options) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.mapping[propertyName]?.handlers?.length) {
      return;
    }

    if (fileOptions.single) {
      target.constructor.prototype.mapping[propertyName].handlers.push(
        multer(options).single(fileOptions.fieldname),
      );
      return;
    }
    target.constructor.prototype.mapping[propertyName].handlers.push(
      multer(options).array(fileOptions.fieldname),
    );
  };
}
