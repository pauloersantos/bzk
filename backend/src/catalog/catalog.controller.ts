import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CatalogService } from './catalog.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { CreateServiceDto } from './dto/create-service.dto';

@ApiTags('Catálogo') @ApiBearerAuth() @Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}
  private ctx(user:AuthenticatedUser,req:Request&{requestId?:string}){return{...user,requestId:req.requestId}}
  @Get('stages') @ApiOperation({summary:'Lista etapas do catálogo global'}) stages(@CurrentUser()u:AuthenticatedUser,@Req()r:Request&{requestId?:string}){return this.service.listStages(this.ctx(u,r))}
  @Post('stages') @ApiOperation({summary:'Cadastra etapa global'}) createStage(@Body()d:CreateStageDto,@CurrentUser()u:AuthenticatedUser,@Req()r:Request&{requestId?:string}){return this.service.createStage(this.ctx(u,r),d)}
  @Get('services') @ApiOperation({summary:'Lista serviços do catálogo global'}) services(@CurrentUser()u:AuthenticatedUser,@Req()r:Request&{requestId?:string}){return this.service.listServices(this.ctx(u,r))}
  @Post('services') @ApiOperation({summary:'Cadastra serviço global'}) createService(@Body()d:CreateServiceDto,@CurrentUser()u:AuthenticatedUser,@Req()r:Request&{requestId?:string}){return this.service.createService(this.ctx(u,r),d)}
}
