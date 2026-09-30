import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Req, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Obras') @ApiBearerAuth() @Controller('projects')
export class ProjectsController {
  constructor(private readonly service:ProjectsService){}
  private context(user:AuthenticatedUser,request:Request&{requestId?:string}){return{...user,requestId:request.requestId};}
  @Get() list(@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.list(this.context(user,request));}
  @Get(':projectId') get(@Param('projectId',ParseUUIDPipe) id:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.get(this.context(user,request),id);}
  @Post() create(@Body() input:CreateProjectDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.create(this.context(user,request),input);}
  @Get(':projectId/documents') @ApiOperation({summary:'Lista projetos e documentos privados da obra'})
  listDocuments(@Param('projectId',ParseUUIDPipe) projectId:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.listDocuments(this.context(user,request),projectId);}
  @Post(':projectId/documents') @ApiOperation({summary:'Envia projeto ou documento privado (PDF, JPEG, PNG ou WebP; até 15 MB)'})
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:15*1024*1024}}))
  createDocument(@Param('projectId',ParseUUIDPipe) projectId:string,@Body() input:CreateProjectDocumentDto,@UploadedFile() file:{buffer:Buffer;mimetype:string;originalname:string;size:number}|undefined,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.createDocument(this.context(user,request),projectId,input,file);}
  @Patch(':projectId/documents/:documentId') @ApiOperation({summary:'Edita metadados e opcionalmente substitui o arquivo'})
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:15*1024*1024}}))
  updateDocument(@Param('projectId',ParseUUIDPipe) projectId:string,@Param('documentId',ParseUUIDPipe) documentId:string,@Body() input:UpdateProjectDocumentDto,@UploadedFile() file:{buffer:Buffer;mimetype:string;originalname:string;size:number}|undefined,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.updateDocument(this.context(user,request),projectId,documentId,input,file);}
  @Get(':projectId/documents/:documentId/file') @ApiOperation({summary:'Baixa o arquivo privado do projeto'})
  async getDocumentFile(@Param('projectId',ParseUUIDPipe) projectId:string,@Param('documentId',ParseUUIDPipe) documentId:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){const file=await this.service.getDocumentFile(this.context(user,request),projectId,documentId);return new StreamableFile(file.content,{type:file.mimeType,length:file.size,disposition:`attachment; filename="${file.fileName.replace(/["\\]/g,'')}"`});}
  @Delete(':projectId/documents/:documentId') @ApiOperation({summary:'Exclui logicamente o documento preservando auditoria'})
  removeDocument(@Param('projectId',ParseUUIDPipe) projectId:string,@Param('documentId',ParseUUIDPipe) documentId:string,@Query('version',ParseIntPipe) version:number,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.removeDocument(this.context(user,request),projectId,documentId,version);}
  @Get(':projectId/schedule') @ApiOperation({summary:'Monta o cronograma com etapas configuradas e atividades manuais'})
  listSchedule(@Param('projectId',ParseUUIDPipe) projectId:string,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.listSchedule(this.context(user,request),projectId);}
  @Post(':projectId/schedule') @ApiOperation({summary:'Cria atividade manual complementar no cronograma'})
  createScheduleItem(@Param('projectId',ParseUUIDPipe) projectId:string,@Body() input:CreateScheduleItemDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.createScheduleItem(this.context(user,request),projectId,input);}
  @Patch(':projectId/schedule/:source/:itemId') @ApiOperation({summary:'Edita período, status e avanço de item do cronograma'})
  updateScheduleItem(@Param('projectId',ParseUUIDPipe) projectId:string,@Param('source') source:string,@Param('itemId',ParseUUIDPipe) itemId:string,@Body() input:UpdateScheduleItemDto,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.updateScheduleItem(this.context(user,request),projectId,source,itemId,input);}
  @Delete(':projectId/schedule/manual/:itemId') @ApiOperation({summary:'Exclui atividade manual do cronograma'})
  removeScheduleItem(@Param('projectId',ParseUUIDPipe) projectId:string,@Param('itemId',ParseUUIDPipe) itemId:string,@Query('version',ParseIntPipe) version:number,@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string}){return this.service.removeScheduleItem(this.context(user,request),projectId,itemId,version);}
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
