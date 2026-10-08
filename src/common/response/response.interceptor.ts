import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Codes } from './codes';

// Bọc kết quả thành công thành { code, message, data }.
// Controller muốn trả 1001 thì dùng created(data).
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((payload) => {
        const res = ctx.switchToHttp().getResponse();
        if (payload && payload.__created) {
          res.status(Codes.CREATED.http);
          return { code: Codes.CREATED.code, message: Codes.CREATED.message, data: payload.data ?? null };
        }
        res.status(Codes.OK.http);
        return { code: Codes.OK.code, message: Codes.OK.message, data: payload ?? null };
      }),
    );
  }
}

export const created = <T>(data: T) => ({ __created: true, data });
