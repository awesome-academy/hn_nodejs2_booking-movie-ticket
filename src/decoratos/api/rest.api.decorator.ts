import 'reflect-metadata';
import express from 'express';
import { container, injectable, singleton } from 'tsyringe';
import { HttpMethod } from '../../enum/http.method.enum';
import { Request, Response, NextFunction } from 'express';
import { StatusEnum } from '../../enum/status.enum';
import { ClassConstructor } from '../../declare/class.constructor';
import { Logger } from '../../config/logger';
import {
  createParamDecorator,
  ExecutionContext,
} from './param.custom.decorator';
import { Interceptor } from './interceptor.decorator';

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  switch (err.status) {
    case StatusEnum.NOT_FOUND:
      res.status(StatusEnum.NOT_FOUND).json(err);
      break;
    case StatusEnum.BAD_REQUEST:
      res.status(StatusEnum.BAD_REQUEST).json(err);
      break;
    case StatusEnum.FORBIDDEN:
      res.status(StatusEnum.FORBIDDEN).json(err);
      break;
    case StatusEnum.INTERNAL_ERROR:
      res.status(StatusEnum.INTERNAL_ERROR).json(err);
      break;
    default:
      Logger.error(err.stack);
      res.status(StatusEnum.INTERNAL_ERROR).json({
        status: StatusEnum.INTERNAL_ERROR,
        message: 'Internal Server Error',
      });
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

async function getMethodParams(
  controllerMethodParams: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!controllerMethodParams) return;
  const promises = Object.keys(controllerMethodParams)
    .sort((n1, n2) => +n1 - +n2)
    .map((key) => {
      const { callback, callbackArgs } = controllerMethodParams[key];
      callbackArgs.excutionContext = { req, res, next } as ExecutionContext;
      return callback(callbackArgs.data, callbackArgs.excutionContext);
    });

  const result = await Promise.all(promises);
  return result;
}

export function RestController<T extends ClassConstructor>(path: string) {
  return function decorator(constructor: T) {
    injectable()(constructor);

    constructor.prototype.route = express.Router();
    constructor.prototype.path = path;
    const controller = container.resolve(constructor);

    Object.keys(constructor.prototype.mapping).forEach((methodName: string) => {
      const {
        path: _path,
        method,
        handlers,
      } = constructor.prototype.mapping[methodName];
      const newHandler = async function (
        req: Request,
        res: Response,
        next: NextFunction,
      ) {
        try {
          const methodParams = await getMethodParams(
            constructor.prototype.controllerMethodParams?.[methodName],
            req,
            res,
            next,
          );
          const obj = await handlers[0].apply(controller, methodParams);
          const status =
            req.method == HttpMethod.POST ? StatusEnum.CREATED : StatusEnum.OK;
          if (constructor.prototype?.interceptors?.[methodName]) {
            res['tempObj'] = obj;
            next();
            return;
          }
          res.status(status).json(obj);
        } catch (error) {
          next(error);
        }
      };

      const befores = [];
      const afters = [];
      if (
        constructor.prototype.interceptors &&
        constructor.prototype.interceptors[methodName]
      ) {
        befores.push(
          ...constructor.prototype.interceptors[methodName].map(
            (interceptor: Interceptor) => {
              return function (
                req: Request,
                res: Response,
                next: NextFunction,
              ) {
                try {
                  const ctx: ExecutionContext = { req, res, next };
                  interceptor.before(null, ctx);
                } catch (error) {
                  next(error);
                }
              };
            },
          ),
        );

        afters.push(
          ...constructor.prototype.interceptors[methodName].map(
            (interceptor: Interceptor) => {
              return function (
                req: Request,
                res: Response,
                next: NextFunction,
              ) {
                try {
                  const ctx: ExecutionContext = { req, res, next };
                  interceptor.after(res['tempObj'], ctx);
                } catch (error) {
                  next(error);
                }
              };
            },
          ),
        );
      }

      const [oldHandler, ...restHandlers] = handlers;
      constructor.prototype.route[`${method.toLowerCase()}`](_path, [
        ...restHandlers?.reverse(),
        ...befores,
        newHandler,
        ...afters,
      ]);
    });
  };
}

export function RequestMapping(
  path: string,
  method: HttpMethod = HttpMethod.GET,
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const handler = descriptor.value;

    if (!target.constructor.prototype.mapping) {
      target.constructor.prototype.mapping = {};
    }

    target.constructor.prototype.mapping[propertyName] = {
      path,
      method,
      handlers: [],
    };

    target.constructor.prototype.mapping[propertyName].handlers.push(handler);
  };
}

export function GetMapping(path: string) {
  return RequestMapping(path, HttpMethod.GET);
}

export function PostMapping(path: string) {
  return RequestMapping(path, HttpMethod.POST);
}

export function PutMapping(path: string) {
  return RequestMapping(path, HttpMethod.PUT);
}

export function PatchMapping(path: string) {
  return RequestMapping(path, HttpMethod.PATCH);
}

export function DeleteMapping(path: string) {
  return RequestMapping(path, HttpMethod.DELETE);
}

async function applyFunction(args: any[], obj: any, name?: string) {
  if (!args) return obj;

  const [key, ...fns] = args;
  if (typeof key == 'string') {
    obj = obj[key];
    for (let fn of fns) {
      obj = await fn(obj, name);
    }
    return obj;
  }
  for (let fn of fns) {
    obj = await fn(obj, name);
  }

  return obj;
}

export const Req = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req;
  },
);

export const Res = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.res;
  },
);

export const Next = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.next;
  },
);

export const Session = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req.session;
  },
);

export function Param(key: string = null, ...fns: Function[]) {
  const params = createParamDecorator(
    async (data: any, ctx: ExecutionContext) => {
      const params = ctx.req.params;
      return applyFunction(data, params, key);
    },
  );
  return params(key, ...fns);
}

export function Body(key: string = null, ...fns: Function[]) {
  const body = createParamDecorator(
    async (data: any, ctx: ExecutionContext) => {
      const body = ctx.req.body;
      return applyFunction(data, body, key);
    },
  );
  return body(key, ...fns);
}

export function Query(key: string = null, ...fns: Function[]) {
  const query = createParamDecorator(
    async (data: any, ctx: ExecutionContext) => {
      const query = ctx.req.query;
      return applyFunction(data, query, key);
    },
  );
  return query(key, ...fns);
}

export function Headers(key: string = null) {
  const headers = createParamDecorator(
    async (data: any, ctx: ExecutionContext) => {
      const headers = ctx.req.headers;
      return applyFunction(data, headers, key);
    },
  );
  return headers(key);
}

export const Ip = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req.ip;
  },
);

export const HostParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req.host;
  },
);

export const File = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req.file;
  },
);

export const Files = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req.files;
  },
);

export const CSRFToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.req.csrfToken();
  },
);
