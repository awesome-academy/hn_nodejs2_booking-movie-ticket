import 'reflect-metadata';
import express from 'express';
import { container, injectable, singleton } from 'tsyringe';
import { HttpMethod } from '../enum/http.method.enum';
import { Request, Response, NextFunction } from 'express';
import { StatusEnum } from '../enum/status.enum';
import { ClassConstructor } from '../declare/class.constructor';

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  switch (err.status) {
    case StatusEnum.NOT_FOUND:
      res.status(StatusEnum.NOT_FOUND).json({
        status: StatusEnum.NOT_FOUND,
        message: err.message,
      });
      break;
    case StatusEnum.BAD_REQUEST:
      res.status(StatusEnum.BAD_REQUEST).json({
        status: StatusEnum.BAD_REQUEST,
        message: err.message,
      });
      break;
    case StatusEnum.FORBIDDEN:
      res.status(StatusEnum.FORBIDDEN).json({
        status: StatusEnum.FORBIDDEN,
        message: err.message,
      });
      break;
    case StatusEnum.INTERNAL_ERROR:
      res.status(StatusEnum.INTERNAL_ERROR).json({
        status: StatusEnum.INTERNAL_ERROR,
        message: err.message,
      });
      break;
    default:
      break;
  }
}

export function RestConfig<T extends ClassConstructor>(
  controllers: ClassConstructor[],
) {
  return function decorator(constructor: T) {
    singleton()(constructor);
    const rootRoute: any = container.resolve(constructor);
    controllers.forEach((controller) => {
      rootRoute
        .getRouter()
        .use(
          controller.prototype.path,
          controller.prototype.route,
          errorHandler,
        );
    });
  };
}

export function RestController<T extends ClassConstructor>(path: string) {
  return function decorator(constructor: T) {
    injectable()(constructor);
    constructor.prototype.route = express.Router();
    constructor.prototype.path = path;
    const controller = container.resolve(constructor);
    Object.keys(constructor.prototype.mapping).forEach((keyPath) => {
      let [method, handlers] = constructor.prototype.mapping[keyPath];
      const newHandler = async function (
        req: Request,
        res: Response,
        next: NextFunction,
      ) {
        try {
          const obj = await handlers[0].call(controller, req, res, next);
          const status =
            req.method == HttpMethod.POST ? StatusEnum.CREATED : StatusEnum.OK;
          res.status(status).json(obj);
        } catch (error) {
          next(error);
        }
      };
      const [oldHandler, ...restHandlers] = handlers;
      constructor.prototype.route[`${method.toLowerCase()}`](keyPath, [
        restHandlers?.reverse(),
        newHandler,
      ]);
    });
  };
}

export function RequestMapping(path: string, method?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    method = method ? method.toUpperCase() : HttpMethod.GET;
    const handlers = [];
    const handler = descriptor.value;

    if (!target.constructor.prototype.mapping) {
      target.constructor.prototype.mapping = {};
    }

    handlers.push(handler);
    target.constructor.prototype.mapping[path] = [method, handlers];
  };
}

export function GetMapping(path: string) {
  return RequestMapping(path, 'GET');
}

export function PostMapping(path: string) {
  return RequestMapping(path, 'POST');
}

export function PutMapping(path: string) {
  return RequestMapping(path, 'PUT');
}

export function PatchMapping(path: string) {
  return RequestMapping(path, 'PATCH');
}

export function DeleteMapping(path: string) {
  return RequestMapping(path, 'DELETE');
}
