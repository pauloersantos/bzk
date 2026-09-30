import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/auth.types';
import { Public } from '../common/auth/public.decorator';
import { ACCESS_COOKIE, CSRF_COOKIE, REFRESH_COOKIE } from './auth.types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth:AuthService,private readonly config:ConfigService){}
  private cookieOptions(httpOnly:boolean,maxAge:number){return{httpOnly,secure:this.config.getOrThrow<string>('app.environment')==='production',sameSite:'lax' as const,path:'/',maxAge};}
  private setCookies(response:Response,tokens:{accessToken:string;refreshToken:string;csrfToken:string}){response.cookie(ACCESS_COOKIE,tokens.accessToken,this.cookieOptions(true,10*60*1000));response.cookie(REFRESH_COOKIE,tokens.refreshToken,{...this.cookieOptions(true,30*86400000),path:'/api/v1/auth'});response.cookie(CSRF_COOKIE,tokens.csrfToken,this.cookieOptions(false,30*86400000));}
  private clear(response:Response){response.clearCookie(ACCESS_COOKIE,{path:'/'});response.clearCookie(REFRESH_COOKIE,{path:'/api/v1/auth'});response.clearCookie(CSRF_COOKIE,{path:'/'});}
  @Public() @Throttle({default:{limit:10,ttl:60000}}) @Post('login')
  async login(@Body() input:LoginDto,@Req() request:Request&{requestId?:string},@Res({passthrough:true}) response:Response){const result=await this.auth.login(input,request.requestId);this.setCookies(response,result);return{user:result.user,organization:result.organization,memberships:result.memberships,csrfToken:result.csrfToken};}
  @Public() @Throttle({default:{limit:20,ttl:60000}}) @Post('refresh')
  async refresh(@Req() request:Request&{requestId?:string},@Res({passthrough:true}) response:Response){const result=await this.auth.refresh(request.cookies?.[REFRESH_COOKIE]??'',request.requestId);this.setCookies(response,result);return{csrfToken:result.csrfToken};}
  @Get('me') me(@CurrentUser() user:AuthenticatedUser){return this.auth.me(user.userId,user.organizationId);}
  @Post('logout') async logout(@CurrentUser() user:AuthenticatedUser,@Req() request:Request&{requestId?:string;authSessionId?:string},@Res({passthrough:true}) response:Response){await this.auth.logout(request.authSessionId??'',user.userId,user.organizationId,request.requestId);this.clear(response);return{success:true};}
}
