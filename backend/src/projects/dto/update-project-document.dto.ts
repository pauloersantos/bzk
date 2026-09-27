import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, MaxLength, Min } from 'class-validator';

export class UpdateProjectDocumentDto {
  @IsOptional() @IsString() @Length(3,180) title?:string;
  @IsOptional() @IsIn(['architecture','engineering','structure','hydraulic','electrical']) category?:string;
  @IsOptional() @IsUUID() supplierId?:string;
  @IsOptional() @IsIn(['pending','received','approved','superseded']) status?:string;
  @IsOptional() @IsDateString() documentDate?:string;
  @IsOptional() @IsString() @MaxLength(2000) details?:string;
  @Type(()=>Number) @IsInt() @Min(1) version!:number;
}
