import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  /**
   * Normaliza falhas no formato RFC 9457 sem devolver stack trace ou detalhes
   * internos do banco. O requestId permite localizar o evento nos logs seguros.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request & { requestId?: string }>();
    const response = context.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const detail = typeof body === 'string' ? body : (body as { message?: string | string[] } | undefined)?.message;
    response.status(status).type('application/problem+json').json({
      type: `https://bomzeika.local/problems/http-${status}`,
      title: status >= 500 ? 'Erro interno' : HttpStatus[status] ?? 'Erro',
      status,
      detail: Array.isArray(detail) ? detail.join('; ') : detail,
      instance: request.originalUrl,
      requestId: request.requestId,
    });
  }
}
