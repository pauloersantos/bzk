import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
export class CreateDependencyDto{
  @ApiProperty() @IsUUID() predecessorStageId!:string;
  @ApiProperty() @IsUUID() successorStageId!:string;
  @ApiProperty({enum:['FS','SS','FF','SF'],example:'FS'}) @IsIn(['FS','SS','FF','SF']) dependencyType!:string;
  @ApiProperty({example:0}) @IsInt() @Min(0) lagDays!:number;
  @ApiProperty({example:'Fundações devem terminar antes da estrutura.'}) @IsOptional() @IsString() reason?:string;
}
