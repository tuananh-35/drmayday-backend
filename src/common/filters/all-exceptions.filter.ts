import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    if (exception instanceof HttpException) {
      const body: any = exception.getResponse();
      const status = exception.getStatus();
      if (body && typeof body === 'object' && 'code' in body) return res.status(status).json(body);
      return res.status(status).json({ code: status, message: body?.message ?? exception.message, data: null });
    }
    const code = (exception as any)?.code; // lỗi Prisma
    if (code === 'P2002') return res.status(409).json({ code: 2003, message: 'Duplicate value', data: null });
    if (code === 'P2003') return res.status(400).json({ code: 2003, message: 'Invalid parameter value', data: null });
    if (code === 'P2025') return res.status(404).json({ code: 2003, message: 'Record not found', data: null });

    this.logger.error(exception);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ code: 5000, message: 'Internal server error', data: null });
  }
}
