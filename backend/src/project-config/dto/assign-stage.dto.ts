import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumberString, IsOptional, IsUUID, Min } from 'class-validator';
export class AssignStageDto{
  @ApiProperty() @IsUUID() catalogStageId!:string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() primarySupplierId?:string;
  @ApiProperty({example:10}) @IsInt() @Min(0) displayOrder!:number;
  @ApiProperty({example:'2026-08-05'}) @IsDateString() plannedStart!:string;
  @ApiProperty({example:'2026-09-30'}) @IsDateString() plannedEnd!:string;
  @ApiProperty({example:'8.0000'}) @IsNumberString() physicalWeight!:string;
  @ApiPropertyOptional({example:'Configuração inicial da fundação.'}) @IsOptional() notes?:string;
}
