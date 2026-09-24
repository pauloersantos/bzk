import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CatalogService } from './catalog.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@ApiTags('Catálogo') @ApiBearerAuth() @Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}
  private context(user: AuthenticatedUser, request: Request & { requestId?: string }) { return { ...user, requestId: request.requestId }; }

  @Get('stages') @ApiOperation({ summary: 'Lista etapas' })
  stages(@CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.listStages(this.context(user, request)); }
  @Post('stages') @ApiOperation({ summary: 'Cadastra etapa' })
  createStage(@Body() input: CreateStageDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.createStage(this.context(user, request), input); }
  @Patch('stages/:id') @ApiOperation({ summary: 'Edita etapa com controle de versão' })
  updateStage(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateStageDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.updateStage(this.context(user, request), id, input); }
  @Delete('stages/:id') @ApiOperation({ summary: 'Desativa etapa' })
  deleteStage(@Param('id', ParseUUIDPipe) id: string, @Query('version', ParseIntPipe) version: number, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.deactivateStage(this.context(user, request), id, version); }

  @Get('services') @ApiOperation({ summary: 'Lista serviços' })
  services(@CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.listServices(this.context(user, request)); }
  @Post('services') @ApiOperation({ summary: 'Cadastra serviço' })
  createService(@Body() input: CreateServiceDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.createService(this.context(user, request), input); }
  @Patch('services/:id') @ApiOperation({ summary: 'Edita serviço com controle de versão' })
  updateService(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateServiceDto, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.updateService(this.context(user, request), id, input); }
  @Delete('services/:id') @ApiOperation({ summary: 'Desativa serviço' })
  deleteService(@Param('id', ParseUUIDPipe) id: string, @Query('version', ParseIntPipe) version: number, @CurrentUser() user: AuthenticatedUser, @Req() request: Request & { requestId?: string }) { return this.service.deactivateService(this.context(user, request), id, version); }
}
