import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * Preserva IDs externos apenas quando usam um formato seguro e limitado.
   * Caso contrário, gera UUID local. O valor acompanha resposta, log e auditoria.
   */
  use(request: Request & { requestId?: string }, response: Response, next: NextFunction): void {
    const incoming = request.header('x-request-id');
    request.requestId = incoming && /^[a-zA-Z0-9._-]{8,128}$/.test(incoming) ? incoming : randomUUID();
    response.setHeader('x-request-id', request.requestId);
    next();
  }
}
