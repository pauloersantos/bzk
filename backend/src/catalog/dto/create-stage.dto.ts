import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateStageDto {
  @ApiProperty({ enum: ['stage', 'substage'], example: 'stage' }) @IsIn(['stage', 'substage']) itemType!: 'stage' | 'substage';
  @ApiProperty({ example: 'CAT-08' }) @IsString() @Length(6, 6) categoryCode!: string;
  @ApiProperty({ example: 'Fundações e estrutura' }) @IsString() @Length(3, 160) name!: string;
  @ApiPropertyOptional({ example: 'Terraplenagem, fundações e estrutura principal.' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: '00000000-0000-4000-8000-000000000020' }) @IsOptional() @IsUUID() parentStageId?: string;
  @ApiPropertyOptional({ example: '00000000-0000-4000-8000-000000000021' }) @IsOptional() @IsUUID() predecessorStageId?: string;
  @ApiProperty({ example: 10 }) @IsInt() @Min(0) displayOrder!: number;
}

