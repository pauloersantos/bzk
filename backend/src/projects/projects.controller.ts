import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Obras')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
  private context(user: AuthenticatedUser, request: Request & { requestId?: string }) { return { ...user, requestId: request.requestId }; }

  @Get() @ApiOperation({ summary: 'Lista obras autorizadas da organização' }) @ApiOkResponse()
  list(@CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.list(this.context(user, request)); }

  @Get(':projectId') @ApiOperation({ summary: 'Consulta uma obra' }) @ApiOkResponse()
  get(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.get(this.context(user, request), projectId); }

  @Post() @ApiOperation({ summary: 'Cadastra uma obra' }) @ApiCreatedResponse()
  create(@Body() input: CreateProjectDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.create(this.context(user, request), input); }
}
