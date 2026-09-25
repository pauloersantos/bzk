import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Req, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Obras') @ApiBearerAuth() @Controller('projects')
export class ProjectsController {
  constructor(private readonly service:ProjectsService){}
  private context(user:AuthenticatedUser,request:Request&{requestId?:string}){return{...user,requestId:request.requestId};}
  @Get() list(@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.list(this.context(user,request));}
  @Get(':projectId') get(@Param('projectId',ParseUUIDPipe) id:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.get(this.context(user,request),id);}
  @Post() create(@Body() input:CreateProjectDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.create(this.context(user,request),input);}
  @Post(':projectId/main-image') @ApiOperation({summary:'Envia a imagem principal privada da obra (JPEG, PNG ou WebP; até 5 MB)'})
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:5*1024*1024}}))
  async uploadMainImage(@Param('projectId',ParseUUIDPipe) id:string,@UploadedFile() file:{buffer:Buffer;mimetype:string;originalname:string;size:number}|undefined,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.saveMainImage(this.context(user,request),id,file);}
  @Get(':projectId/main-image') @ApiOperation({summary:'Obtém a imagem principal privada da obra'})
  async getMainImage(@Param('projectId',ParseUUIDPipe) id:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){const image=await this.service.getMainImage(this.context(user,request),id);return new StreamableFile(image.content,{type:image.mimeType,length:image.size,disposition:`inline; filename="${image.fileName.replace(/["\\]/g,'')}"`});}
  @Delete(':projectId/main-image') @ApiOperation({summary:'Remove a imagem principal preservando a ação na auditoria'})
  removeMainImage(@Param('projectId',ParseUUIDPipe) id:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.removeMainImage(this.context(user,request),id);}
  @Patch(':projectId') @ApiOperation({summary:'Edita obra com controle de versão'})
  update(@Param('projectId',ParseUUIDPipe) id:string,@Body() input:UpdateProjectDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.update(this.context(user,request),id,input);}
  @Delete(':projectId') @ApiOperation({summary:'Cancela obra preservando histórico'})
  remove(@Param('projectId',ParseUUIDPipe) id:string,@Query('version',ParseIntPipe) version:number,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.cancel(this.context(user,request),id,version);}
}
