import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsNumberString, IsUUID } from 'class-validator';

export class AssignStageBatchDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(250) @IsUUID('4',{each:true}) catalogStageIds!:string[];
  @IsUUID() primarySupplierId!:string;
  @IsDateString() plannedStart!:string;
  @IsDateString() plannedEnd!:string;
  @IsNumberString() totalPhysicalWeight!:string;
}
