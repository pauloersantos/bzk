import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthenticatedUser } from './auth.types';
import { ACCESS_COOKIE, AccessPayload } from '../../auth/auth.types';
import { AuthService } from '../../auth/auth.service';


/**
 * Valida o access token antes de qualquer controller protegido.
 *
 * A verificação exige assinatura, emissor e audiência esperados. A organização
 * do token é apenas o contexto solicitado: o acesso efetivo continua sujeito às
 * políticas RLS e aos vínculos ativos registrados no banco.
 *
 * Este guard não implementa login nem emissão de credenciais de produção. O
 * fluxo completo está especificado em `backend/docs/autenticacao-segura.md`.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService, private readonly config: ConfigService,private readonly auth:AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>;cookies?:Record<string,string>; user?: AuthenticatedUser;authSessionId?:string }>();
    const [type, bearer] = request.headers.authorization?.split(' ') ?? [];
    const token=request.cookies?.[ACCESS_COOKIE]??(type==='Bearer'?bearer:undefined);
    if (!token) throw new UnauthorizedException('Sessão obrigatória');
    try {
      const payload = await this.jwt.verifyAsync<AccessPayload>(token, {
        secret: this.config.getOrThrow<string>('jwt.secret'),
        issuer: this.config.getOrThrow<string>('jwt.issuer'),
        audience: this.config.getOrThrow<string>('jwt.audience'),
      });
      if (!payload.sub || !payload.organizationId||!payload.sid) throw new Error('claims ausentes');
      const session=await this.auth.validateSession(payload);if(!session)throw new Error('sessão revogada');
      request.user = { userId: payload.sub, organizationId: payload.organizationId, roles: [session.roleCode] };
      request.authSessionId=payload.sid;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
