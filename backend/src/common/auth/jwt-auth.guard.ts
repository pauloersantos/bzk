import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthenticatedUser } from './auth.types';

interface TokenPayload { sub: string; organizationId: string; roles?: string[] }

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
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: AuthenticatedUser }>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Token Bearer obrigatório');
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token, {
        secret: this.config.getOrThrow<string>('jwt.secret'),
        issuer: this.config.getOrThrow<string>('jwt.issuer'),
        audience: this.config.getOrThrow<string>('jwt.audience'),
      });
      if (!payload.sub || !payload.organizationId) throw new Error('claims ausentes');
      request.user = { userId: payload.sub, organizationId: payload.organizationId, roles: payload.roles ?? [] };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
