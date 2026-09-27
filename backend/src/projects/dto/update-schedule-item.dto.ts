import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';

export class UpdateScheduleItemDto {
  @IsOptional() @IsString() @Length(3,180) name?:string;
  @IsOptional() @IsDateString() plannedStart?:string;
  @IsOptional() @IsDateString() plannedEnd?:string;
  @IsOptional() @IsIn(['planned','released','blocked','in_progress','completed','suspended','cancelled']) status?:string;
  @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) @Max(100) progressPercentage?:number;
  @IsOptional() @IsString() @MaxLength(2000) notes?:string;
  @Type(()=>Number) @IsInt() @Min(1) version!:number;
}
