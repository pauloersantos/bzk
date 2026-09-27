import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';

export class CreateScheduleItemDto {
  @IsString() @Length(3,180) name!:string;
  @IsDateString() plannedStart!:string;
  @IsDateString() plannedEnd!:string;
  @IsOptional() @IsIn(['planned','released','blocked','in_progress','completed','suspended','cancelled']) status?:string;
  @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) @Max(100) progressPercentage?:number;
  @IsOptional() @IsString() @MaxLength(2000) notes?:string;
}
