import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { AssignServiceDto } from './dto/assign-service.dto';
import { AssignStageDto } from './dto/assign-stage.dto';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { ProjectConfigService } from './project-config.service';

@ApiTags('Configuração da obra')
@ApiBearerAuth()
@Controller('projects/:projectId/config')
export class ProjectConfigController {
  constructor(private readonly configService: ProjectConfigService) {}

  private context(user: AuthenticatedUser, request: Request & { requestId?: string }) {
    return { ...user, requestId: request.requestId };
  }

  @Get()
  @ApiOperation({ summary: 'Consulta etapas, serviços e dependências da obra' })
  list(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) {
    return this.configService.list(this.context(user, request), projectId);
  }

  @Post('stages')
  @ApiOperation({ summary: 'Inclui etapa na obra' })
  addStage(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() input: AssignStageDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) {
    return this.configService.addStage(this.context(user, request), projectId, input);
  }

  @Post('services')
  @ApiOperation({ summary: 'Inclui serviço com fornecedor obrigatório' })
  addService(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() input: AssignServiceDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) {
    return this.configService.addService(this.context(user, request), projectId, input);
  }

  @Post('dependencies')
  @ApiOperation({ summary: 'Configura predecessor e sucessor' })
  addDependency(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() input: CreateDependencyDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) {
    return this.configService.addDependency(this.context(user, request), projectId, input);
  }
}
