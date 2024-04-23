import { ExecutionContext } from '../decoratos/api/param.custom.decorator';

export declare type ParamDecoratorCallBack = (
  data: unknown,
  ctx: ExecutionContext,
) => any | Promise<any>;
