import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateProjectDocumentDto {
  @IsString() @Length(3,180) title!:string;
  @IsIn(['architecture','engineering','structure','hydraulic','electrical']) category!:string;
  @IsUUID() supplierId!:string;
  @IsIn(['pending','received','approved','superseded']) status!:string;
  @IsOptional() @IsDateString() documentDate?:string;
  @IsOptional() @IsString() @MaxLength(2000) details?:string;
}
