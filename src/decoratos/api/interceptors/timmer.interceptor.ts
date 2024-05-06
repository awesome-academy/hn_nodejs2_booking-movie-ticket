import * as dotenv from 'dotenv';
dotenv.config();

import { injectable } from 'tsyringe';
import { Interceptor } from '../interceptor.decorator';
import { ExecutionContext } from '../param.custom.decorator';
import { StatusEnum } from '../../../enum/status.enum';
import { HttpMethod } from '../../../enum/http.method.enum';

@injectable()
export class TimmerInterceptor implements Interceptor {
  before(data: unknown, ctx: ExecutionContext) {
    ctx.next();
  }

  after(data: any, ctx: ExecutionContext) {
    const { req, res } = ctx;
    const scheduleId = +req.params.id;

    if (!req.session['user'].timmer) {
      req.session['user'].timmer = {};
    }

    const totalTime = +process.env.BOOKING_TIMMER;
    let remainTime = totalTime;

    if (!req.session['user'].timmer[scheduleId]) {
      req.session['user'].timmer[scheduleId] = new Date().getTime();
    } else {
      remainTime =
        totalTime -
        (((new Date().getTime() - req.session['user'].timmer[scheduleId]) /
          1000) |
          0);

      remainTime = remainTime >= 0 ? remainTime : totalTime;

      req.session['user'].timmer[scheduleId] =
        remainTime == totalTime
          ? new Date().getTime()
          : req.session['user'].timmer[scheduleId];
    }
    const method = req.method;
    res.header('remainTime', `${remainTime}`);
    res
      .status(method == HttpMethod.POST ? StatusEnum.CREATED : StatusEnum.OK)
      .json(data);
  }
}
