import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/auth/public.decorator';
import { DatabaseService } from '../database/database.service';

@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Verifica se o processo da API está ativo' })
  live() { return { status: 'ok', service: 'bomzeika-obras-api', timestamp: new Date().toISOString() }; }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Verifica se a API consegue acessar o PostgreSQL' })
  async ready() {
    try { await this.database.ping(); return { status: 'ready', database: 'ok' }; }
    catch { throw new ServiceUnavailableException('PostgreSQL indisponível'); }
  }
}
