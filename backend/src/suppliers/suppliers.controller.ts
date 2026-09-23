import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SuppliersService } from './suppliers.service';
@ApiTags('Fornecedores') @ApiBearerAuth() @Controller('suppliers')
export class SuppliersController{constructor(private readonly service:SuppliersService){} private ctx(u:AuthenticatedUser,r:Request&{requestId?:string}){return{...u,requestId:r.requestId}} @Get() @ApiOperation({summary:'Lista fornecedores da organização'}) list(@CurrentUser()u:AuthenticatedUser,@Req()r:Request&{requestId?:string}){return this.service.list(this.ctx(u,r))} @Post() @ApiOperation({summary:'Cadastra fornecedor'}) create(@Body()d:CreateSupplierDto,@CurrentUser()u:AuthenticatedUser,@Req()r:Request&{requestId?:string}){return this.service.create(this.ctx(u,r),d)}}
