import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { CSRF_COOKIE } from './auth.types';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly config:ConfigService){}
  canActivate(context:ExecutionContext){const request=context.switchToHttp().getRequest<{method:string;originalUrl:string;headers:Record<string,string|undefined>;cookies?:Record<string,string>}>();if(['GET','HEAD','OPTIONS'].includes(request.method)||request.originalUrl.endsWith('/auth/login')||request.originalUrl.endsWith('/auth/dev-token'))return true;const origin=request.headers.origin;if(origin&&!this.config.getOrThrow<string[]>('cors.origins').includes(origin))throw new ForbiddenException('Origem não permitida');const cookie=request.cookies?.[CSRF_COOKIE]??'',header=request.headers['x-csrf-token']??'';const a=Buffer.from(cookie),b=Buffer.from(header);if(!a.length||a.length!==b.length||!timingSafeEqual(a,b))throw new ForbiddenException('Token CSRF inválido');return true;}
}
