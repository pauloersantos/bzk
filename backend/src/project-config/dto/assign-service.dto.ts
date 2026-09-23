import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsUUID } from 'class-validator';
export class AssignServiceDto{
  @ApiProperty() @IsUUID() projectStageId!:string;
  @ApiProperty() @IsUUID() catalogServiceId!:string;
  @ApiProperty() @IsUUID() supplierId!:string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() environmentId?:string;
  @ApiProperty({example:'250.0000'}) @IsNumberString() quantity!:string;
  @ApiProperty({example:'2.0000'}) @IsNumberString() physicalWeight!:string;
  @ApiProperty({enum:['quantity','percentage','milestone'],example:'quantity'}) @IsIn(['quantity','percentage','milestone']) progressCriterion!:string;
}
