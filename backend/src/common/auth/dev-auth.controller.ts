import { Controller, NotFoundException, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';

/** Emite credencial apenas para o ambiente local; a rota não existe em produção. */
@ApiTags('Desenvolvimento')
@Controller('auth')
export class DevAuthController {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  @Public()
  @Post('dev-token')
  @ApiOperation({ summary: 'Emite token para a interface local de desenvolvimento' })
  async issue() {
    if (this.config.get<string>('app.environment') === 'production') throw new NotFoundException();
    const userId = this.config.get<string>('development.userId');
    const organizationId = this.config.get<string>('development.organizationId');
    if (!userId || !organizationId) throw new NotFoundException('Identidade de desenvolvimento não configurada');
    const accessToken = await this.jwt.signAsync(
      { sub: userId, organizationId, roles: ['admin'] },
      {
        secret: this.config.getOrThrow<string>('jwt.secret'),
        issuer: this.config.getOrThrow<string>('jwt.issuer'),
        audience: this.config.getOrThrow<string>('jwt.audience'),
        expiresIn: this.config.getOrThrow<number>('jwt.ttlSeconds'),
      },
    );
    return { accessToken, tokenType: 'Bearer', expiresIn: this.config.getOrThrow<number>('jwt.ttlSeconds') };
  }
}
