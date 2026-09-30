import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('Fornecedores') @ApiBearerAuth() @Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}
  private context(user:AuthenticatedUser,request:Request&{requestId?:string}){return{...user,requestId:request.requestId};}
  @Get() list(@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.list(this.context(user,request));}
  @Post() create(@Body() input:CreateSupplierDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.create(this.context(user,request),input);}
  @Patch(':id') @ApiOperation({summary:'Edita fornecedor com controle de versão'})
  update(@Param('id',ParseUUIDPipe) id:string,@Body() input:UpdateSupplierDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.update(this.context(user,request),id,input);}
  @Delete(':id') @ApiOperation({summary:'Desativa fornecedor'})
  remove(@Param('id',ParseUUIDPipe) id:string,@Query('version',ParseIntPipe) version:number,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.deactivate(this.context(user,request),id,version);}
}
