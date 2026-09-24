import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumberString, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'CAT-08' }) @IsString() @Length(6, 6) categoryCode!: string;
  @ApiProperty() @IsUUID() stageId!: string;
  @ApiProperty({ example: 'Impermeabilização de laje' }) @IsString() @Length(3, 160) name!: string;
  @ApiProperty({ example: 'm2' }) @IsString() @Length(1, 20) unitCode!: string;
  @ApiProperty({ example: 'services' }) @IsString() @Length(2, 40) costCategoryCode!: string;
  @ApiProperty({ example: '5.0000' }) @IsNumberString() defaultWeight!: string;
  @ApiProperty({ example: 30 }) @IsInt() @Min(0) defaultDurationDays!: number;
  @ApiProperty({ enum: ['quantity', 'percentage', 'milestone'], example: 'quantity' }) @IsIn(['quantity', 'percentage', 'milestone']) progressCriterion!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

